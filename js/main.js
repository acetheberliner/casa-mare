const translations = {
  it: window.TRANSLATIONS_IT,
  en: window.TRANSLATIONS_EN
};

const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

const navbar = $('#navbar');
const menuBtn = $('#menuBtn');
const mobileMenu = $('#mobileMenu');
const lightbox = $('#lightbox');
const lightboxImage = $('#lightboxImage');
const lightboxClose = $('#lightboxClose');

const galleryTrack = $('#galleryTrack');
const galleryPrev = $('#galleryPrev');
const galleryNext = $('#galleryNext');

const territoryTrack = $('#territoryTrack');
const territoryPrev = $('#territoryPrev');
const territoryNext = $('#territoryNext');

function applySiteConfig() {
  const config = window.SITE_CONFIG;
  if (!config) return;

  const whatsappOwnerUrl = `https://wa.me/${config.ownerPhone}?text=${encodeURIComponent(config.whatsappMessage)}`;
  const developerWhatsappUrl = `https://wa.me/${config.developerPhone}?text=${encodeURIComponent(config.developerWhatsappMessage)}`;

  const hrefMap = {
    whatsappOwner: whatsappOwnerUrl,
    developerWhatsapp: developerWhatsappUrl,
    facebookPost: config.facebookPostUrl,
    mapsOpen: config.mapsOpenUrl
  };

  const srcMap = {
    mapsEmbed: config.mapsEmbedUrl
  };

  $$("[data-config-href]").forEach((element) => {
    const key = element.dataset.configHref;
    if (hrefMap[key]) element.href = hrefMap[key];
  });

  $$("[data-config-src]").forEach((element) => {
    const key = element.dataset.configSrc;
    if (srcMap[key]) element.src = srcMap[key];
  });
}

function updateNavbar() {
    if (!navbar) return;
    navbar.classList.toggle('is-scrolled', window.scrollY > 20);
}

function toggleMobileMenu() {
    if (!mobileMenu || !menuBtn) return;

    mobileMenu.classList.toggle('is-open');

    const svg = menuBtn.querySelector('svg');
    const isOpen = mobileMenu.classList.contains('is-open');

    if (svg) {
    svg.innerHTML = isOpen
        ? `<path stroke-linecap="round" stroke-linejoin="round" d="M6 6l12 12M18 6 6 18"/>`
        : `<path stroke-linecap="round" stroke-linejoin="round" d="M4 7h16M4 12h16M4 17h16"/>`;
    }
}

function initReveal() {
    const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        }
    });
    }, { threshold: 0.14 });

    $$('.reveal').forEach((element) => observer.observe(element));
}

function closeLightbox() {
    if (!lightbox || !lightboxImage) return;

    lightbox.classList.remove('is-open');
    document.body.style.overflow = '';

    setTimeout(() => {
    lightboxImage.src = '';
    }, 250);
}

function openLightbox(src, alt = '') {
    if (!lightbox || !lightboxImage || !src) return;

    lightboxImage.src = src;
    lightboxImage.alt = alt;
    lightbox.classList.add('is-open');
    document.body.style.overflow = 'hidden';
}

function updateSliderButtons(track, prevBtn, nextBtn) {
    if (!track || !prevBtn || !nextBtn) return;

    const maxScrollLeft = track.scrollWidth - track.clientWidth;
    const currentScroll = Math.ceil(track.scrollLeft);

    prevBtn.disabled = currentScroll <= 0;
    nextBtn.disabled = currentScroll >= maxScrollLeft - 2;
}

function initSlider(track, prevBtn, nextBtn, fallbackAlt) {
    if (!track || !prevBtn || !nextBtn) return;

    const getStep = () => {
    const firstSlide = track.querySelector('.gallery-slide');
    if (!firstSlide) return 300;

    const gap = parseInt(window.getComputedStyle(track).gap || 18, 10);
    return firstSlide.offsetWidth + gap;
    };

    prevBtn.addEventListener('click', () => {
    track.scrollBy({ left: -getStep(), behavior: 'smooth' });
    });

    nextBtn.addEventListener('click', () => {
    track.scrollBy({ left: getStep(), behavior: 'smooth' });
    });

    track.querySelectorAll('.gallery-slide').forEach((slide) => {
    slide.addEventListener('click', () => {
        const src = slide.dataset.src;
        const img = slide.querySelector('img');
        openLightbox(src, img?.alt || fallbackAlt);
    });
    });

    track.addEventListener('scroll', () => {
    updateSliderButtons(track, prevBtn, nextBtn);
    }, { passive: true });

    window.addEventListener('resize', () => {
    updateSliderButtons(track, prevBtn, nextBtn);
    });

    updateSliderButtons(track, prevBtn, nextBtn);
}

