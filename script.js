/* =================================================================
   HERRERÍA BRUCK'S – script.js
   Funciones: Navbar, Carrusel táctil, Grilla dinámica de proyectos,
              Tabs de categoría, Validación y envío de cotizador WhatsApp,
              Carga dinámica de datos de contacto desde localStorage.
   ================================================================= */

'use strict';

/* -----------------------------------------------------------------
   PROYECTOS DE EJEMPLO (se muestran si el admin no subió ninguno)
   ----------------------------------------------------------------- */
const PROYECTOS_EJEMPLO = [
  {
    id:          0,
    titulo:      'Galpón Industrial 800m²',
    categoria:   'grandes',
    descripcion: 'Nave industrial con estructura de perfiles de acero, cubierta de chapa termopanel y portón automatizado de 6 metros. Entregado con garantía escrita.',
    imagen:      ''  // se reemplaza con degradado gris
  },
  {
    id:          1,
    titulo:      'Pérgola de Diseño Premium',
    categoria:   'medianos',
    descripcion: 'Pérgola de acero pintado al horno en color grafito con techo de policarbonato opalescente. Ideal para espacios exteriores residenciales.',
    imagen:      ''
  },
  {
    id:          2,
    titulo:      'Mesa Industrial por Mayor',
    categoria:   'chicos',
    descripcion: 'Línea de mesas industriales con estructura de hierro cuadrado y tapa de madera recuperada. Fabricación en serie para espacios gastronómicos y comerciales.',
    imagen:      ''
  }
];

/* Etiquetas legibles por categoría */
const CAT_LABELS = {
  grandes:  'Grande',
  medianos: 'Mediano',
  chicos:   'Chico'
};

/* Gradientes de placeholder para proyectos sin imagen */
const GRADIENTES = [
  'linear-gradient(135deg,#1c1209 0%,#2d1e0f 40%,#1a1108 100%)',
  'linear-gradient(135deg,#0f1a1c 0%,#0d1c1e 40%,#0a1214 100%)',
  'linear-gradient(135deg,#1a1212 0%,#2a1a1a 40%,#150e0e 100%)'
];

/* -----------------------------------------------------------------
   HELPERS DE LOCALSTORAGE
   ----------------------------------------------------------------- */
function lsGet(key) {
  try { return JSON.parse(localStorage.getItem(key)); } catch { return null; }
}

/* -----------------------------------------------------------------
   NAVBAR – fondo al hacer scroll y hamburguesa
   ----------------------------------------------------------------- */
function initNavbar() {
  const navbar    = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('nav-links');

  // Fondo al bajar
  const onScroll = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 30);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Hamburguesa mobile
  if (hamburger) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('open');
      navLinks.classList.toggle('open');
    });
    // Cerrar al hacer clic en un enlace
    navLinks.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('open');
        navLinks.classList.remove('open');
      });
    });
  }
}

/* -----------------------------------------------------------------
   CARRUSEL – táctil, con puntos y botones
   ----------------------------------------------------------------- */
