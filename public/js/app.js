const API_URL = '/api';

// DOM Elements
const authView = document.getElementById('auth-view');
const dashView = document.getElementById('dashboard-view');
const loginForm = document.getElementById('login-form');
const sidebar = document.getElementById('sidebar');
const sidebarOverlay = document.getElementById('sidebar-overlay');
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const navItems = document.querySelectorAll('.nav-item');
const contentSections = document.querySelectorAll('.content-section');
const userFullname = document.getElementById('user-fullname');
const userInitial = document.getElementById('user-initial');
const userRole = document.getElementById('user-role');
const logoutBtn = document.getElementById('btn-logout');

// State
let token = localStorage.getItem('token');
let currentUser = JSON.parse(localStorage.getItem('user'));
let clientsMap = {}; 
let lastReportTickets = []; 
let operatorChart = null; 
let clientChart = null;   
let categoryChart = null; 
let selectedCategoryId = null;

// Custom Confirm Modal
window.customConfirm = function(message, onConfirm) {
  const modal = document.getElementById('confirm-modal');
  document.getElementById('confirm-modal-msg').innerText = message;
  
  const btnYes = document.getElementById('btn-confirm-yes');
  const btnCancel = document.getElementById('btn-confirm-cancel');
  
  const cleanup = () => {
    btnYes.removeEventListener('click', handleYes);
    btnCancel.removeEventListener('click', handleCancel);
  };
  
  const handleYes = () => {
    modal.classList.add('hidden');
    cleanup();
    onConfirm();
  };
  
  const handleCancel = () => {
    modal.classList.add('hidden');
    cleanup();
  };
  
  btnYes.addEventListener('click', handleYes);
  btnCancel.addEventListener('click', handleCancel);
  
  modal.classList.remove('hidden');
};

