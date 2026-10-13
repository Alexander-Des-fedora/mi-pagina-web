document.addEventListener('DOMContentLoaded', () => {
    // 0. Loader Handle: Quitado a petición del usuario.
    // Animación de carga desactivada por completo.

    // 8. Light/Dark Mode Toggle
    const themeToggle = document.getElementById('themeToggle');
    const body = document.body;
    const themeIcon = themeToggle?.querySelector('i');

    // Sync icon with current theme (potentially set by inline script)
    const syncThemeIcon = () => {
        if (themeIcon) {
            themeIcon.className = body.classList.contains('light-mode') ? 'fas fa-sun' : 'fas fa-moon';
        }
    };
    
    syncThemeIcon();

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            body.classList.toggle('light-mode');
            const isLight = body.classList.contains('light-mode');
            syncThemeIcon();
            localStorage.setItem('theme', isLight ? 'light' : 'dark');
        });
    }

    // 1. Sticky Navbar
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // 2. Reveal Animations on Scroll
    const reveals = document.querySelectorAll('.reveal');
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    reveals.forEach((reveal, index) => {
        // Set a slight transition delay based on horizontal position or simple index if in same container
        const parent = reveal.parentElement;
        const siblings = Array.from(parent.querySelectorAll('.reveal'));
        const siblingIndex = siblings.indexOf(reveal);
        if (siblingIndex > 0) {
            reveal.style.transitionDelay = `${siblingIndex * 0.15}s`;
        }
        revealObserver.observe(reveal);
    });

    // 3. Smooth Scrolling for Navigation
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                window.scrollTo({
                    top: target.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });

    // 4. Mobile Menu Toggle
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.querySelector('.nav-links');

    if (navToggle && navLinks) {
        navToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            navToggle.classList.toggle('open');
        });

        // Close mobile menu when a link is clicked
        const links = navLinks.querySelectorAll('a');
        links.forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                navToggle.classList.remove('open');
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!navToggle.contains(e.target) && !navLinks.contains(e.target)) {
                navLinks.classList.remove('active');
                navToggle.classList.remove('open');
            }
        });
    }

    // 5. Add a subtle mouse move effect to hero
    const hero = document.getElementById('hero');
    const heroContent = hero?.querySelector('.hero-content');
    if (hero) {
        hero.addEventListener('mousemove', (e) => {
            const rect = hero.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            // 1. Update Spotlight CSS variables
            hero.style.setProperty('--mouse-x', `${x}px`);
            hero.style.setProperty('--mouse-y', `${y}px`);

            // 2. Parallax move for Hero Content (Mejorado más suave)
            const xPos = (e.clientX / window.innerWidth - 0.5) * 40;
            const yPos = (e.clientY / window.innerHeight - 0.5) * 40;
            if (heroContent) {
                heroContent.style.transform = `translate(${-xPos}px, ${-yPos}px) scale(1.02)`;
                heroContent.style.transition = 'transform 0.1s ease-out';
            }

            // 3. (Canvas reactivity handles mouse position separately)
            window.mousePos = { x, y };
        });
    }

    // 6. Form Submission Handling (AJAX)
    const contactForm = document.getElementById('contactForm');
    const formStatus = document.getElementById('formStatus');

    // List of common disposable/temporary email domains
    const disposableDomains = [
        'mailinator.com', '10minutemail.com', 'guerrillamail.com', 'tempmail.com',
        'dispostable.com', 'getnada.com', 'mail.tm', 'mail.gw', 'yopmail.com',
        'protonmail.ch', 'sharklasers.com', 'mailnesia.com', 'trashmail.com',
        '33mail.com', 'anonymousemail.me', 'fakeinbox.com', 'temp-mail.org'
    ];

    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = contactForm.querySelector('.submit-btn');
            const emailInput = contactForm.querySelector('input[name="email"]');
            const originalBtnText = submitBtn.innerText;

            const formData = new FormData(contactForm);
            const email = formData.get('email').toLowerCase();
            const domain = email.split('@')[1];
            const turnstileToken = formData.get('cf-turnstile-response');

            // Reset input state
            emailInput.classList.remove('invalid-input');

            // Validation logic (Identity & Humanity)
            if (!turnstileToken || disposableDomains.includes(domain)) {
                emailInput.classList.add('invalid-input');
                formStatus.innerHTML = '<div class="terminal-alert">FALLO DE AUTENTICACIÓN: Verifique su humanidad e identidad de correo.</div>';
                
                // Clear errors
                setTimeout(() => { 
                    formStatus.innerHTML = ''; 
                    emailInput.classList.remove('invalid-input');
                }, 5000);
                return;
            }

            submitBtn.innerText = 'AUTENTICANDO...';
            submitBtn.disabled = true;

            try {
                const response = await fetch(contactForm.action, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Accept': 'application/json'
                    }
                });

                if (response.ok) {
                    formStatus.innerHTML = '<p class="success-msg">¡Mensaje enviado con éxito!</p>';
                    contactForm.reset();
                } else {
                    const data = await response.json();
                    if (Object.hasOwn(data, 'errors')) {
                        formStatus.innerHTML = `<p class="error-msg">${data.errors.map(error => error.message).join(", ")}</p>`;
                    } else {
                        formStatus.innerHTML = '<p class="error-msg">Ups! Algo salió mal.</p>';
                    }
                }
            } catch (error) {
                formStatus.innerHTML = '<p class="error-msg">Hubo un error al enviar el formulario.</p>';
            } finally {
                submitBtn.innerText = originalBtnText;
                submitBtn.disabled = false;

                setTimeout(() => {
                    formStatus.innerHTML = '';
                }, 5000);
            }
        });
    }

    // 9. Telegram Link Fix for iOS/Safari
    // This addresses the "Safari cannot open the page because the address is invalid" issue
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

    document.querySelectorAll('.tg-link').forEach(link => {
        link.addEventListener('click', function (e) {
            if (isIOS) {
                // On iOS, we avoid target="_blank" and use location.assign
                // for better Universal Link handling in Safari.
                e.preventDefault();
                const url = this.getAttribute('href');
                window.location.assign(url);
            }
        });
    });
});

