window.beezzRequirePrivacyConsent = function (form) {
  const box = form?.querySelector('.form__consent-input');
  if (!box) return true;
  if (!box.checked) {
    alert('Please agree to the privacy policy to continue.');
    box.focus();
    return false;
  }
  return true;
};

document.addEventListener('DOMContentLoaded', () => {

  const nav = document.getElementById('nav');
  const onScroll = () => nav.classList.toggle('nav--scrolled', window.scrollY > 40);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const burger = document.getElementById('navBurger');
  const navLinks = document.getElementById('navLinks');
  if (burger && navLinks) {
    burger.setAttribute('aria-expanded', 'false');
    burger.addEventListener('click', () => {
      const open = navLinks.classList.toggle('nav__links--open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      document.body.style.overflow = open ? 'hidden' : '';
    });
    navLinks.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('nav__links--open');
        burger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
  }

  document.querySelectorAll('.services__tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.services__tab').forEach((t) => {
        t.classList.remove('services__tab--active');
        t.setAttribute('aria-selected', 'false');
      });
      document.querySelectorAll('.services__panel').forEach((p) => {
        p.classList.remove('services__panel--active');
      });
      tab.classList.add('services__tab--active');
      tab.setAttribute('aria-selected', 'true');
      const target = document.getElementById('tab-' + tab.dataset.tab);
      if (target) target.classList.add('services__panel--active');
    });
  });

  document.querySelectorAll('.faq__item').forEach(item => {
    const btn = item.querySelector('.faq__question');
    const answer = item.querySelector('.faq__answer');
    btn.addEventListener('click', () => {
      const isOpen = btn.getAttribute('aria-expanded') === 'true';
      document.querySelectorAll('.faq__item').forEach(i => {
        i.querySelector('.faq__question').setAttribute('aria-expanded', 'false');
        i.querySelector('.faq__answer').classList.remove('faq__answer--open');
      });
      if (!isOpen) {
        btn.setAttribute('aria-expanded', 'true');
        answer.classList.add('faq__answer--open');
      }
    });
  });

  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - 80, behavior: 'smooth' });
      }
    });
  });

  const fadeEls = document.querySelectorAll(
    '.section-label, .section-title, .section-subtitle, .projects__item, ' +
    '.flashes__item, .services__panel-inner, .faq__item, .benefits__item, ' +
    '.testimonials__card, .featured-testimonial__content'
  );
  const fadeTargets = [...fadeEls].filter((el) => !el.closest('#flashesGalleryView'));
  const style = document.createElement('style');
  style.textContent = '.is-visible { opacity: 1 !important; transform: none !important; }';
  document.head.appendChild(style);
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('is-visible'); io.unobserve(entry.target); }
    });
  }, { threshold: 0.1 });
  fadeTargets.forEach((el, i) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = `opacity 0.55s ease ${(i % 5) * 0.07}s, transform 0.55s ease ${(i % 5) * 0.07}s`;
    io.observe(el);
  });

  const contactForm = document.getElementById('contactForm');
  const referenceInput = document.getElementById('references');
  const referenceFileList = document.getElementById('referenceFileList');
  const filloutUrl = contactForm?.dataset.filloutUrl || contactForm?.action;

  const MAX_FILE_BYTES = 10 * 1024 * 1024;

  function updateReferenceFileList() {
    if (!referenceInput || !referenceFileList) return;
    const files = referenceInput.files;
    if (!files.length) {
      referenceFileList.textContent = '';
      return;
    }
    const names = Array.from(files).map((f) => f.name);
    referenceFileList.textContent = names.length === 1
      ? names[0]
      : `${names.length} files: ${names.join(', ')}`;
  }

  referenceInput?.addEventListener('change', updateReferenceFileList);

  contactForm?.addEventListener('submit', (e) => {
    if (!window.beezzRequirePrivacyConsent(contactForm)) {
      e.preventDefault();
      return;
    }
    if (!referenceInput || !filloutUrl) return;

    const files = referenceInput.files;
    if (files.length) {
      for (let i = 0; i < files.length; i++) {
        if (files[i].size > MAX_FILE_BYTES) {
          e.preventDefault();
          alert(`Each image must be under 10 MB. "${files[i].name}" is too large.`);
          return;
        }
      }
      contactForm.method = 'post';
      contactForm.enctype = 'multipart/form-data';
      contactForm.action = filloutUrl;
      return;
    }

    contactForm.method = 'get';
    contactForm.removeAttribute('enctype');
    contactForm.action = filloutUrl;

    e.preventDefault();
    const params = new URLSearchParams();
    const name = document.getElementById('name')?.value.trim();
    const email = document.getElementById('email')?.value.trim();
    const phone = document.getElementById('phone')?.value.trim();
    const idea = document.getElementById('idea')?.value.trim();
    if (name) params.set('name', name);
    if (email) params.set('email', email);
    if (phone) params.set('phone', phone);
    if (idea) params.set('idea', idea);
    const q = params.toString();
    window.open(q ? `${filloutUrl}?${q}` : filloutUrl, '_blank', 'noopener,noreferrer');
  });

});
