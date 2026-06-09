# 🔥 TopViral — Guía de configuración

Web de rankings virales con IA integrada, lista para monetizar con AdSense.

---

## 📁 Archivos incluidos

```
topviral/
├── index.html          → Página principal
├── style.css           → Todos los estilos
├── app.js              → Lógica + integración IA
├── privacidad.html     → Página de privacidad (obligatoria para AdSense)
├── sobre-nosotros.html → Página "About" (obligatoria para AdSense)
└── README.md           → Esta guía
```

---

## 🚀 Pasos para publicar

### 1. Subir a hosting
Sube todos los archivos a tu hosting. Recomendados (gratuitos):
- **Vercel** → vercel.com (deploy con drag & drop)
- **Netlify** → netlify.com (arrastra la carpeta)
- **GitHub Pages** → gratis con repositorio público

### 2. Configurar la API de IA (generador de rankings)
Edita `app.js` y sustituye `YOUR_API_KEY`:

```javascript
const CONFIG = {
  API_KEY: 'sk-ant-api03-XXXXXXXXXX',  // ← Tu key aquí
  ...
};
```

Obtén tu API key en: https://console.anthropic.com

⚠️ **IMPORTANTE para producción:** No expongas la API key en el frontend.
Crea un backend sencillo (Vercel Functions, Netlify Functions o un servidor Node.js)
que reciba el tema y haga la llamada a la API. Así proteges tu clave.

### 3. Activar Google AdSense
1. Crea cuenta en: https://adsense.google.com
2. Verifica la propiedad de tu dominio
3. Espera aprobación (1-14 días)
4. En `index.html`, descomenta y añade tu Publisher ID:

```html
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXX" crossorigin="anonymous"></script>
```

5. Sustituye cada bloque `<div class="ad-placeholder">` por la etiqueta `<ins>` de AdSense.

---

## 💡 Cómo generar tráfico

### SEO (gratis, sostenible)
- Crea un ranking nuevo cada día con títulos tipo:
  - "Top 10 [tema] de [año]"
  - "Los mejores [X] de la historia"
  - "Ranking de [tema]: ¿cuál es el número 1?"
- Usa el generador IA del sitio para crearlos rápido
- Añade las páginas al sitemap y regístralo en Google Search Console

### Redes sociales (viralización)
- Comparte cada ranking en TikTok como vídeo rápido (lista visual)
- Instagram Stories con la pregunta del ranking
- Twitter/X con encuesta basada en el ranking

### Temáticas con más tráfico orgánico
- Traspasos de fútbol, goleadores, Champions League
- Series y películas (justo al salir temporadas nuevas)
- Rankings anuales (mejores ciudades, países más ricos, etc.)
- Curiosidades virales ("el país más X del mundo")

---

## 🛠️ Personalización

- **Colores:** Edita las variables CSS en `:root` en `style.css`
- **Logo:** Cambia "TOPVIRAL" en `index.html` (busca `.logo`)
- **Rankings iniciales:** Edita los `.card` en `index.html`
- **Categorías:** Modifica las opciones en `#aiCategory` en `index.html`

---

## 📈 Monetización estimada

Con 5.000 visitas/día y 3 páginas vistas por visita:
- **RPM AdSense en español:** ~1,5€ - 3€ por 1.000 páginas vistas
- **Estimación mensual:** 675€ - 1.350€/mes

Con 50.000 visitas/día: 6.750€ - 13.500€/mes

---

¿Tienes dudas? El código está comentado para que puedas modificarlo fácilmente.
