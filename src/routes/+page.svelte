<script>
    import { onMount, onDestroy } from 'svelte';
    import { favorites, addFavorite, removeFavorite } from '../lib/stores/favorites.js';
    import lodash from 'lodash'; // Cambiado a la importación por defecto
    import { initializeSession, tokenStatus } from '$lib/services/tokenValidation.js';
    import Carrusel from '$lib/components/Carrusel.svelte';
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
  let loading = true;

  async function loadTracks() {
    try {
      const response = await fetch("http://localhost:5000/api/latest-tracks");
      if (!response.ok) {
        throw new Error("No se pudo obtener las canciones");
      }
      const data = await response.json();
      tracks = data.data;
      loading = false;
    } catch (err) {
      console.error("Error al obtener las canciones:", err.message);
      loading = false;
    }
  }

  onMount(() => {
    loadTracks();
  });
  
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
    import { get } from 'svelte/store';
    import SearchResult from '$lib/components/SearchResult.svelte';

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

    // Reproducir una canción seleccionada
  const playTrack = (previewUrl) => {
    const audio = new Audio(previewUrl);
    audio.play();
  };


onMount(() => {
  initializeSession();
  obtFavorites();
})

  let selectedOption = null;
let favoriteSongs = []; // Lista local para las canciones favoritas

