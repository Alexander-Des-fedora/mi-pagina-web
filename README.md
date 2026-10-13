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
└── images/              # Avatar e imagen del sitio
```

## Notas de desarrollo

- El formulario de contacto usa Formspree y Cloudflare Turnstile (la clave de Turnstile es pública por diseño).
- Es un sitio estático: no necesita build. Publica la carpeta `mi-pagina-web/` como directorio raíz.
- El sitio incluye datos estructurados (JSON-LD) para que los buscadores asocien esta web con el nombre de Alexander y sus redes sociales.
