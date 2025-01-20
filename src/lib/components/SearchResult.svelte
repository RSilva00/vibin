<script>
    import { resultToShow } from "$lib/stores/resultToShow.js";
    import { get } from "svelte/store";
    import { onMount } from "svelte";
    import { favorites, addFavorite, removeFavorite } from '$lib/stores/favorites.js';
    import { setCurrentSong } from "$lib/stores/songStore.js";

    export let isAuthenticated = true;

    let id = get(resultToShow); // Obtén el ID actual del store
    let idDetails = null; // Detalles del ID
    let idType = null; // Tipo del ID (track, album, artist)
    let error = null; // Mensaje de error
    let relatedItems = []; // Álbumes relacionados o canciones del álbum

    async function fetchIdDetails(id) {
        try {
            const response = await fetch(`http://localhost:5000/api/identify/${id}`);
            const data = await response.json();

            if (response.ok && !data.error) {
                idType = data.type;
                idDetails = data.data;

                // Fetch de datos relacionados a través de endpoints del backend
                if (idType === "artist") {
                    await fetchRelatedAlbums(id);
                } else if (idType === "album") {
                    await fetchAlbumTracks(id);
                }
            } else {
                error = data.error || "Error desconocido.";
            }
        } catch (err) {
            error = "Error al conectar con el servidor.";
            console.error(err);
        }
    }

    async function fetchRelatedAlbums(artistId) {
        try {
            const response = await fetch(`http://localhost:5000/api/artist/${artistId}/albums`);
            relatedItems = await response.json();
        } catch (err) {
            console.error("Error al obtener álbumes relacionados:", err);
        }
    }

    async function fetchAlbumTracks(albumId) {
        try {
            const response = await fetch(`http://localhost:5000/api/album/${albumId}/tracks`);
            relatedItems = await response.json();
        } catch (err) {
            console.error("Error al obtener canciones del álbum:", err);
        }
    }

    function updateId(newId) {
        resultToShow.set(newId);
        id = newId; // Actualizar localmente
        idDetails = null;
        relatedItems = [];
        fetchIdDetails(newId); // Recargar datos para el nuevo ID
    }

    onMount(() => {
        if (id) {
            fetchIdDetails(id);
        }
    });

    // Observa los cambios en resultToShow y actualiza el ID
    $: id = $resultToShow;

    $: if (id) {
        console.log("Nuevo ID en SearchResult:", id);
        updateId(id);
    }


</script>

