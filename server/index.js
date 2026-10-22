const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { initDB, run, get, all, getNextFolio } = require('./db');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Iniciar base de datos
initDB().catch(err => {
  console.error('Error al inicializar la base de datos:', err);
});

// --- API ENDPOINTS ---

// 1. Estadísticas rápidas para el dashboard
app.get('/api/estadisticas', async (req, res) => {
  try {
    const statsArribos = await get(`
      SELECT 
        COUNT(*) as total_arribos,
        COALESCE(SUM(bultos), 0) as total_bultos,
        COALESCE(SUM(peso_libras), 0) as total_peso_libras
      FROM arribos
    `);

    const hoy = new Date().toISOString().slice(0, 10);
    const statsHoy = await get(`
      SELECT COUNT(*) as arribos_hoy
      FROM arribos
      WHERE fecha_arribo LIKE ?
    `, [`${hoy}%`]);

    const statsDetalles = await get(`
      SELECT 
        COUNT(*) as total_partidas,
        COALESCE(SUM(cantidad), 0) as total_piezas
      FROM arribo_detalles
    `);

    res.json({
      total_arribos: statsArribos.total_arribos,
      total_bultos: statsArribos.total_bultos,
      total_peso_libras: statsArribos.total_peso_libras,
      total_peso_kg: (statsArribos.total_peso_libras * 0.45359237).toFixed(2),
      arribos_hoy: statsHoy.arribos_hoy,
      total_partidas: statsDetalles.total_partidas,
      total_piezas: statsDetalles.total_piezas
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. Obtener lista de arribos (con filtros de búsqueda opcionales)
app.get('/api/arribos', async (req, res) => {
  try {
    const { q, estado } = req.query;
    let query = `
      SELECT 
        a.*,
        COUNT(d.id) as cantidad_partidas,
        COALESCE(SUM(d.cantidad), 0) as total_unidades_detalle
      FROM arribos a
      LEFT JOIN arribo_detalles d ON a.id = d.arribo_id
      WHERE 1=1
    `;
    const params = [];

    if (q) {
      query += ` AND (a.folio LIKE ? OR a.cliente LIKE ? OR a.guia_bol LIKE ? OR a.transportista LIKE ?)`;
      const term = `%${q}%`;
      params.push(term, term, term, term);
    }

    if (estado && estado !== 'Todos') {
      query += ` AND a.estado = ?`;
      params.push(estado);
    }

    query += ` GROUP BY a.id ORDER BY a.id DESC`;

    const arribos = await all(query, params);
    res.json(arribos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3. Obtener un arribo con su lista de detalles
app.get('/api/arribos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const arribo = await get(`SELECT * FROM arribos WHERE id = ?`, [id]);

    if (!arribo) {
      return res.status(404).json({ error: 'Arribo no encontrado' });
    }

    const detalles = await all(
      `SELECT * FROM arribo_detalles WHERE arribo_id = ? ORDER BY id ASC`,
      [id]
    );

    res.json({ ...arribo, detalles });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 4. Registrar nuevo arribo
app.post('/api/arribos', async (req, res) => {
  try {
    const {
      fecha_arribo,
      cliente,
      email_cliente,
      transportista,
      guia_bol,
      bultos,
      peso_libras,
      descripcion_general,
      estado
    } = req.body;

    if (!cliente || !transportista || !guia_bol) {
      return res.status(400).json({ error: 'Cliente, transportista y número de guía son obligatorios' });
    }

    const folio = await getNextFolio();
    const fecha = fecha_arribo || new Date().toISOString().replace('T', ' ').slice(0, 16);

    const result = await run(`
      INSERT INTO arribos (folio, fecha_arribo, cliente, email_cliente, transportista, guia_bol, bultos, peso_libras, descripcion_general, estado)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      folio,
      fecha,
      cliente.trim(),
      (email_cliente || '').trim(),
      transportista.trim(),
      guia_bol.trim(),
      parseInt(bultos, 10) || 1,
      parseFloat(peso_libras) || 0,
      (descripcion_general || '').trim(),
      estado || 'Recibido'
    ]);

    const nuevoArribo = await get(`SELECT * FROM arribos WHERE id = ?`, [result.lastID]);
    res.status(201).json({ ...nuevoArribo, detalles: [] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 5. Actualizar un arribo
app.put('/api/arribos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      fecha_arribo,
      cliente,
      email_cliente,
      transportista,
      guia_bol,
      bultos,
      peso_libras,
      descripcion_general,
      estado
    } = req.body;

    await run(`
      UPDATE arribos SET
        fecha_arribo = COALESCE(?, fecha_arribo),
        cliente = COALESCE(?, cliente),
        email_cliente = COALESCE(?, email_cliente),
        transportista = COALESCE(?, transportista),
        guia_bol = COALESCE(?, guia_bol),
        bultos = COALESCE(?, bultos),
        peso_libras = COALESCE(?, peso_libras),
        descripcion_general = COALESCE(?, descripcion_general),
        estado = COALESCE(?, estado)
      WHERE id = ?
    `, [
      fecha_arribo,
      cliente,
      email_cliente,
      transportista,
      guia_bol,
      bultos !== undefined ? parseInt(bultos, 10) : undefined,
      peso_libras !== undefined ? parseFloat(peso_libras) : undefined,
      descripcion_general,
      estado,
      id
    ]);

    const actualizado = await get(`SELECT * FROM arribos WHERE id = ?`, [id]);
    res.json(actualizado);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 6. Eliminar un arribo (y sus detalles en cascada)
app.delete('/api/arribos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await run(`DELETE FROM arribos WHERE id = ?`, [id]);
    res.json({ message: 'Arribo eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 7. Listar partidas de detalle de un arribo
app.get('/api/arribos/:id/detalles', async (req, res) => {
  try {
    const { id } = req.params;
    const detalles = await all(
      `SELECT * FROM arribo_detalles WHERE arribo_id = ? ORDER BY id ASC`,
      [id]
    );
    res.json(detalles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 8. Agregar partida de detalle a un arribo
app.post('/api/arribos/:id/detalles', async (req, res) => {
  try {
    const { id } = req.params;
    const { numero_parte, modelo, descripcion, cantidad, unidad_medida, numero_serie, notas } = req.body;

    if (!numero_parte || !descripcion || cantidad === undefined) {
      return res.status(400).json({ error: 'Número de parte, descripción y cantidad son requeridos' });
    }

    const result = await run(`
      INSERT INTO arribo_detalles (arribo_id, numero_parte, modelo, descripcion, cantidad, unidad_medida, numero_serie, notas)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      id,
      numero_parte.trim(),
      (modelo || '').trim(),
      descripcion.trim(),
      parseFloat(cantidad) || 0,
      (unidad_medida || 'PZA').trim().toUpperCase(),
      (numero_serie || '').trim(),
      (notas || '').trim()
    ]);

    const item = await get(`SELECT * FROM arribo_detalles WHERE id = ?`, [result.lastID]);
    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 9. Actualizar partida de detalle
app.put('/api/detalles/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { numero_parte, modelo, descripcion, cantidad, unidad_medida, numero_serie, notas } = req.body;

    await run(`
      UPDATE arribo_detalles SET
        numero_parte = COALESCE(?, numero_parte),
        modelo = COALESCE(?, modelo),
        descripcion = COALESCE(?, descripcion),
        cantidad = COALESCE(?, cantidad),
        unidad_medida = COALESCE(?, unidad_medida),
        numero_serie = COALESCE(?, numero_serie),
        notas = COALESCE(?, notas)
      WHERE id = ?
    `, [
      numero_parte,
      modelo,
      descripcion,
      cantidad !== undefined ? parseFloat(cantidad) : undefined,
      unidad_medida ? unidad_medida.toUpperCase() : undefined,
      numero_serie,
      notas,
      id
    ]);

    const item = await get(`SELECT * FROM arribo_detalles WHERE id = ?`, [id]);
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 10. Eliminar partida de detalle
app.delete('/api/detalles/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await run(`DELETE FROM arribo_detalles WHERE id = ?`, [id]);
    res.json({ message: 'Partida eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 11. Simulación / Envío de correo electrónico con la boleta
app.post('/api/arribos/:id/enviar-correo', async (req, res) => {
  try {
    const { id } = req.params;
    const { destinatario, notasAdicionales } = req.body;

    const arribo = await get(`SELECT * FROM arribos WHERE id = ?`, [id]);
    if (!arribo) {
      return res.status(404).json({ error: 'Arribo no encontrado' });
    }

    const emailDestino = destinatario || arribo.email_cliente;
    if (!emailDestino) {
      return res.status(400).json({ error: 'No se especificó correo electrónico destinatario' });
    }

    const detalles = await all(`SELECT * FROM arribo_detalles WHERE arribo_id = ?`, [id]);

    // Registro de envío simulado
    const envioInfo = {
      folio: arribo.folio,
      destinatario: emailDestino,
      asunto: `Comprobante de Entrada al Almacén - Folio ${arribo.folio} (${arribo.guia_bol})`,
      fechaEnvio: new Date().toLocaleString(),
      cliente: arribo.cliente,
      transportista: arribo.transportista,
      guia: arribo.guia_bol,
      bultos: arribo.bultos,
      peso_libras: arribo.peso_libras,
      total_partidas: detalles.length,
      notasAdicionales: notasAdicionales || 'Mercancía recibida en almacén y registrada satisfactoriamente.'
    };

    console.log(`[CORREO ENVIADO A ${emailDestino}]:`, envioInfo);

    res.json({
      success: true,
      mensaje: `Boleta ${arribo.folio} enviada exitosamente a ${emailDestino}`,
      detallesEnvio: envioInfo
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Servir frontend compilado en producción si existe
const distPath = path.resolve(__dirname, '..', 'client', 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.use((req, res, next) => {
    // Si la ruta no empieza con /api, servir index.html
    if (!req.path.startsWith('/api')) {
      return res.sendFile(path.join(distPath, 'index.html'));
    }
    next();
  });
}

app.listen(PORT, () => {
  console.log(`Servidor de Almacén ejecutándose en http://localhost:${PORT}`);
});
