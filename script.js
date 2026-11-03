document.addEventListener('DOMContentLoaded', () => {
    // 1. Inicialización de datos por defecto en localStorage
    if (!localStorage.getItem('users')) {
        const defaultUsers = [
            { name: "Super Administrador", address: "Oficina Central COPACI", email: "admin@copaci.com", password: "admin123", role: "admin" },
            { name: "Comité COPACI", address: "Sede Comunal", email: "copaci@copaci.com", password: "copaci123", role: "copaci" },
            { name: "Juan Pérez (Vecino)", address: "Calle Principal #123", email: "vecino@copaci.com", password: "123", role: "citizen" }
        ];
        localStorage.setItem('users', JSON.stringify(defaultUsers));
    }

    if (!localStorage.getItem('records')) {
        localStorage.setItem('records', JSON.stringify([]));
    }

    if (!localStorage.getItem('announcements')) {
        localStorage.setItem('announcements', JSON.stringify([
            { text: "Bienvenidos al Portal de Servicios Ciudadanos y Participación.", date: new Date().toLocaleDateString() }
        ]));
    }

    if (!localStorage.getItem('events')) {
        localStorage.setItem('events', JSON.stringify([
            { title: "Jornada de Limpieza Comunitaria", date: "2026-11-15", location: "Parque Central", desc: "Limpieza y reforestación de áreas verdes.", status: "Aprobado" }
        ]));
    }

    if (!localStorage.getItem('feedback')) {
        localStorage.setItem('feedback', JSON.stringify([]));
    }

    // Elementos del DOM
    const loginSection = document.getElementById('login-section');
    const signupSection = document.getElementById('signup-section');
    const dashboardSection = document.getElementById('dashboard-section');
    const userInfoBar = document.getElementById('user-info-bar');
    const activeUserName = document.getElementById('active-user-name');
    const activeUserRole = document.getElementById('active-user-role');
    const welcomeTitle = document.getElementById('welcome-title');
    const welcomeDescription = document.getElementById('welcome-description');

    // Navegación de autenticación
    document.getElementById('show-signup')?.addEventListener('click', (e) => {
        e.preventDefault();
        loginSection.classList.add('hidden');
        signupSection.classList.remove('hidden');
    });

    document.getElementById('show-login')?.addEventListener('click', (e) => {
        e.preventDefault();
        signupSection.classList.add('hidden');
        loginSection.classList.remove('hidden');
    });

    // Sign Up
    document.getElementById('signup-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('signup-name').value.trim();
        const address = document.getElementById('signup-address').value.trim();
        const email = document.getElementById('signup-email').value.trim().toLowerCase();
        const password = document.getElementById('signup-password').value;

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            alert('Por favor, ingrese un formato de correo electrónico válido.');
            return;
        }

        let users = JSON.parse(localStorage.getItem('users')) || [];
        if (users.some(u => u.email === email)) {
            alert('El correo electrónico ya está registrado.');
            return;
        }

        users.push({ name, address, email, password, role: 'citizen' });
        localStorage.setItem('users', JSON.stringify(users));
        alert('¡Registro exitoso! Ahora puede iniciar sesión.');

        document.getElementById('signup-form').reset();
        signupSection.classList.add('hidden');
        loginSection.classList.remove('hidden');
    });

    // Login
    document.getElementById('login-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value.trim().toLowerCase();
        const password = document.getElementById('login-password').value;

        let users = JSON.parse(localStorage.getItem('users')) || [];
        const user = users.find(u => u.email === email && u.password === password);

        if (!user) {
            alert('Credenciales incorrectas. Verifique su correo y contraseña.');
            return;
        }

        localStorage.setItem('currentUser', JSON.stringify(user));
        initApp(user);
    });

    // Cerrar sesión
    document.getElementById('btn-logout')?.addEventListener('click', () => {
        localStorage.removeItem('currentUser');
        dashboardSection.classList.add('hidden');
        userInfoBar.classList.add('hidden');
        loginSection.classList.remove('hidden');
        document.getElementById('login-form').reset();
    });

    // Comprobar sesión activa
    const activeUser = JSON.parse(localStorage.getItem('currentUser'));
    if (activeUser) {
        initApp(activeUser);
    }
});

