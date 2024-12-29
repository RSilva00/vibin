<script>
    let message = '';

    // Hacer una solicitud al backend
    async function fetchMessage() {
        const response = await fetch('http://localhost:3001/api');
        const data = await response.json();
        message = data.message;
    }

    fetchMessage();

    import { onMount } from 'svelte';

  let artist = null;

  onMount(async () => {
    const res = await fetch('https://api.deezer.com/artist/27', { mode: 'no-cors' });
    if (res.ok) {
      artist = await res.json();
      console.log(artist); // Asegúrate de que los datos se imprimen correctamente
    } else {
      console.error('Error al recuperar el artista:', res.status);
    }
  });

  
  
</script>

{#if artist}
  <h1>{artist.name}</h1>
  <p>Número de fans: {artist.nb_fan}</p>
  <img src="{artist.picture}" alt="{artist.name}" />
{:else}
  <p>Cargando...</p>
{/if}

<main>
    <h1>Conexión SvelteKit y Node.js</h1>
    <p>{message}</p>
</main>
