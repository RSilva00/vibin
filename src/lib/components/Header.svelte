<script>
    export let isAuthenticated = false;
    import Search from "./Search.svelte";
</script>

<header style="display: flex; justify-content: space-between; align-items: center; padding: 1rem 2rem;">
    <!-- Left Section: Logo and Navigation -->
    <div style="display: flex; align-items: center;">
        <!-- Logo -->
        <img src="/src/lib/components/vibin_logo.webp" alt="Logo" style="height: 2.5rem; margin-right: 1rem;">
    </div>
    <div>
        <nav style="display: flex; gap: 1rem;">
            <a href="/" style="text-decoration: none; font-weight: bold;">Inicio</a>
            <Search />
        </nav>
    </div>
    
    <!-- Right Section: User Authentication -->
    <div style="display: flex; align-items: center; gap: 1rem;">
        {#if isAuthenticated}
            <button
                on:click={() => {
                    localStorage.removeItem('token');
                    location.reload();
                }}
                style="background: transparent; border: 1px solid white; border-radius: 20px; padding: 0.5rem 1rem; cursor: pointer;"
            >
                Cerrar Sesión
            </button>
        {:else}
            <a href="/login" style="text-decoration: none; padding: 0.5rem 1rem; border: 1px solid white; border-radius: 20px;">Iniciar Sesión</a>
            <a href="/register" style="text-decoration: none; padding: 0.5rem 1rem; border: 1px solid white; border-radius: 20px;">Registro</a>
        {/if}
    </div>
</header>
