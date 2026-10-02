document.addEventListener('DOMContentLoaded', () => {

    // 1. Registro de Usuarios y Sus Permisos de Acceso
    const USERS = {
        'admin': {
            password: 'admin123',
            name: 'Super Administrador',
            role: 'Administrador',
            roleKey: 'admin'
        },
        'copaci': {
            password: 'copaci123',
            name: 'Representante COPACI',
            role: 'Copaci',
            roleKey: 'copaci'
        },
        'ciudadano': {
            password: 'ciudadano123',
            name: 'Ciudadano Vecino',
            role: 'Ciudadano',
            roleKey: 'ciudadano'
        }
    };

    // 2. Referencia a Elementos Del Dom
    const loginForm = document.getElementById('login-form');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');

    const loginSection = document.getElementById('login-section');
    const dashboardSection = document.getElementById('dashboard-section');
    const userInfoBar = document.getElementById('user-info-bar');

    const activeUserName = document.getElementById('active-user-name');
    const activeUserRole = document.getElementById('active-user-role');
    const welcomeTitle = document.getElementById('welcome-title');
    const welcomeDescription = document.getElementById('welcome-description');
    const btnLogout = document.getElementById('btn-logout');

    const moduleCards = document.querySelectorAll('.module-card');


    // 3. Evento de Validación e Inicio de Sesión
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const userInput = usernameInput.value.trim().toLowerCase();
        const passInput = passwordInput.value.trim();

        // Buscar el usuario registrado
        const user = USERS[userInput];

        if (user && user.password === passInput) {
            // Autenticación exitosa
            loginUser(user);
        } else {
            // Error en credenciales
            alert('❌ Usuario o contraseña incorrectos.\n\nPruebe con: admin, copaci o ciudadano.');
        }
    });

    // 4. Función para Cambiar de Pantalla y Cargar el Panel
    function loginUser(user) {
        // Limpiar formulario
        usernameInput.value = '';
        passwordInput.value = '';

        // Actualizar datos del usuario activo en la barra superior
        activeUserName.innerHTML = `Usuario: <strong>${user.name}</strong>`;
        activeUserRole.textContent = user.role;

        // Personalizar títulos del panel
        welcomeTitle.textContent = `Panel de Gestión: ${user.name}`;
        welcomeDescription.textContent = getRoleDescription(user.roleKey);

        // Ocultar pantalla de inicio de sesión y mostrar el dashboard principal
        loginSection.classList.add('hidden');
        dashboardSection.classList.remove('hidden');
        userInfoBar.classList.remove('hidden');

        // Filtrar tarjetas/módulos según permisos de la imagen
        filterModulesByRole(user.roleKey);
    }

    // 5. Filtrado Dinámico Según Rol Registrado
    function filterModulesByRole(roleKey) {
        moduleCards.forEach(card => {
            const allowedRoles = card.getAttribute('data-role').split(' ');

            if (roleKey === 'admin') {
                // El administrador tiene acceso total
                card.style.display = 'flex';
            } else if (allowedRoles.includes(roleKey)) {
                // Muestra la opción si el rol del usuario actual tiene acceso
                card.style.display = 'flex';
            } else {
                // Oculta la opción si el usuario no tiene permisos
                card.style.display = 'none';
            }
        });
    }

    // 6. Eventos de Cierre de Sesión
    btnLogout.addEventListener('click', () => {
        if (confirm('¿Está seguro de que desea cerrar la sesión actual?')) {
            // Ocultar panel y volver a la pantalla de login
            dashboardSection.classList.add('hidden');
            userInfoBar.classList.add('hidden');
            loginSection.classList.remove('hidden');
        }
    });

    // 7. Mensajes Descriptivos Según el Tipo de Rol
    function getRoleDescription(roleKey) {
        switch (roleKey) {
            case 'admin':
                return 'Acceso total (11 módulos). Puede gestionar, modificar, agregar y eliminar información en el portal.';
            case 'copaci':
                return 'Panel de gestión comunitaria (8 módulos). Puede revisar solicitudes, opiniones, informes y avisos a la comunidad.';
            case 'ciudadano':
                return 'Portal del ciudadano (4 módulos). Puede realizar trámites, consultar la cartelera de eventos, enviar reportes y ver membresías.';
            default:
                return 'Seleccione una opción para continuar.';
        }
    }

});