/*--------------------
Protección de HTML y Código
--------------------*/
document.addEventListener('contextmenu', e => {
    // Evita el clic derecho en todo el documento para que no puedan Inspeccionar o Guardar fácilmente
    e.preventDefault();
});

document.addEventListener('keydown', e => {
    // F12
    if(e.keyCode === 123) {
        e.preventDefault();
        return false;
    }
    // Ctrl+Shift+I (Herramientas de Desarrollador)
    if(e.ctrlKey && e.shiftKey && e.keyCode === 73) {
        e.preventDefault();
        return false;
    }
    // Ctrl+Shift+C (Inspect Element)
    if(e.ctrlKey && e.shiftKey && e.keyCode === 67) {
        e.preventDefault();
        return false;
    }
    // Ctrl+Shift+J (Consola)
    if(e.ctrlKey && e.shiftKey && e.keyCode === 74) {
        e.preventDefault();
        return false;
    }
    // Ctrl+U (Ver Código Fuente)
    if(e.ctrlKey && e.keyCode === 85) {
        e.preventDefault();
        return false;
    }
    // Ctrl+S (Guardar Página Web)
    if(e.ctrlKey && e.keyCode === 83) {
        e.preventDefault();
        return false;
    }
});

/*--------------------
Seguimiento del cursor (usado por los ojos del fantasma de contacto)
--------------------*/
let cursorMouse = { x: window.innerWidth / 2, y: window.innerHeight / 2, dir: '' };
const getMouse = (e) => {
    cursorMouse = {
        x: e.clientX || e.pageX || (e.touches && e.touches[0].pageX) || 0 || window.innerWidth / 2,
        y: e.clientY || e.pageY || (e.touches && e.touches[0].pageY) || 0 || window.innerHeight / 2,
        dir: (getMouse.x > e.clientX) ? 'left' : 'right'
    }
};
['mousemove', 'touchstart', 'touchmove'].forEach(e => {
    window.addEventListener(e, getMouse);
});