function setLanguage(lang) {
    const dict = translations[lang] || translations.it;

    document.documentElement.lang = lang;

    $$('[data-i18n]').forEach((element) => {
    const key = element.dataset.i18n;
    if (dict[key]) {
        element.innerHTML = dict[key];
    }
    });

    $$('[data-i18n-placeholder]').forEach((element) => {
    const key = element.dataset.i18nPlaceholder;
    if (dict[key]) {
        element.setAttribute('placeholder', dict[key]);
    }
    });

    $$('[data-i18n-alt]').forEach((element) => {
    const key = element.dataset.i18nAlt;
    if (dict[key]) {
        element.setAttribute('alt', dict[key]);
    }
    });

    $$('[data-lang]').forEach((button) => {
    button.classList.toggle('is-active', button.dataset.lang === lang);
    });

    localStorage.setItem('siteLanguage', lang);

    if (window.lucide) {
      lucide.createIcons();
    }
}

function detectInitialLanguage() {
    const savedLanguage = localStorage.getItem('siteLanguage');
    if (savedLanguage && translations[savedLanguage]) {
    return savedLanguage;
    }

    return navigator.language.toLowerCase().startsWith('en') ? 'en' : 'it';
}

function initPageScrollbar() {
    const scrollbar = $('.page-scrollbar');
    const thumb = $('.page-scrollbar-thumb');
    if (!scrollbar || !thumb || !window.matchMedia('(pointer: fine)').matches) return;

    let dragging = false;
    let dragStartY = 0;
    let dragStartScrollY = 0;

    const updateThumb = () => {
    const scrollHeight = document.documentElement.scrollHeight;
    const viewportHeight = window.innerHeight;
    const trackHeight = scrollbar.clientHeight;
    const maxScroll = Math.max(scrollHeight - viewportHeight, 0);
    const thumbHeight = Math.max((viewportHeight / scrollHeight) * trackHeight, 44);
    const maxThumbTop = Math.max(trackHeight - thumbHeight, 0);
    const thumbTop = maxScroll ? (window.scrollY / maxScroll) * maxThumbTop : 0;

    scrollbar.hidden = maxScroll === 0;
    thumb.style.height = `${thumbHeight}px`;
    thumb.style.transform = `translateY(${thumbTop}px)`;
    };

    thumb.addEventListener('pointerdown', (event) => {
    dragging = true;
    dragStartY = event.clientY;
    dragStartScrollY = window.scrollY;
    thumb.classList.add('is-dragging');
    thumb.setPointerCapture(event.pointerId);
    });

    thumb.addEventListener('pointermove', (event) => {
    if (!dragging) return;

    const scrollHeight = document.documentElement.scrollHeight;
    const viewportHeight = window.innerHeight;
    const availableTrack = scrollbar.clientHeight - thumb.offsetHeight;
    const maxScroll = scrollHeight - viewportHeight;
    if (availableTrack <= 0 || maxScroll <= 0) return;

    window.scrollTo(0, dragStartScrollY + ((event.clientY - dragStartY) / availableTrack) * maxScroll);
    });

    const stopDragging = (event) => {
    if (!dragging) return;
    dragging = false;
    thumb.classList.remove('is-dragging');
    if (thumb.hasPointerCapture(event.pointerId)) thumb.releasePointerCapture(event.pointerId);
    };

    thumb.addEventListener('pointerup', stopDragging);
    thumb.addEventListener('pointercancel', stopDragging);
    window.addEventListener('scroll', updateThumb, { passive: true });
    window.addEventListener('resize', updateThumb);
    updateThumb();
}

if (menuBtn) {
    menuBtn.addEventListener('click', toggleMobileMenu);
}

if (lightboxClose) {
    lightboxClose.addEventListener('click', closeLightbox);
}

if (lightbox) {
    lightbox.addEventListener('click', (event) => {
    if (event.target === lightbox) {
        closeLightbox();
    }
    });
}

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
    closeLightbox();
    }
});

$$('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', () => {
    if (mobileMenu) mobileMenu.classList.remove('is-open');

    if (menuBtn) {
        const svg = menuBtn.querySelector('svg');
        if (svg) {
        svg.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" d="M4 7h16M4 12h16M4 17h16"/>`;
        }
    }
    });
});

$$('[data-lang]').forEach((button) => {
    button.addEventListener('click', () => {
    setLanguage(button.dataset.lang);
    });
});

window.addEventListener('scroll', updateNavbar, { passive: true });

updateNavbar();

initReveal();
initSlider(galleryTrack, galleryPrev, galleryNext, 'Foto Casa Salento');
initSlider(territoryTrack, territoryPrev, territoryNext, 'Foto territorio');
initPageScrollbar();

applySiteConfig();

setLanguage(detectInitialLanguage());
if (window.lucide) {
  lucide.createIcons();
}
