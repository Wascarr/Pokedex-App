const { Region } = require('../models');

exports.getAllRegions = async (req, res) => {
    try {
        const regions = await Region.findAll({ order: [['name', 'ASC']] });
        res.render('regions/index', { regions });
    } catch (error) {
        console.error('Error al obtener regiones:', error);
        res.status(500).render('error', { message: 'Error al cargar las regiones' });
    }
};

exports.newRegionForm = (req, res) => {
    res.render('regions/new');
};

exports.createRegion = async (req, res) => {
    try {
        console.log('Datos recibidos:', req.body); // Para depuración
        const { name } = req.body;
        if (!name) {
            throw new Error('El nombre de la región es requerido');
        }
        const newRegion = await Region.create({ name });
        console.log('Nueva región creada:', newRegion.toJSON()); // Para depuración
        res.redirect('/regions');
    } catch (error) {
        console.error('Error al crear región:', error);
        res.status(500).render('error', { message: 'Error al crear la región: ' + error.message });
    }
};

exports.editRegionForm = async (req, res) => {
    try {
        const region = await Region.findByPk(req.params.id);
        if (region) {
            res.render('regions/edit', { region });
        } else {
            res.status(404).render('404');
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).render('error', { message: 'Error al cargar el formulario de edición' });
    }
};

exports.updateRegion = async (req, res) => {
    try {
        const { name } = req.body;
        await Region.update({ name }, {
            where: { id: req.params.id }
        });
        res.redirect('/regions');
    } catch (error) {
        console.error('Error:', error);
        res.status(500).render('error', { message: 'Error al actualizar la región' });
    }
};

exports.deleteRegion = async (req, res) => {
    try {
        await Region.destroy({ where: { id: req.params.id } });
        res.redirect('/regions');
    } catch (error) {
        console.error('Error al eliminar región:', error);
        res.status(500).json({ message: 'Error al eliminar la región' });
    }
};