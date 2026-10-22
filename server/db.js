const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const DB_PATH = path.resolve(__dirname, '..', 'almacen.db');

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Error al conectar con la base de datos SQLite:', err.message);
  } else {
    console.log(`Conectado a la base de datos SQLite en: ${DB_PATH}`);
  }
});

// Habilitar claves foráneas
db.run('PRAGMA foreign_keys = ON');

// Promisified DB helpers
const run = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
};

const get = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

const all = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

async function initDB() {
  // Tabla de Arribos / Entradas al almacén
  await run(`
    CREATE TABLE IF NOT EXISTS arribos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      folio TEXT UNIQUE NOT NULL,
      fecha_arribo TEXT NOT NULL,
      cliente TEXT NOT NULL,
      email_cliente TEXT,
      transportista TEXT NOT NULL,
      guia_bol TEXT NOT NULL,
      bultos INTEGER NOT NULL DEFAULT 1,
      peso_libras REAL NOT NULL DEFAULT 0,
      descripcion_general TEXT,
      estado TEXT NOT NULL DEFAULT 'Recibido',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Tabla de Detalle de Partidas recibidas (Relación 1 a N)
  await run(`
    CREATE TABLE IF NOT EXISTS arribo_detalles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      arribo_id INTEGER NOT NULL,
      numero_parte TEXT NOT NULL,
      modelo TEXT,
      descripcion TEXT NOT NULL,
      cantidad REAL NOT NULL,
      unidad_medida TEXT NOT NULL DEFAULT 'PZA',
      numero_serie TEXT,
      notas TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (arribo_id) REFERENCES arribos(id) ON DELETE CASCADE
    )
  `);

  // Índices para búsquedas rápidas
  await run(`CREATE INDEX IF NOT EXISTS idx_arribos_cliente ON arribos(cliente)`);
  await run(`CREATE INDEX IF NOT EXISTS idx_arribos_guia ON arribos(guia_bol)`);
  await run(`CREATE INDEX IF NOT EXISTS idx_detalles_arribo ON arribo_detalles(arribo_id)`);

  // Semilla de prueba si la base de datos está vacía
  const countRow = await get(`SELECT COUNT(*) as total FROM arribos`);
  if (countRow.total === 0) {
    console.log('Inicializando datos de prueba en la base de datos...');
    
    // Arribo 1
    const res1 = await run(`
      INSERT INTO arribos (folio, fecha_arribo, cliente, email_cliente, transportista, guia_bol, bultos, peso_libras, descripcion_general, estado)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      'ENT-2026-0001',
      '2026-10-21 10:30',
      'Manufacturas Industriales del Norte S.A.',
      'logistica@manufacturasnorte.com',
      'Transportes Castores S.A. de C.V.',
      'CAS-98421033',
      4,
      1250.50,
      'Tarimas con componentes electrónicos, motores y tableros de control.',
      'Recibido'
    ]);

    await run(`
      INSERT INTO arribo_detalles (arribo_id, numero_parte, modelo, descripcion, cantidad, unidad_medida, numero_serie)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [res1.lastID, 'MOT-8840', 'V8-400W', 'Motor eléctrico trifásico 400W', 12, 'PZA', 'SN-MOT-2026-01']);

    await run(`
      INSERT INTO arribo_detalles (arribo_id, numero_parte, modelo, descripcion, cantidad, unidad_medida, numero_serie)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [res1.lastID, 'TAB-CTRL-22', 'SmartPanel X', 'Tablero de control automatizado con pantalla táctil', 4, 'PZA', 'SN-TAB-9901']);

    await run(`
      INSERT INTO arribo_detalles (arribo_id, numero_parte, modelo, descripcion, cantidad, unidad_medida, numero_serie)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [res1.lastID, 'CAB-AWG-12', 'HeavyDuty', 'Carrete de cable industrial reforzado calibre 12', 8, 'CARRETE', '']);

    // Arribo 2
    const res2 = await run(`
      INSERT INTO arribo_detalles (arribo_id, numero_parte, modelo, descripcion, cantidad, unidad_medida, numero_serie)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      (await run(`
        INSERT INTO arribos (folio, fecha_arribo, cliente, email_cliente, transportista, guia_bol, bultos, peso_libras, descripcion_general, estado)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        'ENT-2026-0002',
        '2026-10-21 13:15',
        'Distribuidora Automotriz Global',
        'compras@autoglobal.com',
        'DHL Freight Express',
        'DHL-771290384',
        2,
        480.00,
        'Cajas con sensores de oxígeno y filtros de aire de alto flujo.',
        'Inspeccionado'
      ])).lastID,
      'SNS-O2-09',
      'BOSCH-OX9',
      'Sensores de oxígeno automotrices universales',
      50,
      'PZA',
      ''
    ]);

    console.log('Datos iniciales listos.');
  }
}

// Generador de siguiente folio
async function getNextFolio() {
  const currentYear = new Date().getFullYear();
  const prefix = `ENT-${currentYear}-`;
  
  const lastRow = await get(`
    SELECT folio FROM arribos 
    WHERE folio LIKE '${prefix}%' 
    ORDER BY id DESC LIMIT 1
  `);

  if (!lastRow) {
    return `${prefix}0001`;
  }

  const parts = lastRow.folio.split('-');
  const seq = parseInt(parts[2], 10) || 0;
  const nextSeq = String(seq + 1).padStart(4, '0');
  return `${prefix}${nextSeq}`;
}

module.exports = {
  db,
  run,
  get,
  all,
  initDB,
  getNextFolio
};
