window.BEEZZ_FORM_ENDPOINT =
  'https://script.google.com/macros/s/AKfycbwmGyteWiHULVFNk4-tzZP3oKdz5LMf0_D1iiy705hn_dKMWhw0GaNfRA0OlztPVFvDSQ/exec';

window.beezzReadFileAsBase64 = function (file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error || new Error('Could not read file'));
    reader.readAsDataURL(file);
  });
};

window.beezzFilesToPayload = async function (fileList, maxBytes) {
  const files = [];
  for (let i = 0; i < fileList.length; i++) {
    const file = fileList[i];
    if (maxBytes && file.size > maxBytes) {
      throw new Error(`Each image must be under 10 MB. "${file.name}" is too large.`);
    }
    const data = await window.beezzReadFileAsBase64(file);
    files.push({ name: file.name, mimeType: file.type || 'application/octet-stream', data });
  }
  return files;
};

window.beezzSubmitLead = async function (payload) {
  const res = await fetch(window.BEEZZ_FORM_ENDPOINT, {
    method: 'POST',
    mode: 'cors',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(payload),
  });
  let data = {};
  try {
    data = await res.json();
  } catch {
    throw new Error('Could not reach the form server. Please try again.');
  }
  if (!data.ok) {
    throw new Error(data.error || 'Submission failed');
  }
  if (window.beezzTrackLead) window.beezzTrackLead();
  else if (window.beezzTrackCustom) window.beezzTrackCustom('Lead');
  return data;
};
