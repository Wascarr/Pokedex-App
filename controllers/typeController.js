// controllers/typeController.js
const { Type } = require('../models');

exports.getAllTypes = async (req, res) => {
    try {
        const types = await Type.findAll();
        res.render('types/index', { types });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).render('error', { message: 'Error al cargar los tipos' });
    }
};

exports.newTypeForm = (req, res) => {
    res.render('types/new');
};

exports.createType = async (req, res) => {
    try {
        await Type.create(req.body);
        res.redirect('/types');
    } catch (error) {
        console.error('Error:', error);
        res.status(500).render('error', { message: 'Error al crear el tipo' });
    }
};

exports.editTypeForm = async (req, res) => {
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
};

exports.updateType = async (req, res) => {
    try {
        await Type.update(req.body, {
            where: { id: req.params.id }
        });
        res.redirect('/types');
    } catch (error) {
        console.error('Error:', error);
        res.status(500).render('error', { message: 'Error al actualizar el tipo' });
    }
};

exports.deleteType = async (req, res) => {
    try {
        await Type.destroy({
            where: { id: req.params.id }
        });
        res.redirect('/types');
    } catch (error) {
        console.error('Error:', error);
        res.status(500).render('error', { message: 'Error al eliminar el tipo' });
    }
};