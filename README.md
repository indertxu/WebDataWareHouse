# Next Data · web

Web de producto de **Next Data** (data warehouse financiero de Next Finance), con la estética de Next Reporting.

## Arrancar en local

```bash
npm install
npm run dev
```

Se abre en http://localhost:5173

## Publicar

```bash
npm run build      # genera /dist (estático)
npm run preview    # para comprobar el build
```

`/dist` se puede subir tal cual a Vercel, Netlify, Cloudflare Pages, Firebase Hosting o un bucket con CDN.

## Dónde está cada cosa

- `src/content/es.js` y `src/content/en.js` — **todo el texto** de la web (ES por defecto, botón ES/EN en la barra).
- `src/styles/tokens.css` — colores, radios, sombras y tema oscuro (guía de estilo de Next).
- `src/styles/app.css` — estilos de cada sección.
- `src/components/FlowDiagram.jsx` — el diagrama animado del hero (ERPs → bronze → silver → gold → destinos).
- `src/components/Layers.jsx` — la sección fija al scroll donde un mismo apunte cambia capa a capa.
- `src/components/Showcase.jsx` — el panel de producto de escaparate (datos inventados, animado).
- `src/components/Backdrop.jsx` — fondo animado (rejilla, halos, haces de luz y foco que sigue al ratón).

## Pendiente antes de publicar

- El formulario de demo (`Cta` en `src/components/Sections.jsx`) solo muestra la confirmación: conectar al CRM o a un endpoint.
- Revisar la lista de ERPs "En el catálogo" en `src/content/*.js`.
- Enlaces de Privacidad y Aviso legal del pie.
