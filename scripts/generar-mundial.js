// ===== TOPVIRAL — GENERADOR MUNDIAL 2026 =====
// Se ejecuta cada día a las 08:00 via GitHub Actions
// Genera rankings y datos curiosos del Mundial automáticamente

const https = require('https');
const fs = require('fs');
const path = require('path');

const API_KEY = process.env.OPENROUTER_KEY;
const HOY = new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
const HOY_SLUG = new Date().toISOString().slice(0, 10);

if (!API_KEY) {
  console.error('❌ Falta OPENROUTER_KEY en los secrets de GitHub');
  process.exit(1);
}

// ===== TEMAS QUE ROTA CADA DÍA =====
const TEMAS_MUNDIAL = [
  {
    tipo: 'goleadores',
    prompt: `Hoy es ${HOY}. Estamos en el Mundial 2026 (USA, México, Canadá). 
Crea un ranking actualizado de los TOP 8 GOLEADORES del Mundial 2026 con datos realistas y actualizados.
Incluye: nombre del jugador, selección, goles marcados, y un dato curioso de cada uno.`
  },
  {
    tipo: 'records',
    prompt: `Hoy es ${HOY}. Estamos en pleno Mundial 2026.
Genera un TOP 7 de RÉCORDS Y DATOS CURIOSOS del Mundial 2026 hasta hoy.
Pueden ser: récord de goles en un partido, porteros imbatidos, jugadores más rápidos, estadios más llenos, etc.
Hazlo sorprendente y viral.`
  },
  {
    tipo: 'selecciones',
    prompt: `Hoy es ${HOY}. Mundial 2026 en curso.
Crea un ranking de las TOP 8 SELECCIONES que mejor están jugando en este Mundial 2026.
Incluye: posición, selección, partidos ganados, goles a favor/en contra, y un análisis breve de su juego.`
  },
  {
    tipo: 'curiosidades',
    prompt: `Hoy es ${HOY}. Estamos viviendo el Mundial 2026.
Genera un TOP 10 de DATOS CURIOSÍSIMOS del Mundial 2026 que la gente no sabe.
Mezcla estadísticas, anécdotas, récords históricos comparados con este Mundial. 
Que sean datos que den ganas de compartir.`
  },
  {
    tipo: 'mejores-jugadas',
    prompt: `Hoy es ${HOY}. Mundial 2026 activo.
Crea un TOP 5 de los MEJORES MOMENTOS o JUGADAS del Mundial 2026 hasta hoy.
Describe cada momento de forma emocionante: goles épicos, paradas increíbles, jugadas colectivas.
Que quien lo lea sienta que se lo perdió si no lo vio.`
  }
];

// Elige el tema del día según el día del año
const diaDelAno = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
const temaHoy = TEMAS_MUNDIAL[diaDelAno % TEMAS_MUNDIAL.length];