// Inicialización de Interfaz
function initApp(user) {
    const loginSection = document.getElementById('login-section');
    const signupSection = document.getElementById('signup-section');
    const dashboardSection = document.getElementById('dashboard-section');
    const userInfoBar = document.getElementById('user-info-bar');
    const activeUserName = document.getElementById('active-user-name');
    const activeUserRole = document.getElementById('active-user-role');
    const welcomeTitle = document.getElementById('welcome-title');
    const welcomeDescription = document.getElementById('welcome-description');

    loginSection.classList.add('hidden');
    signupSection.classList.add('hidden');
    dashboardSection.classList.remove('hidden');
    userInfoBar.classList.remove('hidden');

    let roleText = "Ciudadano";
    let roleKey = "citizen";
    if (user.role === 'admin') {
        roleText = "Administrador";
        roleKey = "admin";
    } else if (user.role === 'copaci') {
        roleText = "COPACI";
        roleKey = "copaci";
    }

    activeUserName.innerHTML = `Usuario: <strong>${user.name}</strong>`;
    activeUserRole.textContent = roleText;
    welcomeTitle.textContent = `Panel de Gestión: ${user.name}`;
    welcomeDescription.textContent = `Acceso como ${roleText}. Gestione los trámites, servicios y reportes comunitarios.`;

    // Filtrar Módulos por Rol
    const moduleCards = document.querySelectorAll(".module-card");
    moduleCards.forEach(card => {
        const allowedRoles = card.getAttribute("data-role") || "";
        if (allowedRoles.includes(roleKey) || allowedRoles.includes(user.role)) {
            card.classList.remove("hidden");
        } else {
            card.classList.add("hidden");
        }
    });

    const citizenDash = document.getElementById('citizen-dashboard');
    const adminDash = document.getElementById('admin-dashboard');
    const mainAnnouncementsCard = document.getElementById('main-announcements-card');

    if (user.role === 'admin' || user.role === 'copaci') {
        citizenDash.classList.add('hidden');
        adminDash.classList.remove('hidden');
        if (mainAnnouncementsCard) mainAnnouncementsCard.classList.add('hidden');
        loadAdminTable();
    } else {
        adminDash.classList.add('hidden');
        citizenDash.classList.remove('hidden');
        if (mainAnnouncementsCard) mainAnnouncementsCard.classList.remove('hidden');
        loadAnnouncements(); // Carga de avisos para el Ciudadano
        loadUserHistory();
    }

    bindModuleButtons(user);
}

// Navegación de Vistas
const modulesGrid = document.getElementById('modules-grid');
const servicesContainer = document.getElementById('services-container');
const btnBackGrid = document.getElementById('btn-back-grid');

btnBackGrid?.addEventListener('click', () => {
    servicesContainer.classList.add('hidden');
    modulesGrid.classList.remove('hidden');
});

// Enlace de Funciones a los 11 Módulos
function bindModuleButtons(user) {
    const cards = document.querySelectorAll('.module-card');
    
    cards.forEach(card => {
        const title = card.querySelector('h3').textContent.trim();
        const btn = card.querySelector('button');

        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);

        newBtn.addEventListener('click', () => {
            switch(title) {
                case "Nuevos Registros":
                    gestionarNuevosRegistros();
                    break;
                case "Actualizar Registros":
                    actualizarRegistrosUsuarios();
                    break;
                case "Eliminar Registros":
                    eliminarRegistrosUsuarios();
                    break;
                case "Opiniones y Comentarios":
                    abrirOpinionesYComentarios(user);
                    break;
                case "Solicitud de Eventos":
                    abrirSolicitudEventos(user);
                    break;
                case "Avisos a la Comunidad":
                    abrirAvisosComunidad(user);
                    break;
                case "Informe Trimestral":
                    abrirInformeTrimestral();
                    break;
                case "Trámite de Documentos":
                    abrirSeccionServicios('tab-constancia');
                    break;
                case "Reportes Ciudadanos":
                    abrirSeccionServicios('tab-luminaria');
                    break;
                case "Visualización de Eventos":
                    abrirCarteleraEventos();
                    break;
                case "Membresía y Anuncios":
                    abrirEstatusMembresia(user);
                    break;
            }
        });
    });
}

function abrirSeccionServicios(tabTargetId) {
    modulesGrid.classList.add('hidden');
    servicesContainer.classList.remove('hidden');

    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

    const targetBtn = document.querySelector(`.tab-btn[data-target="${tabTargetId}"]`);
    const targetContent = document.getElementById(tabTargetId);

    if (targetBtn) targetBtn.classList.add('active');
    if (targetContent) targetContent.classList.add('active');
}

