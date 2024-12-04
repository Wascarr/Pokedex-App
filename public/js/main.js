// Variables globales
let searchTimeout;
let lastScrollPosition = 0;
// Inicializar tooltips
var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))

var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
  return new bootstrap.Tooltip(tooltipTriggerEl)
})
// Búsqueda en tiempo real con mantenimiento de scroll
document.getElementById('searchName')?.addEventListener('input', function() {
    clearTimeout(searchTimeout);
    const searchTerm = this.value;
    
    // Guardar la posición actual del scroll
    lastScrollPosition = window.scrollY;
    
    searchTimeout = setTimeout(() => {
        fetch(`/api/pokemon/search?name=${searchTerm}`)
            .then(response => response.json())
            .then(data => {
                updatePokemonList(data);
                // Restaurar la posición del scroll después de actualizar la lista
                window.scrollTo(0, lastScrollPosition);
            })
            .catch(error => {
                console.error('Error en la búsqueda:', error);
                showError('Error al buscar Pokémon');
            });
    }, 300);
});

function updatePokemonList(pokemons) {
    const pokemonGrid = document.querySelector('.pokemon-grid');
    if (!pokemonGrid) return;

    pokemonGrid.innerHTML = pokemons.map(pokemon => `
        <div class="col-sm-6 col-md-4 col-lg-3 mb-4" data-aos="fade-up">
            <div class="card h-100 shadow-sm">
                <img src="${pokemon.image || '/images/pokemon-placeholder.png'}" 
                     class="card-img-top" 
                     alt="${pokemon.name}"
                     onerror="this.src='/images/pokemon-placeholder.png'">
                <div class="card-body">
                    <h5 class="card-title text-center">${pokemon.name}</h5>
                    <div class="d-flex justify-content-between mb-2">
                        <span class="badge bg-primary">${pokemon.Type?.name || 'Sin tipo'}</span>
                        <span class="badge bg-secondary">${pokemon.Region?.name || 'Sin región'}</span>
                    </div>
                </div>
                <div class="card-footer bg-transparent">
                    <div class="d-flex justify-content-between gap-2">
                        <a href="/pokemon/${pokemon.id}/edit" 
                           class="btn btn-warning btn-sm flex-grow-1"
                           data-bs-toggle="tooltip" 
                           title="Editar Pokémon">
                            <i class="fas fa-edit"></i> Editar
                        </a>
                        <button onclick="deletePokemon(${pokemon.id})" 
                                class="btn btn-danger btn-sm flex-grow-1"
                                data-bs-toggle="tooltip" 
                                title="Eliminar Pokémon">
                            <i class="fas fa-trash"></i> Eliminar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');

    initializeComponents();
}

// Función para mostrar errores usando SweetAlert2
function showError(message) {
    Swal.fire({
        icon: 'error',
        title: 'Error',
        text: message,
        confirmButtonColor: '#3085d6'
    });
}

// Función para eliminar Pokémon
function deletePokemon(id) {
    Swal.fire({
        title: '¿Estás seguro?',
        text: "No podrás revertir esta acción",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            handleDelete(`/pokemon/${id}/delete`, 'Pokémon');
        }
    });
}

// Función para eliminar Tipo
function deleteType(id) {
    Swal.fire({
        title: '¿Estás seguro?',
        text: "Esta acción eliminará el tipo y podría afectar a los Pokémon asociados",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            handleDelete(`/types/${id}/delete`, 'tipo');
        }
    });
}

// Función para eliminar Región
function deleteRegion(id) {
    Swal.fire({
        title: '¿Estás seguro?',
        text: "Esta acción eliminará la región y podría afectar a los Pokémon asociados",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            handleDelete(`/regions/${id}/delete`, 'región');
        }
    });
}

// Función genérica para manejar eliminaciones
async function handleDelete(url, itemType) {
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            await Swal.fire({
                title: '¡Eliminado!',
                text: `El ${itemType} ha sido eliminado.`,
                icon: 'success',
                confirmButtonColor: '#3085d6'
            });
            window.location.reload();
        } else {
            throw new Error(`Error al eliminar ${itemType}`);
        }
    } catch (error) {
        console.error('Error:', error);
        showError(`No se pudo eliminar el ${itemType}`);
    }
}

// Función para inicializar componentes
function initializeComponents() {
    // Inicializar tooltips
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function(tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    // Reinicializar AOS
    if (typeof AOS !== 'undefined') {
        AOS.refresh();
    }
}

// Mantener la posición del scroll al recargar la página
window.addEventListener('beforeunload', () => {
    sessionStorage.setItem('scrollPosition', window.scrollY);
});

// Inicialización cuando el DOM está listo
document.addEventListener('DOMContentLoaded', function() {
    // Restaurar la posición del scroll
    const savedScrollPosition = sessionStorage.getItem('scrollPosition');
    if (savedScrollPosition) {
        window.scrollTo(0, parseInt(savedScrollPosition));
        sessionStorage.removeItem('scrollPosition');
    }

    // Inicializar componentes
    initializeComponents();
    
    // Inicializar AOS
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 800,
            once: true,
            offset: 50
        });
    }
});