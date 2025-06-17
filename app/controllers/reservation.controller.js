// reservation.controller.js
const db = require('../models');
const Reservation = db.reservation;

exports.getReservations = async (req, res) => {
  try {
    console.log('User ID:', req.userId); // Vérifiez que l'ID est correct
    const reservations = await Reservation.findAll({
      where: { id_utilisateur: req.userId }, // Changé de userId à id_utilisateur
      order: [['date_reservation', 'DESC']]
    });
    
    console.log('Réservations trouvées:', reservations); // Vérifiez les données
    
    res.render('reservations', { 
      reservations,
      token: req.query.token
    });
  } catch (error) {
    console.error('Erreur détaillée:', error);
    res.status(500).send('Erreur serveur: ' + error.message);
  }
};
