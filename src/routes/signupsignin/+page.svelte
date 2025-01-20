<script>
  import { page } from '$app/stores';  // Acceder a la página y parámetros
  import { goto } from '$app/navigation'; // Importar goto para redirecciones

  let username = '';
  let email = '';
  let password = '';
  let confirmPassword = '';
  let error = '';
  let success = '';
  let isLogin = true;  // Variable para controlar si se está en login o registro

  // Establecer el formulario a mostrar basándote en la URL
  $: {
    // Leer el parámetro de la URL, si está presente
    isLogin = $page.url.searchParams.get('type') === 'login';  // Si el parámetro 'type' es 'login', muestra el login
  }

  const toggleForm = () => {
    // Cambiar la URL dinámicamente sin recargar la página
    isLogin = !isLogin;
    const newType = isLogin ? 'login' : 'register';
    goto(`/signupsignin?type=${newType}`);  // Actualizar la URL con el nuevo parámetro
  };

  // Lógica para el login
  const handleLoginSubmit = async (event) => {
    event.preventDefault();
    
    const response = await fetch('http://localhost:5000/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    if (response.ok) {
      const { token } = await response.json();
      localStorage.setItem('token', token); // Guardar token
      goto('/'); // Redirigir al home
    } else {
      const data = await response.json();
      error = data.error;
    }
  };

 // Lógica para el registro
const handleRegisterSubmit = async (event) => {
  event.preventDefault();

  // Validar que las contraseñas coinciden
  if (password !== confirmPassword) {
    error = 'Las contraseñas no coinciden. Por favor, inténtalo de nuevo.';
    success = '';
    return;
  }

  // Enviar la solicitud de registro al servidor
  const response = await fetch('http://localhost:5000/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password }),
  });

  if (response.ok) {
    success = 'Usuario registrado exitosamente. Ahora puedes iniciar sesión. Redirigiendo...';
    // Limpiar los campos después del registro exitoso
    username = '';
    password = '';
    email = '';
    confirmPassword = '';  // Limpiar el campo de confirmación de contraseña
    error = '';

    // Mostrar el mensaje de éxito y redirigir al login después de 5 segundos
    setTimeout(() => {
      // Redirigir a la página de login
      window.location.href = '/signupsignin?type=login'; // Aquí es donde se redirige al login
    }, 5000); // 5 segundos de espera

  } else {
    const data = await response.json();
    error = data.error || 'Error al registrar usuario.';
    success = '';
  }
};

</script>

<main class="auth-container">
  <!-- Mostrar formulario dependiendo de si es Login o Registro -->
  {#if isLogin}
    <div class="form-container login-form">
      <h2>Iniciar sesión</h2>
      <form on:submit={handleLoginSubmit}>
        <div>
          <label for="username">Usuario:</label>
          <input id="username" bind:value={username} required />
        </div>
        <div>
          <label for="password">Contraseña:</label>
          <input id="password" type="password" bind:value={password} required />
        </div>
        {#if error}
        <p class="error-message">{error}</p>
        {/if}
        <button type="submit">Entrar</button>
    </form>
    <button on:click={toggleForm} class="toggle-button">¿No tienes cuenta? Regístrate</button>
</div>
{/if}

{#if !isLogin}
<div class="form-container register-form">
      <h2>Regístrate</h2>
      <form on:submit={handleRegisterSubmit}>
          <div>
              <label for="username">Usuario:</label>
              <input id="username" bind:value={username} required />
            </div>
            <div>
                <label for="email">Correo electrónico:</label>
                <input id="email" type="email" bind:value={email} required />
        </div>
        <div>
            <label for="password">Contraseña:</label>
          <input id="password" type="password" bind:value={password} required />
        </div>
        <div>
          <label for="password">Confirmar contraseña:</label>
          <input id="password" type="password" bind:value={confirmPassword} required />
        </div>
        {#if error}
        <p class="error-message">{error}</p>
        {/if}
        {#if success}
        <p class="success-message">{success}</p>
        {/if}
        <button type="submit">Registrarse</button>
      </form>
      <button on:click={toggleForm} class="toggle-button">¿Ya tienes cuenta? Inicia sesión</button>
    </div>
  {/if}
</main>

<style>

    /* Estilos para el mensaje de éxito */
.success-message {
  color: green;
  text-align: center;
  font-size: 1.1rem;
  margin-top: 20px;
  animation: fadeIn 1s ease-in-out;
}

/* Animación para el fade in del mensaje */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

  /* Contenedor general */
  .auth-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    flex-direction: column;
  }

  /* Estilo de los formularios */
  .form-container {
    background-color: rgba(0, 0, 0, 0.6);  /* Fondo oscuro semi-transparente */
    border-radius: 8px;
    padding: 2rem;
    width: 100%;
    max-width: 400px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
    transition: all 0.3s ease-in-out;
  }

  /* Títulos */
  h2 {
    text-align: center;
    margin-bottom: 1.5rem;
  }

  /* Inputs */
  input {
    width: 100%;
    padding: 0.8rem;
    margin: 0.6rem 0;
    border: 1px solid #ccc;
    border-radius: 5px;
    background-color: #333;
    color: white;
    font-size: 1rem;
  }

  /* Botón principal */
  button {
    width: 100%;
    padding: 0.8rem;
    margin-top: 1rem;
    border: none;
    border-radius: 5px;
    background-color: #61045f;
    color: white;
    font-size: 1.1rem;
    cursor: pointer;
    transition: background-color 0.3s ease;
  }

  /* Botón hover */
  button:hover {
    background-color: #aa076b;
  }

  /* Estilo de mensaje de error */
  .error-message {
    color: red;
    text-align: center;
  }

  /* Estilo de mensaje de éxito */
  .success-message {
    color: green;
    text-align: center;
  }

  /* Botón para alternar entre login y registro */
  .toggle-button {
    margin-top: 1rem;
    padding: 0.5rem;
    background: transparent;
    border: 1px solid white;
    color: white;
    cursor: pointer;
    font-size: 1rem;
    transition: background-color 0.3s ease;
  }

  /* Hover para el botón de alternar */
  .toggle-button:hover {
    background-color: rgba(255, 255, 255, 0.2);
  }
</style>
