(function () {
  const form = document.getElementById('posterInquiryForm');
  const printSelect = document.getElementById('posterInquiryPrint');
  if (!form || !printSelect) return;

  const posters = window.POSTERS || [];
  posters.forEach((p) => {
    const opt = document.createElement('option');
    opt.value = p.id;
    opt.textContent = p.title;
    printSelect.appendChild(opt);
  });

  const generalOpt = document.createElement('option');
  generalOpt.value = 'general';
  generalOpt.textContent = 'General question / not sure yet';
  printSelect.appendChild(generalOpt);

  const params = new URLSearchParams(window.location.search);
  const preselect = params.get('poster');
  if (preselect) {
    for (let i = 0; i < printSelect.options.length; i++) {
      if (printSelect.options[i].value === preselect) {
        printSelect.value = preselect;
        break;
      }
    }
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!window.beezzRequirePrivacyConsent?.(form)) return;
    window.beezzClearFormFeedback?.(form);

    if (!window.beezzSubmitLead) {
      window.beezzShowFormFeedback?.(
        form,
        'error',
        'Form is not configured. Please try again later.'
      );
      return;
    }

    const printId = printSelect.value;
    const poster = window.getPosterById?.(printId);
    const printLabel = poster
      ? poster.title
      : printId === 'general'
        ? 'General / not selected'
        : printId;

    const name = document.getElementById('posterInquiryName')?.value.trim();
    const email = document.getElementById('posterInquiryEmail')?.value.trim();
    const phone = document.getElementById('posterInquiryPhone')?.value.trim();
    const shipping = document.getElementById('posterInquiryShipping')?.value.trim();
    const notes = document.getElementById('posterInquiryNotes')?.value.trim();

    const idea = [
      '--- Print inquiry ---',
      `Print: ${printLabel}`,
      poster?.cardSubtitle ? `Edition: ${poster.cardSubtitle}` : '',
      `Shipping: ${shipping}`,
      notes ? `\nNotes:\n${notes}` : '',
      poster
        ? `\nPrint page: ${new URL(`poster.html?poster=${encodeURIComponent(poster.id)}`, window.location.href).href}`
        : '',
    ]
      .filter(Boolean)
      .join('\n');

    window.beezzStartFormSubmit?.(form);

    try {
      await window.beezzSubmitLead({
        name,
        email,
        phone,
        idea,
        source: 'poster-inquiry',
        files: [],
      });

      form.reset();
      if (preselect && poster) printSelect.value = preselect;

      window.beezzShowFormFeedback?.(
        form,
        'success',
        'Thank you! Your print inquiry was sent. I\u2019ll get back to you by email soon.'
      );
    } catch (err) {
      window.beezzShowFormFeedback?.(
        form,
        'error',
        err.message || 'Something went wrong. Please try again.'
      );
    }
  });
})();