<div class="container">
    {#if error}
        <p class="error">{error}</p>
    {:else if idType === 'track' && idDetails}
        <div>
            <h2 class="header">Canción: {idDetails.title}</h2>
            <p>Artista: {idDetails.artist?.name}</p>
            <p>Álbum: {idDetails.album?.title}</p>
        </div>
    {:else if idType === 'album' && idDetails}
        <div>
            <h2 class="header">Álbum:
                <button class="idSetter" on:click={() => updateId(idDetails.id)}>
                    {idDetails.title}
                </button>
            </h2>
            <p>Artista:
                <button class="idSetter" on:click={() => updateId(idDetails.artist.id)}>
                    {idDetails.artist?.name}
                </button>
            </p>
            <p>Número de tracks: {idDetails.nb_tracks}</p>

            <div class="related-items">
                <h3>Canciones:</h3>
                <ul class="songs-list">
                    {#each relatedItems as track}
                        <li on:click|self={() => updateId(track?.id)}>
    <img src={track?.album?.cover_small || idDetails.cover_small} alt="Portada de la canción" />
    <span>{track?.title}</span>
    <button
  on:click={() =>
    setCurrentSong({
      ...track,
      album: {
        ...track.album,
        cover_big: idDetails.cover_big || track.album?.cover_big || '/placeholder.jpg',
      },
    })
  }
>
  Reproducir
</button>
    {#if isAuthenticated}
        {#if $favorites.some(fav => fav === track?.id)}
            <button on:click={() => removeFavorite(track?.id)}>
                Eliminar de favoritos
            </button>
        {:else}
            <button on:click={() => addFavorite(track?.id)}>
                Agregar a favoritos
            </button>
        {/if}
    {/if}
</li>

                    {/each}
                </ul>
            </div>
        </div>
    {:else if idType === 'artist' && idDetails}
        <div>
            <h2 class="header">Artista: {idDetails.name}</h2>
            <p>Número de fans: {idDetails.nb_fan}</p>

            <div class="related-items">
                <h3>Álbumes:</h3>
                <div class="albums-grid">
                    {#each relatedItems as album}
                        <div class="album-card" on:click={() => updateId(album.id)}>
                            <img src={album.cover_medium} alt="Portada del álbum" />
                            <span>{album.title}</span>
                        </div>
                    {/each}
                </div>
            </div>
        </div>
    {:else}
        <p>Cargando detalles...</p>
    {/if}
</div>

<style>
    .idSetter {
        all: unset; /* Elimina todos los estilos por defecto del botón */
        display: inline-block; /* Asegura que se comporte como un botón */
        cursor: pointer; /* Muestra el puntero al pasar el mouse */
    }

    .idSetter:hover {
        background-color: transparent;
        box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1); /* Sombra sutil al hacer hover */
    }

    /* Contenedor principal */
    .container {
        font-family: Arial, sans-serif;
        color: #333;
        padding: 20px;
        border: 1px solid #ccc;
        border-radius: 10px;
        background-color: #f9f9f9;
        max-width: 90%;
        margin: auto;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        overflow-y: auto;
    }

    .header {
        font-size: 24px;
        font-weight: bold;
        margin-bottom: 10px;
    }

    .related-items {
        margin-top: 20px;
        overflow: auto; /* Permite el desplazamiento si hay muchos elementos */
    }

    .related-items h3 {
        font-size: 18px;
        margin-bottom: 10px;
    }

    /* Estilo para la lista de canciones */
    .songs-list {
        list-style: none;
        padding: 0;
        margin: 0;
        max-height: 300px; /* Limitar la altura de la lista */
        overflow-y: auto; /* Scroll vertical en la lista */
    }

    .songs-list li {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 8px;
        padding: 8px;
        background-color: #fff;
        border-radius: 5px;
        border: 1px solid #ddd;
        cursor: pointer;
        box-sizing: border-box;
    }

    .songs-list li:hover {
        background-color: #f0f0f0;
    }

    .songs-list img {
        width: 50px;
        height: 50px;
        border-radius: 5px;
        flex-shrink: 0;
    }

    .songs-list span {
        flex-grow: 1;
        font-size: 16px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    /* Estilo para la cuadrícula de álbumes */
    .albums-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 15px;
        max-height: 300px; /* Limitar la altura */
        overflow-y: auto; /* Scroll vertical para álbumes */
    }

    .album-card {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        padding: 10px;
        background-color: #fff;
        border-radius: 5px;
        border: 1px solid #ddd;
        cursor: pointer;
        box-sizing: border-box;
        overflow: hidden;
    }

    .album-card:hover {
        background-color: #f0f0f0;
    }

    .album-card img {
        width: 100px;
        height: 100px;
        border-radius: 5px;
        margin-bottom: 10px;
    }

    .album-card span {
        font-size: 14px;
        font-weight: bold;
        color: #333;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .error {
        color: red;
        font-weight: bold;
    }

    button {
        margin-top: 10px;
        padding: 10px 20px;
        background-color: #007bff;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        font-size: 16px;
    }

    button:hover {
        background-color: #0056b3;
    }

    /* Personalización del scroll */
    ::-webkit-scrollbar {
        width: 8px;
    }

    ::-webkit-scrollbar-thumb {
        background-color: #ccc;
        border-radius: 4px;
    }

    ::-webkit-scrollbar-thumb:hover {
        background-color: #aaa;
    }

    ::-webkit-scrollbar-track {
        background-color: #f9f9f9;
    }
</style>