// 1. Nuevos Registros
function gestionarNuevosRegistros() {
    const name = prompt("Nombre completo del nuevo usuario:");
    if (!name) return;
    const email = prompt("Correo electrónico:");
    if (!email) return;
    const address = prompt("Dirección / Calle y Número:");
    if (!address) return;
    const pass = prompt("Contraseña asignada:");
    if (!pass) return;
    const role = prompt("Rol (admin / copaci / citizen):", "citizen");

    let users = JSON.parse(localStorage.getItem('users')) || [];
    users.push({ name, address, email: email.toLowerCase(), password: pass, role });
    localStorage.setItem('users', JSON.stringify(users));
    alert(`Usuario ${name} registrado con éxito.`);
}

// 2. Actualizar Registros
function actualizarRegistrosUsuarios() {
    let users = JSON.parse(localStorage.getItem('users')) || [];
    let list = users.map((u, i) => `${i + 1}. ${u.name} (${u.email}) - Rol: ${u.role}`).join('\n');
    const choice = prompt(`Seleccione el número de usuario a modificar:\n\n${list}`);
    const index = parseInt(choice) - 1;

    if (!isNaN(index) && users[index]) {
        users[index].name = prompt("Nuevo nombre:", users[index].name) || users[index].name;
        users[index].address = prompt("Nueva dirección:", users[index].address) || users[index].address;
        users[index].role = prompt("Nuevo rol (admin / copaci / citizen):", users[index].role) || users[index].role;

        localStorage.setItem('users', JSON.stringify(users));
        alert("Expediente de usuario actualizado.");
    }
}

// 3. Eliminar Registros
function eliminarRegistrosUsuarios() {
    let users = JSON.parse(localStorage.getItem('users')) || [];
    let list = users.map((u, i) => `${i + 1}. ${u.name} (${u.email})`).join('\n');
    const choice = prompt(`Seleccione el número de usuario a DAR DE BAJA:\n\n${list}`);
    const index = parseInt(choice) - 1;

    if (!isNaN(index) && users[index]) {
        if (confirm(`¿Está seguro de eliminar a ${users[index].name}?`)) {
            users.splice(index, 1);
            localStorage.setItem('users', JSON.stringify(users));
            alert("Usuario eliminado correctamente.");
        }
    }
}

// 4. Opiniones y Comentarios
function abrirOpinionesYComentarios(user) {
    let feedback = JSON.parse(localStorage.getItem('feedback')) || [];
    
    if (user.role === 'admin' || user.role === 'copaci') {
        if (feedback.length === 0) {
            alert("No hay comentarios u opiniones registradas por los ciudadanos.");
        } else {
            let msg = "OPINIONES Y COMENTARIOS RECIBIDOS:\n\n";
            feedback.forEach((f, i) => {
                msg += `${i + 1}. [${f.date}] ${f.user}: "${f.text}"\n`;
            });
            alert(msg);
        }
    } else {
        const opinion = prompt("Escriba su opinión, propuesta o sugerencia para la comunidad:");
        if (opinion) {
            feedback.push({ user: user.name, text: opinion, date: new Date().toLocaleDateString() });
            localStorage.setItem('feedback', JSON.stringify(feedback));
            alert("Su comentario ha sido enviado a la Mesa Directiva COPACI.");
        }
    }
}

// 5. Solicitud de Eventos
function abrirSolicitudEventos(user) {
    let events = JSON.parse(localStorage.getItem('events')) || [];

    if (user.role === 'admin' || user.role === 'copaci') {
        let msg = "SOLICITUDES DE EVENTOS REGISTRADAS:\n\n";
        events.forEach((ev, i) => {
            msg += `${i + 1}. ${ev.title} | Fecha: ${ev.date} | Lugar: ${ev.location} | Estatus: ${ev.status}\n`;
        });
        alert(msg);
    } else {
        const title = prompt("Nombre del Evento a realizar:");
        if (!title) return;
        const date = prompt("Fecha estimada (AAAA-MM-DD):");
        const location = prompt("Espacio comunitario requerido:");
        const desc = prompt("Descripción breve de la actividad:");

        events.push({ title, date, location, desc, applicant: user.name, status: "En Revisión" });
        localStorage.setItem('events', JSON.stringify(events));
        alert("Solicitud de evento enviada a revisión por la Mesa Directiva.");
    }
}

