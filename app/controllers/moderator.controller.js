const db = require("../models");
const Salle = db.salle;
const Reservation = db.reservation;
const Op = db.Sequelize.Op;
const Film = db.film;
const Payment = db.paiement;
// il faudra que tu me donnes ton model Payment si tu l'as
// Gestion des salles
exports.listSalles = async (req, res) => {
  try {
    const salles = await Salle.findAll();
    res.render("moderator-salle", { salles });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

exports.createSalle = async (req, res) => {
  try {
    if (!req.body.nom || !req.body.capacite) {
      return res.status(400).send({ message: "Le nom et la capacité sont requis" });
    }
    
    await Salle.create({
      nom: req.body.nom,
      capacite: req.body.capacite,
      emplacement: req.body.emplacement || null
    });
    res.redirect("/moderator/salles");
  } catch (err) {
    console.error("Erreur création salle:", err);
    res.status(500).send({ message: err.message });
  }
};

exports.updateSalle = async (req, res) => {
  try {
    if (!req.body.nom || !req.body.capacite) {
      return res.status(400).send({ message: "Le nom et la capacité sont requis" });
    }
    
    await Salle.update(
      {
        nom: req.body.nom,
        capacite: req.body.capacite,
        emplacement: req.body.emplacement || null
      },
      { where: { id: req.params.id } }
    );
    res.redirect("/moderator/salles");
  } catch (err) {
    console.error("Erreur mise à jour salle:", err);
    res.status(500).send({ message: err.message });
  }
};

exports.deleteSalle = async (req, res) => {
  try {
    await Salle.destroy({ where: { id: req.params.id } });
    res.redirect("/moderator/salles");
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

// Gestion des réservations
exports.listReservations = async (req, res) => {
  try {
    const reservations = await db.reservation.findAll({
      include: [
        {
          model: db.seance,
          include: [{ model: db.salle }, { model: db.film }]
        },
        {
          model: db.user
        }
      ]
    });

    const seances = await db.seance.findAll({
      include: [{ model: db.salle }],
    });

    const users = await db.user.findAll();
    const films = await db.film.findAll();

    res.render("moderator-reservation", {
      reservations,
      seances,
      users,
      films
    });
  } catch (error) {
    console.error("Erreur lors du chargement des réservations :", error);
    res.status(500).send("Erreur serveur");
  }
};


exports.createReservation = async (req, res) => {
  try {
    const { nb_places, id_utilisateur, id_seance } = req.body;
    await db.reservation.create({
      nb_places,
      id_utilisateur,
      id_seance
    });
    res.redirect("/moderator/reservations");
  } catch (error) {
    console.error("Erreur lors de la création de la réservation :", error);
    res.status(500).send("Erreur serveur");
  }
};


exports.updateReservation = async (req, res) => {
  try {
    const { statut, nb_places, id_seance } = req.body;
    
    if (!statut || !nb_places || !id_seance) {
      return res.status(400).send({ message: "Tous les champs sont requis" });
    }
    
    const reservation = await Reservation.findByPk(req.params.id);
    if (!reservation) {
      return res.status(404).send({ message: "Réservation non trouvée" });
    }
    
    // Vérifier la disponibilité si la séance ou le nombre de places change
    if (id_seance !== reservation.id_seance || nb_places > reservation.nb_places) {
      const seance = await db.seance.findByPk(id_seance, {
        include: [db.salle]
      });
      
      const reservationsExistantes = await Reservation.sum('nb_places', {
        where: { id_seance, statut: 'confirmée' }
      }) || 0;
      
      const placesDisponibles = seance.salle.capacite - reservationsExistantes;
      
      if (nb_places > placesDisponibles + reservation.nb_places) {
        return res.status(400).send({ 
          message: `Seulement ${placesDisponibles} places disponibles` 
        });
      }
    }
    
    await reservation.update({
      statut,
      nb_places,
      id_seance
    });
    
    res.redirect("/moderator/reservations");
  } catch (err) {
    console.error("Erreur mise à jour réservation:", err);
    res.status(500).send({ message: err.message });
  }
};

exports.updateReservationStatus = async (req, res) => {
  try {
    if (!req.body.statut) {
      return res.status(400).send({ message: "Le statut est requis" });
    }
    
    await Reservation.update(
      { statut: req.body.statut },
      { where: { id: req.params.id } }
    );
    res.redirect("/moderator/reservations");
  } catch (err) {
    console.error("Erreur mise à jour réservation:", err);
    res.status(500).send({ message: err.message });
  }
};

exports.deleteReservation = async (req, res) => {
  try {
    await Reservation.destroy({ where: { id: req.params.id } });
    res.redirect("/moderator/reservations");
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

// Gestion des films
exports.listFilms = async (req, res) => {
  try {
    const films = await Film.findAll();
    res.render("moderator-film", { films });
  } catch (err) {
    console.error("Erreur liste films:", err);
    res.status(500).send({ message: err.message });
  }
};

// Dans la méthode createFilm
exports.createFilm = async (req, res) => {
  try {
    const { titre, description, genre, duree, prix, date_sortie } = req.body;
    const image_affiche = req.file ? req.file.buffer : null;
    
    const film = await db.film.create({
      titre,
      description,
      genre,
      duree,
      prix,
      date_sortie,
      image_affiche
    });
    
    res.redirect('/moderator/films?action=ajout');
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// Dans la méthode updateFilm
exports.updateFilm = async (req, res) => {
  try {
    const { titre, description, genre, duree, prix, date_sortie } = req.body;
    const updateData = {
      titre,
      description,
      genre,
      duree,
      prix,
      date_sortie
    };
    
    if (req.file) {
      updateData.image_affiche = req.file.buffer;
    }
    
    await db.film.update(updateData, {
      where: { id: req.params.id }
    });
    
    res.redirect('/moderator/films?action=modification');
  } catch (error) {
    res.status(500).send(error.message);
  }
};

exports.deleteFilm = async (req, res) => {
  try {
    await Film.destroy({ where: { id: req.params.id } });
    res.redirect("/moderator/films");
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

// Gestion des paiements
exports.listPayments = async (req, res) => {
  try {
    const payments = await Payment.findAll({ 
      include: [
        {
          model: db.reservation,
          include: [
            {
              model: db.seance,
              include: [db.film]
            },
            {
              model: db.user
            }
          ],
          required: false // Permet d'inclure les paiements même sans réservation
        }
      ]
    });
    
    const reservations = await db.reservation.findAll({
      where: { 
        statut: 'confirmée',
        id: {
          [Op.notIn]: payments.map(p => p.reservationId).filter(id => id)
        }
      },
      include: [
        {
          model: db.seance,
          include: [db.film]
        },
        {
          model: db.user
        }
      ]
    });

    res.render("moderator-payment", { 
      payments, 
      reservations,
      calculateTotal: (reservation) => {
        if (!reservation || !reservation.seance || !reservation.seance.film) return 0;
        return reservation.nb_places * reservation.seance.film.prix;
      }
    });
  } catch (err) {
    console.error("Erreur liste paiements:", err);
    res.status(500).send({ message: err.message });
  }
};

exports.createPayment = async (req, res) => {
  try {
    const { id_reservation, methode_paiement } = req.body;
    
    if (!id_reservation || !methode_paiement) {
      return res.status(400).send({ message: "Tous les champs sont requis" });
    }

    // Récupérer la réservation avec les informations nécessaires
    const reservation = await db.reservation.findByPk(id_reservation, {
      include: [
        {
          model: db.seance,
          include: [db.film]
        }
      ]
    });

    if (!reservation) {
      return res.status(404).send({ message: "Réservation non trouvée" });
    }

    // Calculer le montant total
    const montant = reservation.nb_places * reservation.seance.film.prix;

    await Payment.create({
      montant,
      methode_paiement,
      statut: 'payé',
      reservationId: id_reservation
    });

    // Mettre à jour le statut de la réservation
    await reservation.update({ statut: 'confirmée' });

    res.redirect("/moderator/payments?action=ajout");
  } catch (err) {
    console.error("Erreur création paiement:", err);
    res.status(500).send({ message: err.message });
  }
};

exports.updatePayment = async (req, res) => {
  try {
    const { methode_paiement, statut } = req.body;
    
    if (!methode_paiement || !statut) {
      return res.status(400).send({ message: "Tous les champs sont requis" });
    }

    await Payment.update(
      {
        methode_paiement,
        statut
      },
      { where: { id: req.params.id } }
    );
    
    res.redirect("/moderator/payments?action=modification");
  } catch (err) {
    console.error("Erreur mise à jour paiement:", err);
    res.status(500).send({ message: err.message });
  }
};
exports.deletePayment = async (req, res) => {
  try {
    await Payment.destroy({ where: { id: req.params.id } });
    res.redirect("/moderator/payments?action=suppression");
  } catch (err) {
    console.error("Erreur suppression paiement:", err);
    res.status(500).send({ message: err.message });
  }
};



// Gestion des séances
exports.listSeances = async (req, res) => {
  try {
    const [seances, films, salles] = await Promise.all([
      db.seance.findAll({
        include: [
          { model: db.film },
          { model: db.salle }
        ],
        order: [['date_heure', 'ASC']]
      }),
      db.film.findAll(),
      db.salle.findAll()
    ]);

    res.render("moderator-seance", { 
      seances,
      films,
      salles
    });
  } catch (err) {
    console.error("Erreur liste séances:", err);
    res.status(500).send({ message: err.message });
  }
};

exports.createSeance = async (req, res) => {
  try {
    if (!req.body.date_heure || !req.body.id_film || !req.body.id_salle) {
      return res.status(400).send({ message: "Tous les champs sont requis" });
    }

    // Vérifier si la salle est disponible à cette heure
    const conflit = await db.seance.findOne({
      where: {
        id_salle: req.body.id_salle,
        date_heure: {
          [Op.between]: [
            new Date(new Date(req.body.date_heure).getTime() - 2 * 60 * 60 * 1000), // 2h avant
            new Date(new Date(req.body.date_heure).getTime() + 2 * 60 * 60 * 1000)  // 2h après
          ]
        }
      }
    });

    if (conflit) {
      return res.status(400).send({ 
        message: "La salle est déjà réservée pour une séance proche de cette heure" 
      });
    }

    // Récupérer la durée du film
    const film = await db.film.findByPk(req.body.id_film);
    if (!film) {
      return res.status(404).send({ message: "Film non trouvé" });
    }

    // Créer la séance
    await db.seance.create({
      date_heure: req.body.date_heure,
      id_film: req.body.id_film,
      id_salle: req.body.id_salle,
      places_disponibles: req.body.places_disponibles || null
    });

    res.redirect("/moderator/seances");
  } catch (err) {
    console.error("Erreur création séance:", err);
    res.status(500).send({ message: err.message });
  }
};

exports.updateSeance = async (req, res) => {
  try {
    if (!req.body.date_heure || !req.body.id_film || !req.body.id_salle) {
      return res.status(400).send({ message: "Tous les champs sont requis" });
    }

    const seance = await db.seance.findByPk(req.params.id);
    if (!seance) {
      return res.status(404).send({ message: "Séance non trouvée" });
    }

    // Vérifier si la salle est disponible à cette heure (sauf pour cette séance)
    const conflit = await db.seance.findOne({
      where: {
        id: { [Op.ne]: req.params.id },
        id_salle: req.body.id_salle,
        date_heure: {
          [Op.between]: [
            new Date(new Date(req.body.date_heure).getTime() - 2 * 60 * 60 * 1000), // 2h avant
            new Date(new Date(req.body.date_heure).getTime() + 2 * 60 * 60 * 1000)  // 2h après
          ]
        }
      }
    });

    if (conflit) {
      return res.status(400).send({ 
        message: "La salle est déjà réservée pour une séance proche de cette heure" 
      });
    }

    // Mettre à jour la séance
    await seance.update({
      date_heure: req.body.date_heure,
      id_film: req.body.id_film,
      id_salle: req.body.id_salle,
      places_disponibles: req.body.places_disponibles || null
    });

    res.redirect("/moderator/seances");
  } catch (err) {
    console.error("Erreur mise à jour séance:", err);
    res.status(500).send({ message: err.message });
  }
};

exports.deleteSeance = async (req, res) => {
  try {
    // Vérifier s'il y a des réservations pour cette séance
    const reservations = await db.reservation.count({
      where: { id_seance: req.params.id }
    });

    if (reservations > 0) {
      return res.status(400).send({ 
        message: "Impossible de supprimer cette séance car des réservations y sont associées" 
      });
    }

    await db.seance.destroy({ where: { id: req.params.id } });
    res.redirect("/moderator/seances");
  } catch (err) {
    console.error("Erreur suppression séance:", err);
    res.status(500).send({ message: err.message });
  }
};
