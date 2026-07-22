// ============================================
// API Football Data - World Cup 2026
// Conexión con https://www.football-data.org/
// ============================================

const API_CONFIG = {
  proxyUrl: (function() {
    // Detectar entorno: Vercel (sin PHP) vs hosting con PHP
    var hostname = window.location.hostname;
    if (hostname.indexOf('vercel.app') !== -1) {
      return '/api/proxy';
    }
    // Fallback: para desarrollo local o GitHub Pages usamos /api/proxy
    return '/api/proxy';
  })(),
  directUrl: 'https://api.football-data.org/v4',
  token: '244ff96cf28140c8b82341ecff5239b8'
};

// ============================================
// Caché de respuestas API (localStorage, 5 min)
// ============================================

const CACHE_CONFIG = {
  ttl: 5 * 60 * 1000,       // 5 minutos en milisegundos
  prefix: 'wc2026_cache_',   // prefijo de claves en localStorage
  maxEntries: 30             // máx. entradas en caché (limpieza de antiguas)
};

/**
 * Obtener datos de la caché
 * @param {string} key - clave (endpoint)
 * @returns {object|null} datos o null si la caché expiró / no existe
 */
function getFromCache(key) {
  try {
    const raw = localStorage.getItem(CACHE_CONFIG.prefix + key);
    if (!raw) return null;

    const entry = JSON.parse(raw);

    // Verificar fecha de caducidad
    if (Date.now() > entry.expiresAt) {
      localStorage.removeItem(CACHE_CONFIG.prefix + key);
      return null;
    }

    console.log(`[CACHE] ACIERTO para "${key}" (expira: ${new Date(entry.expiresAt).toLocaleTimeString()})`);
    return entry.data;
  } catch (e) {
    // Si localStorage no está disponible o los datos están corruptos
    console.warn('[CACHE] Error de lectura:', e.message);
    return null;
  }
}

/**
 * Guardar datos en la caché
 * @param {string} key - clave (endpoint)
 * @param {*} data - datos a guardar
 */
function setToCache(key, data) {
  try {
    // Limpiar entradas antiguas si se supera el límite
    cleanupCache();

    const entry = {
      data: data,
      cachedAt: Date.now(),
      expiresAt: Date.now() + CACHE_CONFIG.ttl
    };

    localStorage.setItem(CACHE_CONFIG.prefix + key, JSON.stringify(entry));
    console.log(`[CACHE] GUARDADO "${key}" (expira: ${new Date(entry.expiresAt).toLocaleTimeString()})`);
  } catch (e) {
    // localStorage puede estar lleno — limpiamos todo
    console.warn('[CACHE] Error de escritura, limpiando caché:', e.message);
    clearEntireCache();
  }
}

/**
 * Eliminar de la caché todas las entradas con el prefijo indicado
 */
function clearEntireCache() {
  try {
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(CACHE_CONFIG.prefix)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(k => localStorage.removeItem(k));
    console.log(`[CACHE] Limpiadas ${keysToRemove.length} entradas`);
  } catch (e) {
    console.warn('[CACHE] Error de limpieza:', e.message);
  }
}

/**
 * Limpieza de entradas antiguas si se supera el límite
 */
function cleanupCache() {
  try {
    const keys = [];
    const now = Date.now();

    // Recopilar todas las claves de caché
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(CACHE_CONFIG.prefix)) {
        const raw = localStorage.getItem(key);
        if (raw) {
          try {
            const entry = JSON.parse(raw);
            keys.push({ key, expiresAt: entry.expiresAt || 0 });
          } catch {
            keys.push({ key, expiresAt: 0 });
          }
        }
      }
    }

    // Si se supera el límite — eliminar las más antiguas (que expiran pronto)
    if (keys.length >= CACHE_CONFIG.maxEntries) {
      keys.sort((a, b) => a.expiresAt - b.expiresAt);
      const toRemove = keys.slice(0, keys.length - CACHE_CONFIG.maxEntries + 5);
      toRemove.forEach(({ key }) => localStorage.removeItem(key));
    }

    // También eliminar las que han expirado explícitamente
    keys.forEach(({ key, expiresAt }) => {
      if (expiresAt > 0 && now > expiresAt) {
        localStorage.removeItem(key);
      }
    });
  } catch (e) {
    console.warn('[CACHE] Error de limpieza:', e.message);
  }
}

