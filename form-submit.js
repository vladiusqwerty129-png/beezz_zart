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

window.beezzClearFormFeedback = function (form) {
  if (!form) return;
  const errorEl = form.querySelector('.form__error');
  if (errorEl) {
    errorEl.hidden = true;
    errorEl.textContent = '';
  }
};

window.beezzShowFormFeedback = function (form, type, message) {
  if (!form) return;
  const successEl = form.querySelector('.form__success');
  const errorEl = form.querySelector('.form__error');

  if (type === 'success') {
    if (errorEl) {
      errorEl.hidden = true;
      errorEl.textContent = '';
    }
    if (successEl) {
      successEl.textContent = message;
      successEl.hidden = false;
    }
    form.classList.add('form--sent');
    form.querySelectorAll(':scope > *:not(.form__success)').forEach((child) => {
      child.hidden = true;
    });
    successEl?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    return;
  }

  form.classList.remove('form--sent');
  form.querySelectorAll(':scope > *').forEach((child) => {
    if (!child.classList.contains('form__success')) child.hidden = false;
  });
  if (successEl) {
    successEl.hidden = true;
    successEl.textContent = '';
  }
  if (errorEl) {
    errorEl.textContent = message;
    errorEl.hidden = false;
    errorEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
};

window.beezzSubmitLead = async function (payload) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: 'generate_lead',
    form_name: (payload && payload.source) ? payload.source : 'lead-form',
    lead_email: (payload && payload.email) ? payload.email : '',
    lead_phone: (payload && payload.phone) ? payload.phone : '',
  });
  if (window.beezzTrackLead) window.beezzTrackLead();
  else if (window.beezzTrackCustom) window.beezzTrackCustom('Lead');

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
  return data;
};