// Initialization
function init() {
  if (token && currentUser) {
    showDashboard();
    loadDashboardData();
  } else {
    showAuth();
  }

  // Auth Submit
  loginForm.addEventListener('submit', handleLogin);
  if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);

  // Mobile Menu Logic
  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
      sidebar.classList.toggle('active');
      sidebarOverlay.classList.toggle('active');
    });
  }

  if (sidebarOverlay) {
    sidebarOverlay.addEventListener('click', () => {
      sidebar.classList.remove('active');
      sidebarOverlay.classList.remove('active');
    });
  }

  // Navigation
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const targetId = item.getAttribute('data-target');
      if (!targetId) return;

      // Close sidebar on mobile
      sidebar.classList.remove('active');
      sidebarOverlay.classList.remove('active');
      
      navItems.forEach(nav => nav.classList.remove('active'));
      item.classList.add('active');

      contentSections.forEach(sec => sec.classList.add('hidden'));
      const targetSection = document.getElementById(targetId);
      if (targetSection) targetSection.classList.remove('hidden');

      // Load data based on section
      if (targetId === 'dashboard-content') loadDashboardData();
      if (targetId === 'clients-content') loadClients();
      if (targetId === 'tickets-content') loadTickets();
      if (targetId === 'users-content') loadUsers();
      if (targetId === 'categories-content') loadCategories();
      if (targetId === 'reports-content') {
        initReports();
        const tbody = document.querySelector('#reports-table tbody');
        if (tbody.children.length === 0 || !lastReportTickets.length) {
          tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; opacity: 0.7; padding: 2rem;">Utilize os filtros acima e clique em Filtrar para carregar os chamados.</td></tr>';
        }
      }
    });
  });

  // Global Close Modals
  document.querySelectorAll('.close-modal').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.modal-overlay').forEach(m => m.classList.add('hidden'));
    });
  });

  // Register Global window functions for simplified onclicks in HTML
  window.openNewTicketModal = async () => {
    try {
      await loadClientOptions();
      await loadCategoryOptions();
      document.getElementById('ticket-form').reset();
      document.getElementById('ticket-modal-title').innerText = 'Novo Chamado';
      document.getElementById('ticket-modal').classList.remove('hidden');
      document.getElementById('ticket-subcategory').disabled = true;
    } catch (err) {
      alert('Erro ao carregar opções: ' + err.message);
    }
  };

  window.openClientModal = (clientId = null) => {
    document.getElementById('client-form').reset();
    document.getElementById('client-modal-title').innerText = clientId ? 'Editar Cliente' : 'Novo Cliente';
    document.getElementById('client-modal').classList.remove('hidden');
  };

  window.openCategoryModal = () => {
    document.getElementById('category-form').reset();
    document.getElementById('category-modal').classList.remove('hidden');
  };

  window.openSubcategoryModal = () => {
    if (!selectedCategoryId) return;
    document.getElementById('subcategory-form').reset();
    document.getElementById('subcategory-modal').classList.remove('hidden');
  };

  // Status Filter Listener
  const statusFilter = document.getElementById('status-filter');
  if (statusFilter) statusFilter.addEventListener('change', loadTickets);

  // Forms Listeners
  const clientForm = document.getElementById('client-form');
  if (clientForm) clientForm.addEventListener('submit', saveClient);

  const ticketForm = document.getElementById('ticket-form');
  if (ticketForm) ticketForm.addEventListener('submit', saveTicket);

  const catForm = document.getElementById('category-form');
  if (catForm) catForm.addEventListener('submit', handleCategorySubmit);

  const subcatForm = document.getElementById('subcategory-form');
  if (subcatForm) subcatForm.addEventListener('submit', handleSubcategorySubmit);

  const userForm = document.getElementById('user-form');
  if (userForm) userForm.addEventListener('submit', saveUser);

  const ticketCatSelect = document.getElementById('ticket-category');
  if (ticketCatSelect) {
    ticketCatSelect.addEventListener('change', e => loadSubcategoryOptions(e.target.value));
  }

  const addLogBtn = document.getElementById('btn-add-log');
  if (addLogBtn) addLogBtn.addEventListener('click', handleAddLog);

  window.openUserModal = (userId = null) => {
    const modal = document.getElementById('user-modal');
    const form = document.getElementById('user-form');
    const title = document.getElementById('user-modal-title');
    const passInput = document.getElementById('manage-user-password');
    
    form.reset();
    document.getElementById('manage-user-id').value = userId || '';
    
    if (userId) {
      title.innerText = 'Editar Usuário';
      document.getElementById('lbl-manage-password').innerHTML = '<i class="fas fa-key"></i> Nova Senha';
      document.getElementById('help-manage-password').innerText = '(Deixe em branco para manter a atual)';
      passInput.placeholder = '••••••••';
      passInput.required = false;
      fillUserInfo(userId);
    } else {
      title.innerText = 'Novo Usuário';
      document.getElementById('lbl-manage-password').innerHTML = '<i class="fas fa-key"></i> Senha';
      document.getElementById('help-manage-password').innerText = '';
      passInput.placeholder = 'Crie uma senha forte';
      passInput.required = true;
    }
    modal.classList.remove('hidden');
  };

  async function fillUserInfo(id) {
    try {
      const users = await apiCall('/users');
      const u = users.find(user => user.id == id);
      if (u) {
        document.getElementById('manage-user-name').value = u.name;
        document.getElementById('manage-user-username').value = u.username;
        document.getElementById('manage-user-role').value = u.role.toLowerCase();
      }
    } catch (err) { console.error(err); }
  }

  // Reports
  const reportFilterForm = document.getElementById('report-filter-form');
  if (reportFilterForm) reportFilterForm.addEventListener('submit', loadReportData);
  
  const reportPdfBtn = document.getElementById('btn-generate-pdf');
  if (reportPdfBtn) reportPdfBtn.addEventListener('click', generatePDF);

  const reportChartsPdfBtn = document.getElementById('btn-generate-charts-pdf');
  if (reportChartsPdfBtn) reportChartsPdfBtn.addEventListener('click', generateChartsPDF);

  const confirmExportBtn = document.getElementById('btn-confirm-export');
  if (confirmExportBtn) confirmExportBtn.addEventListener('click', executeSelectivePDF);

  document.querySelectorAll('.report-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => switchReportView(btn.dataset.reportView));
  });
}

// --- Auth Functions ---
async function handleLogin(e) {
  e.preventDefault();
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  const errorDiv = document.getElementById('login-error');

  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    
    if (!res.ok) throw new Error('Falha no login');
    const data = await res.json();
    
    token = data.token;
    currentUser = data.user;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(currentUser));
    
    showDashboard();
    loadDashboardData();
  } catch (err) {
    errorDiv.classList.remove('hidden');
    console.error(err);
  }
}

function handleLogout() {
  localStorage.clear();
  token = null;
  currentUser = null;
  showAuth();
}

function showAuth() {
  authView.classList.remove('hidden');
  dashView.classList.add('hidden');
  document.querySelector('.mobile-header').style.display = 'none';
}

function showDashboard() {
  authView.classList.add('hidden');
  dashView.classList.remove('hidden');

  userFullname.innerText = currentUser.name;
  userInitial.innerText = currentUser.name.charAt(0).toUpperCase();
  userRole.innerText = currentUser.role === 'admin' ? 'Administrador' : 'Operador';

  if (currentUser.role === 'admin') {
    document.getElementById('nav-categories-item').classList.remove('hidden');
    document.getElementById('nav-users-item').classList.remove('hidden');
    document.getElementById('nav-reports-item').classList.remove('hidden');
  }
}

