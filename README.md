# AlexanderCodec — Portafolio web

Sitio personal de Alexander: portafolio con MySocialVault, Proyecto Fibonacci, servicios de ingeniería y un minijuego (Alexander Games).

🌐 **Sitio:** https://alexandercodec.com

## Estructura

```
mi-pagina-web/
├── index.html      # Página principal (portafolio)
├── style.css       # Estilos del portafolio (modo claro/oscuro)
├── script.js       # Navegación, animaciones, tema y formulario de contacto
├── juego.html      # Página del minijuego
├── juego.js        # Lógica del juego (1 vs 1 y vs IA)
├── juego.scss      # Fuente de estilos del juego
├── juego.css       # CSS compilado desde juego.scss
└── images/         # Avatar e imagen del sitio
```

## Notas de desarrollo

- `juego.css` se genera desde `juego.scss`. Edita el `.scss` y vuelve a compilar.
- El formulario de contacto usa Formspree y Cloudflare Turnstile (la clave de Turnstile es pública por diseño).
- Es un sitio estático: no necesita build. Publica la carpeta `mi-pagina-web/` como directorio raíz.
