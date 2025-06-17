// app/controllers/page.controller.js

const jwt = require("jsonwebtoken"); // ajouté
const config = require("../config/auth.config.js"); // ajouté
const db = require("../models");
const User = db.user;

exports.showHome = (req, res) => {
  res.render("acceuil");
};

exports.showInscription = (req, res) => {
  res.render("inscription");
};

exports.showLogin = (req, res) => {
  res.render("login");
};

exports.showAdminDashboard = (req, res) => {
  res.render("admin-dashboard");
};

exports.showProfile = (req, res) => {
  const token = req.query.token;

  if (!token) {
    return res.status(403).send({ message: "Aucun token fourni." });
  }

  jwt.verify(token, config.secret, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: "Token invalide." });
    }

    User.findByPk(decoded.id)
      .then(user => {
        if (!user) {
          return res.status(404).send({ message: "Utilisateur non trouvé." });
        }

        res.render("profil", {
          username: user.username,
          email: user.email,
        });
      })
      .catch(err => {
        console.error(err);
        res.status(500).send({ message: "Erreur serveur." });
      });
  });
};