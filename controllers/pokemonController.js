const { Pokemon, Region, Type } = require('../models');
const { Op } = require('sequelize');

exports.getHomePage = async (req, res) => {
    try {
        console.log('Query params:', req.query);

        const page = parseInt(req.query.page) || 1;
        const limit = 12;
        const offset = (page - 1) * limit;

        const { name, regionId, typeId } = req.query;
        let whereClause = {};
        
        if (name) whereClause.name = { [Op.like]: `%${name}%` };
        if (regionId) whereClause.RegionId = regionId;
        if (typeId) whereClause.TypeId = typeId;

        console.log('Where clause:', whereClause);

        const { count, rows: pokemons } = await Pokemon.findAndCountAll({
            where: whereClause,
            include: [
                { model: Region, required: true },
                { model: Type, required: true }
            ],
            limit,
            offset,
            distinct: true
        });

        console.log('Pokemons found:', pokemons.length);
        console.log('Total count:', count);

        const totalPages = Math.ceil(count / limit);
        const pagination = {
            prev: page > 1 ? page - 1 : null,
            next: page < totalPages ? page + 1 : null,
            pages: Array.from({ length: totalPages }, (_, i) => ({
                number: i + 1,
                active: i + 1 === page
            })),
            currentPage: page,
            totalPages
        };

        // Optimizado: Carga regiones y tipos en paralelo
        const [regions, types] = await Promise.all([
            Region.findAll(),
            Type.findAll()
        ]);

        console.log('Regions:', regions.map(r => r.name));
        console.log('Types:', types.map(t => t.name));

        const renderData = { 
            pokemons,
            regions,
            types,
            pagination,
            searchTerm: name,
            selectedRegions: regionId ? { [regionId]: true } : {},
            selectedTypes: typeId ? { [typeId]: true } : {},
            currentRegionId: regionId,
            currentTypeId: typeId
        };

        console.log('Render data:', JSON.stringify(renderData, null, 2));

        res.render('home', renderData);
    } catch (error) {
        console.error('Error in getHomePage:', error);
        res.status(500).render('error', { message: 'Error al cargar los Pokémon', error: error.toString() });
    }
};

exports.newPokemonForm = async (req, res) => {
    try {
        // Optimizado: Carga regiones y tipos en paralelo
        const [regions, types] = await Promise.all([
            Region.findAll(),
            Type.findAll()
        ]);
        res.render('pokemon/new', { regions, types });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).render('error', { message: 'Error al cargar el formulario' });
    }
};

exports.createPokemon = async (req, res) => {
    try {
        const { name, typeId, regionId, image } = req.body;
        
        console.log('Datos recibidos del formulario:', req.body);
        
        if (!name || !typeId || !regionId) {
            throw new Error('Todos los campos son requeridos: nombre, tipo y región');
        }

        // Optimizado: Verifica tipo y región en paralelo
        const [type, region] = await Promise.all([
            Type.findByPk(typeId),
            Region.findByPk(regionId)
        ]);

        if (!type || !region) {
            throw new Error('El tipo o la región seleccionada no existe');
        }

        const newPokemon = await Pokemon.create({
            name,
            TypeId: typeId,
            RegionId: regionId,
            image: image || null
        });

        console.log('Pokémon creado exitosamente:', newPokemon.toJSON());

        res.redirect('/');

    } catch (error) {
        console.error('Error detallado al crear Pokémon:', {
            message: error.message,
            stack: error.stack,
            name: error.name
        });

        try {
            // Optimizado: Carga tipos y regiones en paralelo para re-renderizar el formulario
            const [types, regions] = await Promise.all([
                Type.findAll(),
                Region.findAll()
            ]);

            res.status(500).render('pokemon/new', {
                error: `Error al crear el Pokémon: ${error.message}`,
                types,
                regions,
                pokemon: req.body
            });
        } catch (secondaryError) {
            console.error('Error secundario al cargar tipos y regiones:', secondaryError);
            res.status(500).render('error', {
                message: 'Error al crear el Pokémon y al cargar el formulario',
                error: error.toString()
            });
        }
    }
};

exports.editPokemonForm = async (req, res) => {
    try {
        // Optimizado: Carga pokemon, regiones y tipos en paralelo
        const [pokemon, regions, types] = await Promise.all([
            Pokemon.findByPk(req.params.id, { include: [Region, Type] }),
            Region.findAll(),
            Type.findAll()
        ]);

        if (pokemon) {
            res.render('pokemon/edit', { pokemon, regions, types });
        } else {
            res.status(404).render('404');
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).render('error', { message: 'Error al cargar el formulario de edición' });
    }
};

exports.updatePokemon = async (req, res) => {
    try {
        const [updatedRows] = await Pokemon.update(req.body, {
            where: { id: req.params.id }
        });

        if (updatedRows > 0) {
            res.redirect('/');
        } else {
            res.status(404).render('404');
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).render('error', { message: 'Error al actualizar el Pokémon' });
    }
};

exports.deletePokemon = async (req, res) => {
    try {
        const deletedRows = await Pokemon.destroy({
            where: { id: req.params.id }
        });

        if (deletedRows > 0) {
            res.sendStatus(200);
        } else {
            res.status(404).json({ message: 'Pokémon no encontrado' });
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Error al eliminar el Pokémon' });
    }
};

exports.getPokemonDetails = async (req, res) => {
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
        res.status(500).render('error', { message: 'Error al cargar los detalles del Pokémon' });
    }
};

exports.searchPokemon = async (req, res) => {
    try {
        const { name } = req.query;
        const pokemons = await Pokemon. findAll({
            where: { name: { [Op.like]: `%${name}%` } },
            include: [Region, Type],
            limit: 10
        });
        res.json(pokemons);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Error en la búsqueda' });
    }
};