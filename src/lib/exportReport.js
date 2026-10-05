import XLSX from "xlsx-js-style";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/**
 * Excel (.xlsx) eksport qilish — xlsx-js-style yordamida (2-rasmdagi dizayn asosida)
 */
export const exportReportToExcel = (
  rows = [],
  columns = [],
  reportTitle = "Hisobot",
  periodText = "",
  filename = "hisobot"
) => {
  if (!rows || rows.length === 0) {
    alert("Yuklab olish uchun ma'lumot mavjud emas");
    return;
  }

  // 1. Prepare data matrix (Headers start on row 1 like reference)
  const matrix = [];

  // Table Headers
  const headerRow = columns.map((col) => col.label || col.key);
  matrix.push(headerRow);

  // Table Body
  rows.forEach((row, idx) => {
    const rowData = columns.map((col) => {
      if (col.key === "#" || col.key === "index") {
        return idx + 1;
      }
      if (col.formatter) {
        return col.formatter(row[col.key], row, idx) ?? "";
      }
      const val = row[col.key];
      if (val === null || val === undefined) return "";
      return typeof val === "object" ? val.name || val.full_name || val.title || "" : val;
    });
    matrix.push(rowData);
  });

  // 2. Create worksheet
  const ws = XLSX.utils.aoa_to_sheet(matrix);

  // 3. Dynamic column width calculation
  const colWidths = columns.map((col, cIdx) => {
    const headerLen = (col.label || col.key).length;
    let maxContentLen = headerLen;
    rows.forEach((row, rIdx) => {
      let cellVal = "";
      if (col.key === "#" || col.key === "index") cellVal = String(rIdx + 1);
      else if (col.formatter) cellVal = String(col.formatter(row[col.key], row, rIdx) ?? "");
      else cellVal = String(row[col.key] ?? "");
      if (cellVal.length > maxContentLen) {
        maxContentLen = cellVal.length;
      }
    });
    return { wch: Math.min(Math.max(maxContentLen + 4, 10), 45) };
  });
  ws["!cols"] = colWidths;

  // 4. Set row heights
  const rowHeights = [{ hpt: 26 }]; // Header row height
  for (let i = 0; i < rows.length; i++) {
    rowHeights.push({ hpt: 20 }); // Body row height
  }
  ws["!rows"] = rowHeights;

  // 5. Enable gridlines view
  ws["!views"] = [{ showGridLines: true }];

  // 6. Style worksheet cells (matching 2-rasm: royal blue header with thin borders)
  const range = XLSX.utils.decode_range(ws["!ref"]);
  const headerBgColor = "5B76DF"; // Reference blue #5B76DF / #5874D6
  const borderColor = "D1D5DB";

  for (let R = 0; R <= range.e.r; ++R) {
    const isHeader = R === 0;

    for (let C = 0; C <= range.e.c; ++C) {
      const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
      if (!ws[cellAddress]) continue;

      const colAlign = columns[C]?.align || (C === 0 ? "center" : "left");
      const hAlign = colAlign === "right" ? "right" : colAlign === "center" ? "center" : "left";

      if (isHeader) {
        ws[cellAddress].s = {
          fill: { fgColor: { rgb: headerBgColor } },
          font: { name: "Calibri", sz: 11, bold: true, color: { rgb: "FFFFFF" } },
          alignment: { horizontal: "center", vertical: "center", wrapText: false },
          border: {
            top: { style: "thin", color: { rgb: "4A65CC" } },
            bottom: { style: "thin", color: { rgb: "4A65CC" } },
            left: { style: "thin", color: { rgb: "728AE8" } },
            right: { style: "thin", color: { rgb: "728AE8" } },
          },
        };
      } else {
        ws[cellAddress].s = {
          fill: { fgColor: { rgb: "FFFFFF" } },
          font: { name: "Calibri", sz: 10, color: { rgb: "111827" } },
          alignment: {
            horizontal: hAlign,
            vertical: "center",
          },
          border: {
            top: { style: "thin", color: { rgb: borderColor } },
            bottom: { style: "thin", color: { rgb: borderColor } },
            left: { style: "thin", color: { rgb: borderColor } },
            right: { style: "thin", color: { rgb: borderColor } },
          },
        };
      }
    }
  }

  // 7. Create workbook and write
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
  XLSX.writeFile(wb, `${filename}_${new Date().toISOString().slice(0, 10)}.xlsx`);
};

