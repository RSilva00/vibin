<script>
    import { onMount } from 'svelte';
    import { favorites, addFavorite, removeFavorite } from '../lib/stores/favorites.js';
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
 let tracks = [];
  let currentIndex = 0;
  const tracksPerPage = 5;
  let loading = true;

  async function loadTracks() {
    try {
      const response = await fetch('http://localhost:5000/api/latest-tracks');
      if (!response.ok) {
        throw new Error('No se pudo obtener las canciones');
      }
      const data = await response.json();
      tracks = data.data;
      console.log("Tracks:", tracks);

      // Establecer un carrusel automático
      setInterval(() => {
        currentIndex = (currentIndex + 1) % Math.ceil(tracks.length / tracksPerPage);
      }, 3000);

      loading = false;
    } catch (err) {
      console.error('Error al obtener las canciones:', err.message);
      loading = false;
    }
  }

  loadTracks();

  // Función para dividir canciones en grupos de 5
  function chunkTracks(tracks, size) {
    const chunks = [];
    for (let i = 0; i < tracks.length; i += size) {
      chunks.push(tracks.slice(i, i + size));
    }
    return chunks;
  }
  
  let selectedArtist = null;
  let topTracks = [];

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

  // Función para obtener las 10 canciones principales de un artista
  const getTopTracks = async (artistId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/artist-top-tracks/${artistId}`);
      if (!response.ok) {
        throw new Error('Error al obtener canciones');
      }
      topTracks = await response.json();
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

  // Función para manejar la selección de un artista
  const handleArtistClick = (artistId) => {
    selectedArtist = results.find(artist => artist.id === artistId);
    getTopTracks(artistId);
  };

    import Header from '$lib/components/Header.svelte';

    let isAuthenticated = false;

    // Verificar si el usuario está autenticado
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        isAuthenticated = !!token;
    }

    const obtFavorites = async() => {
        const token = localStorage.getItem('token');
        console.log("Token:", token);
        if (token) {
            try {
                const response = await fetch('http://localhost:5000/api/getFavorites', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                });
                const data = await response.json();
                if (response.ok) {
                    favorites.set(data.favorites);
                    console.log("Favoritos:", data.favorites);
                } else {
                    console.error(data.error);
                }
            } catch (err) {
                console.error("Error al obtener favoritos:", err);
            }
        }
    }



onMount(() => {
  obtFavorites();
})


  // Función para agregar a favoritos
  const addToFavorites = async (songId) => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const response = await fetch('http://localhost:5000/api/favorites', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ songId }),
        });

        const data = await response.json();
        if (response.ok) {
          favorites.push(songId);  // Agregar el ID de la canción a favoritos
          alert(data.message);
        } else {
          alert(data.error);
        }
      } catch (err) {
        console.error("Error al agregar a favoritos:", err);
      }
    } else {
      alert('Debes iniciar sesión para agregar canciones a favoritos.');
    }
  };
  
// Función para reproducir la canción seleccionada
  const playTrack = (previewUrl) => {
    const audio = new Audio(previewUrl);
    audio.play();
  };

</script>
<style>
.carousel-container {
    position: relative;
    width: 50rem;
    overflow: hidden;
  }

  .carousel {
    display: flex;
    transition: transform 0.5s ease;
  }

  .carousel-item {
    min-width: 100%;
    box-sizing: border-box;
    padding: 20px;
  }

  .carousel-item img {
    width: 100%;
    border-radius: 10px;
  }

  .carousel-indicators {
    position: absolute;
    bottom: 10px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    justify-content: center;
    gap: 5px;
  }

  .indicator {
    background-color: white;
    border-radius: 50%;
    width: 10px;
    height: 10px;
    cursor: pointer;
    opacity: 0.7;
  }

  .indicator.active {
    background-color: #007bff;
  }

  .skeleton {
    background-color: #e0e0e0;
    border-radius: 10px;
    height: 200px;
  }

  .skeleton-text {
    background-color: #e0e0e0;
    height: 20px;
    margin-top: 10px;
    width: 60%;
    border-radius: 5px;
  }

  .skeleton-indicator {
    background-color: #e0e0e0;
    height: 10px;
    width: 10px;
    margin: 0 5px;
    border-radius: 50%;
  }

.error { color: red; }
.success { color: green; }

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
  cursor: pointer;
}

.artist-card:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
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

.track-list {
  margin-top: 20px;
}

.track-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.track-item button {
  padding: 5px 10px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.track-item button:hover {
  background-color: #0056b3;
}

.track-item img {
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 5px;
}

</style>

<Header {isAuthenticated} />

<main style="padding: 2rem;">
    <h1>Bienvenido a la Página Principal</h1>
    {#if isAuthenticated}
    {console.log()}
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
      <div class="artist-card" on:click={() => handleArtistClick(artist.id)}>
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
      
      {#if selectedArtist}
  <h2>{selectedArtist.name} - Top 10 Canciones</h2>
  <div class="track-list">
    {#each topTracks as track}
      <div class="track-item">
        <img src={track.album.cover_medium || '/placeholder.jpg'} alt={track.title} />
        <div>{track.title}</div>
        <button on:click={() => playTrack(track.preview)}>Reproducir</button>

        {#if $favorites.find(fav => {
    console.log("Comparando", fav, "con", track.id); 
    return fav === track.id;
})}
    <button on:click={() => removeFavorite(track.id)}>Eliminar de favoritos</button>
{:else}
    <button on:click={() => addFavorite(track.id)}>Agregar a favoritos</button>
{/if}

      </div>
    {/each}
  </div>
{/if}

      </div>
    </main>

    <div class="carousel-container">
      {#if loading}
        <!-- Skeleton Loader -->
        <div class="carousel">
          {#each Array(tracksPerPage) as _}
            <div class="carousel-item">
              <div class="skeleton"></div>
            </div>
          {/each}
        </div>
      {:else}
        <!-- Carrusel de Canciones -->
        {#if tracks.length > 0}
          <div class="carousel" style="transform: translateX(-{currentIndex * 100}%)">
            {#each chunkTracks(tracks, tracksPerPage) as trackGroup}
              <div class="carousel-item">
                {#each trackGroup as track}
                  <div>
                    <img src={track.album.cover_medium || '/placeholder.jpg'} alt={track.title} />
                    <div>{track.title}</div>
                  </div>
                {/each}
              </div>
            {/each}
          </div>
    
          <div class="carousel-indicators">
            {#each Array(Math.ceil(tracks.length / tracksPerPage)) as _, index}
              <div
                class="indicator {index === currentIndex ? 'active' : ''}"
                on:click={() => currentIndex = index}
              ></div>
            {/each}
          </div>
        {/if}
      {/if}
    </div>