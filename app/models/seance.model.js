module.exports = (sequelize, Sequelize) => {
  const Seance = sequelize.define("seance", {
    date_heure: {
      type: Sequelize.DATE,
      allowNull: false
    },
    places_disponibles: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    id_film: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'films',
        key: 'id'
      }
    },
    id_salle: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'salles',
        key: 'id'
      }
    }
  });

  return Seance;
};