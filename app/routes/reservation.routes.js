// reservation.routes.js
const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservation.controller');
const authJwt = require('../middleware/authJwt');

// Modifiez cette ligne pour utiliser le bon chemin
router.get('/', [authJwt.verifyToken], reservationController.getReservations);

module.exports = router;