// --- API Helper ---
async function apiCall(endpoint, method = 'GET', body = null) {
  const options = {
    method,
    headers: {
      'Authorization': `Bearer ${token}`
    }
  };
  if (body) {
    options.headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(body);
  }
  const res = await fetch(API_URL + endpoint, options);
  if (!res.ok) {
    if (res.status === 401 || res.status === 403) {
      console.warn('Sessão inválida (401/403). Forçando logout.');
      handleLogout();
    }
    const err = await res.json().catch(() => ({ message: 'Erro desconhecido' }));
    throw new Error(err.message || err.error || 'Erro na requisição');
  }
  return res.json();
}

// --- Dashboard Data ---
async function loadDashboardData() {
  try {
    const tickets = await apiCall('/tickets');
    const clients = await apiCall('/clients');
    
    const open = tickets.filter(t => t.status === 'open').length;
    const progress = tickets.filter(t => t.status === 'in_progress').length;
    const closed = tickets.filter(t => t.status === 'closed').length;

    document.getElementById('stat-open').innerText = open;
    document.getElementById('stat-progress').innerText = progress;
    document.getElementById('stat-closed').innerText = closed;
    document.getElementById('stat-clients').innerText = clients.length;

    const recent = tickets.slice(0, 5);
    const tbody = document.getElementById('recent-tickets-body');
    tbody.innerHTML = recent.map(t => `
      <tr>
        <td>#${t.id}</td>
        <td>${t.title}</td>
        <td>${t.client?.name || 'N/A'}</td>
        <td>${t.finalizer?.name || '-'}</td>
        <td><span class="status-badge badge-${t.status}">${translateStatus(t.status)}</span></td>
        <td>${new Date(t.createdAt).toLocaleDateString()}</td>
      </tr>
    `).join('');
  } catch (err) { console.error(err); }
}

// --- Clients Module ---
async function loadClients() {
  try {
    const clients = await apiCall('/clients');
    const tbody = document.getElementById('clients-table-body');
    tbody.innerHTML = clients.map(c => `
      <tr>
        <td>${c.name}</td>
        <td>${c.email}</td>
        <td>${c.phone || '-'}</td>
        <td>${c.document || '-'}</td>
        <td>
          <button class="btn btn-icon btn-edit" title="Editar" onclick="window.openClientModal(${c.id})"><i class="fas fa-edit"></i></button>
          <button class="btn btn-icon text-danger btn-delete" title="Excluir" onclick="deleteClient(${c.id})"><i class="fas fa-trash-alt"></i></button>
        </td>
      </tr>
    `).join('');
  } catch (err) { console.error(err); }
}

async function saveClient(e) {
  e.preventDefault();
  const name = document.getElementById('client-name').value;
  const email = document.getElementById('client-email').value;
  const phone = document.getElementById('client-phone').value;
  const documentVal = document.getElementById('client-document').value;

  try {
    await apiCall('/clients', 'POST', { name, email, phone, document: documentVal });
    document.getElementById('client-modal').classList.add('hidden');
    loadClients();
  } catch (err) { alert(err.message); }
}

async function deleteClient(id) {
  window.customConfirm('Excluir este cliente?', async () => {
    try {
      await apiCall(`/clients/${id}`, 'DELETE');
      loadClients();
    } catch (err) { alert(err.message); }
  });
}

// --- Tickets Module ---
async function loadTickets() {
  const status = document.getElementById('status-filter').value;
  const qs = status !== 'todos' ? `?status=${status}` : '';
  try {
    const tickets = await apiCall('/tickets' + qs);
    const tbody = document.getElementById('tickets-table-body');
    tbody.innerHTML = tickets.map(t => `
      <tr onclick="openAttendance(${t.id})" style="cursor: pointer;" title="Clique para ver o histórico">
        <td>#${t.id}</td>
        <td>${t.title} <br><small class="text-secondary">${t.category?.name || ''} > ${t.subcategory?.name || ''}</small></td>
        <td>${t.client?.name || 'N/A'}</td>
        <td>${t.user?.name || 'Sistema'}</td>
        <td>${t.finalizer?.name || '-'}</td>
        <td><span class="badge ${t.status}">${translateStatus(t.status)}</span></td>
        <td>
          <div style="display: flex; gap: 0.5rem; justify-content: flex-start;">
            <button class="btn btn-icon btn-edit" title="${t.status === 'closed' ? 'Ver' : 'Atender'}" onclick="event.stopPropagation(); openAttendance(${t.id})"><i class="fas fa-${t.status === 'closed' ? 'eye' : 'play'}"></i></button>
            ${currentUser.role === 'admin' ? `<button class="btn btn-icon text-danger btn-delete" title="Excluir" onclick="event.stopPropagation(); deleteTicket(${t.id})"><i class="fas fa-trash-alt"></i></button>` : ''}
          </div>
        </td>
      </tr>
    `).join('');
  } catch (err) { console.error(err); }
}

