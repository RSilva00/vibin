<script>
  import { onMount } from 'svelte';
  import FavoriteSongs from '../components/FavoriteSongs.svelte';
  import FriendList from '../components/FriendList.svelte';

  let user = null;

  // Carga los datos del usuario al montar
  onMount(async () => {
    const response = await fetch('/api/user'); // API para obtener datos del usuario
    user = await response.json();
  });
</script>

{#if user}
  <h1>Perfil de {user.username}</h1>

  <section>
    <h2>Canciones Favoritas</h2>
    <FavoriteSongs {user} />
  </section>

  <section>
    <h2>Amigos</h2>
    <FriendList {user} />
  </section>
{:else}
  <p>Cargando...</p>
{/if}
