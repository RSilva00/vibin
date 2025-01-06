<script>
  export let user;

  let friends = user.friends || [];

  async function addFriend() {
    const friendEmail = prompt("Ingresa el correo del amigo:");
    if (friendEmail) {
      const response = await fetch('/api/friends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: friendEmail }),
      });

      if (response.ok) {
        const newFriend = await response.json();
        friends = [...friends, newFriend];
      } else {
        alert("No se pudo agregar al amigo.");
      }
    }
  }
</script>

<ul>
  {#each friends as friend}
    <li>
      <span>{friend.username}</span>
      <a href={`/chat/${friend.id}`}>Chatear</a>
    </li>
  {/each}
</ul>

<button on:click={addFriend}>Añadir Amigo</button>
