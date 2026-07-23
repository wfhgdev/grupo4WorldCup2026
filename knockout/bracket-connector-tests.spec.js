// ============================================
// Tests E2E con Playwright para conectores del bracket
// Verifica que todas las líneas SVG estén correctamente alineadas
// ============================================

const { test, expect } = require('@playwright/test');
const path = require('path');

// URL del archivo knockout.html
const KNOCKOUT_URL = `file://${path.resolve(__dirname, 'knockout.html')}`;

/**
 * Helper: Esperar a que los conectores SVG se rendericen
 */
async function waitForConnectors(page) {
  await page.waitForSelector('#knockout-container:not(.hidden)', { timeout: 10000 });
  await page.waitForSelector('#bracket-connectors path.bracket-connector', { timeout: 10000 });
  await page.waitForTimeout(1500);
}

/**
 * Helper: Obtener el centro de una tarjeta en coordenadas relativas al bracket
 */
async function getCardCenter(page, matchId) {
  return await page.evaluate((id) => {
    const card = document.querySelector(`.match-card[data-match-id="${id}"]`);
    if (!card) return null;
    const bracketRect = document.getElementById('bracket-inner').getBoundingClientRect();
    const r = card.getBoundingClientRect();
    return {
      x: r.left + r.width / 2 - bracketRect.left,
      y: r.top + r.height / 2 - bracketRect.top,
      width: r.width,
      height: r.height
    };
  }, matchId);
}

// Las 16 connectionDefs en orden de renderConnectors()
const CONNECTION_DEFS = [
  { from: [15, 16], to: 0, side: 'right' },
  { from: [17, 18], to: 1, side: 'right' },
  { from: [19, 20], to: 2, side: 'right' },
  { from: [21, 22], to: 3, side: 'right' },
  { from: [0, 1], to: 4, side: 'right' },
  { from: [2, 3], to: 5, side: 'right' },
  { from: [4, 5], to: 13, side: 'right' },
  { from: [13], to: 8, side: 'right' },
  { from: [14], to: 8, side: 'left' },
  { from: [6, 7], to: 14, side: 'left' },
  { from: [9, 10], to: 6, side: 'left' },
  { from: [11, 12], to: 7, side: 'left' },
  { from: [23, 24], to: 9, side: 'left' },
  { from: [25, 26], to: 10, side: 'left' },
  { from: [27, 28], to: 11, side: 'left' },
  { from: [29, 30], to: 12, side: 'left' }
];

// ============================================
// TEST 1: Verificar que el SVG existe y no está vacío
// ============================================
test('SVG de conectores existe y contiene paths', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto(KNOCKOUT_URL);
  await waitForConnectors(page);

  const svg = page.locator('#bracket-connectors');
  await expect(svg).toBeVisible();

  const pathCount = await page.locator('#bracket-connectors path.bracket-connector').count();
  expect(pathCount).toBe(16);
  console.log(`✓ Paths encontrados: ${pathCount} (esperados: 16)`);
});

// ============================================
// TEST 2: Verificar que todas las tarjetas tienen posiciones válidas
// ============================================
test('Todas las tarjetas tienen posiciones válidas en el DOM', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto(KNOCKOUT_URL);
  await waitForConnectors(page);

  const invalidCards = await page.evaluate(() => {
    const cards = document.querySelectorAll('.match-card');
    const bracketRect = document.getElementById('bracket-inner').getBoundingClientRect();
    const invalid = [];
    cards.forEach(card => {
      const r = card.getBoundingClientRect();
      const relX = r.left + r.width / 2 - bracketRect.left;
      const relY = r.top + r.height / 2 - bracketRect.top;
      if (relX <= 0 || relY <= 0 || r.width <= 0 || r.height <= 0) {
        invalid.push({ id: card.dataset.matchId, relX, relY });
      }
    });
    return invalid;
  });

  expect(invalidCards.length).toBe(0);
});

