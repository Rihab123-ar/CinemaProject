const db = require("../models");
const Reservation = db.reservation;
const authJwt = require("./app/middleware/authJwt");
exports.createReservation = async (req, res) => {
  try {
    const userId = req.user.id;
    const filmId = req.body.filmId;
    const existing = await Reservation.findOne({ where: { userId, filmId } });
    if (existing) {
      return res.status(400).send({ message: "Séance déjà réservée." });
    }

    await Reservation.create({ userId, filmId });

    res.status(201).send({ message: "Réservation réussie !" });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Erreur serveur." });
  }
};
