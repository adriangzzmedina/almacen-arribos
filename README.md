# 📦 AlmacénPro - Sistema de Control de Entradas & Arribos al Almacén

Aplicación web integral para la recepción y control logístico de mercancía en almacenes. Permite registrar entradas de transporte con datos generales de arribo, generar boletas oficiales en formato PDF con control de firmas, enviar comprobantes por correo electrónico y desglosar las partidas detalladas recibidas (relación 1 a N).

---

## 🚀 Inicio Rápido

El servidor ya está listo para ejecutarse en tu equipo.

### Iniciar la Aplicación
Abre una terminal PowerShell o CMD en esta carpeta y ejecuta:
```bash
npm start
```
Luego abre tu navegador en:
👉 **[http://localhost:4000](http://localhost:4000)**

---

## 📋 Funcionalidades Principales

### 1. Registro de Entrada / Arribo al Almacén
- **Fecha y hora de arribo** (con fecha predeterminada actual).
- **Línea transportista** (con sugerencias automáticas de fleteras comunes).
- **Cantidad de bultos** (pallets, cajas, tambores).
- **Peso total en Libras (lbs)** con cálculo automático informativo a Kilogramos (kg).
- **Cliente propietario** y correo de contacto.
- **Número de guía o Bill of Lading (BOL)**.
- **Descripción general** de la carga.
- Generación automática de **Folio correlativo** (ej. `ENT-2026-0001`, `ENT-2026-0002`).

### 2. Base de Datos Relacional (SQLite)
- Archivo local persistente: `almacen.db`.
- **Tabla `arribos`**: Datos de cabecera del transporte y recepción.
- **Tabla `arribo_detalles`**: Relación 1 a N con clave foránea (`arribo_id`) y borrado en cascada.

### 3. Emisión de Boleta de Entrada (PDF)
- Generación instantánea en alta resolución con formato corporativo.
- Muestra folio, fecha, datos del transporte, guía BOL, bultos y peso.
- Incluye la **tabla detallada de números de parte** recibidos si ya fueron capturados.
- Espacio reglamentario para firmas: *Recibido por Almacén* y *Entregado por Transportista*.
- Apertura directa en el navegador o descarga con un solo clic.

### 4. Envío de Comprobante por Correo Electrónico
- Modal de envío al correo del cliente.
- Asunto y cuerpo formal preconfigurados con datos de la guía y folio.
- Simulación y confirmación de entrega en tiempo real.

### 5. Control de Mercancía al Detalle
Para cualquier entrada registrada:
- Captura de **Número de parte / SKU**.
- **Modelo** y **Descripción**.
- **Cantidad recibida** y **Unidad de medida** (PZA, CAJA, TARIMA, CARRETE, KG, LBS, etc.).
- **Número de serie** (opcional).
- Resumen automático de total de unidades vs bultos declarados.

---

## 📂 Estructura del Proyecto

```
almacen-arribos/
├── almacen.db            # Base de datos SQLite relacional
├── package.json          # Dependencias y scripts del proyecto
├── server/
│   ├── index.js          # API REST con Express y rutas
│   └── db.js             # Conexión SQLite, esquemas y sembrado inicial
└── client/
    ├── src/
    │   ├── App.jsx       # Interfaz principal y listado
    │   ├── components/   # Modales de Arribo, Detalle y Correo
    │   └── utils/
    │       └── pdfGenerator.js # Generador de Boletas PDF con jsPDF
    └── dist/             # Frontend listo para producción
```
