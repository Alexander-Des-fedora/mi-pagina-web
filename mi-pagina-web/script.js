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

    // 7. Binary Animation Effect
    const canvas = document.getElementById('binaryCanvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');

        let width, height, columns;
        const fontSize = 16;
        let drops = [];

        const initCanvas = () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
            columns = Math.floor(width / fontSize);
            drops = new Array(columns).fill(1).map(() => Math.floor(Math.random() * -100));
        };

        initCanvas();

        const binaryChars = "01";

        const draw = () => {
            // Semi-transparent background to create trail effect
            ctx.fillStyle = body.classList.contains('light-mode') ? 'rgba(248, 250, 252, 0.1)' : 'rgba(2, 6, 23, 0.1)';
            ctx.fillRect(0, 0, width, height);

            ctx.font = `${fontSize}px monospace`;

            for (let i = 0; i < drops.length; i++) {
                const text = binaryChars.charAt(Math.floor(Math.random() * binaryChars.length));
                const x = i * fontSize;
                const y = drops[i] * fontSize;

                // Mouse proximity interactivity
                let isNearMouse = false;
                if (window.mousePos) {
                    const dx = x - window.mousePos.x;
                    const dy = y - window.mousePos.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    isNearMouse = distance < 150;
                }

                const isLight = body.classList.contains('light-mode');

                if (isNearMouse) {
                    // Colores profesionales y dinámicos cerca del mouse
                    // Modo claro: Negro intenso y verdes oscuros para que resalten
                    const colors = isLight ? ['#000000', '#059669', '#047857'] : ['#22d3ee', '#10b981', '#d946ef'];
                    ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
                    ctx.globalAlpha = 1.0;
                    ctx.shadowBlur = 15;
                    // El negro no brilla bien por defecto, ponemos un verde de aura
                    ctx.shadowColor = isLight ? 'rgba(5, 150, 105, 0.6)' : ctx.fillStyle;
                    ctx.font = `bold ${fontSize}px monospace`;
                } else {
                    // Cadenas de fondo
                    ctx.fillStyle = isLight ? (Math.random() > 0.5 ? '#000000' : '#059669') : 'rgba(16, 185, 129, 0.6)';
                    ctx.globalAlpha = isLight ? (Math.random() * 0.6 + 0.3) : (Math.random() * 0.5 + 0.1);
                    ctx.shadowBlur = 0;
                    ctx.font = `${fontSize}px monospace`;
                }

                ctx.fillText(text, x, y);

                if (y > height && Math.random() > 0.975) {
                    drops[i] = 0;
                }

                // Speed up slightly when near mouse
                drops[i] += isNearMouse ? 1.5 : 1;
            }
        };

        let animationFrame;
        const animate = () => {
            draw();
            animationFrame = setTimeout(() => requestAnimationFrame(animate), 50);
        };

        animate();

        window.addEventListener('resize', () => {
            clearTimeout(animationFrame);
            initCanvas();
            animate();
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
Ghost Cursor Follow (Reducido al 50%)
--------------------*/
let cursorMouse = { x: window.innerWidth / 2, y: window.innerHeight / 2, dir: '' };
let cursorClicked = false;
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
window.addEventListener('mousedown', (e) => {
    cursorClicked = true;
});
window.addEventListener('mouseup', () => {
    cursorClicked = false;
});

class GhostFollow {
    constructor() {
        this.el = document.querySelector('#ghost');
        this.mouth = document.querySelector('.ghost__mouth');
        this.eyes = document.querySelector('.ghost__eyes');
        this.pos = { x: 0, y: 0 };
    }

    follow() {
        if (!this.el || !this.eyes || !this.mouth) return;

        this.distX = cursorMouse.x - this.pos.x;
        this.distY = cursorMouse.y - this.pos.y;

        this.velX = this.distX / 8;
        this.velY = this.distY / 8;

        this.pos.x += this.distX / 10;
        this.pos.y += this.distY / 10;

        function map(num, in_min, in_max, out_min, out_max) {
            return (num - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
        }

        this.skewX = map(this.velX, 0, 100, 0, -50);
        this.scaleY = map(this.velY, 0, 100, 1, 2.0);
        this.scaleEyeX = map(Math.abs(this.velX), 0, 100, 1, 1.2);
        this.scaleEyeY = map(Math.abs(this.velX * 2), 0, 100, 1, 0.1);
        this.scaleMouth = Math.min(Math.max(map(Math.abs(this.velX * 1.5), 0, 100, 0, 10), map(Math.abs(this.velY * 1.2), 0, 100, 0, 5)), 2);

        if (cursorClicked) {
            this.scaleEyeY = .4;
            this.scaleMouth = -this.scaleMouth;
        }

        // AJUSTE CLAVE: Reducido a scale(.35) para que sea exactamente la mitad de tamaño
        this.el.style.transform = 'translate(' + this.pos.x + 'px, ' + this.pos.y + 'px) scale(.35) skew(' + this.skewX + 'deg) rotate(' + -this.skewX + 'deg) scaleY(' + this.scaleY + ')';
        this.eyes.style.transform = 'translateX(-50%) scale(' + this.scaleEyeX + ',' + this.scaleEyeY + ')';
        this.mouth.style.transform = 'translate(' + (-this.skewX * .5 - 10) + 'px) scale(' + this.scaleMouth + ')';
    }
}

const ghostCursor = new GhostFollow();
const renderGhost = () => {
    requestAnimationFrame(renderGhost);
    ghostCursor.follow();
}
// Solo iniciamos el render si el elemento existe en el HTML
if(document.querySelector('#ghost')){
    renderGhost();
}

/*--------------------
Contact Ghost Eyes Follow
--------------------*/
const cgEyes = document.querySelectorAll(".js-cg-eye");
const cgPupils = document.querySelectorAll(".js-cg-pupil");
const cgEyeRadius = 20;  // Mitad porque escalamos a 2px en vez de 4px
const cgMaxPupilDistance = 22; // Mitad

function rightBetweenTheEyes(eyes) {
  let offset = {x:0,y:0};
  let eye0Left =  eyes[0].getBoundingClientRect().left;
  let eye0Top =  eyes[0].getBoundingClientRect().top;
  let eye1Left =  eyes[1].getBoundingClientRect().left;
  let eye1Top =  eyes[1].getBoundingClientRect().top;

  offset.x = ((eye0Left + eye1Left) / 2) + cgEyeRadius;
  offset.y = ((eye0Top + eye1Top) / 2) + cgEyeRadius;
  return offset;
}

function moveCgEyes(event) {
  if(!cgEyes.length) return;
  
  // Usar las coordenadas unificadas de cursorMouse
  let xCoord = cursorMouse.x;
  let yCoord = cursorMouse.y;

  let offset = rightBetweenTheEyes(cgEyes);
  let x = (xCoord - offset.x) / window.innerWidth * 100;
  let y = (yCoord - offset.y) / window.innerHeight * 100;
  let pupilDistanceFromCenter = Math.sqrt(Math.pow(x,2) + Math.pow(y,2));

  if (pupilDistanceFromCenter >= cgMaxPupilDistance) {
    let angle = Math.atan2(x, y);
    // Para replicar la lógica original del código proporcionado:
    // La cuenta de su fórmula original era Math.atan(x/y)
    let originalAngle = Math.atan(x/y);
    let adjustedX = Math.sin(originalAngle) * cgMaxPupilDistance;
    let adjustedY = Math.cos(originalAngle) * cgMaxPupilDistance;

    if (y < 0) {
      x = adjustedX * -1;
      y = adjustedY * -1;
    } else {
      x = adjustedX;
      y = adjustedY;
    }
  }

  cgPupils.forEach(p => {
    p.style.left = (x + 50) + '%';
    p.style.top = (y + 50) + '%';
  })
}

// Escuchar el movimiento para mover los ojos
// Ya tenemos eventos mousemove, así que podemos engancharnos o usar requestAnimationFrame
const renderCgEyes = () => {
    requestAnimationFrame(renderCgEyes);
    // Usamos el evento de mouse global que ya existe
    moveCgEyes({ clientX: cursorMouse.x, clientY: cursorMouse.y });
}
if(cgEyes.length) {
    renderCgEyes();
}
