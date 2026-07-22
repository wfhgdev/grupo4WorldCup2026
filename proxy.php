<?php
/**
 * Proxy para API de Football-Data.org
 * Soluciona el problema CORS: las peticiones van al mismo dominio (proxy.php)
 * y el servidor PHP hace la llamada real a la API externa.
 * Las llamadas server-to-server no tienen restricciones CORS.
 * 
 * Soporta tanto curl como file_get_contents (fallback si curl no está instalado).
 */

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: X-Auth-Token, Content-Type');

// Responder a preflight OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Solo aceptar GET
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Método no permitido']);
    exit();
}

$endpoint = $_GET['endpoint'] ?? '';

if (empty($endpoint)) {
    http_response_code(400);
    echo json_encode(['error' => 'Falta el parámetro endpoint']);
    exit();
}

$token = '244ff96cf28140c8b82341ecff5239b8';
$url = 'https://api.football-data.org/v4' . $endpoint;

$response = null;
$httpCode = 0;

// Método 1: curl (si está disponible)
if (function_exists('curl_init')) {
    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER => ['X-Auth-Token: ' . $token],
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_SSL_VERIFYPEER => false,
        CURLOPT_TIMEOUT => 30,
    ]);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlError = curl_error($ch);
    curl_close($ch);

    if ($curlError) {
        http_response_code(500);
        echo json_encode(['error' => 'Error de Curl: ' . $curlError]);
        exit();
    }
} else {
    // Método 2: file_get_contents con stream context (fallback cuando curl no está disponible)
    $opts = [
        'http' => [
            'method' => 'GET',
            'header' => "X-Auth-Token: " . $token . "\r\n" .
                        "User-Agent: WorldCup2026/1.0\r\n",
            'timeout' => 30,
            'ignore_errors' => true
        ],
        'ssl' => [
            'verify_peer' => false,
            'verify_peer_name' => false
        ]
    ];
    $context = stream_context_create($opts);
    $response = @file_get_contents($url, false, $context);
    
    if ($response === false) {
        http_response_code(500);
        echo json_encode(['error' => 'Error al conectar con la API mediante file_get_contents']);
        exit();
    }
    
    // Extraer código HTTP de los headers de respuesta
    // $http_response_header es una variable mágica de PHP
    if (isset($http_response_header[0])) {
        preg_match('/\s(\d{3})\s/', $http_response_header[0], $matches);
        $httpCode = isset($matches[1]) ? (int)$matches[1] : 200;
    } else {
        $httpCode = 200;
    }
}

http_response_code($httpCode);
header('Content-Type: application/json');
echo $response;