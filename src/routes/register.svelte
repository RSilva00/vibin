<script>
  let name = '';
  let email = '';
  let password = '';
  let errorMessage = '';
  let successMessage = '';

  const handleSubmit = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al registrar el usuario');
      }

      successMessage = data.message;
      name = '';
      email = '';
      password = '';
      errorMessage = '';
    } catch (error) {
      errorMessage = error.message;
      successMessage = '';
    }
  };
</script>

<style>
  .error { color: red; }
  .success { color: green; }
</style>

<h2>Registro de Usuario</h2>

{#if errorMessage}
  <p class="error">{errorMessage}</p>
{/if}

{#if successMessage}
  <p class="success">{successMessage}</p>
{/if}

<form on:submit|preventDefault={handleSubmit}>
  <label for="name">Nombre</label>
  <input type="text" id="name" bind:value={name} required />

  <label for="email">Correo electrónico</label>
  <input type="email" id="email" bind:value={email} required />

  <label for="password">Contraseña</label>
  <input type="password" id="password" bind:value={password} required />

  <button type="submit">Registrar</button>
</form>
