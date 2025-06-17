module.exports = (sequelize, Sequelize) => {
  const Salle = sequelize.define("salle", {
    nom: {
      type: Sequelize.STRING(100),
      allowNull: false
    },
    capacite: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    emplacement: {
      type: Sequelize.STRING(255)
    }
  });

  return Salle;
};