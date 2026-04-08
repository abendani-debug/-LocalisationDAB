const { body } = require('express-validator');

const avisValidator = [
  body('note')
    .notEmpty().withMessage('La note est requise.')
    .isInt({ min: 1, max: 5 }).withMessage('La note doit être entre 1 et 5.'),
  body('commentaire')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('Commentaire trop long (max 1000 caractères).'),
];

module.exports = { avisValidator };