/**
 * Función universal para llamar a la API
 * Con caché de respuestas de 5 minutos
 * Estrategia:
 * 1. Verificar caché (localStorage)
 * 2. Si la caché está vacía — probar proxy (resuelve CORS)
 * 3. Si el proxy falla — probar fetch directo (como plan de respaldo)
 * 4. Guardar respuesta exitosa en caché
 *
 * IMPORTANTE: football-data.org devuelve la cabecera CORS Access-Control-Allow-Origin: http://localhost,
 * por lo que el fetch directo desde un dominio externo NO FUNCIONA.
 * Usamos /api/proxy (Vercel Serverless Function) como método principal.
 */
async function fetchApi(endpoint) {
  // === Paso 1: Verificar caché ===
  const cached = getFromCache(endpoint);
  if (cached) {
    return cached;
  }

  // === Paso 2: Probar proxy serverless /api/proxy (método principal) ===
  let data = null;
  let fromProxy = false;

  try {
    const proxyResponse = await fetch(`${API_CONFIG.proxyUrl}?endpoint=${encodeURIComponent(endpoint)}`);

    // Verificar que la respuesta sea JSON
    const contentType = proxyResponse.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      throw new Error(`El proxy devolvió contenido no-JSON (${contentType}). Es posible que la función serverless no esté disponible.`);
    }

    if (!proxyResponse.ok) {
      const errorText = await proxyResponse.text();
      throw new Error(`Error del proxy ${proxyResponse.status}: ${errorText}`);
    }

    data = await proxyResponse.json();
    fromProxy = true;
  } catch (proxyError) {
    console.warn('Proxy falló, intentando API directa como respaldo:', proxyError.message);
  }

  // === Paso 3: Fallback — petición directa (si el proxy falló) ===
  if (!data) {
    try {
      const directResponse = await fetch(`${API_CONFIG.directUrl}${endpoint}`, {
        headers: { 'X-Auth-Token': API_CONFIG.token }
      });
      if (!directResponse.ok) {
        throw new Error(`Error ${directResponse.status}: ${directResponse.statusText}`);
      }
      data = await directResponse.json();
    } catch (directError) {
      console.error('API directa también falló:', directError.message);
      throw new Error('API no disponible. Intente actualizar la página más tarde.');
    }
  }

  // === Paso 4: Guardar en caché ===
  if (data) {
    setToCache(endpoint, data);
  }

  return data;
}

// ============================================
// 1. PÁGINA DE INICIO
// ============================================

/**
 * Información general del torneo
 */
async function getWorldCupInfo() {
  return fetchApi('/competitions/WC');
}

// ============================================
// 2. PRÓXIMOS PARTIDOS Y RESULTADOS
// ============================================

/**
 * Todos los partidos del torneo
 */
async function getAllMatches() {
  return fetchApi('/competitions/WC/matches');
}

/**
 * Partidos filtrados por estado
 * @param {string} status - SCHEDULED | IN_PLAY | FINISHED
 */
async function getMatchesByStatus(status) {
  return fetchApi(`/competitions/WC/matches?status=${status}`);
}

// ============================================
// 3. CLASIFICACIÓN POR GRUPOS
// ============================================

/**
 * Tabla de posiciones de la fase de grupos
 */
async function getStandings() {
  return fetchApi('/competitions/WC/standings?season=2026');
}

/**
 * Partidos de la fase de grupos (para calcular tablas manualmente)
 * Útil cuando el endpoint de standings no devuelve datos
 */
async function getGroupMatches() {
  return fetchApi('/competitions/WC/matches?season=2026&stage=GROUP_STAGE');
}

// ============================================
// 4. ÁRBOL DE ELIMINATORIAS
// ============================================

/**
 * Partidos filtrados por etapa del torneo
 * @param {string} stage - LAST_16 | QUARTER_FINALS | SEMI_FINALS | THIRD_PLACE | FINAL
 */
async function getMatchesByStage(stage) {
  return fetchApi(`/competitions/WC/matches?stage=${stage}`);
}

// ============================================
// 5. ESTADÍSTICAS DEL TORNEO
// ============================================

/**
 * Máximos goleadores - Bota de Oro
 */
async function getScorers() {
  return fetchApi('/competitions/WC/scorers?season=2026');
}

/**
 * Equipos participantes con estadísticas
 */
async function getTeams() {
  return fetchApi('/competitions/WC/teams?season=2026');
}