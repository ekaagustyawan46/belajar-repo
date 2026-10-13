
export default async function handler(req, res) {
  try {
    const spreadsheetId = process.env.SPREADSHEET_ID;
    const apiKey = process.env.GOOGLE_API_KEY;

    if (!spreadsheetId || !apiKey) {
      return res.status(500).json({
        error: "SPREADSHEET_ID atau GOOGLE_API_KEY belum diatur di Vercel."
      });
    }

    const range = "Sheet1!A1:Q1000";

    const url =
      `https://sheets.googleapis.com/v4/spreadsheets/` +
      `${spreadsheetId}/values/${encodeURIComponent(range)}` +
      `?key=${apiKey}`;

    const response = await fetch(url);
    const result = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: result.error?.message || "Gagal mengambil data spreadsheet."
      });
    }

    const data = result.values || [];

    const summaryTargets = [
      { prioritas: "Kontrak", sla: 6, target: 3 },
      { prioritas: "Normal", sla: 9, target: 4 },
      { prioritas: "Urgent", sla: 4, target: 2 },
      { prioritas: "Emergency", sla: 4, target: 2 }
    ];

    let monthlyData = [];

    let overall = {
      no: "13",
      bulan: "Overall",
      kontrakSesuai: 0,
      kontrakLebih: 0,
      kontrakTotal: 0,
      normalSesuai: 0,
      normalLebih: 0,
      normalTotal: 0,
      urgentSesuai: 0,
      urgentLebih: 0,
      urgentTotal: 0,
      emergencySesuai: 0,
      emergencyLebih: 0,
      emergencyTotal: 0,
      allSesuai: 0,
      allLebih: 0,
      allTotal: 0
    };

    for (let i = 6; i < data.length; i++) {
      const row = data[i];

      const noCol = String(row[0] ?? "").trim();
      const bulanCol = String(row[1] ?? "").trim();

      if (
        !bulanCol ||
        bulanCol.toLowerCase() === "2026/bulan" ||
        bulanCol.toLowerCase() === "bulan"
      ) {
        continue;
      }

      const item = {
        no: noCol,
        bulan: bulanCol,
        kontrakSesuai: Number(row[2]) || 0,
        kontrakLebih: Number(row[3]) || 0,
        kontrakTotal: Number(row[4]) || 0,
        normalSesuai: Number(row[5]) || 0,
        normalLebih: Number(row[6]) || 0,
        normalTotal: Number(row[7]) || 0,
        urgentSesuai: Number(row[8]) || 0,
        urgentLebih: Number(row[9]) || 0,
        urgentTotal: Number(row[10]) || 0,
        emergencySesuai: Number(row[11]) || 0,
        emergencyLebih: Number(row[12]) || 0,
        emergencyTotal: Number(row[13]) || 0,
        allSesuai: Number(row[14]) || 0,
        allLebih: Number(row[15]) || 0,
        allTotal: Number(row[16]) || 0
      };

      if (bulanCol.toLowerCase() === "overall" || noCol === "13") {
        overall = item;
      } else if (
        !isNaN(Number(noCol)) &&
        Number(noCol) >= 1 &&
        Number(noCol) <= 12
      ) {
        item.no = Number(noCol);
        monthlyData.push(item);
      }
    }

    return res.status(200).json({
      summaryTargets,
      monthlyData,
      overall
    });

  } catch (error) {
    console.error("Error API SLA:", error);

    return res.status(500).json({
      error: "Terjadi kesalahan saat memproses data SLA."
    });
  }
}
