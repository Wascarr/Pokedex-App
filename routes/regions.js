const express = require('express');
const router = express.Router();
const regionController = require('../controllers/regionController');

// Rutas de regiones
router.get('/regions', regionController.getAllRegions);
router.get('/regions/new', regionController.newRegionForm);
router.post('/regions/new', regionController.createRegion);
router.post('/regions/:id/delete', regionController.deleteRegion);

module.exports = router;