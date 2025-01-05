<script>
    let username = '';
    let email = '';
    let password = '';
    let error = '';
    let success = '';

    const handleSubmit = async (event) => {
        event.preventDefault();

        const response = await fetch('http://localhost:5000/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password }),
        });

        if (response.ok) {
            success = 'Usuario registrado exitosamente. Ahora puedes iniciar sesión.';
            username = '';
            password = '';
            error = '';
        } else {
            const data = await response.json();
            error = data.error || 'Error al registrar usuario.';
            success = '';
        }
    };
</script>

<main style="padding: 2rem;">
    <h2>Registro</h2>
    <form on:submit={handleSubmit}>
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
        {#if error}
            <p style="color: red;">{error}</p>
        {/if}
        {#if success}
            <p style="color: green;">{success}</p>
        {/if}
        <button type="submit">Registrarse</button>
    </form>
</main>
