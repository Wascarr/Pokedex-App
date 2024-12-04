const express = require('express');
const router = express.Router();
const { Pokemon, Region, Type } = require('../models');
const { Op } = require('sequelize');
const pokemonController = require('../controllers/pokemonController');
const regionController = require('../controllers/regionController');
const typeController = require('../controllers/typeController');

// Ruta principal (Home)
router.get('/', pokemonController.getHomePage);

// Rutas de Pokémon
router.get('/pokemon/new', pokemonController.newPokemonForm);
router.post('/pokemon/new', pokemonController.createPokemon);
router.get('/pokemon/:id', pokemonController.getPokemonDetails);
router.get('/pokemon/:id/edit', pokemonController.editPokemonForm);
router.post('/pokemon/:id/update', pokemonController.updatePokemon);
router.post('/pokemon/:id/delete', pokemonController.deletePokemon);

// API para búsqueda
router.get('/api/pokemon/search', pokemonController.searchPokemon);

// Rutas de Regiones
router.get('/regions', regionController.getAllRegions);
router.get('/regions/new', regionController.newRegionForm);
router.post('/regions/new', regionController.createRegion);
router.get('/regions/:id/edit', regionController.editRegionForm);
router.post('/regions/:id/update', regionController.updateRegion);
router.post('/regions/:id/delete', regionController.deleteRegion);

// Rutas de Tipos
router.get('/types', typeController.getAllTypes);
router.get('/types/new', typeController.newTypeForm);
router.post('/types/new', typeController.createType);
router.get('/types/:id/edit', typeController.editTypeForm);
router.post('/types/:id/update', typeController.updateType);
router.post('/types/:id/delete', typeController.deleteType);

// Ruta principal con paginación y filtros
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 12;
        const offset = (page - 1) * limit;

        const { name, regionId, typeId, sort = 'name' } = req.query;
        let whereClause = {};
        let order = [['name', 'ASC']];
        
        if (name) whereClause.name = { [Op.like]: `%${name}%` };
        if (regionId) whereClause.RegionId = regionId;
        if (typeId) whereClause.TypeId = typeId;

        switch(sort) {
            case 'type':
                order = [[{ model: Type }, 'name', 'ASC']];
                break;
            case 'region':
                order = [[{ model: Region }, 'name', 'ASC']];
                break;
        }

        const { count, rows: pokemons } = await Pokemon.findAndCountAll({
            where: whereClause,
            include: [Region, Type],
            order,
            limit,
            offset
        });

        const totalPages = Math.ceil(count / limit);
        const pagination = {
            prev: page > 1 ? page - 1 : null,
            next: page < totalPages ? page + 1 : null,
            pages: Array.from({ length: totalPages }, (_, i) => ({
                number: i + 1,
                active: i + 1 === page
            }))
        };

        const regions = await Region.findAll({ order: [['name', 'ASC']] });
        const types = await Type.findAll({ order: [['name', 'ASC']] });

        res.render('home', { 
            pokemons,
            regions,
            types,
            pagination,
            searchTerm: name,
            selectedRegions: regionId ? { [regionId]: true } : {},
            selectedTypes: typeId ? { [typeId]: true } : {},
            sort
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).render('error', { message: 'Error al cargar los Pokémon' });
    }
});

// API para búsqueda en tiempo real
router.get('/api/pokemon/search', async (req, res) => {
    try {
        const { name } = req.query;
        const pokemons = await Pokemon.findAll({
            where: { name: { [Op.like]: `%${name}%` } },
            include: [Region, Type],
            limit: 10
        });
        res.json(pokemons);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Error en la búsqueda' });
    }
});

// Rutas de Pokémon
router.get('/pokemon/new', async (req, res) => {
    try {
        const types = await Type.findAll();
        const regions = await Region.findAll();
        res.render('pokemon/new', { types, regions });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).render('error', { message: 'Error al cargar el formulario' });
    }
});

router.post('/pokemon/new', async (req, res) => {
    try {
        const { name, typeId, regionId, image } = req.body;
        await Pokemon.create({ name, TypeId: typeId, RegionId: regionId, image });
        res.redirect('/');
    } catch (error) {
        console.error('Error:', error);
        res.status(500).render('error', { message: 'Error al crear el Pokémon' });
    }
});

