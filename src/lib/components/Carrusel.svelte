<script>
  import { resultToShow } from "$lib/stores/resultToShow.js";
  import { showCarrusel } from "$lib/stores/showCarrusel.js";
  import { setCurrentSong } from "$lib/stores/songStore.js";
  import { onMount, onDestroy } from "svelte";

  export let tracks = []; // Pasar las canciones como propiedad
  let currentIndex = 0; // Índice de la página actual
  const tracksPerPage = 2; // Mostrar 2 canciones por vez
  let interval; // Variable para el intervalo de cambio automático

  // Calcular las canciones visibles de manera reactiva
  $: currentTracks = tracks.slice(currentIndex * tracksPerPage, (currentIndex + 1) * tracksPerPage);

  function next() {
    const maxIndex = Math.ceil(tracks.length / tracksPerPage) - 1;
    currentIndex = (currentIndex < maxIndex) ? currentIndex + 1 : 0; // Volver al principio si se llega al final
  }

  function prev() {
    const maxIndex = Math.ceil(tracks.length / tracksPerPage) - 1;
    currentIndex = (currentIndex > 0) ? currentIndex - 1 : maxIndex; // Ir al final si se llega al principio
  }

  onMount(() => {
    // Carrusel automático
    interval = setInterval(next, 5000);
  });

  onDestroy(() => {
    clearInterval(interval); // Limpiar el intervalo al destruir el componente
  });
</script>

<style>/* Contenedor del carrusel */
.carousel {
    width: 80%;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: row;
    gap: 1.5rem;
    padding: 1rem;
    margin: 1rem auto;
    background-color: #1a1a1a; /* Fondo oscuro */
    border-radius: 12px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
    overflow: hidden;
}

/* Tarjetas de canciones */
.track-card {
    border: 1px solid #333;
    border-radius: 8px;
    padding: 1rem;
    text-align: center;
    background-color: #2b2b2b; /* Fondo grafito oscuro */
    color: white;
    flex: 0 0 300px; /* Tamaño fijo en ancho */
    max-width: 300px; /* Limita el ancho */
    height: 420px; /* Altura fija */
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    overflow: hidden; /* Evita desbordes */
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    cursor: pointer;
}

.track-card:hover {
    transform: scale(1.05);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
}

/* Imagen fija dentro de las tarjetas */
.track-card img {
    max-width: 100%;
    height: 240px; /* Tamaño fijo para la imagen */
    border-radius: 6px;
    margin-bottom: 0.5rem;
    object-fit: cover; /* Asegura que la imagen se ajuste correctamente */
}

/* Texto y botones */
.track-card button {
    all: unset;
    cursor: pointer;
    font-size: 0.9rem;
    color: #ff66cc; /* Morado */
    margin-top: 0.5rem;
    transition: color 0.3s ease;
    white-space: nowrap; /* Evita que el texto se desborde */
    overflow: hidden; /* Oculta contenido excedente */
    text-overflow: ellipsis; /* Añade puntos suspensivos si el texto es muy largo */
}

.track-card button:hover {
    color: #ffffff;
}

.track-card h6 {
    font-size: 0.8rem;
    margin: 0.5rem 0;
    color: #cccccc;
    overflow: hidden; /* Oculta contenido adicional */
    text-overflow: ellipsis; /* Añade puntos suspensivos si es necesario */
}

/* Controles del carrusel */
.controls {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    margin-top: 1rem;
}

.control-arrow {
    background: none;
    border: none;
    font-size: 2rem;
    color: white;
    cursor: pointer;
    transition: transform 0.2s ease, color 0.3s ease;
}

.control-arrow:hover {
    transform: scale(1.2);
    color: #ff66cc;
}

/* Ajuste para evitar desbordes */
.carousel-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    overflow: hidden;
}

/* Mensaje de error */
.no-tracks {
    color: #ff4444;
    font-size: 1.2rem;
    text-align: center;
    margin: 2rem 0;
}
</style>

<div class="carousel-wrapper">
  {#if tracks.length === 0}
    <p class="no-tracks">No hay canciones para mostrar</p>
  {:else}
    <div class="carousel">
      {#each currentTracks as track}
        <div class="track-card">
          <p>{track.title}</p>
          <button on:click={() => {
            showCarrusel.set(false);
            resultToShow.set(track.album.id);
          }}>
            <img src={track.album.cover_big || "/placeholder.jpg"} alt={track.title} />
          </button>
          <button on:click={() => {
            showCarrusel.set(false);
            resultToShow.set(track.artist.id);
          }}>
            <p style="border-bottom: 1px solid #ff66cc;">{track.artist.name}</p>
          </button>
          <h6>{track.album.title}</h6>
          {#if track.preview}
            <button on:click={() => setCurrentSong(track)}>Reproducir</button>
          {/if}
        </div>
      {/each}
    </div>

    <div class="controls">
      <button class="control-arrow" on:click={prev}>&#8592;</button>
      <button class="control-arrow" on:click={next}>&#8594;</button>
    </div>
  {/if}
</div>
