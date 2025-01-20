<script>
  import { recentlyPlayedSongs, initializeRecentlyPlayed } from "$lib/stores/recentlyPlayedStore.js";
  import { onMount } from "svelte";

  let isLoading = true;
  let errorMessage = null;

  // Suscribirse al store
  $: recentlyPlayed = $recentlyPlayedSongs;

  // Inicializar el store con datos del backend al montar el componente
  onMount(async () => {
    try {
      await initializeRecentlyPlayed(); // Llama a la función para cargar los datos
    } catch (error) {
      errorMessage = "Error al cargar canciones reproducidas recientemente.";
      console.error(error);
    } finally {
      isLoading = false;
    }
  });
</script>

<style>
  .recently-played {
    padding: 1rem;
  }

  .song-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1rem;
    border-bottom: 1px solid #ddd;
    padding-bottom: 1rem;
  }

  .song-item img {
    width: 50px;
    height: 50px;
    border-radius: 5px;
    object-fit: cover;
  }

  .song-details {
    display: flex;
    flex-direction: column;
  }

  .error {
    color: red;
  }

  .loading {
    font-style: italic;
  }
</style>

<div class="recently-played">
  <h3>Escuchadas recientemente</h3>

  {#if isLoading}
    <p class="loading">Cargando...</p>
  {:else if errorMessage}
    <p class="error">{errorMessage}</p>
  {:else if recentlyPlayed.length === 0}
    <p>No hay canciones reproducidas recientemente.</p>
  {:else}
    <ul>
      {#each recentlyPlayed as song}
        <li class="song-item">
          <img src={song.album?.cover_small || "/placeholder.jpg"} alt="Portada" />
          <div class="song-details">
            <strong>{song.title}</strong>
            <span>{song.artist?.name}</span>
          </div>
        </li>
      {/each}
    </ul>
  {/if}
</div>