// 6. Avisos a la Comunidad (Publicación + Visualización)
function abrirAvisosComunidad(user) {
    if (user.role === 'admin' || user.role === 'copaci') {
        const text = prompt("Escriba el aviso oficial que se publicará a los vecinos:");
        if (text) {
            let announcements = JSON.parse(localStorage.getItem('announcements')) || [];
            announcements.push({ text, date: new Date().toLocaleDateString() });
            localStorage.setItem('announcements', JSON.stringify(announcements));
            alert("Aviso publicado en el portal.");
            loadAnnouncements();
        }
    } else {
        let announcements = JSON.parse(localStorage.getItem('announcements')) || [];
        let msg = "AVISOS OFICIALES COMUNITARIOS:\n\n";
        announcements.slice().reverse().forEach(a => {
            msg += `📌 ${a.text} (${a.date})\n-----------------------------------\n`;
        });
        alert(msg);
    }
}

// Renderizar Avisos en Pantalla
function loadAnnouncements() {
    const announcements = JSON.parse(localStorage.getItem('announcements')) || [];
    const container = document.getElementById('citizen-announcements');
    if (!container) return;

    container.innerHTML = '';
    if (announcements.length === 0) {
        container.innerHTML = '<p style="color: var(--text-secondary); font-size: 0.9rem;">No hay avisos comunitarios recientes.</p>';
        return;
    }

    announcements.slice().reverse().forEach(a => {
        const div = document.createElement('div');
        div.className = 'announcement-item';
        div.style.marginBottom = '8px';
        div.innerHTML = `<p style="margin:0;">📌 <strong>${a.text}</strong> <small style="color: var(--text-secondary);">(${a.date})</small></p>`;
        container.appendChild(div);
    });
}

// 7. Informe Trimestral
function abrirInformeTrimestral() {
    alert("INFORME TRIMESTRAL DE ACTIVIDADES Y RECURSOS (COPACI 2026)\n\n• Avance en Bacheo: 85% de vialidades atendidas.\n• Reparación de Luminarias: 120 puntos recuperados.\n• Eventos Comunitarios: 14 jornadas culturales ejecutadas.");
}

// 10. Visualización de Eventos (Cartelera)
function abrirCarteleraEventos() {
    let events = JSON.parse(localStorage.getItem('events')) || [];
    let list = "CARTELERA DE ACTIVIDADES COMUNITARIAS:\n\n";
    events.forEach(e => {
        list += `📅 ${e.date} - ${e.title}\n📍 Lugar: ${e.location}\nℹ️ ${e.desc}\n-----------------------------------\n`;
    });
    alert(list);
}

// 11. Membresía y Anuncios
function abrirEstatusMembresia(user) {
    alert(`ESTATUS DE MEMBRESÍA Y REGISTRO CIUDADANO\n\nTitular: ${user.name}\nDirección: ${user.address}\nEstatus de Cuenta: Activa\nDerecho a Voto y Participación: Vigente`);
}

// Pestañas Internas
const tabBtns = document.querySelectorAll('.tab-btn');
tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        tabBtns.forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        
        btn.classList.add('active');
        document.getElementById(btn.dataset.target).classList.add('active');

        if(btn.dataset.target === 'tab-historial') {
            loadUserHistory();
        }
    });
});

function saveRecord(recordData) {
    let records = JSON.parse(localStorage.getItem('records')) || [];
    records.push(recordData);
    localStorage.setItem('records', JSON.stringify(records));
}

// Formulario de Constancia
document.getElementById('constancia-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const user = JSON.parse(localStorage.getItem('currentUser'));
    const motivo = document.getElementById('constancia-motivo').value.trim();
    const folio = 'COPACI-RES-' + Math.floor(100000 + Math.random() * 900000);
    const fecha = new Date().toLocaleDateString();

    saveRecord({
        type: 'Constancia de Residencia',
        folio: folio,
        userEmail: user.email,
        citizen: user.name,
        details: `Motivo: ${motivo} | Dir: ${user.address}`,
        status: 'Pendiente',
        date: fecha
    });

    document.getElementById('doc-folio').textContent = folio;
    document.getElementById('doc-nombre').textContent = user.name;
    document.getElementById('doc-direccion').textContent = user.address;
    document.getElementById('doc-motivo').textContent = motivo;
    document.getElementById('doc-fecha').textContent = fecha;
    
    document.getElementById('documento-preview').classList.remove('hidden');
    alert(`Solicitud registrada. Folio: ${folio}`);
    document.getElementById('constancia-form').reset();
});

