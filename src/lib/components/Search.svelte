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
    if (searchQuery.trim()) {
      debouncedSearch(); // Llamamos a la función debouncedSearch cuando cambia searchQuery
    }
  }
</script>
<style>
  .search-input {
    width: 100%;
    padding: 0.5rem;
    font-size: 1rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    margin-bottom: 1rem;
  }

  .results-container {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
  }

  .result-card {
    border: 1px solid #ddd;
    border-radius: 4px;
    padding: 0.5rem;
    width: calc(33.33% - 1rem);
    text-align: center;
  }

  .error {
    color: red;
    margin-top: 1rem;
  }
</style>

<div>
  <input
    type="text"
    placeholder="Buscar..."
    class="search-input"
    bind:value={searchQuery}
  />

  {#if error}
    <p class="error">{error}</p>
  {/if}

  {#if results.length > 0}
    <div class="results-container">
      {#each results as result}
        <div class="result-card">
          {#if result.type === 'artist'}
            <img src={result.picture || '/placeholder.jpg'} alt={result.name} style="width: 100%; height: auto;" />
            <p>{result.name}</p>
          {:else if result.type === 'track'}
            <img src={result.cover || '/placeholder.jpg'} alt={result.title} style="width: 100%; height: auto;" />
            <p>{result.title}</p>
            <p>{result.artist}</p>
            <audio controls>
              <source src={result.preview} type="audio/mpeg" />
              Tu navegador no soporta el elemento de audio.
            </audio>
          {:else if result.type === 'album'}
            <img src={result.cover || '/placeholder.jpg'} alt={result.title} style="width: 100%; height: auto;" />
            <p>{result.title}</p>
            <p>{result.artist}</p>
          {/if}
        </div>
      {/each}
    </div>
  {/if}

  {#if searchQuery.trim() && results.length === 0 && !error}
    <p>No se encontraron resultados</p>
  {/if}
</div>