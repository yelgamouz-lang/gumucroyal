/**
 * GUMÜÇ ROYAL — Google Apps Script
 *
 * 1. Créez un Google Sheet avec ces en-têtes en ligne 1 (A→K) :
 *    date | order_id | country | name | phone | product | sku | quantity | total_price | currency | status
 * 2. Extensions → Apps Script → collez ce code
 * 3. Paramètres du projet → Propriétés du script → ajoutez :
 *    WEBHOOK_SECRET = <même valeur que GOOGLE_SHEETS_WEBHOOK_SECRET sur EasyPanel>
 * 4. Déployer → Nouvelle version → Application web → Exécuter en tant que : Moi → Accès : Toute personne
 * 5. Copiez l'URL de déploiement dans GOOGLE_SHEETS_WEBHOOK_URL (backend EasyPanel)
 */

function verifyWebhookSecret(data) {
  var expected = PropertiesService.getScriptProperties().getProperty("WEBHOOK_SECRET");
  if (!expected) {
    return true;
  }
  return data.webhook_secret && data.webhook_secret === expected;
}

function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = JSON.parse(e.postData.contents);

    if (!verifyWebhookSecret(data)) {
      return ContentService.createTextOutput(
        JSON.stringify({ ok: false, error: "Unauthorized" })
      ).setMimeType(ContentService.MimeType.JSON);
    }

    sheet.appendRow([
      data.date || "",
      data.order_id || "",
      data.country || "Maroc",
      data.name || "",
      data.phone || "",
      data.product || "",
      data.sku || "",
      data.quantity || "",
      data.total_price || "",
      data.currency || "MAD",
      data.status || "",
    ]);

    return ContentService.createTextOutput(
      JSON.stringify({ ok: true })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(
      JSON.stringify({ ok: false, error: String(err) })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet() {
  return ContentService.createTextOutput("GUMÜÇ ROYAL webhook OK");
}
