<script>
  import lodash from 'lodash';
  const debounce = lodash.debounce; // Correctamente accediendo a debounce de lodash

  let searchQuery = ''; // Valor del input de búsqueda
  let results = []; // Resultados de la búsqueda
  let error = ''; // Manejo de errores

  // Función de búsqueda general
  const searchGeneral = async () => {

    if (!searchQuery.trim()) {
      console.log("Nada que buscar");
      results = [];
      return;
    }

    try {
      console.log("Buscando en el backend para:", searchQuery);
      const response = await fetch(`http://localhost:5000/api/search?query=${encodeURIComponent(searchQuery)}`);
      if (!response.ok) {
        throw new Error('Error al comunicarse con el backend');
      }

      const data = await response.json();
      results = data.results || [];
    } catch (err) {
      error = err.message;
      console.error("Error al realizar la búsqueda:", err.message);
    }
  };


  // Aquí definimos debouncedSearch como una función que se ejecuta con un retraso
  const debouncedSearch = debounce(() => {
    searchGeneral();
  }, 500);

  // Ejecutamos la función de búsqueda cada vez que searchQuery cambie
  $: {
    if (searchQuery.trim() === '') {
      results = [];
    }
    if (searchQuery.trim()) {
      debouncedSearch(); // Llamamos a la función debouncedSearch cuando cambia searchQuery
    }
  }

  let currentAudio = null;

  function playAudio(src) {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    }
    currentAudio = new Audio(src);
    currentAudio.play();
  }

  function stopAudio() {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      currentAudio = null;
    }
  }

  import { showCarrusel } from '$lib/stores/showCarrusel.js';
    import { get } from 'svelte/store';
    import { resultToShow } from '$lib/stores/resultToShow.js';
    import { setCurrentSong } from '$lib/stores/songStore.js';
</script>

<style>
/* Estilos generales */
.search {
  position: relative; /* Posiciona los resultados en relación con el input */
  color: black;
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem;
  font-size: 1.1rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: #007BFF;
  box-shadow: 0 4px 10px rgba(0, 123, 255, 0.3);
}

/* Contenedor de los resultados flotante */
.results-overlay {
  position: fixed; /* Fija el contenedor en la pantalla */
  top: 50%; /* Centrado vertical */
  left: 50%; /* Centrado horizontal */
  transform: translate(-50%, -50%); /* Ajuste para centrar */
  z-index: 1000; /* Asegura que el contenedor esté sobre otros elementos */
  width: 85%; /* Ancho del contenedor */
  max-height: 70vh; /* Altura máxima del contenedor */
  overflow-y: auto; /* Permite desplazamiento si hay más contenido */
  background-color: rgba(255, 255, 255, 0.95); /* Fondo casi opaco */
  padding: 2rem;
  border-radius: 16px; /* Bordes redondeados */
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.25); /* Sombra intensa */
  display: flex;
  flex-direction: column; /* Organización de los resultados */
  gap: 2rem; /* Espacio entre los grupos */
  animation: fadeIn 0.4s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translate(-50%, -60%);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%);
  }
}

.results-container {
  display: flex;
  flex-direction: column; /* Organización vertical de grupos */
  gap: 1.5rem; /* Espacio entre grupos */
}

.results-container button {
  background-color: #000000;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.3s ease;
}

.results-container button:hover {
  background-color: #7900b9;
}

/* Grupos de resultados */
.result-group {
  display: flex;
  flex-direction: row; /* Resultados en fila */
  justify-content: space-evenly;
  flex-wrap: wrap; /* Permite que los elementos se ajusten */
  gap: 1rem;
}

/* Estilo de las tarjetas de resultados */
.result-card {
  border: 1px solid #ddd;
  border-radius: 12px;
  padding: 1rem;
  width: calc(20% - 1rem); /* Ajusta el tamaño relativo */
  text-align: center;
  position: relative;
  background: white;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.result-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.2);
}

