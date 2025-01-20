<script>
  import { currentSongDetails, isPlaying } from '../stores/songStore.js';
  import { onDestroy } from 'svelte';

  let audio = null;
  let currentTime = 0; // Tiempo actual de la canción
  let duration = 0; // Duración total de la canción

 // Registrar canción en el historial
 async function addRecentlyPlayed(track) {
    try {
        const response = await fetch("http://localhost:5000/api/recently-played", {
            method: "POST",
            headers: { "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`
             },
            body: JSON.stringify({
                songId: track.id
            }),
        });

        if (!response.ok) {
            throw new Error("Error al agregar al historial");
        }

        const data = await response.json();
        console.log("Historial actualizado:", data);
    } catch (error) {
        console.error(error);
    }
}


  // Escuchar cambios en la canción actual
  $: if ($currentSongDetails) {
    addRecentlyPlayed($currentSongDetails);
  }

  // Escuchar cambios en los detalles de la canción
  $: if ($currentSongDetails) {
    if (audio) {
      audio.pause();
      audio = null;
    }
    if ($currentSongDetails.preview) {
      audio = new Audio($currentSongDetails.preview);

      // Manejar metadatos de la canción (duración total)
      audio.addEventListener('loadedmetadata', () => {
        duration = audio.duration;
      });

      // Actualizar el tiempo actual durante la reproducción
      audio.addEventListener('timeupdate', () => {
        currentTime = audio.currentTime;
      });

      // Reproducir automáticamente si está marcado como "playing"
      if ($isPlaying) {
        audio.play();
      }

      // Manejar el final de la canción
      audio.addEventListener('ended', () => {
        isPlaying.set(false);
      });
    }
  }

  // Manejo de reproducción/pausa desde los controles
  function togglePlay() {
    if (audio) {
      if ($isPlaying) {
        audio.pause();
        isPlaying.set(false);
      } else {
        audio.play();
        isPlaying.set(true);
      }
    }
  }

  // Avanzar o retroceder en la canción
  function seek(event) {
    if (audio) {
      const progressWidth = event.currentTarget.offsetWidth;
      const clickPosition = event.offsetX;
      const newTime = (clickPosition / progressWidth) * duration;
      audio.currentTime = newTime;
      currentTime = newTime;
    }
  }

  // Limpiar recursos al desmontar
  onDestroy(() => {
    if (audio) {
      audio.pause();
      audio = null;
    }
  });
</script>

<style>
  .fixed-player {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: #1e1e1e;
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem;
    box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.3);
    z-index: 1000;
    font-family: Arial, sans-serif;
  }

  .song-info {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .song-info img {
    width: 50px;
    height: 50px;
    border-radius: 5px;
    object-fit: cover;
  }

  .song-info h4,
  .song-info p {
    margin: 0;
  }

  .controls {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .controls button {
    background: none;
    border: 1px solid #fff;
    color: #fff;
    padding: 0.5rem 1rem;
    cursor: pointer;
    border-radius: 5px;
  }

  .controls button:hover {
    background-color: #333;
  }

  .progress-bar {
    position: relative;
    flex: 1;
    margin: 0 1rem;
    height: 5px;
    background: rgba(255, 255, 255, 0.3);
    border-radius: 3px;
    cursor: pointer;
  }

  .progress {
    position: absolute;
    height: 100%;
    background: #fff;
    width: 0;
    transition: width 0.2s ease;
  }

  .time {
    font-size: 0.9rem;
  }
</style>

<div class="fixed-player">
  {#if $currentSongDetails}
    <!-- Información de la canción -->
    <div class="song-info">
        {console.log("Detalles de la canción:", $currentSongDetails)}
      <img src={$currentSongDetails.album?.cover_big || $currentSongDetails.cover || "/placeholder.jpg"} alt="Portada" />
      <div>
        <h4>{$currentSongDetails.title || "Sin título"}</h4>
        <p>{$currentSongDetails.artist?.name || "Artista desconocido"}</p>
      </div>
    </div>

    <!-- Barra de progreso -->
    <div class="progress-bar" on:click={seek}>
      <div
        class="progress"
        style="width: {currentTime / duration * 100 || 0}%;"
      ></div>
    </div>

    <!-- Controles -->
    <div class="controls">
      <button on:click={togglePlay}>
        {$isPlaying ? "⏸ Pausar" : "▶ Reproducir"}
      </button>
      <span class="time">{Math.floor(currentTime) || 0}s / {Math.floor(duration) || 0}s</span>
    </div>
  {/if}
</div>
