// ============================================
// bracket-tests.js — Tests automatizados para el Árbol de Eliminatorias
// Se ejecutan automáticamente al cargar la página
// Usan console.assert() con formato claro (✓/✗)
// ============================================

/**
 * Ejecutar todos los tests del bracket
 * @param {boolean} [silent=false] - Si es true, no muestra resultados en consola
 * @returns {object} Resultados { total, passed, failed, tests }
 */
function runBracketTests(silent = false) {
  const results = { total: 0, passed: 0, failed: 0, tests: [] };

  const testLogger = silent
    ? { log: () => {}, warn: () => {}, error: () => {} }
    : createLogger('BracketTests');

  /**
   * Registrar un test individual
   * @param {string} name - Nombre del test
   * @param {function} fn - Función que ejecuta el test
   */
  const test = (name, fn) => {
    results.total++;
    try {
      fn();
      results.passed++;
      results.tests.push({ name, passed: true });
      if (!silent) {
        console.log(`  ✓ ${name}`);
      }
    } catch (err) {
      results.failed++;
      results.tests.push({ name, passed: false, error: err.message });
      if (!silent) {
        console.log(`  ✗ ${name}`);
        console.log(`    Error: ${err.message}`);
      }
    }
  };

  /**
   * Assert que una condición es verdadera
   */
  const assert = (condition, message) => {
    if (!condition) {
      throw new Error(message || 'Assertion failed');
    }
  };

  /**
   * Assert que dos valores son iguales
   */
  const assertEqual = (actual, expected, message) => {
    if (actual !== expected) {
      throw new Error(`${message || 'Not equal'}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
    }
  };

  // ============================================
  // TEST 1: Estructura del bracket HTML
  // ============================================
  test('Estructura del bracket: 31 tarjetas con data-match-id únicos', () => {
    const cards = document.querySelectorAll('.match-card');
    assert(cards.length === 31, `Se esperaban 31 tarjetas, se encontraron ${cards.length}`);

    const ids = [];
    cards.forEach(card => {
      const id = card.dataset.matchId;
      assert(id !== undefined && id !== null, 'Tarjeta sin data-match-id');
      assert(!ids.includes(id), `data-match-id duplicado: ${id}`);
      ids.push(id);
    });

    // Verificar que están todos los IDs del 0 al 30
    for (let i = 0; i <= 30; i++) {
      assert(ids.includes(String(i)), `Falta data-match-id: ${i}`);
    }
  });

  // ============================================
  // TEST 2: buildBracketMapping produce 31 IDs
  // ============================================
  test('buildBracketMapping produce 31 entradas (0-30)', () => {
    const demoData = getDemoBracketData();
    const mapping = buildBracketMapping(demoData);
    const keys = Object.keys(mapping);

    assertEqual(keys.length, 31, `Se esperaban 31 keys, se obtuvieron ${keys.length}`);

    for (let i = 0; i <= 30; i++) {
      assert(keys.includes(String(i)), `Falta key ${i} en el mapping`);
    }
  });

  // ============================================
  // TEST 3: validateBracketData funciona correctamente
  // ============================================
  test('validateBracketData: mapping completo es válido', () => {
    const demoData = getDemoBracketData();
    const mapping = buildBracketMapping(demoData);
    const validation = validateBracketData(mapping);

    assert(validation.valid === true, `Se esperaba valid=true, missing: ${validation.missing.join(',')}`);
    assertEqual(validation.totalCards, 31, 'Total cards debe ser 31');
    assertEqual(validation.missing.length, 0, 'No debe haber IDs faltantes');
  });

  test('validateBracketData: mapping incompleto detecta errores', () => {
    const incomplete = { '0': {}, '1': {}, '5': {} };
    const validation = validateBracketData(incomplete);

    assert(validation.valid === false, 'Mapping incompleto debe ser inválido');
    assert(validation.missing.length > 0, 'Debe reportar IDs faltantes');
    assert(validation.missing.includes('2'), 'Debe incluir ID 2 como faltante');
  });

  // ============================================
  // TEST 4: getStageFromMatchId
  // ============================================
  test('getStageFromMatchId: clasifica correctamente por rango', () => {
    assertEqual(getStageFromMatchId(0), 'LAST_16', 'ID 0 debe ser LAST_16');
    assertEqual(getStageFromMatchId(4), 'QUARTER_FINALS', 'ID 4 debe ser QUARTER_FINALS');
    assertEqual(getStageFromMatchId(8), 'FINAL', 'ID 8 debe ser FINAL');
    assertEqual(getStageFromMatchId(13), 'SEMI_FINALS', 'ID 13 debe ser SEMI_FINALS');
    assertEqual(getStageFromMatchId(15), 'LAST_32', 'ID 15 debe ser LAST_32');
    assertEqual(getStageFromMatchId(23), 'LAST_32', 'ID 23 debe ser LAST_32');
    assertEqual(getStageFromMatchId(99), 'UNKNOWN', 'ID 99 debe ser UNKNOWN');
  });

  // ============================================
  // TEST 5: getWinner
  // ============================================
  test('getWinner: partido FINISHED con ganador local', () => {
    const match = {
      status: 'FINISHED',
      score: { winner: 'HOME_TEAM', fullTime: { home: 3, away: 0 } },
      homeTeam: { id: 1, name: 'Argentina', tla: 'ARG' },
      awayTeam: { id: 2, name: 'Brasil', tla: 'BRA' }
    };
    const winner = getWinner(match);
    assert(winner !== null, 'Debe haber un ganador');
    assertEqual(winner.tla, 'ARG', 'El ganador debe ser Argentina');
  });

  test('getWinner: partido FINISHED con ganador visitante', () => {
    const match = {
      status: 'FINISHED',
      score: { winner: 'AWAY_TEAM', fullTime: { home: 1, away: 2 } },
      homeTeam: { id: 1, name: 'Argentina', tla: 'ARG' },
      awayTeam: { id: 2, name: 'Brasil', tla: 'BRA' }
    };
    const winner = getWinner(match);
    assert(winner !== null, 'Debe haber un ganador');
    assertEqual(winner.tla, 'BRA', 'El ganador debe ser Brasil');
  });

  test('getWinner: partido SCHEDULED devuelve null', () => {
    const match = {
      status: 'SCHEDULED',
      score: { winner: null, fullTime: { home: null, away: null } },
      homeTeam: { id: 1, name: 'Argentina', tla: 'ARG' },
      awayTeam: { id: 2, name: 'Brasil', tla: 'BRA' }
    };
    const winner = getWinner(match);
    assert(winner === null, 'Partido SCHEDULED no debe tener ganador');
  });

  test('getWinner: partido null devuelve null', () => {
    assert(getWinner(null) === null, 'Match null debe devolver null');
    assert(getWinner({}) === null, 'Match vacío debe devolver null');
  });

  // ============================================
  // TEST 6: getConnectorColor y getConnectorWidth
  // ============================================
  test('getConnectorColor: devuelve colores por etapa', () => {
    assertEqual(getConnectorColor('LAST_32'), '#cbc4d2');
    assertEqual(getConnectorColor('FINAL'), '#6750a4');
    assertEqual(getConnectorColor('UNKNOWN'), '#cbc4d2', 'Etapa desconocida debe usar color por defecto');
  });

  test('getConnectorWidth: devuelve anchos por etapa', () => {
    assertEqual(getConnectorWidth('LAST_32'), 1.5);
    assertEqual(getConnectorWidth('FINAL'), 2.5);
    assertEqual(getConnectorWidth('UNKNOWN'), 1.5, 'Etapa desconocida debe usar ancho por defecto');
  });

  // ============================================
  // TEST 7: extractApiData
  // ============================================
  test('extractApiData: extrae correctamente las 6 etapas', () => {
    const responses = [
      { matches: [{ id: 1 }] },
      { matches: [{ id: 2 }, { id: 3 }] },
      { matches: [] },
      null,
      undefined,
      { matches: [{ id: 4 }] }
    ];

    const data = extractApiData(responses);
    assertEqual(data.last32.length, 1, 'last32 debe tener 1 match');
    assertEqual(data.last16.length, 2, 'last16 debe tener 2 matches');
    assertEqual(data.quarters.length, 0, 'quarters debe estar vacío');
    assertEqual(data.semis.length, 0, 'semis null debe ser array vacío');
    assertEqual(data.third.length, 0, 'third undefined debe ser array vacío');
    assertEqual(data.finals.length, 1, 'finals debe tener 1 match');
  });

  // ============================================
  // TEST 8: Datos demo tienen estructura válida
  // ============================================
  test('getDemoBracketData: estructura completa y válida', () => {
    const data = getDemoBracketData();

    assert(data.last32 !== undefined, 'Debe tener last32');
    assert(data.last16 !== undefined, 'Debe tener last16');
    assert(data.quarters !== undefined, 'Debe tener quarters');
    assert(data.semis !== undefined, 'Debe tener semis');
    assert(data.third !== undefined, 'Debe tener third');
    assert(data.finals !== undefined, 'Debe tener finals');

    assert(data.last32.length > 0, 'last32 no debe estar vacío');
    assert(data.last16.length > 0, 'last16 no debe estar vacío');
    assert(data.quarters.length > 0, 'quarters no debe estar vacío');
    assert(data.semis.length > 0, 'semis no debe estar vacío');

    // Verificar formato de cada partido
    const allMatches = [...data.last32, ...data.last16, ...data.quarters, ...data.semis, ...data.third, ...data.finals];
    allMatches.forEach((match, i) => {
      assert(match.id !== undefined, `Match ${i} sin id`);
      assert(match.status !== undefined, `Match ${i} sin status`);
      assert(match.homeTeam !== undefined, `Match ${i} sin homeTeam`);
      assert(match.awayTeam !== undefined, `Match ${i} sin awayTeam`);
      assert(match.score !== undefined, `Match ${i} sin score`);
      assert(match.homeTeam.name !== undefined, `Match ${i} homeTeam sin name`);
      assert(match.awayTeam.name !== undefined, `Match ${i} awayTeam sin name`);
    });
  });

  // ============================================
  // TEST 9: Casos edge - datos vacíos
  // ============================================
  test('buildBracketMapping: datos vacíos produce mapping con todos null', () => {
    const mapping = buildBracketMapping({});
    const keys = Object.keys(mapping);
    assertEqual(keys.length, 31, 'Debe producir 31 keys aunque no haya datos');

    const allNull = keys.every(k => mapping[k] === null);
    assert(allNull, 'Todos los valores deben ser null con datos vacíos');
  });

  test('buildBracketMapping: apiData null no lanza error', () => {
    const mapping = buildBracketMapping(null);
    assert(mapping !== null, 'No debe devolver null');
    assertEqual(Object.keys(mapping).length, 31, 'Debe producir 31 keys');
  });

  // ============================================
  // TEST 10: createLogger
  // ============================================
  test('createLogger: produce objeto con métodos log, warn, error', () => {
    const log = createLogger('Test');
    assert(typeof log.log === 'function', 'Debe tener método log');
    assert(typeof log.warn === 'function', 'Debe tener método warn');
    assert(typeof log.error === 'function', 'Debe tener método error');

    // Verificar que no lanza errores
    log.log('test message');
    log.warn('test warning');
    log.error('test error');
  });

  // ============================================
  // TEST 11: Conectores SVG (si existen en el DOM)
  // ============================================
  test('Conectores SVG: se crean paths con clase bracket-connector', () => {
    const svg = document.getElementById('bracket-connectors');
    if (!svg) {
      testLogger.warn('SVG bracket-connectors no encontrado en DOM, saltando test de conectores');
      return;
    }

    const paths = svg.querySelectorAll('path.bracket-connector');
    // Puede que no haya paths si el viewport es < 1024px
    if (paths.length === 0) {
      testLogger.log('No hay paths de conectores (posiblemente viewport < 1024px)');
      return;
    }

    paths.forEach((path, i) => {
      const d = path.getAttribute('d');
      assert(d !== null && d.length > 0, `Path ${i} sin atributo d`);
      assert(d.startsWith('M '), `Path ${i} debe empezar con 'M '`);
    });
  });

  // ============================================
  // TEST 12: Integración - demo data + buildBracketMapping produce bracket funcional
  // ============================================
  test('Integración: demo data + mapping produce bracket con datos', () => {
    const demoData = getDemoBracketData();
    const mapping = buildBracketMapping(demoData);

    // Verificar que los partidos de etapas avanzadas tienen datos
    assert(mapping[8] !== null, 'La final (ID 8) debe tener datos');
    assert(mapping[13] !== null, 'Semifinal izquierda (ID 13) debe tener datos');
    assert(mapping[14] !== null, 'Semifinal derecha (ID 14) debe tener datos');

    // Verificar que los cuartos tienen datos
    assert(mapping[4] !== null, 'QF izquierdo 1 (ID 4) debe tener datos');
    assert(mapping[5] !== null, 'QF izquierdo 2 (ID 5) debe tener datos');
    assert(mapping[6] !== null, 'QF derecho 1 (ID 6) debe tener datos');
    assert(mapping[7] !== null, 'QF derecho 2 (ID 7) debe tener datos');
  });

  // ============================================
  // Mostrar resumen
  // ============================================
  if (!silent) {
    const totalTests = results.total;
    const passedTests = results.passed;
    const failedTests = results.failed;
    const passRate = totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0;

    console.log('');
    console.log('========================================');
    console.log('  RESUMEN DE TESTS DEL BRACKET');
    console.log('========================================');
    console.log(`  Total:  ${totalTests}`);
    console.log(`  ✓ Pasados: ${passedTests}`);
    console.log(`  ✗ Fallados: ${failedTests}`);
    console.log(`  Tasa:   ${passRate}%`);
    console.log('========================================');
    console.log('');
  }

  return results;
}

// Auto-ejecutar tests al cargar la página (con retardo para asegurar DOM listo)
if (typeof document !== 'undefined') {
  if (document.readyState === 'complete') {
    runBracketTests();
  } else {
    document.addEventListener('DOMContentLoaded', () => {
      // Pequeño retardo para que los conectores se hayan renderizado
      setTimeout(() => runBracketTests(), 500);
    });
  }
}