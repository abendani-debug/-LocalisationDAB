const { body, query } = require('express-validator');

const dabCreateValidator = [
  body('nom')
    .trim()
    .notEmpty().withMessage('Le nom est requis.')
    .isLength({ max: 255 }).withMessage('Nom trop long (max 255 caractères).'),
  body('adresse')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Adresse trop longue.'),
  body('latitude')
    .notEmpty().withMessage('La latitude est requise.')
    .isFloat({ min: -90, max: 90 }).withMessage('Latitude invalide.'),
  body('longitude')
    .notEmpty().withMessage('La longitude est requise.')
    .isFloat({ min: -180, max: 180 }).withMessage('Longitude invalide.'),
  body('statut')
    .optional()
    .isIn(['actif', 'hors_service', 'maintenance']).withMessage('Statut invalide.'),
  body('banque_id')
    .optional()
    .isInt({ min: 1 }).withMessage('banque_id invalide.'),
  body('type_lieu')
    .optional()
    .isIn(['atm', 'agence']).withMessage('type_lieu invalide.'),
];

const dabUpdateValidator = [
  body('nom')
    .optional()
    .trim()
    .notEmpty().withMessage('Le nom ne peut pas être vide.')
    .isLength({ max: 255 }).withMessage('Nom trop long.'),
  body('adresse')
    .optional()
    .trim(),
  body('latitude')
    .optional()
    .isFloat({ min: -90, max: 90 }).withMessage('Latitude invalide.'),
  body('longitude')
    .optional()
    .isFloat({ min: -180, max: 180 }).withMessage('Longitude invalide.'),
  body('statut')
    .optional()
    .isIn(['actif', 'hors_service', 'maintenance']).withMessage('Statut invalide.'),
  body('banque_id')
    .optional()
    .isInt({ min: 1 }).withMessage('banque_id invalide.'),
  body('type_lieu')
    .optional()
    .isIn(['atm', 'agence']).withMessage('type_lieu invalide.'),
];

const nearbyValidator = [
  query('lat')
    .notEmpty().withMessage('lat est requis.')
    .isFloat({ min: -90, max: 90 }).withMessage('lat invalide.'),
  query('lng')
    .notEmpty().withMessage('lng est requis.')
    .isFloat({ min: -180, max: 180 }).withMessage('lng invalide.'),
  query('radius')
    .optional()
    .isFloat({ min: 0.1, max: 50 }).withMessage('radius doit être entre 0.1 et 50 km.'),
];

const proposerValidator = [
  body('nom')
    .trim()
    .notEmpty().withMessage('Le nom est requis.')
    .isLength({ max: 255 }).withMessage('Nom trop long (max 255 caractères).'),
  body('adresse')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Adresse trop longue.'),
  body('latitude')
    .notEmpty().withMessage('La latitude est requise.')
    .isFloat({ min: -90, max: 90 }).withMessage('Latitude invalide.'),
  body('longitude')
    .notEmpty().withMessage('La longitude est requise.')
    .isFloat({ min: -180, max: 180 }).withMessage('Longitude invalide.'),
  body('banque_id')
    .optional({ nullable: true })
    .isInt({ min: 1 }).withMessage('banque_id invalide.'),
  body('type_lieu')
    .notEmpty().withMessage('Le type est requis.')
    .isIn(['atm', 'agence']).withMessage('Type invalide. Valeurs acceptées : atm, agence.'),
];

module.exports = { dabCreateValidator, dabUpdateValidator, nearbyValidator, proposerValidator };
