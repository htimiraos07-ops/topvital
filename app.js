// ===== TOPVIRAL — APP.JS =====
// Lógica principal + integración con OpenRouter (GRATIS, sin tarjeta)
// ============================================================
// CONFIGURACIÓN — IMPORTANTE:
// 1. Ve a https://openrouter.ai y crea cuenta (gratis)
// 2. Ve a Keys → Create Key → copia la clave (empieza por sk-or-)
// 3. Pégala abajo reemplazando YOUR_OPENROUTER_KEY
// ============================================================

const CONFIG = {
  // ⚠️ Reemplaza con tu API key de OpenRouter (gratis)
  API_KEY: 'YOUR_OPENROUTER_KEY',
  MODEL: 'google/gemini-2.0-flash-exp:free',  // Modelo gratis
};

// ===== GENERADOR IA =====
async function generateRanking() {
  const topic = document.getElementById('aiTopic').value.trim();
  const category = document.getElementById('aiCategory').value;
  const count = document.getElementById('aiCount').value;
  const btn = document.getElementById('btnGenerate');
  const result = document.getElementById('generatorResult');

  if (!topic) {
    showToast('✍️ Escribe un tema para el ranking');
    document.getElementById('aiTopic').focus();
    return;
  }

  // Estado de carga
  btn.disabled = true;
  btn.textContent = '⏳ Generando...';
  result.classList.remove('hidden');
  result.innerHTML = `
    <div class="loading-dots">
      <div class="dot"></div>
      <div class="dot"></div>
      <div class="dot"></div>
      <span style="margin-left:8px">La IA está creando tu ranking...</span>
    </div>`;

  const categoryLabels = {
    futbol: 'fútbol',
    entretenimiento: 'entretenimiento y cultura pop',
    tecnologia: 'tecnología e inteligencia artificial',
    viral: 'curiosidades virales y datos sorprendentes'
  };

  const prompt = `Crea un ranking viral de Top ${count} sobre: "${topic}" 
Categoría: ${categoryLabels[category]}

Responde ÚNICAMENTE con un JSON válido, sin texto adicional, sin markdown, sin backticks:
{
  "titulo": "Título atractivo y viral para el ranking (máximo 60 caracteres)",
  "items": [
    {
      "posicion": 1,
      "nombre": "Nombre del elemento",
      "descripcion": "Dato curioso o razón de la posición (máximo 80 caracteres)"
    }
  ]
}

Genera exactamente ${count} items ordenados del mejor al menos relevante. 
Haz el título llamativo, que genere curiosidad y ganas de hacer clic.
Incluye datos reales o estimaciones plausibles en las descripciones.`;

  try {
    // Llamada a OpenRouter (gratis)
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${CONFIG.API_KEY}`
      },
      body: JSON.stringify({
        model: CONFIG.MODEL,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.8
      })
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error?.message || `Error ${response.status}`);
    }

    const data = await response.json();
    const rawText = data.choices?.[0]?.message?.content;

    // Limpiar posibles backticks o prefijos
    const clean = rawText.replace(/```json|```/g, '').trim();
    const ranking = JSON.parse(clean);

    renderGeneratedRanking(ranking);
    showToast('✅ ¡Ranking generado con éxito!');

  } catch (error) {
    console.error('Error generando ranking:', error);

    // Si no hay API key configurada, mostrar demo
    if (CONFIG.API_KEY === 'YOUR_OPENROUTER_KEY') {
      renderDemoRanking(topic, count);
    } else {
      result.innerHTML = `
        <div style="text-align:center;padding:20px;color:#E8302A">
          <div style="font-size:24px;margin-bottom:8px">⚠️</div>
          <div style="font-weight:600;margin-bottom:4px">No se pudo generar el ranking</div>
          <div style="font-size:12px;color:#6B6B67">${error.message}</div>
          <button onclick="generateRanking()" style="margin-top:12px;padding:8px 16px;background:#E8302A;color:white;border:none;border-radius:8px;cursor:pointer;font-size:13px">Reintentar</button>
        </div>`;
    }
  } finally {
    btn.disabled = false;
    btn.textContent = '✨ Generar ranking ahora';
  }
}

function renderGeneratedRanking(ranking) {
  const result = document.getElementById('generatorResult');
  const medals = ['🥇', '🥈', '🥉'];

  let html = `<h3>${escapeHtml(ranking.titulo)}</h3>`;

  ranking.items.forEach((item, i) => {
    const medal = i < 3 ? `${medals[i]} ` : '';
    html += `
      <div class="gen-rank-item">
        <div class="gen-num">${item.posicion}</div>
        <div>
          <div class="gen-name">${medal}${escapeHtml(item.nombre)}</div>
          <div class="gen-desc">${escapeHtml(item.descripcion)}</div>
        </div>
      </div>`;
  });

  html += `
    <div style="margin-top:14px;display:flex;gap:8px;flex-wrap:wrap">
      <button class="btn-like" onclick="toggleLike(this)" style="font-size:12px">❤️ <span>0</span></button>
      <button class="btn-share" onclick="shareCard(this)" style="font-size:12px">📤 Compartir</button>
      <button onclick="generateRanking()" style="font-size:12px;padding:5px 12px;border:1px solid #7C3AED;border-radius:20px;background:transparent;color:#7C3AED;cursor:pointer">✨ Nuevo ranking</button>
    </div>`;

  result.innerHTML = html;
}

// Demo para cuando no hay API key
function renderDemoRanking(topic, count) {
  const result = document.getElementById('generatorResult');
  result.innerHTML = `
    <div style="background:#EDE7F6;border-radius:8px;padding:14px;margin-bottom:14px">
      <div style="font-size:12px;font-weight:600;color:#4527A0;margin-bottom:4px">⚙️ Modo demo — configura tu API key</div>
      <div style="font-size:12px;color:#7C3AED">Edita <code>app.js</code> y añade tu API key de <a href="https://console.anthropic.com" target="_blank" style="color:#4527A0">Anthropic Console</a></div>
    </div>
    <h3>Top ${count} sobre: ${escapeHtml(topic)}</h3>
    ${[...Array(parseInt(count))].map((_, i) => `
      <div class="gen-rank-item">
        <div class="gen-num">${i + 1}</div>
        <div>
          <div class="gen-name">${i === 0 ? '🥇 ' : i === 1 ? '🥈 ' : i === 2 ? '🥉 ' : ''}Elemento #${i + 1} del ranking</div>
          <div class="gen-desc">Aquí aparecerá el dato real generado por IA</div>
        </div>
      </div>`).join('')}
    <div style="margin-top:12px;font-size:12px;color:#6B6B67">Añade tu API key para ver rankings reales generados por IA</div>`;
}

// ===== VOTACIONES =====
function castVote(btn) {
  const container = document.getElementById('voteOptions');
  if (container.dataset.voted) return;

  container.dataset.voted = 'true';
  btn.classList.add('voted');

  // Animar los contadores
  const votes = parseInt(btn.dataset.votes) + 1;
  btn.dataset.votes = votes;

  const allBtns = container.querySelectorAll('.vote-btn');
  let total = 0;
  allBtns.forEach(b => total += parseInt(b.dataset.votes));

  allBtns.forEach(b => {
    const pct = Math.round((parseInt(b.dataset.votes) / total) * 100);
    b.querySelector('.vote-pct').textContent = pct + '%';
    b.querySelector('.vote-bar').style.width = pct + '%';
  });

  document.getElementById('voteTotalText').textContent =
    `${total.toLocaleString('es-ES')} votos · Actualizado en tiempo real`;

  showToast('✅ ¡Voto registrado! Gracias por participar');
}

// ===== LIKES =====
function toggleLike(btn) {
  const span = btn.querySelector('span');
  const current = parseLikeCount(span.textContent);
  btn.classList.toggle('liked');
  span.textContent = btn.classList.contains('liked')
    ? formatLikeCount(current + 1)
    : formatLikeCount(current - 1);
}

function parseLikeCount(str) {
  str = str.trim().replace(',', '.');
  if (str.includes('k')) return Math.round(parseFloat(str) * 1000);
  return parseInt(str) || 0;
}

function formatLikeCount(n) {
  if (n >= 1000) return (n / 1000).toFixed(1).replace('.', ',') + 'k';
  return n.toString();
}

// ===== COMPARTIR =====
let currentShareUrl = window.location.href;
let currentShareTitle = 'TopViral — Rankings que arrasan';

function shareCard(btn) {
  const card = btn.closest('.card');
  if (card) {
    const titleEl = card.querySelector('.card-title');
    if (titleEl) currentShareTitle = titleEl.textContent;
  }
  document.getElementById('modalOverlay').classList.add('open');
}

function closeModal() {
  document.getElementById('modalOverlay').classList.remove('open');
}

function shareWhatsApp() {
  const text = encodeURIComponent(`🔥 ${currentShareTitle}\n${currentShareUrl}`);
  window.open(`https://wa.me/?text=${text}`, '_blank');
  closeModal();
}

function shareTwitter() {
  const text = encodeURIComponent(`🔥 ${currentShareTitle} via @TopViral`);
  const url = encodeURIComponent(currentShareUrl);
  window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
  closeModal();
}

function shareTelegram() {
  const text = encodeURIComponent(`🔥 ${currentShareTitle}`);
  const url = encodeURIComponent(currentShareUrl);
  window.open(`https://t.me/share/url?url=${url}&text=${text}`, '_blank');
  closeModal();
}

function copyLink() {
  navigator.clipboard.writeText(currentShareUrl).then(() => {
    showToast('🔗 Enlace copiado al portapapeles');
    closeModal();
  });
}

// ===== NEWSLETTER =====
function subscribeNewsletter(e) {
  e.preventDefault();
  const input = e.target.querySelector('input');
  const email = input.value.trim();
  if (!email) return;
  showToast(`📩 ¡${email} suscrito correctamente!`);
  input.value = '';
  // Aquí integrar con Mailchimp, ConvertKit, etc.
}

// ===== NAVEGACIÓN POR CATEGORÍAS =====
document.addEventListener('DOMContentLoaded', () => {
  const links = document.querySelectorAll('.nav-link, .cat-pill');
  links.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
      if (link.classList.contains('nav-link')) {
        link.classList.add('active');
        document.querySelectorAll('.nav-link[data-cat="' + link.dataset.cat + '"]').forEach(l => l.classList.add('active'));
      }
      // Aquí puedes filtrar contenido por categoría
      showToast(`📂 Mostrando: ${link.textContent.trim()}`);
    });
  });

  // Botón generar en nav
  document.getElementById('generateBtn')?.addEventListener('click', () => {
    document.getElementById('aiGenerator').scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(() => document.getElementById('aiTopic').focus(), 500);
  });
  document.getElementById('generateBtnMobile')?.addEventListener('click', () => {
    document.getElementById('aiGenerator').scrollIntoView({ behavior: 'smooth', block: 'center' });
    document.getElementById('mobileMenu').classList.remove('open');
    setTimeout(() => document.getElementById('aiTopic').focus(), 500);
  });

  // Menú móvil
  document.getElementById('menuToggle')?.addEventListener('click', () => {
    document.getElementById('mobileMenu').classList.toggle('open');
  });

  // Ticker doble para loop suave
  const ticker = document.getElementById('ticker');
  if (ticker) {
    ticker.innerHTML = ticker.innerHTML + ticker.innerHTML;
  }

  // Enter en el input del generador
  document.getElementById('aiTopic')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') generateRanking();
  });

  // Inicializar AdSense si está disponible
  if (typeof adsbygoogle !== 'undefined') {
    try {
      (adsbygoogle = window.adsbygoogle || []).push({});
    } catch(e) {}
  }
});

// ===== TOAST =====
function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove('show'), 3000);
}

// ===== UTILIDADES =====
function escapeHtml(text) {
  const div = document.createElement('div');
  div.appendChild(document.createTextNode(text || ''));
  return div.innerHTML;
}

// ===== AUTO-REFRESH SIMULADO (para ranking en vivo) =====
// En producción: conectar a una base de datos real
setInterval(() => {
  const voteText = document.getElementById('voteTotalText');
  if (voteText && !document.getElementById('voteOptions').dataset.voted) {
    const base = 68100;
    const random = Math.floor(Math.random() * 5);
    voteText.textContent = `${(base + random).toLocaleString('es-ES')} votos · Actualizado en tiempo real`;
  }
}, 8000);
