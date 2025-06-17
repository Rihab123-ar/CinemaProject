module.exports = (sequelize, Sequelize) => {
  const Film = sequelize.define("film", {
    titre: {
      type: Sequelize.STRING,
      allowNull: false
    },
    description: {
      type: Sequelize.TEXT
    },
    genre: {
      type: Sequelize.ENUM(
        'Action',
        'Aventure',
        'Comédie',
        'Drame',
        'Fantastique',
        'Horreur',
        'Romance',
        'Science-fiction',
        'Thriller',
        'Documentaire',
        'Animation',
        'Policier',
        'Musical',
        'Western'
      ),
      allowNull: false
    },
    duree: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    date_sortie: {
      type: Sequelize.DATE
    },
    prix: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 9.99
    },
    image_affiche: {
      type: Sequelize.BLOB('long'),
      allowNull: true
    }
  });

  return Film;
};