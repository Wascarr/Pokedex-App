const { Pokemon, Region, Type } = require('../models');

async function seedDatabase() {
    try {
        // Limpiar las tablas existentes
        await Pokemon.destroy({ where: {} });
        await Region.destroy({ where: {} });
        await Type.destroy({ where: {} });

        // Crear regiones
        const kanto = await Region.create({ name: 'Kanto' });
        const johto = await Region.create({ name: 'Johto' });

        // Crear tipos
        const electric = await Type.create({ name: 'Eléctrico' });
        const fire = await Type.create({ name: 'Fuego' });
        const water = await Type.create({ name: 'Agua' });
        const grass = await Type.create({ name: 'Planta' });
        const psychic = await Type.create({ name: 'Psíquico' });
        const normal = await Type.create({ name: 'Normal' });

        // Crear Pokémon
        const pokemons = await Pokemon.bulkCreate([
            {
                name: 'Pikachu',
                image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png',
                TypeId: electric.id,
                RegionId: kanto.id
            },
            {
                name: 'Charizard',
                image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/6.png',
                TypeId: fire.id,
                RegionId: kanto.id
            },
            {
                name: 'Blastoise',
                image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/9.png',
                TypeId: water.id,
                RegionId: kanto.id
            },
            {
                name: 'Venusaur',
                image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/3.png',
                TypeId: grass.id,
                RegionId: kanto.id
            },
            {
                name: 'Mewtwo',
                image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/150.png',
                TypeId: psychic.id,
                RegionId: kanto.id
            },
            {
                name: 'Snorlax',
                image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/143.png',
                TypeId: normal.id,
                RegionId: kanto.id
            }
        ]);

        console.log('Datos de prueba insertados correctamente');
        return { 
            regions: [kanto, johto], 
            types: [electric, fire, water, grass, psychic, normal], 
            pokemons 
        };
    } catch (error) {
        console.error('Error al insertar datos de prueba:', error);
        throw error;
    }
}

module.exports = seedDatabase;