async function saveTicket(e) {
  e.preventDefault();
  const data = {
    title: document.getElementById('ticket-title').value,
    clientId: parseInt(document.getElementById('ticket-client').value),
    categoryId: parseInt(document.getElementById('ticket-category').value),
    subCategoryId: parseInt(document.getElementById('ticket-subcategory').value),
    description: document.getElementById('ticket-desc').value
  };

  try {
    await apiCall('/tickets', 'POST', data);
    document.getElementById('ticket-modal').classList.add('hidden');
    loadTickets();
    loadDashboardData();
  } catch (err) { alert(err.message); }
}

async function deleteTicket(id) {
  window.customConfirm('Excluir chamado?', async () => {
    try {
      await apiCall(`/tickets/${id}`, 'DELETE');
      loadTickets();
    } catch (err) { alert(err.message); }
  });
}

// --- Attendance Module ---
async function openAttendance(id) {
  try {
    const ticket = await apiCall(`/tickets/${id}`);
    document.getElementById('att-ticket-id').innerText = '#' + ticket.id;
    document.getElementById('att-ticket-title').innerText = ticket.title;
    const clientEl = document.getElementById('att-ticket-client');
    if (clientEl) clientEl.innerText = '👤 Cliente: ' + (ticket.client?.name || 'N/A');
    const badgeEl = document.getElementById('att-ticket-status-badge');
    if (badgeEl) {
      badgeEl.innerText = translateStatus(ticket.status);
      badgeEl.className = 'badge ' + ticket.status;
    }
    const catEl = document.getElementById('att-ticket-category');
    if (catEl) catEl.innerText = `${ticket.category?.name || ''} > ${ticket.subcategory?.name || ''}`;
    const finEl = document.getElementById('att-ticket-finalizer');
    if (finEl) finEl.innerText = '✅ Finalizado por: ' + (ticket.finalizer?.name || 'Nenhum');
    const newStatusEl = document.getElementById('att-new-status');
    if (newStatusEl) newStatusEl.value = ticket.status;
    const descEl = document.getElementById('att-ticket-desc');
    if (descEl) descEl.innerText = ticket.description || 'Sem descrição';
    
    const commentBox = document.getElementById('comment-section-box');
    if (commentBox) {
      if (ticket.status === 'closed') commentBox.classList.add('hidden');
      else commentBox.classList.remove('hidden');
    }

    const mainActions = document.getElementById('attendance-main-actions');
    if (mainActions) {
      if (ticket.status === 'closed') mainActions.classList.add('hidden');
      else mainActions.classList.remove('hidden');
    }

    const startBtn = document.getElementById('start-attendance-btn');
    const finishBtn = document.getElementById('finish-attendance-btn');
    if (startBtn && finishBtn) {
      startBtn.onclick = () => startTicketAttendance(id);
      finishBtn.onclick = () => openFinishModal(id);
      if (ticket.status === 'open') {
        startBtn.classList.remove('hidden');
        finishBtn.classList.add('hidden');
      } else if (ticket.status === 'in_progress') {
        startBtn.classList.add('hidden');
        finishBtn.classList.remove('hidden');
      }
    }
    
    const commentPhoto = document.getElementById('comment-photo');
    if (commentPhoto) {
      commentPhoto.onchange = function() {
        document.getElementById('file-name-preview').innerText = this.files[0] ? this.files[0].name : '';
      };
    }
    
    const commentForm = document.getElementById('comment-form');
    if (commentForm) {
      commentForm.onsubmit = async (e) => {
        e.preventDefault();
        const msg = document.getElementById('comment-msg').value;
        const photo = commentPhoto ? commentPhoto.files[0] : null;
        
        if (!msg && !photo) return;
        
        const formData = new FormData();
        formData.append('message', msg || '📷 Arquivo em anexo');
        if (photo) formData.append('photo', photo);
        
        try {
          const res = await fetch(`${API_URL}/tickets/${id}/logs`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData
          });
          if (!res.ok) throw new Error('Erro ao enviar mensagem');
          
          document.getElementById('comment-msg').value = '';
          if (commentPhoto) commentPhoto.value = '';
          document.getElementById('file-name-preview').innerText = '';
          loadTicketLogs(id);
        } catch (err) { alert(err.message); }
      };
    }
    
    loadTicketLogs(id);
    document.getElementById('attendance-modal').classList.remove('hidden');
  } catch (err) { alert(err.message); }
}

async function startTicketAttendance(id) {
  try {
    const formData = new FormData();
    formData.append('message', 'Atendimento iniciado');
    formData.append('status', 'in_progress');
    
    const res = await fetch(`${API_URL}/tickets/${id}/logs`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    });
    if (!res.ok) throw new Error('Erro ao iniciar atendimento');
    
    openAttendance(id);
    loadTickets();
  } catch (err) { alert(err.message); }
}