/**
 * PDF (.pdf) eksport qilish — jsPDF va autoTable yordamida
 */
export const exportReportToPDF = (
  rows = [],
  columns = [],
  reportTitle = "Hisobot",
  periodText = "",
  filename = "hisobot"
) => {
  if (!rows || rows.length === 0) {
    alert("Yuklab olish uchun ma'lumot mavjud emas");
    return;
  }

  const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });

  // Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.setTextColor(26, 29, 46);
  doc.text(reportTitle, 40, 36);

  // Period subtitle
  if (periodText) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(94, 100, 128);
    doc.text(periodText, 40, 52);
  }

  // Table columns & rows
  const headers = [columns.map((col) => col.label || col.key)];
  const body = rows.map((row, idx) => {
    return columns.map((col) => {
      if (col.key === "#" || col.key === "index") {
        return idx + 1;
      }
      if (col.formatter) {
        return col.formatter(row[col.key], row, idx) ?? "";
      }
      const val = row[col.key];
      if (val === null || val === undefined) return "";
      return typeof val === "object" ? val.name || val.full_name || val.title || "" : val;
    });
  });

  const columnStyles = {};
  columns.forEach((col, idx) => {
    if (col.align) {
      columnStyles[idx] = { halign: col.align };
    }
  });

  autoTable(doc, {
    head: headers,
    body: body,
    startY: periodText ? 65 : 48,
    margin: { left: 40, right: 40 },
    theme: "grid",
    columnStyles,
    headStyles: {
      fillColor: [91, 118, 223], // #5B76DF
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 9,
      halign: "center",
      cellPadding: 6,
    },
    bodyStyles: {
      textColor: [26, 29, 46],
      fontSize: 8.5,
      cellPadding: 5.5,
    },
    alternateRowStyles: {
      fillColor: [249, 250, 253],
    },
    styles: {
      lineColor: [209, 213, 219],
      lineWidth: 0.5,
      overflow: "linebreak",
      valign: "middle",
    },
    didDrawPage: (data) => {
      const pageCount = doc.internal.getNumberOfPages();
      doc.setFontSize(8);
      doc.setTextColor(139, 144, 165);
      doc.text(
        `Sahifa ${data.pageNumber} / ${pageCount}`,
        doc.internal.pageSize.width - 90,
        doc.internal.pageSize.height - 20
      );
    },
  });

  doc.save(`${filename}_${new Date().toISOString().slice(0, 10)}.pdf`);
};

/**
 * CSV (.csv) eksport qilish
 */
export const exportReportToCSV = (
  rows = [],
  columns = [],
  reportTitle = "Hisobot",
  periodText = "",
  filename = "hisobot"
) => {
  if (!rows || rows.length === 0) {
    alert("Yuklab olish uchun ma'lumot mavjud emas");
    return;
  }

  const headerLine = columns.map((col) => `"${(col.label || col.key).replace(/"/g, '""')}"`).join(",");
  const csvRows = rows.map((row, idx) => {
    return columns
      .map((col) => {
        let val;
        if (col.key === "#" || col.key === "index") {
          val = idx + 1;
        } else if (col.formatter) {
          val = col.formatter(row[col.key], row, idx);
        } else {
          val = row[col.key];
        }
        if (val === null || val === undefined) val = "";
        if (typeof val === "object") val = val.name || val.full_name || val.title || "";
        const str = String(val).replace(/"/g, '""');
        return `"${str}"`;
      })
      .join(",");
  });

  const lines = [];
  lines.push(headerLine);
  lines.push(...csvRows);

  const csvContent = "\uFEFF" + lines.join("\r\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
