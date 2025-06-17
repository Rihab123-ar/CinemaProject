const { authJwt } = require("../middleware");
const userController = require("../controllers/user.controller");      // lil route inta3 test
const authController = require("../controllers/auth.controller");      // lil listUsers + promote + des/ativation

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  // Routes inta3 test
  app.get("/api/test/all", userController.allAccess);
  app.get("/api/test/user", [authJwt.verifyToken], userController.userBoard);
  app.get("/api/test/mod", [authJwt.verifyToken, authJwt.isModerator], userController.moderatorBoard);
  app.get("/api/test/admin", [authJwt.verifyToken, authJwt.isAdmin], userController.adminBoard);

  // Routes int3 admin lkol (promote + liste des users + des/ativation)
  app.get("/admin/users", [authJwt.verifyToken, authJwt.isAdmin], authController.listUsers);
  app.post("/admin/promote", [authJwt.verifyToken, authJwt.isAdmin], authController.promoteToModerator);
  app.post("/admin/demote", [authJwt.verifyToken, authJwt.isAdmin], authController.demoteFromModerator);
  app.post("/admin/activer", [authJwt.verifyToken, authJwt.isAdmin], authController.activerUser);
  app.post("/admin/desactiver", [authJwt.verifyToken, authJwt.isAdmin], authController.desactiverUser);



};


