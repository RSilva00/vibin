<script>
    export let isAuthenticated = false;
</script>

<header style="display: flex; justify-content: space-between; padding: 1rem; background: #f4f4f4; border-bottom: 1px solid #ddd;">
    <div>
        <a href="/" style="text-decoration: none; font-weight: bold;">🏠 Inicio</a>
    </div>
    <div>
        {#if isAuthenticated}
            <button
                on:click={() => {
                    localStorage.removeItem('token');
                    location.reload();
                }}
                style="background: none; border: none; color: blue; cursor: pointer;"
            >
                Cerrar Sesión
            </button>
        {:else}
            <a href="/login" style="margin-right: 1rem; text-decoration: none; color: blue;">Iniciar Sesión</a>
            <a href="/register" style="text-decoration: none; color: blue;">Registro</a>
        {/if}
    </div>
</header>