function openFinishModal(id) {
  document.getElementById('attendance-modal').classList.add('hidden');
  document.getElementById('finish-ticket-id').innerText = '#' + id;
  const finishForm = document.getElementById('finish-form');
  
  if (finishForm) {
    finishForm.onsubmit = async (e) => {
      e.preventDefault();
      const msg = document.getElementById('finish-message').value;
      const photo = document.getElementById('finish-photo').files[0];
      
      const formData = new FormData();
      formData.append('message', `CONCLUÍDO: ${msg}`);
      formData.append('status', 'closed');
      if (photo) formData.append('photo', photo);
      
      try {
        const res = await fetch(`${API_URL}/tickets/${id}/logs`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formData
        });
        if (!res.ok) throw new Error('Erro ao finalizar chamado');
        
        document.getElementById('finish-modal').classList.add('hidden');
        finishForm.reset();
        loadTickets();
      } catch (err) { alert(err.message); }
    };
  }
  document.getElementById('finish-modal').classList.remove('hidden');
  const finishPhotoInput = document.getElementById('finish-photo');
  if (finishPhotoInput) {
    finishPhotoInput.value = '';
    document.getElementById('finish-file-preview').innerText = 'Nenhum arquivo selecionado';
    finishPhotoInput.onchange = function() {
      document.getElementById('finish-file-preview').innerText = this.files[0] ? this.files[0].name : 'Nenhum arquivo selecionado';
    };
  }
}

async function loadTicketLogs(id) {
  try {
    const logs = await apiCall(`/tickets/${id}/logs`);
    const container = document.getElementById('ticket-timeline');
    if (!container) return;
    container.innerHTML = logs.map(l => `
      <div class="log-item">
        <div class="log-header">
           <span class="user">${l.user.name}</span>
           <span class="time">${new Date(l.createdAt).toLocaleString()}</span>
        </div>
        <div class="log-content">
          ${l.message}
          ${l.photoUrl ? `<div style="margin-top: 10px;"><img src="${API_URL.replace('/api', '')}${l.photoUrl}" style="max-width: 100%; border-radius: 8px; cursor: pointer; border: 1px solid var(--glass-border);" onclick="window.open(this.src, '_blank')"></div>` : ''}
        </div>
      </div>
    `).join('') || '<p style="text-align: center; opacity: 0.5;">Fim do histórico.</p>';
    container.scrollTop = container.scrollHeight;
  } catch (err) { console.error(err); }
}

// handleAddLog implementation safely removed, logic is encapsulated in openAttendance

// --- Categories Module ---
async function loadCategories() {
  try {
    const categories = await apiCall('/categories');
    const list = document.getElementById('category-list');
    list.innerHTML = categories.map(c => `
      <div class="cat-chip ${selectedCategoryId == c.id ? 'active' : ''}" onclick="selectCategory(${c.id}, '${c.name}')">
        <div class="cat-chip-icon"><i class="fas fa-tag"></i></div>
        <span class="cat-chip-name">${c.name}</span>
        <button class="cat-chip-delete" title="Excluir" onclick="deleteCategory(event, ${c.id})"><i class="fas fa-trash-alt"></i></button>
      </div>
    `).join('') || '<p style="padding: 20px; opacity: 0.5; text-align:center;">Nenhuma categoria encontrada.</p>';
  } catch (err) { console.error(err); }
}

async function handleCategorySubmit(e) {
  e.preventDefault();
  const name = document.getElementById('category-name').value;
  try {
    await apiCall('/categories', 'POST', { name });
    document.getElementById('category-modal').classList.add('hidden');
    loadCategories();
  } catch (err) { alert(err.message); }
}

async function deleteCategory(event, id) {
  event.stopPropagation();
  window.customConfirm('Excluir categoria e todas as subcategorias?', async () => {
    try {
      await apiCall(`/categories/${id}`, 'DELETE');
      if (selectedCategoryId == id) {
        selectedCategoryId = null;
        document.getElementById('subcategory-list-content').innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 20px;">Selecione uma categoria ao lado</p>';
        document.getElementById('btn-new-subcategory').classList.add('hidden');
      }
      loadCategories();
    } catch (err) { alert(err.message); }
  });
}

window.selectCategory = (id, name) => {
  selectedCategoryId = id;
  const hintEl = document.getElementById('subcategory-panel-hint');
  if (hintEl) hintEl.innerText = name;
  const titleEl = document.getElementById('subcategory-panel-title');
  if (titleEl) titleEl.innerHTML = `<i class="fas fa-list-ul" style="margin-right: 0.5rem; opacity: 0.7;"></i>${name}`;
  document.getElementById('btn-new-subcategory').classList.remove('hidden');
  loadCategories();
  loadSubcategories(id);
};