router.get('/pokemon/:id', async (req, res) => {
    try {
        const pokemon = await Pokemon.findByPk(req.params.id, {
            include: [Region, Type]
        });
        if (pokemon) {
            res.render('pokemon/detail', { pokemon });
        } else {
            res.status(404).render('404');
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).render('error', { message: 'Error al cargar el Pokémon' });
    }
});

router.get('/pokemon/:id/edit', async (req, res) => {
    try {
        const pokemon = await Pokemon.findByPk(req.params.id);
        const types = await Type.findAll();
        const regions = await Region.findAll();
        res.render('pokemon/edit', { pokemon, types, regions });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).render('error', { message: 'Error al cargar el formulario de edición' });
    }
});

router.post('/pokemon/:id/edit', async (req, res) => {
    try {
        const { name, typeId, regionId, image } = req.body;
        await Pokemon.update(
            { name, TypeId: typeId, RegionId: regionId, image },
            { where: { id: req.params.id } }
        );
        res.redirect('/');
    } catch (error) {
        console.error('Error:', error);
        res.status(500).render('error', { message: 'Error al actualizar el Pokémon' });
    }
});

router.post('/pokemon/:id/delete', async (req, res) => {
    try {
        await Pokemon.destroy({ where: { id: req.params.id } });
        res.redirect('/');
    } catch (error) {
        console.error('Error:', error);
        res.status(500).render('error', { message: 'Error al eliminar el Pokémon' });
    }
});

// Rutas de Regiones
router.get('/regions', async (req, res) => {
    try {
        const regions = await Region.findAll({ order: [['name', 'ASC']] });
        res.render('regions/index', { regions });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).render('error', { message: 'Error al cargar las regiones' });
    }
});

router.get('/regions/new', (req, res) => {
    res.render('regions/new');
});

router.post('/regions/new', async (req, res) => {
    try {
        await Region.create(req.body);
        res.redirect('/regions');
    } catch (error) {
        console.error('Error:', error);
        res.status(500).render('error', { message: 'Error al crear la región' });
    }
});

router.get('/regions/:id/edit', async (req, res) => {
    try {
        const region = await Region.findByPk(req.params.id);
        if (region) {
            res.render('regions/edit', { region });
        } else {
            res.status(404).render('404');
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).render('error', { message: 'Error al cargar la región' });
    }
});

router.post('/regions/:id/edit', async (req, res) => {
    try {
        await Region.update(req.body, { where: { id: req.params.id } });
        res.redirect('/regions');
    } catch (error) {
        console.error('Error:', error);
        res.status(500 ).render('error', { message: 'Error al actualizar la región' });
    }
});

router.post('/regions/:id/delete', async (req, res) => {
    try {
        await Region.destroy({ where: { id: req.params.id } });
        res.redirect('/regions');
    } catch (error) {
        console.error('Error:', error);
        res.status(500).render('error', { message: 'Error al eliminar la región' });
    }
});

// Rutas de Tipos
router.get('/types', async (req, res) => {
    try {
        const types = await Type.findAll({ order: [['name', 'ASC']] });
        res.render('types/index', { types });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).render('error', { message: 'Error al cargar los tipos' });
    }
});

router.get('/types/new', (req, res) => {
    res.render('types/new');
});

router.post('/types/new', async (req, res) => {
    try {
        await Type.create(req.body);
        res.redirect('/types');
    } catch (error) {
        console.error('Error:', error);
        res.status(500).render('error', { message: 'Error al crear el tipo' });
    }
});

router.get('/types/:id/edit', async (req, res) => {
    try {
        const type = await Type.findByPk(req.params.id);
        if (type) {
            res.render('types/edit', { type });
        } else {
            res.status(404).render('404');
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).render('error', { message: 'Error al cargar el tipo' });
    }
});

router.post('/types/:id/edit', async (req, res) => {
    try {
        await Type.update(req.body, { where: { id: req.params.id } });
        res.redirect('/types');
    } catch (error) {
        console.error('Error:', error);
        res.status(500).render('error', { message: 'Error al actualizar el tipo' });
    }
});

router.post('/types/:id/delete', async (req, res) => {
    try {
        await Type.destroy({ where: { id: req.params.id } });
        res.redirect('/types');
    } catch (error) {
        console.error('Error:', error);
        res.status(500).render('error', { message: 'Error al eliminar el tipo' });
    }
});

module.exports = router;