export async function fetchFavoriteSongs() {
  const token = localStorage.getItem('token');
  const favoriteIds = get(favorites); // Obtener los IDs de favoritos del writable

  if (!favoriteIds || favoriteIds.length === 0) {
    console.warn('No hay canciones favoritas almacenadas.');
    return;
  }

  try {
    const response = await fetch('http://localhost:5000/api/userFavorites', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`, // Agrega token si es necesario
      },
      body: JSON.stringify({ ids: favoriteIds }), // Envía los IDs al backend
    });

    if (response.ok) {
      favoriteSongs = await response.json();
      favoriteSongs = favoriteSongs.favorites;
      console.log('Canciones favoritas:', favoriteSongs);
    } else {
      const errorData = await response.json();
      console.error('Error al obtener canciones favoritas:', errorData.error);
    }
  } catch (error) {
    console.error('Error fetching favorite songs:', error.message);
  }
}

function handleOptionClick(option) {
  if (isAuthenticated) {
    selectedOption = option;
    if (option === 'Favoritos') {
      fetchFavoriteSongs(); // Llama a la función para obtener los datos
    }
  } else {
    alert('Por favor, inicia sesión o regístrate para acceder a esta opción.');
  }
}

  function goBack() {
    selectedOption = null;
  }

  import {showCarrusel} from '$lib/stores/showCarrusel.js';
    import { resultToShow } from '$lib/stores/resultToShow.js';

     function changeId(newId) {
        resultToShow.set(newId);
        showCarrusel.set(false);
    }

    import { setCurrentSong } from '$lib/stores/songStore.js';
  import FixedPlayer from '$lib/components/FixedPlayer.svelte'; // Reproductor fijo
  import { currentSongId } from '$lib/stores/songStore.js';
    import RecentlyPlayed from '$lib/components/RecentlyPlayed.svelte';
    import { addRecentlyPlayed } from '$lib/stores/recentlyPlayedStore.js';

  async function handlePlaySong(song) {
    // Actualiza el `store` localmente
    addRecentlyPlayed(song);

    // Envía los datos al backend para actualizar el historial en la base de datos
    try {
      const response = await fetch("http://localhost:5000/api/recently-played", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          songId: song.id
        }),
      });

      if (!response.ok) {
        throw new Error("Error al sincronizar con el backend");
      }
    } catch (error) {
      console.error("Error al actualizar el historial en el backend:", error);
    }
  }

  import { initializeRecentlyPlayed } from "$lib/stores/recentlyPlayedStore.js";

  // Llama a la función para inicializar el store
  initializeRecentlyPlayed();

</script>


<FixedPlayer />

<style>

  main {
        display: grid;
        grid-template-columns: 20% 1fr 20%;
        gap: 1rem;
        padding: 1rem;
        height: 65vh;
    }

    .sidebar {
        background: rgba(0, 0, 0, 0.7);
        color: white;
        padding: 1rem;
        border-radius: 10px;
    }

    .sidebar h2 {
        margin-top: 0;
    }

    .content {
      border: 1px solid white;
    }

    .content h2 {
        margin-top: 0;
    }

    /* Contenedor principal de la sección extra */
.extra {
    background: rgba(0, 0, 0, 0.8); /* Fondo más oscuro */
    color: white;
    padding: 1.5rem;
    border-radius: 12px; /* Bordes redondeados */
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.4); /* Sombra para profundidad */
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    overflow: hidden; /* Previene desbordes */
}

.extra:hover {
    transform: scale(1.02); /* Aumenta ligeramente el tamaño */
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.5); /* Sombra más intensa */
}

/* Título de la sección */
.extra h2 {
    margin-top: 0;
    font-size: 1.5rem; /* Tamaño del texto más grande */
    color: #ff66cc; /* Morado vibrante */
    border-bottom: 2px solid #ff66cc; /* Línea decorativa */
    padding-bottom: 0.5rem;
    text-transform: uppercase;
}

/* Lista de enlaces */
.extra ul {
    list-style: none; /* Elimina los puntos de lista */
    padding: 0;
    margin: 1rem 0 0; /* Separación superior */
    display: flex;
    flex-direction: column;
    gap: 1rem; /* Espaciado entre elementos */
}

.extra li {
    margin: 0;
}

.extra a {
    color: #ffffff; /* Texto blanco */
    text-decoration: none;
    font-size: 1rem;
    font-weight: bold;
    padding: 0.5rem 1rem;
    border: 2px solid transparent;
    border-radius: 8px;
    transition: color 0.3s ease, background-color 0.3s ease, transform 0.2s ease;
    background-color: rgba(255, 255, 255, 0.1); /* Fondo semi-transparente */
}

.extra a:hover {
    color: #1a1a1a; /* Texto negro */
    background-color: #ff66cc; /* Fondo morado vibrante */
    transform: scale(1.05); /* Aumenta ligeramente el tamaño */
    border: 2px solid #ff66cc; /* Borde decorativo */
}

.extra a:active {
    transform: scale(0.98); /* Reduce ligeramente el tamaño al hacer clic */
    background-color: #e055b3; /* Fondo morado más oscuro */
}

/* Responsive: Espaciado adicional en pantallas pequeñas */
@media (max-width: 768px) {
    .extra {
        padding: 1rem;
    }

    .extra h2 {
        font-size: 1.2rem;
    }

    .extra a {
        font-size: 0.9rem;
        padding: 0.4rem 0.8rem;
    }
}


    a {
        color: lightblue;
        text-decoration: none;
    }

    a:hover {
        text-decoration: underline;
    }
.loading {
    text-align: center;
    font-size: 1.5rem;
    color: gray;
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
}/* Contenedor principal de la barra lateral */
.sidebar {
    padding: 1.5rem; /* Más espacio para un diseño limpio */
    border: 1px solid #444; /* Borde grafito */
    background-color: #1a1a1a; /* Fondo negro */
    border-radius: 12px; /* Bordes redondeados */
    color: white; /* Texto en blanco */
    overflow-y: auto;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.4); /* Sombra para profundidad */
    transition: transform 0.3s ease, box-shadow 0.3s ease; /* Transición suave */
}

.sidebar:hover {
    transform: scale(1.02); /* Aumenta ligeramente el tamaño */
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.5); /* Sombra más intensa */
}

/* Lista dentro de la barra lateral */
.sidebar ul {
    list-style: none; /* Sin viñetas */
    padding: 0;
    margin: 1rem 0 0; /* Espaciado superior para separar contenido */
    display: flex;
    flex-direction: column; /* Organización vertical */
    gap: 1rem; /* Espaciado entre elementos */
}

.sidebar li {
    margin: 0; /* Elimina margen adicional */
}

/* Estilo de botones dentro de la barra lateral */
.sidebar button {
    width: 100%;
    padding: 0.75rem 1rem; /* Botones más amplios */
    border: none;
    border-radius: 8px; /* Bordes redondeados */
    cursor: pointer;
    background-color: #df00da; /* Fondo morado oscuro */
    color: white;
    font-size: 1rem;
    font-weight: bold;
    text-transform: uppercase;
    transition: background-color 0.3s ease, transform 0.2s ease, box-shadow 0.3s ease; /* Transiciones suaves */
}

.sidebar button:hover {
    background-color: #6a0dad; /* Morado más claro */
    transform: translateY(-2px); /* Desplazamiento hacia arriba */
    box-shadow: 0 4px 12px rgba(106, 13, 173, 0.6); /* Sombra morada */
}

.sidebar button:active {
    background-color: #3a0066; /* Morado más oscuro */
    transform: translateY(0); /* Vuelve a su posición original */
    box-shadow: 0 2px 6px rgba(58, 0, 102, 0.6); /* Sombra reducida */
}

/* Botones deshabilitados */
.sidebar button[disabled] {
    background-color: #333; /* Fondo grafito oscuro */
    color: #aaa; /* Texto gris claro */
    cursor: not-allowed;
    opacity: 0.6; /* Más transparencia */
}

.sidebar button[disabled]:hover {
    transform: none; /* Sin transformación */
    box-shadow: none; /* Sin sombra */
}

/* Scrollbar estilizado */
.sidebar::-webkit-scrollbar {
    width: 8px; /* Ancho de la barra de desplazamiento */
}

.sidebar::-webkit-scrollbar-thumb {
    background: #4b0082; /* Color morado oscuro */
    border-radius: 4px; /* Bordes redondeados */
}

/* Títulos dentro de la barra lateral */
.sidebar h2 {
    font-size: 1.5rem; /* Tamaño más grande */
    color: #ff66cc; /* Color morado vibrante */
    text-transform: uppercase;
    border-bottom: 2px solid #ff66cc; /* Línea decorativa */
    padding-bottom: 0.5rem;
    margin-bottom: 1rem; /* Separación del contenido */
}

/* Enlaces dentro de la barra lateral */
.sidebar a {
    color: white; /* Texto blanco */
    text-decoration: none; /* Sin subrayado */
    padding: 0.5rem;
    border-radius: 8px;
    background-color: rgba(255, 255, 255, 0.1); /* Fondo semi-transparente */
    transition: background-color 0.3s ease, color 0.3s ease, transform 0.2s ease;
}

.sidebar a:hover {
    background-color: #ff66cc; /* Fondo morado vibrante */
    color: #1a1a1a; /* Texto negro */
    transform: scale(1.05); /* Efecto de aumento */
}

.sidebar a:active {
    background-color: #e055b3; /* Morado más oscuro */
    transform: scale(0.98); /* Reducido ligeramente */
}

/* Responsividad para pantallas pequeñas */
@media (max-width: 768px) {
    .sidebar {
        padding: 1rem;
    }

    .sidebar h2 {
        font-size: 1.2rem;
    }

    .sidebar button {
        font-size: 0.9rem;
        padding: 0.5rem 0.8rem;
    }

    .sidebar a {
        font-size: 0.9rem;
    }
}


  .option-detail {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .song-row {
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    gap: 1rem;
    overflow-x: auto;
    padding: 1rem 0;
    font-size: small;
  }

  .song-row button {
    all: unset;
    color: black;
  }

  .song-card {
    flex: 0 0 auto;
    text-align: center;
    background: #fff;
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 0.5rem;
    margin: 0.5rem;
    box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.1);
  }

  .song-card img {
    width: 100%;          /* Asegúrate de que la imagen ocupe todo el espacio disponible */
  height: auto;         /* Mantiene la proporción de la imagen */
  object-fit: cover;    /* Asegura que la imagen cubra el área sin distorsionarse */
  border-radius: 4px;
  }

  .song-card h4 {
    margin: 0.5rem 0 0.2rem;
    font-size: 0.9rem;
    color: black;
  }

  .song-card p {
    margin: 0;
    font-size: 0.8rem;
    color: #555;
  }

  /* Scrollbar styling for the sidebar */
  .sidebar::-webkit-scrollbar {
    width: 8px;
  }

  .sidebar::-webkit-scrollbar-thumb {
    background: #ccc;
    border-radius: 4px;
  }

  /* Scrollbar styling for the song row (horizontal scroll) */
  .song-row::-webkit-scrollbar {
    height: 8px;
  }

  .song-row::-webkit-scrollbar-thumb {
    background: #ccc;
    border-radius: 4px;
  }
</style>

<Header {isAuthenticated} />

<main>
    <!-- Sidebar Left -->
    <div class="sidebar">
  {#if isAuthenticated}
    {#if selectedOption}
      <div>
        <button on:click={goBack}>Atrás</button>
        {#if selectedOption === 'Favoritos'}
          <h3>Favoritos</h3>
          <div class="song-row">
            {#if favoriteSongs.length === 0}
              <p>No tienes favoritos. Empieza buscando lo que te guste</p>
            {:else}
              <div>
                {#each favoriteSongs as song}
                  <div class="song-card" aria-label="Canción: {song.title}">
                    <h4>{song.title}</h4>
                    <img src={song.album.cover_big} alt={song.title} />
                    <button on:click={() => changeId(song.album.id)}>
                      <h5 style="color: black; padding: 0; margin: 0">{song.album.title}</h5>
                    </button>
                    <button on:click={() => changeId(song.artist.id)}>
                      <p>{song.artist.name}</p>
                    </button>
                    <br>
                    <button
                      on:click={() => {
                        removeFavorite(song.id);
                        favoriteSongs = favoriteSongs.filter(
                          (favSong) => favSong.id !== song.id
                        );
                      }}
                    >
                      Eliminar de favoritos
                    </button>
                    <br>
                    <button on:click={() => setCurrentSong(song)}>Reproducir</button>
                  </div>
                {/each}
              </div>
            {/if}
          </div>
        {:else if selectedOption === 'Escuchados recientemente'}
          <!-- Renderiza el componente RecentlyPlayed -->
          <RecentlyPlayed />
        {:else}
          <h3>{selectedOption}</h3>
          <p>Contenido relacionado con "{selectedOption}".</p>
        {/if}
      </div>
    {:else}
      <h2>Tu espacio</h2>
      <ul>
        <li>
          <button
            on:click={() => handleOptionClick('Favoritos')}
            aria-label="Ver tus canciones favoritas"
          >
            Favoritos
          </button>
        </li>
        <li>
          <button
            on:click={() => handleOptionClick('Listas de reproducción')}
            aria-label="Ver tus listas de reproducción"
          >
            Listas de reproducción
          </button>
        </li>
        <li>
          <button
            on:click={() => handleOptionClick('Escuchados recientemente')}
            aria-label="Ver tus canciones escuchadas recientemente"
          >
            Escuchados recientemente
          </button>
        </li>
      </ul>
    {/if}
  {:else}
    <h2>Inicia sesión o crea una cuenta para acceder a tus:</h2>
    <ul>
      <li>
        <button
          on:click={handleOptionClick}
          disabled
          aria-label="Inicia sesión para ver tus canciones favoritas"
        >
          Favoritos
        </button>
      </li>
      <li>
        <button
          on:click={handleOptionClick}
          disabled
          aria-label="Inicia sesión para ver tus canciones escuchadas recientemente"
        >
          Escuchados recientemente
        </button>
      </li>
      <li>
        <button
          on:click={handleOptionClick}
          disabled
          aria-label="Inicia sesión para ver tu biblioteca"
        >
          Biblioteca
        </button>
      </li>
    </ul>
  {/if}
</div>



    <!-- Central Content -->
    <div class="content">
    {#if $showCarrusel}
        <Carrusel {tracks} />
    {:else}
        <div style="display: flex; flex-direction: column;">
            <SearchResult {isAuthenticated}/>
            <br>
            <button style="width: 30%; margin: auto;" on:click={() => ($showCarrusel = true)}>
                Volver
            </button>
        </div>
    {/if}
</div>


    <!-- Sidebar Right -->
    <div class="extra">
    <h2>Información</h2>
    <ul>
        <li><a href="/privacy-policy">Política de Privacidad</a></li>
        <li><a href="https://github.com/turepositorio" target="_blank" rel="noopener noreferrer">Código Fuente</a></li>
        <li><a href="/cookies">Cookies</a></li>
        <li><a href="/creator">Creador</a></li>
    </ul>
</div>

</main>