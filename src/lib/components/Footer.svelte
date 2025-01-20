<script>
    export let track = null; // Recibe la pista seleccionada
    let isPlaying = false; // Estado de reproducción

    function togglePlay() {
        isPlaying = !isPlaying;
    }
</script>

<style>
    footer {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        background: #222;
        color: #fff;
        padding: 1rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
        z-index: 1000;
    }

    footer .controls {
        display: flex;
        gap: 1rem;
        align-items: center;
    }

    footer .track-info {
        flex: 1;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
</style>

<footer>
    {#if track}
        <div class="track-info">
            <strong>{track.name}</strong>
        </div>
        <div class="controls">
            <button on:click={togglePlay}>
                {isPlaying ? "Pausar" : "Reproducir"}
            </button>
            <audio
                bind:paused={!isPlaying}
                src={track.preview}
                autoplay
                on:pause={() => (isPlaying = false)}
                on:play={() => (isPlaying = true)}
            ></audio>
        </div>
    {:else}
        <p>No hay pista seleccionada</p>
    {/if}
</footer>