// ============================================
// TEST 3: Verificar que no hay paths con longitud cero
// ============================================
test('Ningún path tiene longitud cero', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto(KNOCKOUT_URL);
  await waitForConnectors(page);

  const zeroLengthPaths = await page.evaluate(() => {
    const paths = document.querySelectorAll('#bracket-connectors path.bracket-connector');
    const zeroLength = [];
    paths.forEach((p, i) => {
      const d = p.getAttribute('d') || '';
      const coords = d.match(/[\d.]+/g);
      if (coords && coords.length >= 4) {
        const startX = parseFloat(coords[0]);
        const startY = parseFloat(coords[1]);
        const endX = parseFloat(coords[coords.length - 2]);
        const endY = parseFloat(coords[coords.length - 1]);
        if (Math.abs(startX - endX) < 1 && Math.abs(startY - endY) < 1) {
          zeroLength.push(i);
        }
      }
    });
    return zeroLength;
  });

  expect(zeroLengthPaths.length).toBe(0);
});

// ============================================
// TEST 4: Verificar que los paths terminan cerca del centro de su tarjeta destino
// ============================================
test('Los paths terminan cerca del centro de su tarjeta destino (tolerancia 8px)', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto(KNOCKOUT_URL);
  await waitForConnectors(page);

  // Obtener centros de todos los destinos únicos
  const uniqueDests = [...new Set(CONNECTION_DEFS.map(d => d.to))];
  const destCenters = {};
  for (const destId of uniqueDests) {
    destCenters[destId] = await getCardCenter(page, destId);
  }

  // Verificar cada path contra su destino esperado
  const mismatches = await page.evaluate(({ defs, centers }) => {
    const paths = document.querySelectorAll('#bracket-connectors path.bracket-connector');
    const errors = [];
    paths.forEach((p, i) => {
      if (i >= defs.length) return;
      const target = centers[defs[i].to];
      if (!target) return;

      const d = p.getAttribute('d') || '';
      const coords = d.match(/[\d.]+/g);
      if (!coords || coords.length < 4) return;

      const endX = parseFloat(coords[coords.length - 2]);
      const endY = parseFloat(coords[coords.length - 1]);
      const dist = Math.sqrt((endX - target.x) ** 2 + (endY - target.y) ** 2);

      if (dist > 8) {
        errors.push({ path: i, destId: defs[i].to, dist, endX, endY, targetX: target.x, targetY: target.y });
      }
    });
    return errors;
  }, { defs: CONNECTION_DEFS, centers: destCenters });

  if (mismatches.length > 0) {
    console.log('Paths con error de alineación:', mismatches);
  }
  expect(mismatches.length).toBe(0);
});

// ============================================
// TEST 5: Verificar que los paths empiezan en el borde de la tarjeta origen
// ============================================
test('Los paths empiezan en el borde de una tarjeta origen', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto(KNOCKOUT_URL);
  await waitForConnectors(page);

  const errors = await page.evaluate((defs) => {
    const paths = document.querySelectorAll('#bracket-connectors path.bracket-connector');
    const bracketRect = document.getElementById('bracket-inner').getBoundingClientRect();
    const errs = [];

    paths.forEach((p, pathIdx) => {
      if (pathIdx >= defs.length) return;
      const d = p.getAttribute('d') || '';
      const coords = d.match(/[\d.]+/g);
      if (!coords || coords.length < 2) return;

      const startX = parseFloat(coords[0]);
      const def = defs[pathIdx];
      const isLeftToRight = def.side === 'right';
      const expectedSide = isLeftToRight ? 'right' : 'left';

      let foundMatch = false;
      for (const srcId of def.from) {
        const card = document.querySelector(`.match-card[data-match-id="${srcId}"]`);
        if (!card) continue;
        const r = card.getBoundingClientRect();
        const expectedX = (expectedSide === 'right')
          ? r.right - bracketRect.left
          : r.left - bracketRect.left;
        const dist = Math.abs(startX - expectedX);
        if (dist < 15) {
          foundMatch = true;
          break;
        }
      }

      if (!foundMatch) {
        errs.push({ path: pathIdx, startX, from: def.from, side: def.side });
      }
    });
    return errs;
  }, CONNECTION_DEFS);

  if (errors.length > 0) {
    console.log('Paths con origen incorrecto:', errors);
  }
  expect(errors.length).toBe(0);
});