let categoriesCache = [];

async function loadCategories() {
  try {
    const categories = await apiCall('/categories');
    categoriesCache = categories;
    const list = document.getElementById('category-list');
    list.innerHTML = categories.map(c => `
      <div class="cat-chip ${selectedCategoryId == c.id ? 'active' : ''}" onclick="selectCategory(${c.id}, '${c.name.replace(/'/g, "\\'")}')">
        <div class="cat-chip-icon"><i class="fas fa-tag"></i></div>
        <span class="cat-chip-name">${c.name}</span>
        <button class="cat-chip-delete" title="Excluir" onclick="deleteCategory(event, ${c.id})"><i class="fas fa-trash-alt"></i></button>
      </div>
    `).join('') || '<p style="padding: 20px; opacity: 0.5; text-align:center;">Nenhuma categoria encontrada.</p>';
  } catch (err) { console.error(err); }
}

async function loadSubcategories(catId) {
  try {
    // Use cached categories if available, else fetch
    let cat = categoriesCache.find(c => c.id == catId);
    if (!cat) {
      const categories = await apiCall('/categories');
      categoriesCache = categories;
      cat = categories.find(c => c.id == catId);
    }
    const subs = cat?.subcategories || [];
    const container = document.getElementById('subcategory-list-content');
    if (subs.length === 0) {
      container.innerHTML = '<p style="padding: 20px; text-align: center; color: var(--text-secondary);">Nenhuma subcategoria nesta categoria.</p>';
    } else {
      container.innerHTML = `
        <div class="sub-chip-list">
          ${subs.map(s => `
            <div class="sub-chip">
              <i class="fas fa-chevron-right" style="font-size:0.7rem; opacity:0.4;"></i>
              <span>${s.name}</span>
              <button class="cat-chip-delete" title="Excluir" onclick="deleteSubcategory(${s.id})"><i class="fas fa-trash-alt"></i></button>
            </div>
          `).join('')}
        </div>
      `;
    }
  } catch (err) { console.error(err); }
}

async function handleSubcategorySubmit(e) {
  e.preventDefault();
  const name = document.getElementById('subcategory-name').value;
  try {
    await apiCall(`/categories/${selectedCategoryId}/subcategories`, 'POST', { name });
    document.getElementById('subcategory-modal').classList.add('hidden');
    loadSubcategories(selectedCategoryId);
  } catch (err) { alert(err.message); }
}

async function deleteSubcategory(id) {
  window.customConfirm('Excluir subcategoria?', async () => {
    try {
      await apiCall(`/subcategories/${id}`, 'DELETE');
      loadSubcategories(selectedCategoryId);
    } catch (err) { alert(err.message); }
  });
}

// --- Users Module ---
async function loadUsers() {
  try {
    const users = await apiCall('/users');
    const tbody = document.getElementById('users-table-body');
    tbody.innerHTML = users.map(u => {
      const initials = u.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
      const roleClass = u.role.toLowerCase() === 'admin' ? 'admin' : 'employee';
      const roleName = u.role.toLowerCase() === 'admin' ? 'Administrador' : 'Operador';
      
      return `
        <tr>
          <td>
            <div class="user-cell">
              <div class="user-avatar-small">${initials}</div>
              <span>${u.name}</span>
            </div>
          </td>
          <td>${u.username}</td>
          <td><span class="badge-role ${roleClass}">${roleName}</span></td>
          <td>
             <div style="display: flex; gap: 0.5rem;">
               <button class="btn btn-icon btn-edit" title="Editar" onclick="window.openUserModal(${u.id})"><i class="fas fa-edit"></i></button>
               <button class="btn btn-icon text-danger btn-delete" title="Excluir" onclick="deleteUser(${u.id})"><i class="fas fa-trash-alt"></i></button>
             </div>
          </td>
        </tr>
      `;
    }).join('');
  } catch (err) { console.error(err); }
}

async function saveUser(e) {
  e.preventDefault();
  const id = document.getElementById('manage-user-id').value;
  const password = document.getElementById('manage-user-password').value;
  
  if (!id && !password) return alert('A senha é obrigatória para novos usuários.');
  if (password && password.length < 6) return alert('A senha deve ter pelo menos 6 caracteres.');

  const data = {
    name: document.getElementById('manage-user-name').value,
    username: document.getElementById('manage-user-username').value,
    role: document.getElementById('manage-user-role').value,
    password: password || undefined
  };

  try {
    const method = id ? 'PUT' : 'POST';
    const url = id ? `/users/${id}` : '/users';
    await apiCall(url, method, data);
    document.getElementById('user-modal').classList.add('hidden');
    loadUsers();
  } catch (err) { alert(err.message); }
}