function initCarousel(proyectos) {
  const track   = document.getElementById('carousel-track');
  const dotsEl  = document.getElementById('carousel-dots');
  const btnPrev = document.getElementById('carousel-prev');
  const btnNext = document.getElementById('carousel-next');

  if (!track) return;

  let currentIdx  = 0;
  let startX      = 0;
  let autoTimer   = null;
  const AUTOPLAY  = 5000; // ms

  /* Construir slides */
  track.innerHTML = '';
  dotsEl.innerHTML = '';

  proyectos.forEach((p, i) => {
    // Slide
    const slide = document.createElement('div');
    slide.className = 'carousel-slide';

    if (p.imagen) {
      const img = document.createElement('img');
      img.src = p.imagen;
      img.alt = p.titulo;
      slide.appendChild(img);
    } else {
      // Placeholder con gradiente
      slide.style.background = GRADIENTES[i % GRADIENTES.length];
      // Ícono centrado
      const icon = document.createElement('div');
      icon.style.cssText = `
        position:absolute; inset:0;
        display:flex; flex-direction:column;
        align-items:center; justify-content:center;
        font-size:3rem; color:rgba(184,107,56,.35);
        gap:.5rem;
      `;
      const emojis = ['🏭', '🌿', '🪑'];
      icon.innerHTML = `<span>${emojis[i % emojis.length]}</span>`;
      slide.appendChild(icon);
    }

    // Info label
    const info = document.createElement('div');
    info.className = 'carousel-slide-info';
    info.innerHTML = `
      <span>${CAT_LABELS[p.categoria] || p.categoria}</span>
      <h3>${p.titulo}</h3>
    `;
    slide.appendChild(info);
    track.appendChild(slide);

    // Punto
    const dot = document.createElement('div');
    dot.className = 'dot' + (i === 0 ? ' active' : '');
    dot.addEventListener('click', () => goTo(i));
    dotsEl.appendChild(dot);
  });

  const slides    = Array.from(track.children);
  const totalSlides = slides.length;

  function goTo(idx) {
    currentIdx = (idx + totalSlides) % totalSlides;
    track.style.transform = `translateX(-${currentIdx * 100}%)`;
    document.querySelectorAll('.dot').forEach((d, i) =>
      d.classList.toggle('active', i === currentIdx)
    );
  }

  function next() { goTo(currentIdx + 1); }
  function prev() { goTo(currentIdx - 1); }

  btnNext?.addEventListener('click', () => { next(); resetAuto(); });
  btnPrev?.addEventListener('click', () => { prev(); resetAuto(); });

  /* Arrastre / swipe táctil */
  track.addEventListener('touchstart', e => {
    startX = e.touches[0].clientX;
  }, { passive: true });
  track.addEventListener('touchend', e => {
    const diff = e.changedTouches[0].clientX - startX;
    if (Math.abs(diff) > 50) {
      diff > 0 ? prev() : next();
      resetAuto();
    }
  }, { passive: true });

  /* Autoplay */
  function startAuto() { autoTimer = setInterval(next, AUTOPLAY); }
  function resetAuto()  { clearInterval(autoTimer); startAuto(); }
  startAuto();
}

/* -----------------------------------------------------------------
   PROYECTOS – GRILLA + TABS
   ----------------------------------------------------------------- */
function initProyectos() {
  // Obtener proyectos del admin o usar los de ejemplo
  const stored    = lsGet('projects');
  const proyectos = (stored && stored.length > 0) ? stored : PROYECTOS_EJEMPLO;

  // Inicializar carrusel con los mismos proyectos
  initCarousel(proyectos);

  // Tabs
  const tabs = document.querySelectorAll('.tab-btn');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      renderGrid(proyectos, tab.dataset.cat);
    });
  });

  // Grilla inicial con todos
  renderGrid(proyectos, 'todos');
}

function renderGrid(proyectos, cat) {
  const grid = document.getElementById('projects-grid');
  if (!grid) return;
  grid.innerHTML = '';

  const filtrados = cat === 'todos'
    ? proyectos
    : proyectos.filter(p => p.categoria === cat);

  if (!filtrados.length) {
    grid.innerHTML = '<p class="projects-empty">No hay proyectos en esta categoría todavía.</p>';
    return;
  }

  filtrados.forEach((p, i) => {
    const card = document.createElement('article');
    card.className = 'project-card fade-up';
    card.style.animationDelay = `${i * 0.08}s`;

    const imgHtml = p.imagen
      ? `<img class="project-card-img" src="${p.imagen}" alt="${p.titulo}" loading="lazy" />`
      : `<div class="project-card-img" style="
            background:${GRADIENTES[i % GRADIENTES.length]};
            display:flex; align-items:center; justify-content:center;
            font-size:2.5rem; color:rgba(184,107,56,.4);
          ">
            ${ {'grandes':'🏭','medianos':'🌿','chicos':'🪑'}[p.categoria] || '⚙' }
          </div>`;

    card.innerHTML = `
      ${imgHtml}
      <div class="project-card-body">
        <p class="project-card-cat">${CAT_LABELS[p.categoria] || p.categoria}</p>
        <h3>${p.titulo}</h3>
        <p>${p.descripcion || ''}</p>
      </div>
    `;
    grid.appendChild(card);
  });
}

/* -----------------------------------------------------------------
   COTIZADOR INTELIGENTE – Validación y envío a WhatsApp
   ----------------------------------------------------------------- */
