const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path');
const winston = require('winston');
require('dotenv').config();

// Configuración de Winston para logging
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' })
    ]
});

// Añadir logging a consola en desarrollo
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.simple()
    }));
}

// Reemplazar console.log y console.error con winston
global.console.log = (...args) => logger.info.call(logger, ...args);
global.console.error = (...args) => logger.error.call(logger, ...args);

const app = express();

// Importar la conexión a la base de datos y los modelos
const { sequelize } = require('./models');
const seedDatabase = require('./seeders/init-data');

// Importar las rutas
const routes = require('./routes');

// Configuración de Handlebars
const hbs = exphbs.create({
    extname: '.hbs',
    defaultLayout: 'main',
    helpers: {
        lookup: function(obj, field) {
            return obj && obj[field];
        },
        eq: function(a, b) {
            return a === b;
        }
    },
    runtimeOptions: {
        allowProtoPropertiesByDefault: true,
        allowProtoMethodsByDefault: true
    }
});

// Configuración del motor de vistas
app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('views', './views');

// Middleware para procesar datos JSON y formularios
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware para logging de solicitudes
app.use((req, res, next) => {
    logger.info(`${req.method} ${req.url}`, {
        body: req.body,
        query: req.query,
        params: req.params
    });
    next();
});

// Archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Usar las rutas
app.use('/', routes);

// Manejo de errores 404
app.use((req, res, next) => {
    logger.warn(`404 - Página no encontrada: ${req.originalUrl}`);
    res.status(404).render('404', { 
        message: 'Página no encontrada',
        url: req.originalUrl 
    });
});

// Manejo de errores generales
app.use((err, req, res, next) => {
    logger.error('Error en la aplicación:', {
        error: err.message,
        stack: err.stack,
        url: req.originalUrl,
        method: req.method
    });

    const isDevelopment = process.env.NODE_ENV === 'development';
    
    res.status(500).render('error', { 
        message: isDevelopment ? err.message : 'Error interno del servidor',
        error: isDevelopment ? {
            message: err.message,
            stack: err.stack
        } : {},
        isDevelopment
    });
});

// Función para iniciar el servidor
async function startServer() {
    try {
        // Verificar la conexión a la base de datos
        await sequelize.authenticate();
        logger.info('Conexión a la base de datos establecida correctamente.');

        // Sincronizar la base de datos
        await sequelize.sync({ force: true });
        logger.info('Base de datos sincronizada correctamente.');

        // Insertar datos de prueba
        await seedDatabase();
        logger.info('Datos de prueba insertados correctamente.');

        // Iniciar el servidor
        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => {
            logger.info(`Servidor corriendo en http://localhost:${PORT}`);
            logger.info(`Ambiente: ${process.env.NODE_ENV || 'development'}`);
        });

    } catch (error) {
        logger.error('Error fatal al iniciar el servidor:', {
            error: error.message,
            stack: error.stack
        });
        process.exit(1);
    }
}

// Manejo de errores no capturados
process.on('uncaughtException', (error) => {
    logger.error('Error no capturado:', {
        error: error.message,
        stack: error.stack
    });
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    logger.error('Promesa rechazada no manejada:', {
        reason: reason,
        promise: promise
    });
    process.exit(1);
});

// Iniciar el servidor
startServer();

module.exports = app;