const express = require("express");
const router = express.Router();
const db = require("../models");
const { Op } = require("sequelize");

// Route GET /queues : afficher tous les films
router.get("/queues", async (req, res) => {
  try {
    const films = await db.film.findAll();

    const filmsWithBase64Image = films.map(film => {
      let base64Image = null;
      if (film.image_affiche) {
        base64Image = film.image_affiche.toString('base64');
      }

      return {
        ...film.dataValues,
        image_base64: base64Image
      };
    });

    res.render("queues", { films: filmsWithBase64Image });
  } catch (err) {
    console.error("Erreur affichage films:", err);
    res.status(500).send({ message: err.message });
  }
});

// Route GET /user-seance/:filmId : afficher les séances à venir pour un film
router.get("/user-seance/:filmId", async (req, res) => {
  try {
    const filmId = req.params.filmId;
    
    // Récupérer le film avec image en base64
    const film = await db.film.findByPk(filmId);
    if (!film) {
      return res.status(404).send('Film non trouvé');
    }

    const filmWithBase64 = {
      ...film.dataValues,
      image_base64: film.image_affiche ? film.image_affiche.toString('base64') : null
    };

    // Récupérer les séances à venir pour ce film + infos salle
    const seances = await db.seance.findAll({
      where: {
        id_film: filmId,
        date_heure: {
          [Op.gte]: new Date() // séances futures
        }
      },
      include: [{
        model: db.salle,
        as: 'salle',
        required: true
      }],
      order: [['date_heure', 'ASC']]
    });

    res.render('user-seance', { 
      film: filmWithBase64,
      seances: seances
    });
    
  } catch (error) {
    console.error("Erreur lors de la récupération des séances:", error);
    res.status(500).send('Erreur serveur');
  }
});

// Route POST /reservation/:seanceId : créer une réservation
// Route POST /reservation/:seanceId : créer une réservation
router.post("/reservation/:seanceId", async (req, res) => {
  try {
    const userId = req.user?.id || 1; // pour test : userId = 1 si non connecté
    const seanceId = req.params.seanceId;
    const nombrePlaces = parseInt(req.body.nombre_places, 10) || 1;

    // Vérifier que la séance existe
    const seance = await db.seance.findByPk(seanceId);
    if (!seance) {
      return res.status(404).send('Séance non trouvée');
    }

    // Vérifier qu'il reste assez de places
    if (seance.places_disponibles < nombrePlaces || nombrePlaces <= 0) {
      return res.status(400).send('Nombre de places invalide ou insuffisant');
    }

    // Créer la réservation
    await db.reservation.create({
      id_utilisateur: userId,
      id_seance: seanceId,
      nb_places: nombrePlaces, // Correction ici (utilisation de nb_places au lieu de nombre_places)
      statut: 'en_attente',
      date_reservation: new Date() // Ajout explicite de la date
    });

    // Diminuer le nombre de places disponibles
    seance.places_disponibles -= nombrePlaces;
    await seance.save();

    // Rediriger vers la confirmation
    res.redirect("/confirmation-reservation");

  } catch (error) {
    console.error("Erreur lors de la réservation:", error);
    res.status(500).send('Erreur serveur');
  }
});


// Route GET /confirmation-reservation : afficher la confirmation
router.get("/confirmation-reservation", (req, res) => {
  res.render("confirmation-reservation");
});

module.exports = router;
