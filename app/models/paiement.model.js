module.exports = (sequelize, Sequelize) => {
  const Paiement = sequelize.define("paiement", {
    montant: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false
    },
    date_paiement: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW
    },
    methode_paiement: {
      type: Sequelize.ENUM('espèce', 'carte', 'en ligne'),
      defaultValue: 'espèce'
    },
    statut: {
      type: Sequelize.ENUM('payé', 'non payé'),
      defaultValue: 'non payé'
    }
  });

  return Paiement;
};