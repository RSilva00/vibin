import { writable, derived } from "svelte/store";

// Store para el ID y los detalles de la canción actual
export const currentSongId = writable(null);
export const currentSongDetails = writable(null);

// Store para manejar el estado de reproducción
export const isPlaying = writable(false);

// Función para establecer la canción actual
export function setCurrentSong(song) {
    currentSongId.set(song.id); // Actualiza el ID
    currentSongDetails.set(song); // Actualiza los detalles de la canción
    isPlaying.set(true); // Inicia automáticamente la reproducción
}

// Función para detener la canción actual
export function clearCurrentSong() {
    currentSongId.set(null);
    currentSongDetails.set(null);
    isPlaying.set(false);
}
