const db = require('../models');
const Paiement = db.paiement;

exports.getPayments = async (req, res) => {
  try {
    console.log('User ID:', req.userId);
    
    // Trouver d'abord les réservations de l'utilisateur
    const reservations = await db.reservation.findAll({
      where: { id_utilisateur: req.userId },
      include: [{
        model: Paiement,
        as: 'paiement' // Cela dépend du nom de l'association dans votre modèle
      }]
    });

    // Extraire les paiements des réservations
    const payments = reservations
      .filter(res => res.paiement)
      .map(res => res.paiement);

    console.log('Paiements trouvés:', payments);
    
    res.render('payments', { 
      payments,
      token: req.query.token
    });
  } catch (error) {
    console.error('Erreur détaillée:', error);
    res.status(500).send('Erreur serveur: ' + error.message);
  }
};