// ============================================
// TEST 7: Verificar que los paths tienen colores correctos según la etapa
// ============================================
test('Los paths tienen colores correctos según la etapa', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto(KNOCKOUT_URL);
  await waitForConnectors(page);

  const colors = await page.evaluate(() => {
    const paths = document.querySelectorAll('#bracket-connectors path.bracket-connector');
    return Array.from(paths).map(p => p.getAttribute('stroke'));
  });

  const validColors = ['#cbc4d2', '#b0a8c0', '#9a8eb0', '#7a6e94', '#6750a4'];
  colors.forEach((color) => {
    expect(validColors).toContain(color);
  });
});

// ============================================
// TEST 8: Screenshot visual para detectar regresiones
// ============================================
test('Captura de pantalla del bracket completo para regresión visual', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto(KNOCKOUT_URL);
  await waitForConnectors(page);

  const bracketContainer = page.locator('#bracket-inner');
  await expect(bracketContainer).toBeVisible();
  await page.screenshot({
    path: 'screenshots/bracket-connectors-1920x1080.png',
    fullPage: false
  });
});

// ============================================
// TEST 9: Verificar funcionamiento con zoom 125%
// ============================================
test('Las conexiones funcionan correctamente con zoom 125%', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto(KNOCKOUT_URL);
  await waitForConnectors(page);

  await page.evaluate(() => {
    document.body.style.zoom = '1.25';
  });
  await page.waitForTimeout(1000);
  await page.waitForSelector('#bracket-connectors path.bracket-connector', { timeout: 5000 });
  await page.waitForTimeout(1500);

  const pathCount = await page.locator('#bracket-connectors path.bracket-connector').count();
  expect(pathCount).toBe(16);
});

// ============================================
// TEST 10: Verificar que no hay paths fuera del contenedor
// ============================================
test('Ningún path está fuera del contenedor del bracket', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto(KNOCKOUT_URL);
  await waitForConnectors(page);

  const outOfBounds = await page.evaluate(() => {
    const paths = document.querySelectorAll('#bracket-connectors path.bracket-connector');
    const svg = document.getElementById('bracket-connectors');
    const svgRect = svg.getBoundingClientRect();
    const errors = [];

    paths.forEach((p, i) => {
      const d = p.getAttribute('d') || '';
      const coords = d.match(/[\d.]+/g);
      if (!coords) return;

      for (let j = 0; j < coords.length; j += 2) {
        const x = parseFloat(coords[j]);
        const y = parseFloat(coords[j + 1]);
        if (x < -10 || x > svgRect.width + 10 || y < -10 || y > svgRect.height + 10) {
          errors.push({ path: i, x, y, svgW: svgRect.width, svgH: svgRect.height });
          break;
        }
      }
    });
    return errors;
  });

  expect(outOfBounds.length).toBe(0);
});

// ============================================
// TEST 11: Verificar en resolución 1366x768
// ============================================
test('Las conexiones funcionan en resolución 1366x768', async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 768 });
  await page.goto(KNOCKOUT_URL);
  await waitForConnectors(page);

  const pathCount = await page.locator('#bracket-connectors path.bracket-connector').count();
  expect(pathCount).toBe(16);
});

// ============================================
// TEST 12: Verificar en resolución 1280x720
// ============================================
test('Las conexiones funcionan en resolución 1280x720', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto(KNOCKOUT_URL);
  await waitForConnectors(page);

  const pathCount = await page.locator('#bracket-connectors path.bracket-connector').count();
  expect(pathCount).toBe(16);
});