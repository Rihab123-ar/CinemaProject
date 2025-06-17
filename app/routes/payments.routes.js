const express = require('express');
const router = express.Router();
const paymentsController = require('../controllers/payments.controller');
const authJwt = require('../middleware/authJwt');

router.get('/', [authJwt.verifyToken], paymentsController.getPayments);

module.exports = router;