async function deleteUser(id) {
  if (id === currentUser.id) return alert('Você não pode excluir seu próprio usuário.');
  window.customConfirm('Excluir usuário?', async () => {
    try {
      await apiCall(`/users/${id}`, 'DELETE');
      loadUsers();
    } catch (err) { alert(err.message); }
  });
}

// --- Reports Module ---
async function initReports() {
  try {
    const [users, clients, categories] = await Promise.all([
      apiCall('/users'),
      apiCall('/clients'),
      apiCall('/categories')
    ]);

    const fillSelect = (id, list, first) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.innerHTML = `<option value="">${first}</option>` + 
        list.map(x => `<option value="${x.id}">${x.name || x.username}</option>`).join('');
    };

    fillSelect('rep-operator', users, 'Todos');
    fillSelect('rep-client', clients, 'Todos');
    fillSelect('rep-category', categories, 'Todas');
  } catch (err) { console.error(err); }
}

async function loadReportData(e) {
  if (e) e.preventDefault();
  
  const filters = {
    startDate: document.getElementById('rep-date-start').value,
    endDate: document.getElementById('rep-date-end').value,
    finalizerId: document.getElementById('rep-operator').value,
    clientId: document.getElementById('rep-client').value,
    categoryId: document.getElementById('rep-category').value
  };

  const qs = Object.entries(filters)
    .filter(([_, v]) => v)
    .map(([k, v]) => `${k}=${v}`)
    .join('&');

  try {
    const tickets = await apiCall('/tickets' + (qs ? '?' + qs : ''));
    lastReportTickets = tickets;
    renderReportTable(tickets);
    renderReportStats(tickets);
    
    const chartsView = document.getElementById('report-charts-view');
    const statsContainer = document.getElementById('report-stats-container');
    
    if (tickets.length > 0) {
      if (statsContainer) statsContainer.style.display = 'grid';
      if (chartsView) chartsView.classList.remove('hidden');
      renderCharts(tickets);
    } else {
      if (statsContainer) statsContainer.style.display = 'none';
      if (chartsView) chartsView.classList.add('hidden');
    }
  } catch (err) { console.error(err); }
}

function renderReportTable(tickets) {
  const tbody = document.querySelector('#reports-table tbody');
  tbody.innerHTML = tickets.map(t => `
    <tr>
      <td>#${t.id}</td>
      <td>${t.title} <br><small class="text-secondary">${t.category?.name || ''}</small></td>
      <td>${t.client?.name || 'N/A'}</td>
      <td>${t.user?.name || '-'}</td>
      <td>${t.finalizer?.name || '-'}</td>
      <td><span class="badge ${t.status}">${translateStatus(t.status)}</span></td>
      <td>${new Date(t.createdAt).toLocaleDateString()}</td>
    </tr>
  `).join('');
}

function renderReportStats(tickets) {
  const total = tickets.length;
  const closed = tickets.filter(t => t.status === 'closed').length;
  
  const elTotal = document.getElementById('rep-stat-total');
  const elClosed = document.getElementById('rep-stat-closed');
  const elOpen = document.getElementById('rep-stat-open');

  if (elTotal) elTotal.innerText = total;
  if (elClosed) elClosed.innerText = closed;
  if (elOpen) elOpen.innerText = total - closed;
}

function switchReportView(view) {
  document.querySelectorAll('.report-tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.reportView === view);
  });
  document.querySelectorAll('.report-view').forEach(el => el.classList.add('hidden'));
  document.getElementById(`report-${view}-view`).classList.remove('hidden');

  if (view === 'charts') renderCharts(lastReportTickets);
}

function renderCharts(tickets) {
  if (!tickets || tickets.length === 0) return;

  const total = tickets.length;
  const opMap = {};
  const cliMap = {};
  const catMap = {};

  tickets.forEach(t => {
    const op = t.finalizer?.name || 'Não finalizado';
    const cli = t.client?.name || 'N/A';
    const cat = t.category?.name || 'Sem categoria';
    opMap[op] = (opMap[op] || 0) + 1;
    cliMap[cli] = (cliMap[cli] || 0) + 1;
    catMap[cat] = (catMap[cat] || 0) + 1;
  });

  if (operatorChart) operatorChart.destroy();
  if (clientChart) clientChart.destroy();
  if (categoryChart) categoryChart.destroy();

  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  operatorChart = new Chart(document.getElementById('chart-operators').getContext('2d'), {
    type: 'bar',
    data: {
      labels: Object.keys(opMap),
      datasets: [{ label: 'Finalizados', data: Object.values(opMap), backgroundColor: '#3b82f6', borderRadius: 4 }]
    },
    options: { responsive: true, maintainAspectRatio: false, animation: false, plugins: { legend: { display: false } } }
  });

  clientChart = new Chart(document.getElementById('chart-clients').getContext('2d'), {
    type: 'pie',
    data: {
      labels: Object.keys(cliMap),
      datasets: [{ data: Object.values(cliMap), backgroundColor: colors }]
    },
    options: { responsive: true, maintainAspectRatio: false, animation: false, plugins: { legend: { position: 'bottom' } } }
  });

  categoryChart = new Chart(document.getElementById('chart-categories').getContext('2d'), {
    type: 'doughnut',
    data: {
      labels: Object.keys(catMap),
      datasets: [{ data: Object.values(catMap), backgroundColor: colors }]
    },
    options: { responsive: true, maintainAspectRatio: false, animation: false, plugins: { legend: { position: 'bottom' } } }
  });
}

