export default async function handler(req, res) {
  try {
    const appsScriptUrl = process.env.APPS_SCRIPT_URL;

    if (!appsScriptUrl) {
      return res.status(500).json({
        error: "APPS_SCRIPT_URL belum diatur di Environment Variables Vercel."
      });
    }

    const response = await fetch(appsScriptUrl);
    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: "Gagal mengambil data dari Web App Google Apps Script."
      });
    }

    return res.status(200).json(data);

  } catch (error) {
    console.error("Error API SLA:", error);
    return res.status(500).json({
      error: "Terjadi kesalahan pada server."
    });
  }
}