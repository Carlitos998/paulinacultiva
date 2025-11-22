const express = require('express');
const { sendVerificationCode, verifyEmail, verifyEmailTransporter } = require('../controller/emailVerificationSimple');

const router = express.Router();

// Ruta para enviar código de verificación
router.post('/send-verification', sendVerificationCode);

// Ruta para verificar el código
router.post('/verify-email', verifyEmail);

// Ruta para verificar configuración del transporter (debug)
router.get('/verify-transporter', verifyEmailTransporter);

module.exports = router;