// --- PDF Generation ---
function generatePDF() {
  if (!lastReportTickets.length) return alert('Filtre os dados primeiro.');
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  
  doc.setFontSize(18);
  doc.text('Relatório de Chamados', 14, 20);
  doc.setFontSize(10);
  doc.text(`Gerado em: ${new Date().toLocaleString()}`, 14, 28);

  const head = [["ID", "Título", "Cliente", "Criador", "Finalizador", "Status", "Data"]];
  const body = lastReportTickets.map(t => [
    `#${t.id}`, t.title, t.client?.name || '-', t.user?.name || '-', t.finalizer?.name || '-', translateStatus(t.status), new Date(t.createdAt).toLocaleDateString()
  ]);

  doc.autoTable({ head, body, startY: 35, theme: 'grid', headStyles: { fillColor: [59, 130, 246] } });
  doc.save('relatorio_chamados.pdf');
}

function generateChartsPDF() {
  if (!lastReportTickets.length) return alert('Filtre os dados primeiro.');
  document.getElementById('chart-export-modal').classList.remove('hidden');
}

async function executeSelectivePDF() {
  const options = {
    ops: document.getElementById('chk-op-perf').checked,
    cli: document.getElementById('chk-cli-vol').checked,
    cat: document.getElementById('chk-cat-dist').checked,
    table: document.getElementById('chk-stats-table').checked
  };

  document.getElementById('chart-export-modal').classList.add('hidden');
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  let y = 20;

  doc.setFontSize(20);
  doc.text('Relatório Analítico', 14, y);
  y += 10;
  doc.setFontSize(10);
  doc.text(`Data: ${new Date().toLocaleDateString()} | Registros: ${lastReportTickets.length}`, 14, y);
  y += 15;

  const addChart = (id, title) => {
    const canvas = document.getElementById(id);
    const imgData = canvas.toDataURL('image/png');
    doc.setFontSize(14);
    doc.text(title, 14, y);
    doc.addImage(imgData, 'PNG', 14, y + 5, 180, 80);
    y += 95;
    if (y > 230) { doc.addPage(); y = 20; }
  };

  if (options.ops) addChart('chart-operators', 'Desempenho por Operador');
  if (options.cli) addChart('chart-clients', 'Volume por Cliente');
  if (options.cat) addChart('chart-categories', 'Distribuição por Categoria');

  if (options.table) {
    if (y > 200) { doc.addPage(); y = 20; }
    doc.setFontSize(14);
    doc.text('Tabela de Resumo', 14, y);
    const catMap = {};
    lastReportTickets.forEach(t => {
      const n = t.category?.name || 'Sem cat.';
      catMap[n] = (catMap[n] || 0) + 1;
    });
    const body = Object.entries(catMap).map(([k, v]) => [k, v, ((v/lastReportTickets.length)*100).toFixed(1) + '%']);
    doc.autoTable({ head: [["Categoria", "Total", "%"]], body, startY: y + 5, theme: 'grid' });
  }

  doc.save('relatorio_visual.pdf');
}

// --- Helpers ---
function translateStatus(s) {
  const m = { open: 'Aberto', in_progress: 'Andamento', closed: 'Concluido' };
  return m[s] || s;
}

async function loadClientOptions() {
  const clients = await apiCall('/clients');
  const s = document.getElementById('ticket-client');
  s.innerHTML = '<option value="">Selecione...</option>' + clients.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
}

async function loadCategoryOptions() {
  const cats = await apiCall('/categories');
  const s = document.getElementById('ticket-category');
  s.innerHTML = '<option value="">Selecione...</option>' + cats.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
}

async function loadSubcategoryOptions(catId) {
  const s = document.getElementById('ticket-subcategory');
  if (!catId) { s.disabled = true; return; }
  const cats = await apiCall('/categories');
  const cat = cats.find(c => c.id == catId);
  s.disabled = false;
  s.innerHTML = '<option value="">Selecione...</option>' + (cat.subcategories||[]).map(sc => `<option value="${sc.id}">${sc.name}</option>`).join('');
}

// Start
init();