// ===== LLAMADA A GEMINI =====
async function llamarGemini(prompt) {
  const promptCompleto = `${prompt}

Responde ÚNICAMENTE con JSON válido, sin texto adicional, sin markdown, sin backticks:
{
  "titulo": "Título viral y llamativo para redes sociales (máximo 65 caracteres, con emoji al inicio)",
  "subtitulo": "Una frase de gancho que genere curiosidad (máximo 100 caracteres)",
  "fecha": "${HOY}",
  "tipo": "${temaHoy.tipo}",
  "items": [
    {
      "posicion": 1,
      "nombre": "Nombre del elemento",
      "detalle": "Dato principal (número, estadística, etc.)",
      "descripcion": "Explicación interesante de máximo 120 caracteres"
    }
  ],
  "dato_extra": "Un dato sorprendente adicional para compartir en redes (máximo 140 caracteres)"
}`;

  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      model: model: 'openrouter/free',
      messages: [{ role: 'user', content: promptCompleto }],
      temperature: 0.9
    });

    const options = {
      hostname: 'openrouter.ai',
      path: '/api/v1/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + API_KEY,
        'Content-Length': Buffer.byteLength(body)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const texto = json.choices?.[0]?.message?.content || '';
          const clean = texto.replace(/```json|```/g, '').trim();
          resolve(JSON.parse(clean));
        } catch (e) {
          reject(new Error('Error parseando respuesta: ' + data.slice(0, 300)));
        }
      });
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// ===== GENERAR HTML DE LA CARD =====
function generarCard(ranking) {
  const medallas = ['🥇', '🥈', '🥉'];

  const itemsHTML = ranking.items.map((item, i) => `
        <div class="rank-item" data-pos="${item.posicion}">
          <div class="rank-num ${i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : ''}">${item.posicion}</div>
          <div class="rank-body">
            <div class="rank-name">${i < 3 ? medallas[i] + ' ' : ''}${item.nombre} ${item.detalle ? `<span class="rank-from">${item.detalle}</span>` : ''}</div>
            <div class="rank-meta">${item.descripcion}</div>
          </div>
        </div>`).join('');

  return `
    <!-- MUNDIAL ${HOY_SLUG} — ${ranking.tipo} -->
    <div class="card card-hero mundial-card" id="mundial-${HOY_SLUG}-${ranking.tipo}">
      <div class="card-eyebrow">
        <span class="badge badge-fire">⚽ Mundial 2026</span>
        <span class="badge badge-cat">🗓 ${new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}</span>
        <span class="ai-tag">✨ Actualizado hoy</span>
      </div>
      <h2 class="card-title">${ranking.titulo}</h2>
      <p class="card-desc">${ranking.subtitulo}</p>
      <div class="ranking" id="ranking-${HOY_SLUG}-${ranking.tipo}">
        ${itemsHTML}
      </div>
      ${ranking.dato_extra ? `<div class="card-desc" style="margin-top:8px;padding:8px 18px;background:#FFF3E0;border-left:3px solid #FF6F00;font-size:13px">💡 <strong>Sabías que:</strong> ${ranking.dato_extra}</div>` : ''}
      <div class="card-footer">
        <div class="card-stats">
          <span>⚽ Mundial 2026</span>
          <span>📅 ${HOY}</span>
        </div>
        <div class="card-actions">
          <button class="btn-like" onclick="toggleLike(this)">❤️ <span>0</span></button>
          <button class="btn-share" onclick="shareCard(this)">📤 Compartir</button>
        </div>
      </div>
    </div>`;
}

// ===== INSERTAR EN INDEX.HTML =====
function insertarEnIndex(cardHTML) {
  const indexPath = path.join(__dirname, '..', 'index.html');
  let html = fs.readFileSync(indexPath, 'utf8');

  // Busca el marcador donde insertar el contenido nuevo
  const marcador = '<!-- MUNDIAL_CONTENT_START -->';

  if (!html.includes(marcador)) {
    // Primera vez: añade el marcador justo después del hero card
    html = html.replace(
      '<!-- ADSENSE IN-FEED -->',
      `<!-- MUNDIAL_CONTENT_START -->\n    <!-- ADSENSE IN-FEED -->`
    );
  }

  // Insertar la nueva card justo después del marcador
  html = html.replace(
    marcador,
    `${marcador}\n${cardHTML}`
  );

  // Guardar máximo 7 cards de Mundial (eliminar las más antiguas)
  const cards = html.match(/<!-- MUNDIAL \d{4}-\d{2}-\d{2}[\s\S]*?<\/div>\n    <\/div>/g) || [];
  if (cards.length > 7) {
    // Eliminar la más antigua
    html = html.replace(cards[cards.length - 1], '');
  }

  fs.writeFileSync(indexPath, html, 'utf8');
  console.log('✅ index.html actualizado con nuevo contenido del Mundial');
}

// ===== GUARDAR LOG =====
function guardarLog(ranking) {
  const logDir = path.join(__dirname, '..', 'mundial-logs');
  if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);

  const logFile = path.join(logDir, `${HOY_SLUG}-${ranking.tipo}.json`);
  fs.writeFileSync(logFile, JSON.stringify(ranking, null, 2), 'utf8');
  console.log(`📁 Log guardado: ${logFile}`);
}

// ===== EJECUTAR =====
async function main() {
  console.log(`\n🌍 TopViral — Generando contenido del Mundial 2026`);
  console.log(`📅 Fecha: ${HOY}`);
  console.log(`📊 Tema de hoy: ${temaHoy.tipo}\n`);

  try {
    console.log('🤖 Consultando Gemini...');
    const ranking = await llamarGemini(temaHoy.prompt);

    console.log(`✅ Ranking generado: "${ranking.titulo}"`);
    console.log(`📋 ${ranking.items.length} items creados`);

    const cardHTML = generarCard(ranking);
    insertarEnIndex(cardHTML);
    guardarLog(ranking);

    console.log('\n🎉 ¡Contenido del Mundial publicado correctamente!');
    console.log('🌐 Vercel actualizará la web en menos de 1 minuto\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