.cover-image {
  width: 100%;
  height: auto;
  border-radius: 8px;
  margin-bottom: 0.5rem;
}

/* Controles de audio */
.audio-container {
  position: relative;
}

.audio-controls {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  gap: 0.5rem;
  opacity: 0;
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.audio-container:hover .audio-controls {
  opacity: 1;
  transform: translate(-50%, -50%) scale(1.1);
}

.audio-controls button {
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.audio-controls button:hover {
  background-color: rgba(0, 0, 0, 0.9);
}

/* Estilo de los mensajes de error */
.error {
  color: red;
  font-weight: bold;
  margin-top: 1rem;
  text-align: center;
  font-size: 1.1rem;
}


/* Botón fijo en la parte superior derecha */
.cancel-button {
  position: fixed;
  top: 2.5rem; /* Distancia desde la parte superior */
  right: 1rem;
  z-index: 1000; /* Asegura que esté por encima de otros elementos */
  background-color: rgb(68, 68, 68); /* Color rojo para destacar */
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  transition: background-color 0.3s ease, transform 0.2s ease;
}

.cancel-button:hover {
  background-color: rgb(0, 0, 0); /* Color más oscuro en hover */
  transform: scale(1.05); /* Ligeramente más grande */
}

.cancel-button:active {
  transform: scale(0.95); /* Más pequeño al hacer clic */
  background-color: #c12b2b; /* Color más oscuro */
}
</style>


<!-- Solo muestra resultados si hay término de búsqueda y resultados -->
<div class="search">
  <input
    type="text"
    placeholder="Buscar..."
    class="search-input"
    bind:value={searchQuery}
  />
  
  {#if error}
    <p class="error">{error}</p>
  {/if}

  {#if searchQuery.trim() && results.length > 0}
    <button 
      class="cancel-button" 
      on:click={() => searchQuery = ""}
    >
      Cancelar búsqueda
    </button>
    
    <div class="results-overlay">
      <div class="results-container">
        <!-- Grupo de Artistas -->
        {#if results.filter(result => result.type === 'artist').length > 0}
          <h3>Artistas</h3>
          <div class="result-group">
            {#each results.filter(result => result.type === 'artist') as result}
              <div class="result-card">
                <button on:click={() => {
                  showCarrusel.set(false);
                  resultToShow.set(result.id)
                  searchQuery = "";
                  console.log("resultToShow", result.id)
                }}>
                  <img src={result.picture || '/placeholder.jpg'} alt={result.name} style="width: 100%; height: auto;" />
                </button>
                <p>{result.name}</p>
              </div>
            {/each}
          </div>
        {/if}

        <!-- Grupo de Pistas -->
        {#if results.filter(result => result.type === 'track').length > 0}
          <h3>Canciones</h3>
          <div class="result-group">
            {#each results.filter(result => result.type === 'track') as result}
              <div class="result-card">
                <div class="audio-container">
                  <img src={result.cover || '/placeholder.jpg'} alt={result.title} class="cover-image" />
                  <div class="audio-controls">
                    <button on:click={() => setCurrentSong(result)}>Play</button>
                  </div>
                </div>
                <p>{result.title}</p>
                <p>{result.artist}</p>
              </div>
            {/each}
          </div>
        {/if}

        <!-- Grupo de Álbumes -->
        {#if results.filter(result => result.type === 'album').length > 0}
          <h3>Álbumes</h3>
          <div class="result-group">
            {#each results.filter(result => result.type === 'album') as result}
              <div class="result-card">
                 <button on:click={() => {
                  showCarrusel.set(false);
                  resultToShow.set(result.id)
                  searchQuery = "";
                  console.log("resultToShow", result.id)
                }}>
                  <img src={result.cover || '/placeholder.jpg'} alt={result.title} style="width: 100%; height: auto;" />
                </button>
                <p>{result.title}</p>
                <p>{result.artist}</p>
              </div>
            {/each}
          </div>
        {/if}
      </div>
    </div>
  {/if}

</div>
