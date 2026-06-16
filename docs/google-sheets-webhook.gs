/**
 * GUMÜÇ ROYAL — Google Apps Script
 *
 * 1. Créez un Google Sheet avec ces en-têtes en ligne 1 (A→L) :
 *    date | order_id | country | name | phone | city | product | sku | quantity | total_price | currency | status
 * 2. Extensions → Apps Script → collez ce code
 * 3. Paramètres du projet → Propriétés du script → ajoutez :
 *    WEBHOOK_SECRET = <même valeur que GOOGLE_SHEETS_WEBHOOK_SECRET sur EasyPanel>
 * 4. Déployer → Nouvelle version → Application web → Exécuter en tant que : Moi → Accès : Toute personne
 * 5. Copiez l'URL de déploiement dans GOOGLE_SHEETS_WEBHOOK_URL (backend EasyPanel)
 */

var SHEET_SIGN_FIELDS = [
  "date", "order_id", "country", "name", "phone", "city",
  "product", "sku", "quantity", "total_price", "currency"
];

var WEBHOOK_MAX_AGE_SECONDS = 300;

function hmacSha256Hex(message, secret) {
  var sig = Utilities.computeHmacSha256Signature(message, secret);
  return sig.map(function (b) {
    var v = b < 0 ? b + 256 : b;
    return ("0" + v.toString(16)).slice(-2);
  }).join("");
}

function verifyWebhookSignature(data) {
  var secret = PropertiesService.getScriptProperties().getProperty("WEBHOOK_SECRET");
  if (!secret) {
    throw new Error("WEBHOOK_SECRET not configured — reject all requests");
  }

  var ts = data.webhook_timestamp;
  var sig = data.webhook_signature;
  if (!ts || !sig) {
    return false;
  }

  var now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - Number(ts)) > WEBHOOK_MAX_AGE_SECONDS) {
    return false;
  }

  var parts = [String(ts)];
  for (var i = 0; i < SHEET_SIGN_FIELDS.length; i++) {
    parts.push(String(data[SHEET_SIGN_FIELDS[i]] || ""));
  }
  var message = parts.join("|");
  var expected = hmacSha256Hex(message, secret);
  return expected === sig;
}

function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = JSON.parse(e.postData.contents);

    if (!verifyWebhookSignature(data)) {
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
      data.city || "",
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
