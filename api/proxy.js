// ============================================
// Vercel Serverless Proxy — Football-Data.org
// ============================================
// Función serverless para Vercel (alternativa al proxy PHP tradicional)
// ============================================

export default async function handler(req, res) {
  // Configuración CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-Auth-Token', 'Content-Type');

  // Respuesta para preflight OPTIONS
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Solo GET
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Método no permitido' });
    return;
  }

  const endpoint = req.query.endpoint || '';

  if (!endpoint) {
    res.status(400).json({ error: 'Falta el parámetro endpoint' });
    return;
  }

  const token = '244ff96cf28140c8b82341ecff5239b8';
  const url = 'https://api.football-data.org/v4' + endpoint;

  try {
    const response = await fetch(url, {
      headers: {
        'X-Auth-Token': token,
        'User-Agent': 'WorldCup2026/1.0'
      }
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    console.error('Error del proxy:', error.message);
    res.status(500).json({ error: 'Error al conectar con la API de datos futbolísticos' });
  }
}