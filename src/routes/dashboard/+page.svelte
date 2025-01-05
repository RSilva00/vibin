<script>
    import { onMount } from 'svelte';

    let user = null;
    let error = '';

    onMount(async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = '/login';
            return;
        }

        const response = await fetch('http://localhost:5000/protected', {
            headers: { Authorization: token },
        });

        if (!response.ok) {
            error = 'No autorizado. Redirigiendo...';
            setTimeout(() => {
                localStorage.removeItem('token');
                window.location.href = '/login';
            }, 2000);
        } else {
            const data = await response.json();
            user = data.user;
        }
    });
</script>

<main>
    {#if error}
        <p style="color: red;">{error}</p>
    {:else if user}
        <h1>Bienvenido, {user.username}</h1>
        <button on:click={() => { localStorage.removeItem('token'); window.location.href = '/login'; }}>
            Cerrar Sesión
        </button>
    {/if}
</main>
