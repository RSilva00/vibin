// src/stores/favorites.js
import { writable } from "svelte/store";
import { get } from "svelte/store";

// Inicializar el store
export const favorites = writable([]);

// Función para agregar una canción a los favoritos
export const addFavorite = async (trackId) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    console.log("ID de la canción a agregar:", trackId);

    // Obtener el estado actual de favoritos desde el store
    const currentFavorites = get(favorites);

    // Verificar si la canción ya está en favoritos
    if (currentFavorites.includes(trackId)) {
        console.warn(
            "La canción ya está en tus favoritos. No se hará la solicitud."
        );
        return; // Salir si ya está en favoritos
    }

    try {
        // Hacer la solicitud para agregar a favoritos
        const response = await fetch("http://localhost:5000/api/favorites", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ songId: trackId }) // Usamos 'songId' como en el backend
        });

        if (!response.ok) {
            throw new Error(
                `Error al agregar a favoritos: ${response.statusText}`
            );
        }

        // Actualizar el store con la lista de favoritos actualizada
        const data = await response.json();
        favorites.set(data.favorites);
    } catch (err) {
        console.error("Error al agregar a favoritos:", err);
    }
};

// Función para eliminar una canción de los favoritos
export const removeFavorite = async (trackId) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    console.log("ID de la canción a eliminar:", trackId);

    // Obtener el estado actual de favoritos desde el store
    const currentFavorites = get(favorites);

    // Verificar si la canción no está en favoritos
    if (!currentFavorites.includes(trackId)) {
        console.warn(
            "La canción no está en tus favoritos. No se hará la solicitud."
        );
        return; // Salir si no está en favoritos
    }

    try {
        // Hacer la solicitud para eliminar de favoritos
        const response = await fetch(
            `http://localhost:5000/api/favorites/${trackId}`,
            {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                }
            }
        );

        if (!response.ok) {
            throw new Error(
                `Error al eliminar de favoritos: ${response.statusText}`
            );
        }

        // Actualizar el store con la lista de favoritos actualizada
        const data = await response.json();
        favorites.set(data.favorites);
    } catch (err) {
        console.error("Error al eliminar de favoritos:", err);
    }
};
