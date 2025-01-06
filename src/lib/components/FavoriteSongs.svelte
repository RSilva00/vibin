<script>
  export let user;

  let favoriteSongs = user.favoriteSongs || [];

  async function removeFavorite(songId) {
    await fetch(`/api/favorites/${songId}`, { method: 'DELETE' });
    favoriteSongs = favoriteSongs.filter(song => song.id !== songId);
  }
</script>

<ul>
  {#each favoriteSongs as song}
    <li>
      <img src={song.album.cover_medium} alt={song.title} />
      <span>{song.title} - {song.artist}</span>
      <button on:click={() => removeFavorite(song.id)}>Eliminar</button>
    </li>
  {/each}
</ul>
