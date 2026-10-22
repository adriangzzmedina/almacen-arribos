import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export function generarBoletaPDF(arribo, detalles = [], autoDownload = false) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pesoKg = (Number(arribo.peso_libras || 0) * 0.45359237).toFixed(2);

  // 1. Encabezado principal (Barra Azul Marino)
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('ALMACÉN CENTRAL - BOLETA DE ENTRADA', 14, 13);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(203, 213, 225); // slate-300
  doc.text('Control Logístico de Arribos y Recepción de Mercancía', 14, 20);

  // Folio en el encabezado
  doc.setFillColor(37, 99, 235); // blue-600
  doc.roundedRect(pageWidth - 65, 6, 52, 16, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(`FOLIO: ${arribo.folio}`, pageWidth - 39, 16, { align: 'center' });

  // 2. Cuadro de Metadatos del Arribo
  let currentY = 36;

  doc.setDrawColor(226, 232, 240); // slate-200
  doc.setFillColor(248, 250, 252); // slate-50
  doc.roundedRect(14, currentY, pageWidth - 28, 48, 2, 2, 'FD');

  doc.setFontSize(10);
  doc.setTextColor(30, 41, 59); // slate-800

  // Columna 1
  doc.setFont('helvetica', 'bold');
  doc.text('Fecha y Hora:', 18, currentY + 8);
  doc.setFont('helvetica', 'normal');
  doc.text(String(arribo.fecha_arribo || 'N/A'), 50, currentY + 8);

  doc.setFont('helvetica', 'bold');
  doc.text('Cliente:', 18, currentY + 16);
  doc.setFont('helvetica', 'normal');
  doc.text(String(arribo.cliente || 'N/A'), 50, currentY + 16);

  doc.setFont('helvetica', 'bold');
  doc.text('Correo Cliente:', 18, currentY + 24);
  doc.setFont('helvetica', 'normal');
  doc.text(String(arribo.email_cliente || 'No especificado'), 50, currentY + 24);

  doc.setFont('helvetica', 'bold');
  doc.text('Descripción:', 18, currentY + 32);
  doc.setFont('helvetica', 'normal');
  const descLines = doc.splitTextToSize(arribo.descripcion_general || 'Sin descripción general registrada.', pageWidth - 70);
  doc.text(descLines, 50, currentY + 32);

  // Columna 2 (Mitad derecha)
  const col2X = 118;
  doc.setFont('helvetica', 'bold');
  doc.text('Transportista:', col2X, currentY + 8);
  doc.setFont('helvetica', 'normal');
  doc.text(String(arribo.transportista || 'N/A'), col2X + 32, currentY + 8);

  doc.setFont('helvetica', 'bold');
  doc.text('No. Guía / BOL:', col2X, currentY + 16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(2, 132, 199); // sky-600
  doc.text(String(arribo.guia_bol || 'N/A'), col2X + 32, currentY + 16);
  doc.setTextColor(30, 41, 59);

  doc.setFont('helvetica', 'bold');
  doc.text('Bultos Recibidos:', col2X, currentY + 24);
  doc.setFont('helvetica', 'bold');
  doc.text(`${arribo.bultos} bulto(s)`, col2X + 32, currentY + 24);

  doc.setFont('helvetica', 'bold');
  doc.text('Peso Declarado:', col2X, currentY + 32);
  doc.setFont('helvetica', 'normal');
  doc.text(`${arribo.peso_libras} lbs (~${pesoKg} kg)`, col2X + 32, currentY + 32);

  doc.setFont('helvetica', 'bold');
  doc.text('Estado Arribo:', col2X, currentY + 40);
  doc.setFont('helvetica', 'normal');
  doc.text(String(arribo.estado || 'Recibido'), col2X + 32, currentY + 40);

  currentY += 56;

  // 3. Título de Sección: Detalle de Mercancía Recibida
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text('DETALLE DE MERCANCÍA RECIBIDA', 14, currentY);

  currentY += 4;

  // 4. Tabla de Partidas con AutoTable
  if (detalles && detalles.length > 0) {
    const tableData = detalles.map((item, index) => [
      index + 1,
      item.numero_parte || '-',
      item.modelo || '-',
      item.descripcion || '-',
      Number(item.cantidad).toLocaleString(),
      item.unidad_medida || 'PZA',
      item.numero_serie || 'N/A'
    ]);

    const totalPiezas = detalles.reduce((sum, d) => sum + Number(d.cantidad || 0), 0);

    autoTable(doc, {
      startY: currentY,
      head: [['#', 'No. Parte', 'Modelo', 'Descripción', 'Cant.', 'U.M.', 'No. Serie']],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: [30, 41, 59],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 9,
        halign: 'left'
      },
      columnStyles: {
        0: { cellWidth: 10, halign: 'center' },
        1: { cellWidth: 30, fontStyle: 'bold' },
        2: { cellWidth: 26 },
        3: { cellWidth: 'auto' },
        4: { cellWidth: 18, halign: 'right', fontStyle: 'bold' },
        5: { cellWidth: 16, halign: 'center' },
        6: { cellWidth: 32 }
      },
      bodyStyles: {
        fontSize: 8.5,
        textColor: [51, 65, 85]
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252]
      },
      foot: [
        ['', '', '', 'TOTAL UNIDADES REGISTRADAS:', totalPiezas.toLocaleString(), 'UNDS', '']
      ],
      footStyles: {
        fillColor: [241, 245, 249],
        textColor: [15, 23, 42],
        fontStyle: 'bold',
        fontSize: 9,
        halign: 'right'
      },
      margin: { left: 14, right: 14 }
    });

    currentY = doc.lastAutoTable.finalY + 12;
  } else {
    // Si aún no se captura el detalle fino
    doc.setDrawColor(203, 213, 225);
    doc.setFillColor(248, 250, 252);
    doc.rect(14, currentY, pageWidth - 28, 24, 'FD');
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text(
      'Entrada preliminar registrada por bultos/peso. El desglose fino de números de parte está pendiente de captura.',
      pageWidth / 2,
      currentY + 13,
      { align: 'center' }
    );
    currentY += 34;
  }

  // 5. Verificación de espacio para firmas (si queda poco espacio, añadir página)
  if (currentY > 230) {
    doc.addPage();
    currentY = 25;
  }

  // Cuadro de Firmas
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('CONFORMIDAD Y CONTROL DE FIRMAS', 14, currentY);

  currentY += 8;

  const boxWidth = (pageWidth - 36) / 2;

  // Firma Almacén
  doc.setDrawColor(203, 213, 225);
  doc.rect(14, currentY, boxWidth, 32);
  doc.line(20, currentY + 22, 14 + boxWidth - 6, currentY + 22);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Recibido e Inspeccionado por (Almacén)', 14 + boxWidth / 2, currentY + 27, { align: 'center' });

  // Firma Transportista
  doc.rect(14 + boxWidth + 8, currentY, boxWidth, 32);
  doc.line(14 + boxWidth + 14, currentY + 22, pageWidth - 20, currentY + 22);
  doc.text('Entregado por (Operador / Transportista)', 14 + boxWidth + 8 + boxWidth / 2, currentY + 27, { align: 'center' });

  // 6. Pie de página
  const pageHeight = doc.internal.pageSize.getHeight();
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text(
    `Boleta generada automáticamente por Sistema de Control de Almacén • Folio: ${arribo.folio} • ${new Date().toLocaleString()}`,
    pageWidth / 2,
    pageHeight - 8,
    { align: 'center' }
  );

  // Acción: Descargar o Abrir en pestaña
  if (autoDownload) {
    doc.save(`Boleta_${arribo.folio}.pdf`);
  } else {
    // Abrir en nueva ventana / visor
    const pdfBlob = doc.output('blob');
    const blobUrl = URL.createObjectURL(pdfBlob);
    window.open(blobUrl, '_blank');
  }

  return doc;
}
