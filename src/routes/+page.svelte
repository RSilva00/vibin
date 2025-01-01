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
  
  let name = '';
  let email = '';
  let password = '';
  let errorMessage = '';
  let successMessage = '';

  const handleSubmit = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al registrar el usuario');
      }

      successMessage = data.message;
      name = '';
      email = '';
      password = '';
      errorMessage = '';
    } catch (error) {
      errorMessage = error.message;
      successMessage = '';
    }
  };
</script>


<h2>Registro de Usuario</h2>

{#if errorMessage}
  <p class="error">{errorMessage}</p>
  {/if}
  
  {#if successMessage}
  <p class="success">{successMessage}</p>
  {/if}
  
  <form on:submit|preventDefault={handleSubmit}>
  <label for="name">Nombre</label>
  <input type="text" id="name" bind:value={name} required />

  <label for="email">Correo electrónico</label>
  <input type="email" id="email" bind:value={email} required />

  <label for="password">Contraseña</label>
  <input type="password" id="password" bind:value={password} required />

  <button type="submit">Registrar</button>
</form>



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