// Formulario de Luminaria
document.getElementById('luminaria-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const user = JSON.parse(localStorage.getItem('currentUser'));
    const calle = document.getElementById('lum-calle').value.trim();
    const entre = document.getElementById('lum-entre').value.trim();
    const desc = document.getElementById('lum-desc').value.trim();
    const folio = 'LUM-' + Math.floor(1000 + Math.random() * 9000);
    const fecha = new Date().toLocaleDateString();

    saveRecord({
        type: 'Reporte Luminaria',
        folio: folio,
        userEmail: user.email,
        citizen: user.name,
        details: `Calle: ${calle} (Entre: ${entre}) | Obs: ${desc}`,
        status: 'En Revisión',
        date: fecha
    });

    alert(`Reporte generado. Folio: ${folio}`);
    document.getElementById('luminaria-form').reset();
});

// Formulario de Bacheo
document.getElementById('bache-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const user = JSON.parse(localStorage.getItem('currentUser'));
    const dir = document.getElementById('bache-dir').value.trim();
    const gravedad = document.getElementById('bache-gravedad').value;
    const desc = document.getElementById('bache-desc').value.trim();
    const folio = 'BACH-' + Math.floor(1000 + Math.random() * 9000);
    const fecha = new Date().toLocaleDateString();

    saveRecord({
        type: 'Reporte Bacheo',
        folio: folio,
        userEmail: user.email,
        citizen: user.name,
        details: `Ubicación: ${dir} | Gravedad: ${gravedad} | Obs: ${desc}`,
        status: 'Registrado',
        date: fecha
    });

    alert(`Reporte registrado. Folio: ${folio}`);
    document.getElementById('bache-form').reset();
});

// Historial del usuario
function loadUserHistory() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    const records = JSON.parse(localStorage.getItem('records')) || [];
    const historyBody = document.getElementById('user-history-body');
    if (!historyBody) return;
    
    const userRecords = records.filter(r => r.userEmail === user.email);
    historyBody.innerHTML = '';

    if (userRecords.length === 0) {
        historyBody.innerHTML = `<tr><td colspan="4" style="text-align:center;">No ha realizado solicitudes aún.</td></tr>`;
        return;
    }

    userRecords.forEach(r => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${r.folio}</strong></td>
            <td>${r.type}</td>
            <td>${r.details}</td>
            <td><span class="badge">${r.status}</span></td>
        `;
        historyBody.appendChild(row);
    });
}

// Formulario de aviso desde el panel de admin
document.getElementById('announcement-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = document.getElementById('announcement-text').value.trim();
    let announcements = JSON.parse(localStorage.getItem('announcements')) || [];
    
    announcements.push({ text, date: new Date().toLocaleDateString() });
    localStorage.setItem('announcements', JSON.stringify(announcements));
    
    alert('Aviso publicado a la comunidad.');
    document.getElementById('announcement-text').value = '';
    loadAnnouncements();
});

// Cargar tabla administrativa
function loadAdminTable() {
    const tableBody = document.getElementById('admin-table-body');
    const filterTypeElement = document.getElementById('filter-type');
    if (!tableBody) return;

    const filterType = filterTypeElement ? filterTypeElement.value : 'ALL';
    let records = JSON.parse(localStorage.getItem('records')) || [];

    if (filterType !== 'ALL') {
        records = records.filter(r => r.type === filterType);
    }

    tableBody.innerHTML = '';

    if (records.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="6" style="text-align: center;">No hay registros disponibles.</td></tr>`;
        return;
    }

    records.forEach((rec) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${rec.type}</strong></td>
            <td>${rec.folio}</td>
            <td>${rec.citizen}</td>
            <td>${rec.details}</td>
            <td><span class="badge">${rec.status}</span></td>
            <td>
                <select onchange="updateStatus('${rec.folio}', this.value)" style="padding: 4px; border-radius: 4px;">
                    <option value="" disabled selected>Cambiar Estatus</option>
                    <option value="Pendiente">Pendiente</option>
                    <option value="En Proceso">En Proceso</option>
                    <option value="Resuelto">Resuelto</option>
                    <option value="Rechazado">Rechazado</option>
                </select>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

document.getElementById('filter-type')?.addEventListener('change', loadAdminTable);

// Actualizar estatus desde el rol COPACI/Admin
window.updateStatus = function(folio, newStatus) {
    let records = JSON.parse(localStorage.getItem('records')) || [];
    const recordIndex = records.findIndex(r => r.folio === folio);

    if (recordIndex !== -1) {
        records[recordIndex].status = newStatus;
        localStorage.setItem('records', JSON.stringify(records));
        alert(`El estatus del folio ${folio} fue actualizado a: ${newStatus}`);
        loadAdminTable();
    }
};