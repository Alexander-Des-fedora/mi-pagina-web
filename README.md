# AlexanderCodec — Portafolio web

Portafolio personal de **Alexander Vega Núñez**: desarrollador backend, bots de Telegram, automatización (RPA) e integraciones con IA, con un minijuego (Alexander Games). Esta web es el perfil individual; los servicios de software para empresas están en [VegaCodec](https://vegacodec.onrender.com/), su empresa.

🌐 **Sitio:** https://alexander-desarrollador.onrender.com

## Estructura

```
mi-pagina-web/
├── index.html      # Página principal (portafolio)
├── style.css       # Estilos del portafolio (modo claro/oscuro)
├── script.js       # Navegación, animaciones, tema y formulario de contacto
├── juego.html       # Página del minijuego
├── juego.js         # Lógica del juego (1 vs 1 y vs IA)
├── juego.css         # Estilos del juego
├── robots.txt         # Indicaciones para buscadores
├── sitemap.xml         # Mapa del sitio para Google
└── images/              # Avatar, ícono del sitio y og-image.png (1200×630, para compartir en redes)
```

## Notas de desarrollo

- El formulario de contacto envía los mensajes a [Formspree](https://formspree.io), que los reenvía al correo de Alexander. Lleva un campo trampa (`_gotcha`) y un widget de Cloudflare Turnstile (la clave de Turnstile es pública por diseño). Turnstile solo se comprueba en el navegador: para una protección real contra spam, activa el filtro de spam o reCAPTCHA en el panel de Formspree.
- Es un sitio estático: no necesita build. Publica la carpeta `mi-pagina-web/` como directorio raíz.
- El sitio incluye datos estructurados (JSON-LD) para que los buscadores asocien esta web con el nombre de Alexander y sus redes sociales.
- Los datos de la sección MySocialVault (líneas de código, redes soportadas, arquitectura) provienen del repositorio `SocialVault-Core`. Si el proyecto cambia, conviene actualizarlos en `index.html`.
- Cuando cambies contenido importante, actualiza también el `lastmod` de `sitemap.xml`.
