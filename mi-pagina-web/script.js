document.addEventListener('DOMContentLoaded', () => {
    // 8. Light/Dark Mode Toggle (Moved up so 'body' is defined before binary animation)
    const themeToggle = document.getElementById('themeToggle');
    const body = document.body;
    const themeIcon = themeToggle?.querySelector('i');

    // Check for saved theme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        body.classList.add('light-mode');
        if (themeIcon) themeIcon.className = 'fas fa-sun';
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            body.classList.toggle('light-mode');
            const isLight = body.classList.contains('light-mode');

            // Update icon
            if (themeIcon) {
                themeIcon.className = isLight ? 'fas fa-sun' : 'fas fa-moon';
            }

            // Save preference
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

    reveals.forEach(reveal => {
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
    }

    // 5. Add a subtle mouse move effect to hero
    const hero = document.getElementById('hero');
    if (hero) {
        hero.addEventListener('mousemove', (e) => {
            const { clientX, clientY } = e;
            const xPos = (clientX / window.innerWidth - 0.5) * 20;
            const yPos = (clientY / window.innerHeight - 0.5) * 20;

            hero.style.backgroundPosition = `${50 + xPos}% ${50 + yPos}%`;
        });
    }

    // 6. Form Submission Handling (AJAX)
    const contactForm = document.getElementById('contactForm');
    const formStatus = document.getElementById('formStatus');

    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = contactForm.querySelector('.submit-btn');
            const originalBtnText = submitBtn.innerText;

            submitBtn.innerText = 'Enviando...';
            submitBtn.disabled = true;

            const formData = new FormData(contactForm);

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

            ctx.fillStyle = '#00ff41'; // Matrix Green
            ctx.font = `${fontSize}px monospace`;

            for (let i = 0; i < drops.length; i++) {
                const text = binaryChars.charAt(Math.floor(Math.random() * binaryChars.length));
                const x = i * fontSize;
                const y = drops[i] * fontSize;

                // Randomly vary opacity for depth
                ctx.globalAlpha = Math.random() * 0.5 + 0.5;
                ctx.fillText(text, x, y);
                ctx.globalAlpha = 1.0;

                if (y > height && Math.random() > 0.975) {
                    drops[i] = 0;
                }

                drops[i]++;
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
});
