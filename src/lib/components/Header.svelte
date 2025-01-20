<script>
    export let isAuthenticated = false;
    import Search from "./Search.svelte";
</script>

<style>
/* Estilo principal del contenedor del header */
header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 2rem;
    background-color: #1a1a1a; /* Fondo oscuro */
    color: white;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    position: sticky; /* Fijo en la parte superior */
    top: 0;
    z-index: 1000;
}

/* Estilo del logo */
header img {
    height: 3.5rem;
    margin-right: 1rem;
}

/* Navegación */
nav {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 1rem;
    width: 100%;
}

/* Icono principal del home */
.home-icon {
    background-color: black;
    border-radius: 50%;
    padding: 0;
    transition: background-color 0.3s ease, transform 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    width: 50px;
    height: 50px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    cursor: pointer;
}

.icon-path {
    fill: white;
    transition: fill 0.3s ease, transform 0.3s ease;
}

.home-icon:hover {
    background-color: #333; /* Fondo dinámico */
    transform: scale(1.1);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.4);
}

.home-icon:hover .icon-path {
    fill: #ff66cc; /* Color dinámico */
    transform: rotate(10deg);
}

.home-icon:focus {
    outline: none;
    box-shadow: 0 0 0 3px #ff66cc, 0 4px 8px rgba(0, 0, 0, 0.3);
}

.home-icon:active {
    transform: scale(0.95);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

/* Botones de autenticación */
.auth-button,
.auth-link {
    text-decoration: none;
    padding: 0.5rem 1rem;
    border: 1px solid white;
    border-radius: 20px;
    background: transparent;
    color: white;
    cursor: pointer;
    font-size: 1rem;
    transition: background-color 0.3s ease, color 0.3s ease;
}

.auth-button:hover,
.auth-link:hover {
    background-color: white;
    color: #1a1a1a;
}

/* Contenedor de usuario */
header .user-auth {
    display: flex;
    align-items: center;
    gap: 1rem;
}

/* Responsive */
@media (max-width: 768px) {
    header {
        flex-direction: column;
        align-items: flex-start;
    }

    nav {
        justify-content: flex-start;
        gap: 0.5rem;
    }

    .home-icon {
        width: 40px;
        height: 40px;
    }

    .auth-button,
    .auth-link {
        font-size: 0.9rem;
        padding: 0.4rem 0.8rem;
    }
}
</style>

<header>
    <!-- Left Section: Logo -->
    <div style="display: flex; align-items: center;">
        <a href="/">
            <img src="/src/lib/components/vibin_logo.webp" alt="Logo">
        </a>
    </div>

    <!-- Center Section: Navigation -->
    <nav>
        <a href="/">
            <svg class="home-icon" viewBox="0 0 16 19" xmlns="http://www.w3.org/2000/svg">
                <path class="icon-path" d="M15.5 14.69h-1.25V7.78a.62.62 0 0 0-.25-.47L8.4 2.7a.65.65 0 0 0-.81 0L2 7.31a.62.62 0 0 0-.22.47v6.91H.5V7.78a1.87 1.87 0 0 1 .68-1.44l5.62-4.6a1.88 1.88 0 0 1 2.39 0l5.63 4.6a1.87 1.87 0 0 1 .68 1.44z"/>
                <path class="icon-path" d="M11.05 12.11H9.8A1.72 1.72 0 0 0 8 10.49a1.72 1.72 0 0 0-1.8 1.62H5a3 3 0 0 1 3-2.87 3 3 0 0 1 3.05 2.87zm-6.1 0H6.2v2.58H4.95zm4.85 0h1.25v2.58H9.8z"/>
            </svg>
        </a>
        <Search />
    </nav>

    <!-- Right Section: User Authentication -->
    <div class="user-auth">
        {#if isAuthenticated}
            <button
                class="auth-button"
                on:click={() => {
                    localStorage.removeItem('token');
                    location.reload();
                }}
            >
                Cerrar Sesión
            </button>
        {:else}
            <a href="/signupsignin?type=login" class="auth-link">Iniciar Sesión</a>
            <a href="/signupsignin?type=register" class="auth-link">Registro</a>
        {/if}
    </div>
</header>
