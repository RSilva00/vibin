<script>
    import lodash from 'lodash'; // Cambiado a la importación por defecto
    const { debounce } = lodash; // Obtener debounce desde lodash
  
    let message = '';
    let searchQuery = '';
    let results = [];
    let error = null;
  
    // Carga el mensaje inicial del backend
    async function fetchMessage() {
      try {
        const response = await fetch('http://localhost:5000/api');
        const data = await response.json();
        message = data.message;
      } catch (err) {
        console.error('Error al obtener el mensaje del backend:', err.message);
      }
    }
  
    fetchMessage();
  
    // Función para buscar artistas
    const searchArtists = async () => {
      if (!searchQuery.trim()) {
        results = [];
        return;
      }
  
      try {
        const response = await fetch(`http://localhost:5000/api/search-artists?query=${searchQuery}`);
        if (!response.ok) {
          throw new Error('Error en la búsqueda');
        }
        results = await response.json();
      } catch (err) {
        error = err.message;
      }
    };
  
    // Función de búsqueda dinámica con debounce
    const debouncedSearch = debounce(() => {
      searchArtists();
    }, 500); // Retraso de 500ms para el debounce
  
    // Ejecutar búsqueda cada vez que cambie `searchQuery`
    $: debouncedSearch(searchQuery);

    import Header from '$lib/components/Header.svelte';

    let isAuthenticated = false;

    // Verificar si el usuario está autenticado
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        isAuthenticated = !!token;
    }
  
</script>

<style>

    .error { color: red; }
    .success { color: green; }
    
  .error {
    color: red;
  }

  .search-input {
    width: 100%;
    padding: 10px;
    margin-bottom: 20px;
    font-size: 16px;
  }

  .results-container {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
  }

  .artist-card {
    background-color: #f9f9f9;
    border: 1px solid #ccc;
    border-radius: 10px;
    overflow: hidden;
    text-align: center;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    transition: transform 0.2s, box-shadow 0.2s;
  }

  .artist-card:hover {
    transform: scale(1.05);
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  }

  .artist-card img {
    width: 100%;
    height: auto;
    border-bottom: 1px solid #ccc;
  }

  .artist-info {
    padding: 10px;
  }

  .artist-name {
    font-size: 16px;
    font-weight: bold;
    margin-bottom: 5px;
    color: #333;
  }

  .artist-fans {
    font-size: 14px;
    color: #555;
  }
</style>

<Header {isAuthenticated} />

<main style="padding: 2rem;">
    <h1>Bienvenido a la Página Principal</h1>
    {#if isAuthenticated}
        <p>Ya estás autenticado. Accede a las funcionalidades protegidas.</p>
    {:else}
        <p>Por favor, <a href="/login">inicia sesión</a> o <a href="/register">regístrate</a> para continuar.</p>
    {/if}
</main>

<main>
  <h1>Conexión SvelteKit y Node.js</h1>
  <p>{message}</p>

  <div>
    <input
      type="text"
      bind:value={searchQuery}
      placeholder="Buscar artistas"
      class="search-input"
    />

    {#if error}
      <p class="error">{error}</p>
    {/if}

    {#if results.length > 0}
      <div class="results-container">
        {#each results as artist}
          <div class="artist-card">
            <img src={artist.picture_medium || '/placeholder.jpg'} alt={artist.name} />
            <div class="artist-info">
              <div class="artist-name">{artist.name}</div>
              <div class="artist-fans">{artist.nb_fan.toLocaleString()} fans</div>
            </div>
          </div>
        {/each}
      </div>
    {:else if searchQuery.trim()}
      <p>No hay resultados</p>
    {/if}
  </div>
</main>
