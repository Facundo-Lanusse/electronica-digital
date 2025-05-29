/**
 * Servicio de autenticación para manejar peticiones HTTP con JWT
 */

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

/**
 * Función para realizar peticiones autenticadas
 * @param {string} endpoint - El endpoint a consultar (sin el BACKEND_URL)
 * @param {Object} options - Opciones de fetch (method, body, etc)
 * @returns {Promise} - La respuesta de la API
 */
export const authenticatedFetch = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');

  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  // Añadir el token a los headers si existe
  if (token) {
    defaultOptions.headers.Authorization = `Bearer ${token}`;
  }

  // Combinar las opciones por defecto con las proporcionadas
  const fetchOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...(options.headers || {})
    }
  };

  try {
    const response = await fetch(`${BACKEND_URL}${endpoint}`, fetchOptions);

    // Si el token ha expirado o es inválido (401 Unauthorized)
    if (response.status === 401) {
      // Limpiar el token y redirigir al login
      localStorage.removeItem('token');
      localStorage.removeItem('userId');

      // Redirigir al login
      window.location.href = '/'; // O la ruta donde tengas el login
      return null;
    }

    return response;
  } catch (error) {
    console.error('Error en petición autenticada:', error);
    throw error;
  }
};

/**
 * Verifica si el usuario está autenticado
 * @returns {boolean} - true si está autenticado, false en caso contrario
 */
export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  if (!token) return false;

  // Opcionalmente, verificar si el token ha expirado
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    const payload = JSON.parse(jsonPayload);
    const expirationTime = payload.exp * 1000; // Convertir a milisegundos

    if (Date.now() >= expirationTime) {
      // El token ha expirado
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error al verificar token:', error);
    return false;
  }
};

/**
 * Obtiene el ID del usuario del token decodificado
 * @returns {string|null} - El ID del usuario o null si no está autenticado
 */
export const getUserId = () => {
  // Primero intentamos obtenerlo del localStorage para mayor eficiencia
  const userId = localStorage.getItem('userId');
  if (userId) return userId;

  // Si no está en localStorage, lo decodificamos del token
  const token = localStorage.getItem('token');
  if (!token) return null;

  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    const payload = JSON.parse(jsonPayload);
    return payload.userId;
  } catch (error) {
    console.error('Error al decodificar token:', error);
    return null;
  }
};

/**
 * Cierra la sesión del usuario
 */
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('userId');

  // Redirigir al login
  window.location.href = '/'; // O la ruta donde tengas el login
};
