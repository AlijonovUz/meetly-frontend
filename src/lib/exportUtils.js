/**
 * Export data array to CSV / Excel compatible file
 * @param {Array<Object>} rows - Data rows
 * @param {Array<{ key: string, label: string, formatter?: Function }>} columns - Column definitions
 * @param {string} filename - Filename without extension
 */
export const exportToCSV = (rows = [], columns = [], filename = "hisobot") => {
  if (!rows || rows.length === 0) {
    alert("Yuklab olish uchun ma'lumot mavjud emas");
    return;
  }

  const headers = columns.map((col) => `"${(col.label || col.key).replace(/"/g, '""')}"`).join(",");
  const csvRows = rows.map((row, index) => {
    return columns
      .map((col) => {
        let val;
        if (col.key === "#" || col.key === "index") {
          val = index + 1;
        } else if (col.formatter) {
          val = col.formatter(row[col.key], row, index);
        } else {
          val = row[col.key];
        }

        if (val === null || val === undefined) val = "";
        const strVal = String(val).replace(/"/g, '""');
        return `"${strVal}"`;
      })
      .join(",");
  });

  // UTF-8 BOM for Excel to properly display Uzbek / Cyrillic / Latin characters
  const csvContent = "\uFEFF" + [headers, ...csvRows].join("\r\n");
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
