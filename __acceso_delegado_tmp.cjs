const { chromium } = require('playwright');
const SCRATCH = 'C:\\Users\\USUARIO\\AppData\\Local\\Temp\\claude\\C--Users-USUARIO-Desktop-Onboarding-design\\b20f439d-7389-4ff0-8a1d-d6630f445bd6\\scratchpad\\';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
  const errors = [];
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
  page.on('pageerror', err => errors.push('pageerror: ' + err.message));

  await page.goto('http://localhost:5173/onboarding/plantillas', { waitUntil: 'networkidle' });
  await page.evaluate(() => {
    const plantillas = [{
      id: 1, name: 'Onboarding Marketing Digital', descripcion: '', area: 'Marketing', cargo: 'Content Creator',
      etapas: 1, tareas: 1, asignados: 0, status: 'activa', updated: 'Hace 2 días', updatedFecha: '29/06/2026',
      creador: 'Ana Martínez Ruiz', creadoEl: '20/04/2026', color: '#d946ef', esGlobal: false, ordenGlobal: null,
      etapasData: [{ name: 'Etapa 1', locked: false, days: 'Día 1 — Día 7', actividades: [{ name: 'General', tareas: [
        { id: 900, name: 'Video institucional', tipo: 'video', obligatoria: false, puntos: 10, desc: '', responsable: ['Colaborador'], diaDesde: 1, confirmacion: false, done: false },
      ]}] }],
    }];
    localStorage.setItem('onb_demo_plantillas', JSON.stringify(plantillas));
  });
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(500);

  // Switch to Laura (auxiliar), no access yet - NO reload after switching (in-memory state)
  await page.getByText('Juan Pérez Gómez').first().click();
  await page.waitForTimeout(200);
  await page.getByText('Laura Díaz Romero').click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: SCRATCH + 'switched_to_laura.png' });

  // click the route row - should open PREVIEW not JourneyBuilder
  const row = page.locator('table tbody tr', { hasText: 'Marketing Digital' }).first();
  await row.click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: SCRATCH + 'auxiliar_sin_acceso.png' });
  const editarBtnFullscreen = await page.getByRole('button', { name: 'Guardar ruta' }).isVisible().catch(() => false);
  console.log('Laura SIN acceso -> JourneyBuilder NO se abrió (correcto):', !editarBtnFullscreen);

  // close preview by clicking overlay background directly
  await page.mouse.click(20, 20);
  await page.waitForTimeout(400);

  // check Editar absent from menu, then close menu by re-clicking the same trigger (toggle-close)
  const menuBtn = row.locator('button').last();
  await menuBtn.click();
  await page.waitForTimeout(300);
  const editarCountNoAccess = await page.getByText('Editar', { exact: true }).count();
  console.log('Laura SIN acceso -> "Editar" ausente del menu:', editarCountNoAccess === 0);
  await menuBtn.click();
  await page.waitForTimeout(300);
  await page.screenshot({ path: SCRATCH + 'debug_before_switch_back.png' });

  // Switch back to admin (no reload), open Información, add Laura
  await page.getByText('Laura Díaz Romero').first().click();
  await page.waitForTimeout(200);
  await page.getByText('Juan Pérez Gómez').click();
  await page.waitForTimeout(500);

  await page.screenshot({ path: SCRATCH + 'debug_back_to_admin.png' });
  const row2 = page.locator('table tbody tr', { hasText: 'Marketing Digital' }).first();
  await row2.locator('button').last().click();
  await page.waitForTimeout(300);
  await page.screenshot({ path: SCRATCH + 'debug_menu_open.png' });
  await page.getByText('Información', { exact: true }).click();
  await page.waitForTimeout(400);
  await page.getByText('Agregar', { exact: true }).click();
  await page.waitForTimeout(300);
  await page.screenshot({ path: SCRATCH + 'admin_agregar_picker.png' });
  await page.getByText('Laura Díaz Romero').click();
  await page.waitForTimeout(400);
  await page.screenshot({ path: SCRATCH + 'admin_laura_agregada.png' });

  // Switch to Laura again (no reload), now should have edit access
  await page.getByText('Juan Pérez Gómez').first().click();
  await page.waitForTimeout(200);
  await page.getByText('Laura Díaz Romero').click();
  await page.waitForTimeout(500);

  const row3 = page.locator('table tbody tr', { hasText: 'Marketing Digital' }).first();
  await row3.click();
  await page.waitForTimeout(600);
  const journeyBuilderVisible = await page.getByRole('button', { name: 'Guardar ruta' }).isVisible().catch(() => false);
  console.log('Laura CON acceso -> JourneyBuilder SÍ se abrió:', journeyBuilderVisible);
  await page.screenshot({ path: SCRATCH + 'auxiliar_con_acceso.png' });

  console.log('ERRORS:', JSON.stringify(errors, null, 2));
  await browser.close();
})();
