<script>
  import { onMount } from 'svelte';
  import { page } from '$app/stores';

  let friendId = $page.params.friendId;
  let chat = null;
  let newMessage = '';

  onMount(async () => {
    const response = await fetch(`/api/chats/${friendId}`);
    chat = await response.json();
  });

  async function sendMessage() {
    if (newMessage.trim()) {
      const response = await fetch(`/api/chats/${friendId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: newMessage }),
      });

      if (response.ok) {
        const updatedMessage = await response.json();
        chat.messages.push(updatedMessage);
        newMessage = '';
      }
    }
  }
</script>

<h1>Chat con {chat?.friend?.username}</h1>

<ul>
  {#each chat?.messages as msg}
    <li>
      <strong>{msg.sender.username}:</strong> {msg.message}
      <small>({new Date(msg.timestamp).toLocaleTimeString()})</small>
    </li>
  {/each}
</ul>

<input
  type="text"
  bind:value={newMessage}
  placeholder="Escribe un mensaje"
/>
<button on:click={sendMessage}>Enviar</button>
