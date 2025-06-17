const { authJwt } = require("../middleware");
const pageController = require("../controllers/page.controller");

module.exports = function(app) {

  app.get("/", pageController.showHome);

  app.get("/inscription", pageController.showInscription);

  app.get("/login", pageController.showLogin);

  app.get("/admin-dashboard", pageController.showAdminDashboard);

  app.get("/profil", [authJwt.verifyToken], pageController.showProfile);

};
