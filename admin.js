// admin.js – lógica de autenticación y gestión de proyectos para admin.html

// Constantes de credenciales (pueden cambiarse más tarde)
const ADMIN_USER = 'admin';
const ADMIN_PASS = 'bruck2026';

// Elementos del DOM
const loginForm = document.getElementById('login-form');
const loginSection = document.getElementById('login-section');
const panelSection = document.getElementById('panel-section');
const loginError = document.getElementById('login-error');
const addProjectForm = document.getElementById('add-project-form');
const projectListEl = document.getElementById('project-list');

// Helper – guardar estado de sesión
function setSession(logged) {
  localStorage.setItem('adminLoggedIn', logged ? 'true' : 'false');
}
function isLoggedIn() {
  return localStorage.getItem('adminLoggedIn') === 'true';
}

function showPanel() {
  loginSection.style.display = 'none';
  panelSection.style.display = 'block';
  loadProjectList();
}
function showLogin() {
  loginSection.style.display = 'block';
  panelSection.style.display = 'none';
}

// ---------- Autenticación ----------
if (loginForm) {
  loginForm.addEventListener('submit', e => {
    e.preventDefault();
    const usuario = document.getElementById('admin-usuario').value.trim();
    const pass = document.getElementById('admin-pass').value.trim();
    if (usuario === ADMIN_USER && pass === ADMIN_PASS) {
      setSession(true);
      loginError.style.display = 'none';
      showPanel();
    } else {
      setSession(false);
      loginError.style.display = 'block';
    }
  });
}

// Si ya está autenticado al cargar la página, ir directo al panel
if (isLoggedIn()) {
  showPanel();
} else {
  showLogin();
}

// ---------- Gestión de proyectos ----------
function loadProjectList() {
  projectListEl.innerHTML = '';
  const projects = JSON.parse(localStorage.getItem('projects') || '[]');
  projects.forEach(p => {
    const item = document.createElement('div');
    item.className = 'project-item';
    item.innerHTML = `
      <img src="${p.imagen}" alt="${p.titulo}" />
      <span>${p.titulo} (${p.categoria})</span>
      <button data-id="${p.id}" class="delete-btn">Eliminar</button>
    `;
    const delBtn = item.querySelector('.delete-btn');
    delBtn.addEventListener('click', () => deleteProject(p.id));
    projectListEl.appendChild(item);
  });
}

function deleteProject(id) {
  let projects = JSON.parse(localStorage.getItem('projects') || '[]');
  projects = projects.filter(p => p.id !== id);
  localStorage.setItem('projects', JSON.stringify(projects));
  loadProjectList();
}

if (addProjectForm) {
  addProjectForm.addEventListener('submit', e => {
    e.preventDefault();
    const titulo = document.getElementById('proj-titulo').value.trim();
    const categoria = document.getElementById('proj-categoria').value;
    const descripcion = document.getElementById('proj-descripcion').value.trim();
    const fileInput = document.getElementById('proj-imagen');
    const file = fileInput.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const proyecto = {
        id: Date.now(),
        titulo,
        categoria,
        descripcion,
        imagen: reader.result // base64 data URL
      };
      const projects = JSON.parse(localStorage.getItem('projects') || '[]');
      projects.push(proyecto);
      localStorage.setItem('projects', JSON.stringify(projects));
      loadProjectList();
      addProjectForm.reset();
    };
    reader.readAsDataURL(file);
  });
}

// Opcional: permitir cerrar sesión
function logout() {
  setSession(false);
  showLogin();
}
// Puedes añadir un botón de logout en el HTML y conectar esta función.
