import { writable } from "svelte/store";

// Store para gestionar la sesión del usuario
export const userSession = writable(null);

// Función para cerrar sesión
export const logout = () => {
    localStorage.removeItem("token"); // Elimina el token del almacenamiento
    userSession.set(null); // Limpia el estado de la sesión

    // Evitar redirección si ya estamos en "/"
    if (window.location.pathname !== "/") {
        window.location.href = "/"; // Redirige al usuario a la raíz
    }
};

// Función para verificar el token JWT
export const tokenStatus = () => {
    const token = localStorage.getItem("token");
    if (!token) {
        logout(); // Si no hay token, cierra la sesión
        return false;
    }

    try {
        // Decodificar el token sin validarlo
        const payload = JSON.parse(atob(token.split(".")[1]));

        // Verificar si el token ha expirado
        if (payload.exp * 1000 < Date.now()) {
            console.warn("El token ha expirado. Cerrando sesión...");
            logout(); // Cerrar sesión si el token ha expirado
            return false;
        }

        return true; // El token es válido
    } catch (err) {
        console.error("Error al verificar el token:", err);
        logout(); // Cerrar sesión si el token no es válido
        return false;
    }
};

// Llamar a la función al cargar la aplicación
export const initializeSession = () => {
    const isValid = tokenStatus();
    if (isValid) {
        const token = localStorage.getItem("token");
        const payload = JSON.parse(atob(token.split(".")[1]));
        userSession.set(payload); // Actualizar el store con los datos del usuario
    }
};
