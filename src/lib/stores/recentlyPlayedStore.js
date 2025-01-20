import { writable } from "svelte/store";

// Lista reactiva para canciones reproducidas recientemente
export const recentlyPlayedSongs = writable([]);

// Función para inicializar el store con detalles de las canciones
export async function initializeRecentlyPlayed() {
    try {
        console.log(
            "Inicializando el store de canciones reproducidas recientemente..."
        );

        // Obtener los IDs
        const response = await fetch(
            "http://localhost:5000/api/recently-played",
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                }
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Error en /api/recently-played:", errorText);
            throw new Error(
                "Error al cargar los IDs de las canciones reproducidas recientemente."
            );
        }

        const data = await response.json();
        console.log("IDs obtenidos:", data);

        // Extraer los IDs
        const ids = data.map((track) => track.trackId);

        // Obtener los detalles
        const detailsResponse = await fetch(
            "http://localhost:5000/api/userFavorites",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                },
                body: JSON.stringify({ ids })
            }
        );

        if (!detailsResponse.ok) {
            const errorText = await detailsResponse.text();
            console.error("Error en /api/userFavorites:", errorText);
            throw new Error(
                "Error al cargar detalles de las canciones reproducidas recientemente."
            );
        }

        const detailsData = await detailsResponse.json();
        console.log("Detalles obtenidos:", detailsData);

        recentlyPlayedSongs.set(detailsData.favorites); // Actualizar el store con los detalles
    } catch (error) {
        console.error(
            "Error al inicializar el store de canciones reproducidas recientemente:",
            error
        );
        recentlyPlayedSongs.set([]); // Vacía el store si ocurre un error
    }
}

// Función para agregar una canción al historial y actualizar detalles en el store
export async function addRecentlyPlayed(song) {
    try {
        recentlyPlayedSongs.update((songs) => {
            const updatedList = [song, ...songs];
            return updatedList.slice(0, 10); // Limita a 10 canciones
        });

        // Opcional: Sincroniza con el backend
        await fetch("http://localhost:5000/api/recently-played", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`
            },
            body: JSON.stringify({
                songId: song.id,
                title: song.title,
                albumCover: song.album?.cover_big,
                artist: song.artist?.name
            })
        });
    } catch (error) {
        console.error("Error al agregar canción al historial:", error);
    }
}
