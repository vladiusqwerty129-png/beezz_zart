/**
 * Paste this entire file into Apps Script (Extensions → Apps Script)
 * on your Beezz_zart Leads spreadsheet.
 *
 * Set NOTIFY_EMAIL to the inbox that should get alerts.
 * After editing: Deploy → Manage deployments → Edit → New version → Deploy.
 */

var UPLOAD_FOLDER_NAME = 'Beezz_zart Form Uploads';
var NOTIFY_EMAIL = 'beezzzart22808@gmail.com';

function doPost(e) {
  try {
    var payload = JSON.parse(e.postData.contents || '{}');
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
    var folder = getUploadFolder_();

    var name = String(payload.name || '').trim();
    var email = String(payload.email || '').trim();
    var phone = String(payload.phone || '').trim();
    var idea = String(payload.idea || '').trim();
    var source = String(payload.source || 'website').trim();
    var files = payload.files || [];
    if (!Array.isArray(files)) {
      files = [];
    }

    var fileLinks = [];
    for (var i = 0; i < files.length; i++) {
      var f = files[i];
      if (!f || !f.data || !f.name) continue;
      var dataStr = String(f.data);
      var base64 = dataStr.indexOf(',') >= 0 ? dataStr.split(',')[1] : dataStr;
      var blob = Utilities.newBlob(
        Utilities.base64Decode(base64),
        f.mimeType || 'application/octet-stream',
        f.name
      );
      var saved = folder.createFile(blob);
      fileLinks.push(saved.getUrl());
    }

    sheet.appendRow([
      new Date(),
      name,
      email,
      phone,
      idea,
      fileLinks.join('\n'),
      source,
    ]);

    sendLeadNotification_(name, email, phone, idea, source, fileLinks);

    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  }
}

function sendLeadNotification_(name, email, phone, idea, source, fileLinks) {
  if (!NOTIFY_EMAIL || NOTIFY_EMAIL.indexOf('@') < 0) return;

  var sheetUrl = SpreadsheetApp.getActiveSpreadsheet().getUrl();
  var subject = 'New lead — beezz-zart.ca — ' + (name || 'No name');
  var body = [
    'Someone submitted a form on beezz-zart.ca',
    '',
    'Name: ' + name,
    'Email: ' + email,
    'Phone: ' + phone,
    'Source: ' + source,
    '',
    'Idea / details:',
    idea || '(empty)',
    '',
    fileLinks.length ? 'Uploaded files:\n' + fileLinks.join('\n') : 'Uploaded files: none',
    '',
    'Open spreadsheet: ' + sheetUrl,
  ].join('\n');

  try {
    MailApp.sendEmail({
      to: NOTIFY_EMAIL,
      subject: subject,
      body: body,
    });
  } catch (mailErr) {
    Logger.log('Email notification failed: ' + mailErr);
    // Do not fail the form — row is already in the sheet.
  }
}

function getUploadFolder_() {
  var folders = DriveApp.getFoldersByName(UPLOAD_FOLDER_NAME);
  if (folders.hasNext()) return folders.next();
  return DriveApp.createFolder(UPLOAD_FOLDER_NAME);
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}
