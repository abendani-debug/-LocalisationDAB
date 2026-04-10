// Injecte les variables d'env AVANT que env.js soit chargé
process.env.DATABASE_URL          = 'postgresql://test:test@localhost:5432/test_db';
process.env.JWT_SECRET            = 'a'.repeat(64);
process.env.JWT_EXPIRES_IN        = '1h';
process.env.IP_SALT               = 'b'.repeat(32);
process.env.GOOGLE_PLACES_API_KEY = 'fake_google_key_for_tests';
process.env.NODE_ENV              = 'test';
process.env.BCRYPT_ROUNDS         = '4';
process.env.SIGNALEMENT_SEUIL     = '2';
process.env.SIGNALEMENT_DUREE_HEURES = '4';
process.env.CORS_ORIGIN           = 'http://localhost:5173';
