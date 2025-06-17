const config = require("../config/db.config.js");

const Sequelize = require("sequelize");
const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  {
    host: config.host,
    dialect: config.dialect,
    pool: {
      max: config.pool.max,
      min: config.pool.min,
      acquire: config.pool.acquire,
      idle: config.pool.idle
    }
  }
);

// Initialisation de l'objet db
const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Modèles existants
db.user = require("../models/user.model.js")(sequelize, Sequelize);
db.role = require("../models/role.model.js")(sequelize, Sequelize);

// Nouveaux modèles
db.film = require("../models/film.model.js")(sequelize, Sequelize);
db.salle = require("../models/salle.model.js")(sequelize, Sequelize);
db.seance = require("../models/seance.model.js")(sequelize, Sequelize);
db.reservation = require("../models/reservation.model.js")(sequelize, Sequelize);
db.paiement = require("../models/paiement.model.js")(sequelize, Sequelize);

// Associations existantes
db.role.belongsToMany(db.user, {
  through: "user_roles"
});
db.user.belongsToMany(db.role, {
  through: "user_roles"
});

// Nouvelles associations
// Film - Seance (1 film → plusieurs séances)
db.film.hasMany(db.seance, { foreignKey: "id_film" });
db.seance.belongsTo(db.film, { foreignKey: "id_film" });

// Salle - Seance (1 salle → plusieurs séances)
db.salle.hasMany(db.seance, { foreignKey: "id_salle" });
db.seance.belongsTo(db.salle, { foreignKey: "id_salle" });

// User - Reservation (1 user → plusieurs réservations)
db.user.hasMany(db.reservation, { foreignKey: "id_utilisateur" });
db.reservation.belongsTo(db.user, { foreignKey: "id_utilisateur" });

// Seance - Reservation (1 séance → plusieurs réservations)
db.seance.hasMany(db.reservation, { foreignKey: "id_seance" });
db.reservation.belongsTo(db.seance, { foreignKey: "id_seance" });

// Reservation - Paiement (1 réservation → 1 paiement)
db.reservation.hasOne(db.paiement, { foreignKey: 'id_reservation', onDelete: 'CASCADE' });
db.paiement.belongsTo(db.reservation, { foreignKey: 'id_reservation', onDelete: 'CASCADE' });

// Rôles existants
db.ROLES = ["user", "admin", "moderator"];

module.exports = db;