function initCotizador() {
  const form = document.getElementById('quote-form');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();
    if (!validarFormulario()) return;
    enviarWhatsApp();
  });
}

function validarFormulario() {
  let valido = true;

  const campos = [
    { id: 'q-nombre',   errId: 'err-nombre',   msg: 'Por favor ingresá tu nombre.' },
    { id: 'q-ciudad',   errId: 'err-ciudad',   msg: 'Por favor ingresá tu ciudad.' },
    { id: 'q-tamano',   errId: 'err-tamano',   msg: 'Seleccioná el tamaño del proyecto.' },
    { id: 'q-servicio', errId: 'err-servicio', msg: 'Seleccioná el tipo de servicio.' }
  ];

  campos.forEach(({ id, errId, msg }) => {
    const campo = document.getElementById(id);
    const errEl = document.getElementById(errId);
    if (!campo) return;
    const vacio = !campo.value.trim();
    if (errEl) errEl.textContent = vacio ? msg : '';
    if (vacio) {
      campo.style.borderColor = 'var(--danger)';
      campo.style.boxShadow   = '0 0 0 3px rgba(231,76,60,.2)';
      valido = false;
    } else {
      campo.style.borderColor = '';
      campo.style.boxShadow   = '';
    }
  });

  return valido;
}

function enviarWhatsApp() {
  // Leer datos del formulario
  const nombre      = document.getElementById('q-nombre').value.trim();
  const ciudad      = document.getElementById('q-ciudad').value.trim();
  const tamano      = document.getElementById('q-tamano').value;
  const servicio    = document.getElementById('q-servicio').value;
  const ancho       = document.getElementById('q-ancho').value.trim();
  const largo       = document.getElementById('q-largo').value.trim();
  const alto        = document.getElementById('q-alto').value.trim();
  const comentario  = document.getElementById('q-comentario').value.trim();

  // Construir dimensiones
  const dimensiones = (ancho || largo || alto)
    ? `${ancho || '?'} m × ${largo || '?'} m × ${alto || '?'} m`
    : 'No especificadas';

  // Mensaje con estructura clara y emojis para legibilidad en WhatsApp
  let msg = `*Hola Herrería Bruck's, me gustaría cotizar mi proyecto con los siguientes datos:*\n\n`;
  msg += `👤 *Nombre:* ${nombre}\n`;
  msg += `📍 *Ciudad:* ${ciudad}\n`;
  msg += `📐 *Tamaño del proyecto:* ${tamano}\n`;
  msg += `🔧 *Tipo de servicio:* ${servicio}\n`;
  msg += `📏 *Dimensiones estimadas:* ${dimensiones}\n`;
  if (comentario) {
    msg += `\n💬 *Comentarios adicionales:*\n${comentario}\n`;
  }
  msg += `\n_Cotización solicitada desde herreriabrucks.com.ar_`;

  // Obtener número (admin puede haberlo cambiado en admin.html)
  const contactData = lsGet('contactData');
  const numero      = (contactData && contactData.whatsapp) ? contactData.whatsapp : '543412297062';

  const url = `https://wa.me/${numero}?text=${encodeURIComponent(msg)}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}

/* -----------------------------------------------------------------
   DATOS DE CONTACTO – actualizar links del footer dinámicamente
   ----------------------------------------------------------------- */
function initContacto() {
  const data = lsGet('contactData');
  if (!data) return;

  const set = (id, attr, val) => {
    const el = document.getElementById(id);
    if (el && val) el[attr] = val;
  };

  if (data.whatsapp) {
    const msg  = encodeURIComponent("Hola Herrería Bruck's, me gustaría cotizar mi proyecto...");
    set('footer-whatsapp', 'href', `https://wa.me/${data.whatsapp}?text=${msg}`);
  }
  set('footer-instagram', 'href', data.instagram);
  set('footer-tiktok',    'href', data.tiktok);
  if (data.email) {
    const el = document.getElementById('footer-email');
    if (el) { el.href = `mailto:${data.email}`; el.textContent = `✉ ${data.email}`; }
  }
}

/* -----------------------------------------------------------------
   INICIALIZACIÓN GENERAL
   ----------------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initProyectos();
  initCotizador();
  initContacto();
});
