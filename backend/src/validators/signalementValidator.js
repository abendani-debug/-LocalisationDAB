const { body } = require('express-validator');

const signalementValidator = [
  body('etat')
    .notEmpty().withMessage('L\'état est requis.')
    .isIn(['disponible', 'vide', 'en_panne']).withMessage('État invalide. Valeurs : disponible, vide, en_panne.'),
  body('cookieId')
    .notEmpty().withMessage('Le cookieId est requis.')
    .isUUID().withMessage('cookieId doit être un UUID valide.'),
];

module.exports = { signalementValidator };
