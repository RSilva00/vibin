<script>
    import { goto } from '$app/navigation';
    let username = '';
    let password = '';
    let error = '';

    const handleSubmit = async (event) => {
        event.preventDefault();

        const response = await fetch('http://localhost:5000/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });

        if (response.ok) {
            const { token } = await response.json();
            localStorage.setItem('token', token); // Guardar el token en localStorage
            goto('/');
        } else {
            const data = await response.json();
            error = data.error;
        }
    };
</script>

<main>
    <h2>Iniciar Sesión</h2>
    <form on:submit={handleSubmit}>
        <div>
            <label for="username">Usuario:</label>
            <input id="username" bind:value={username} required />
        </div>
        <div>
            <label for="password">Contraseña:</label>
            <input id="password" type="password" bind:value={password} required />
        </div>
        {#if error}
            <p style="color: red;">{error}</p>
        {/if}
        <button type="submit">Entrar</button>
    </form>
</main>
