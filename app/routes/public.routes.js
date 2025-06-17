const express = require("express");
const router = express.Router();
const publicController = require("../controllers/public.controller");
const authJwt = require("./app/middleware/authJwt");
// Page d'accueil
router.get("/", publicController.home);

// Liste des films
router.get("/films", publicController.listFilms);

// Détail d'un film
router.get("/films/:id", publicController.filmDetails);

module.exports = router;
