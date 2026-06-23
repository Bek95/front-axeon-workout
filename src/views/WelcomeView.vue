<script setup>
import { ref, computed, onBeforeUnmount } from 'vue'

/* ---------- Données des profils d'entraînement ---------- */
const profiles = [
  {
    key: 'force',
    label: 'Force',
    color: '#FF5A36',
    duration: '60–75 min',
    title: 'Bloc force : développer la charge',
    description:
      'Séries basses, charges hautes, repos longs. La logique pure de la musculation pour faire grimper tes maxis.',
    cardText:
      'Squat, développé, soulevé de terre. Progression linéaire sur les mouvements de base, repos complets entre les séries.',
    icon: '<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="6" y="20" width="6" height="8" rx="1" fill="currentColor"/><rect x="36" y="20" width="6" height="8" rx="1" fill="currentColor"/><rect x="14" y="22" width="20" height="4" fill="currentColor"/></svg>',
    blocks: [
      { name: 'Squat back', detail: '5 × 5 @ 80%' },
      { name: 'Développé couché', detail: '5 × 5 @ 78%' },
      { name: 'Tirage horizontal', detail: '4 × 8' },
    ],
  },
  {
    key: 'hybride-force',
    label: 'Hybride — force',
    color: '#E8965A',
    duration: '50–60 min',
    title: 'Hybride à dominante force',
    description:
      'La base reste la charge lourde, mais un bloc métabolique court vient finir la séance pour le système cardio.',
    cardText:
      'Le tiers du temps en haute intensité, le reste en charge progressive. Pour qui veut soulever lourd sans perdre le souffle.',
    icon: '<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="6" y="20" width="6" height="8" rx="1" fill="currentColor"/><rect x="36" y="20" width="6" height="8" rx="1" fill="currentColor"/><rect x="14" y="22" width="20" height="4" fill="currentColor"/><circle cx="24" cy="10" r="3" fill="currentColor"/></svg>',
    blocks: [
      { name: 'Soulevé de terre', detail: '4 × 6 @ 75%' },
      { name: 'EMOM 10 min', detail: 'Kettlebell swings + burpees' },
      { name: 'Gainage', detail: '3 × 45 s' },
    ],
  },
  {
    key: 'hybride-cardio',
    label: 'Hybride — intensité',
    color: '#C2A368',
    duration: '40–50 min',
    title: 'Hybride à dominante intensité',
    description:
      'Le cœur de la séance est métabolique, mais deux mouvements lourds gardent le lien avec la force pure.',
    cardText:
      "Des enchaînements chronométrés, ponctués de charges techniques. L'intensité du CrossFit, sans renier la barre.",
    icon: '<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 36 18 20 26 28 40 10" stroke="currentColor" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/><circle cx="40" cy="10" r="3" fill="currentColor"/></svg>',
    blocks: [
      { name: 'AMRAP 12 min', detail: 'Wall-balls, rameur, fentes' },
      { name: 'Arraché', detail: '5 × 3 technique' },
      { name: 'Retour au calme', detail: '5 min respiration' },
    ],
  },
  {
    key: 'crossfit',
    label: 'Intensité / CrossFit',
    color: '#FFB23A',
    duration: '35–45 min',
    title: 'Bloc intensité : tout est chronométré',
    description:
      'WOD complet, mouvements variés, intensité maximale. La logique CrossFit dans toute sa fonctionnalité.',
    cardText:
      'AMRAP, EMOM, for time. Des mouvements gymniques, haltéro et cardio combinés contre la montre.',
    icon: '<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="24" cy="24" r="16" stroke="currentColor" stroke-width="3" fill="none"/><path d="M24 16v8l6 4" stroke="currentColor" stroke-width="3" stroke-linecap="round" fill="none"/></svg>',
    blocks: [
      { name: 'For time', detail: '21-15-9 thrusters / pull-ups' },
      { name: 'Skill', detail: 'Double-unders 10 min' },
      { name: 'Accessoire', detail: 'Core 3 × 12' },
    ],
  },
]

/* ---------- Logique du mixeur ---------- */
const mixValue = ref(1) // index dans profiles, 0 à 3
const mixPercent = computed(() => (mixValue.value / (profiles.length - 1)) * 100)
const activeProfile = computed(() => profiles[mixValue.value])

function setMix(index) {
  mixValue.value = Math.max(0, Math.min(profiles.length - 1, index))
}

function onKeydown(e) {
  if (e.key === 'ArrowRight' || e.key === 'ArrowUp') setMix(mixValue.value + 1)
  if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') setMix(mixValue.value - 1)
}

const railRef = ref(null)
let dragging = false

function valueFromClientX(clientX) {
  const rail = railRef.value
  if (!rail) return mixValue.value
  const rect = rail.getBoundingClientRect()
  const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
  return Math.round(ratio * (profiles.length - 1))
}

function onDragStart(e) {
  dragging = true
  setMix(valueFromClientX(e.clientX))
  window.addEventListener('pointermove', onDragMove)
  window.addEventListener('pointerup', onDragEnd)
}
function onDragMove(e) {
  if (!dragging) return
  setMix(valueFromClientX(e.clientX))
}
function onDragEnd() {
  dragging = false
  window.removeEventListener('pointermove', onDragMove)
  window.removeEventListener('pointerup', onDragEnd)
}

onBeforeUnmount(() => {
  window.removeEventListener('pointermove', onDragMove)
  window.removeEventListener('pointerup', onDragEnd)
})
</script>

<template>
<!--  <div class="page">-->
    <!-- Bruit de fond / grain -->
    <div class="grain" aria-hidden="true"></div>

    <!-- NAV -->
<!--    <header class="nav">-->
<!--      <div class="nav__brand">-->
<!--        <span class="nav__mark">FX</span>-->
<!--        <span class="nav__name">FORGE<span class="accent">X</span></span>-->
<!--      </div>-->
<!--      <nav class="nav__links">-->
<!--        <a href="#mix">Le mix</a>-->
<!--        <a href="#programmes">Programmes</a>-->
<!--        <a href="#methode">Méthode</a>-->
<!--        <a href="#methode">Créer son programmes</a>-->
<!--        <a href="#methode">Librairie d'exercices</a>-->
<!--      </nav>-->
<!--      <button class="btn btn&#45;&#45;ghost nav__cta">Se connecter</button>-->
<!--    </header>-->

    <!-- HERO -->
    <section class="hero">
      <div class="hero__plate" aria-hidden="true">
        <span>20</span><span>15</span><span>10</span><span>5</span>
      </div>

      <p class="eyebrow">Générateur de programmes&nbsp;— musculation × crossfit × fonctionnel</p>

      <h1 class="hero__title">
        Ton entraînement
        <span class="hero__title-line">n'a pas une seule case à cocher.</span>
      </h1>

      <p class="hero__lead">
        Force pure, intensité façon CrossFit, mouvements fonctionnels du quotidien —
        ou les trois en même temps. ForgeX génère ton programme à partir du curseur
        que toi seul peux régler.
      </p>

      <div class="hero__actions">
        <button class="btn btn--primary">Générer mon programme</button>
        <button class="btn btn--text">
          Voir un exemple <span aria-hidden="true">→</span>
        </button>
      </div>

      <!-- SIGNATURE : le mixeur de disciplines -->
      <div class="mixer" id="mix">
        <div class="mixer__head">
          <h2>Le mixeur</h2>
          <p>Déplace le curseur. Le programme se réécrit en direct.</p>
        </div>

        <div class="mixer__board">
          <div class="mixer__rail" ref="railRef" @pointerdown="onDragStart">
            <div class="mixer__track">
              <div
                class="mixer__fill"
                :style="{ width: mixPercent + '%' }"
              ></div>
            </div>
            <div
              class="mixer__handle"
              :style="{ left: mixPercent + '%' }"
              role="slider"
              :aria-valuenow="mixValue"
              aria-valuemin="0"
              aria-valuemax="3"
              :aria-valuetext="activeProfile.label"
              tabindex="0"
              @keydown="onKeydown"
            >
              <span class="mixer__handle-dot"></span>
            </div>
          </div>

          <ul class="mixer__labels">
            <li
              v-for="(p, i) in profiles"
              :key="p.key"
              :class="{ 'is-active': i === mixValue }"
              @click="setMix(i)"
            >
              <span class="mixer__labels-tick"></span>
              {{ p.label }}
            </li>
          </ul>
        </div>

        <!-- Carte programme générée dynamiquement -->
        <transition name="fade-slide" mode="out-in">
          <article class="result-card" :key="activeProfile.key">
            <div class="result-card__top">
              <span class="result-card__tag" :style="{ background: activeProfile.color }">
                {{ activeProfile.label }}
              </span>
              <span class="result-card__duration">{{ activeProfile.duration }}</span>
            </div>
            <h3>{{ activeProfile.title }}</h3>
            <p class="result-card__desc">{{ activeProfile.description }}</p>
            <ul class="result-card__blocks">
              <li v-for="block in activeProfile.blocks" :key="block.name">
                <span class="result-card__block-name">{{ block.name }}</span>
                <span class="result-card__block-detail">{{ block.detail }}</span>
              </li>
            </ul>
          </article>
        </transition>
      </div>
    </section>

    <!-- PROGRAMMES -->
    <section class="programmes" id="programmes">
      <p class="eyebrow eyebrow--center">Quatre logiques, une seule app</p>
      <h2 class="section-title">Choisis ta dominante, ou n'en choisis aucune</h2>

      <div class="cards">
        <article v-for="p in profiles" :key="p.key" class="card" :style="{ '--card-color': p.color }">
          <div class="card__icon" v-html="p.icon"></div>
          <h3>{{ p.label }}</h3>
          <p>{{ p.cardText }}</p>
        </article>
      </div>
    </section>

    <!-- METHODE -->
    <section class="methode" id="methode">
      <div class="methode__text">
        <p class="eyebrow">Comment ça marche</p>
        <h2 class="section-title">Trois réglages, zéro friction</h2>
        <ol class="steps">
          <li>
            <h4>Pose le curseur</h4>
            <p>Force, intensité ou fonctionnel — ou un mélange précis entre les trois.</p>
          </li>
          <li>
            <h4>Indique ton matériel</h4>
            <p>Barre, kettlebell, poids du corps : le programme s'adapte à ce que tu as sous la main.</p>
          </li>
          <li>
            <h4>Lance la séance</h4>
            <p>Charges, séries, temps de repos : tout est calculé, tu n'as qu'à pousser.</p>
          </li>
        </ol>
      </div>
      <div class="methode__visual" aria-hidden="true">
        <div class="bar-loader">
          <div class="bar-loader__plate" v-for="n in 6" :key="n"></div>
        </div>
      </div>
    </section>

    <!-- CTA FINAL -->
    <section class="final-cta">
      <h2>Ton prochain programme t'attend.</h2>
      <button class="btn btn--primary btn--lg">Générer mon programme</button>
    </section>

<!--    <footer class="footer">-->
<!--      <span>FORGE<span class="accent">X</span></span>-->
<!--      <span class="footer__copy">© 2026 — entraîne ce que tu décides d'être.</span>-->
<!--    </footer>-->
<!--  </div>-->
</template>

<style scoped>
/* ---------- Tokens ---------- */
.grain {
  position: fixed;
  inset: 0;
  pointer-events: none;
  opacity: 0.035;
  z-index: 1;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
}

.eyebrow {
  font-family: var(--font-display);
  text-transform: uppercase;
  letter-spacing: 0.14em;
  font-size: 0.78rem;
  color: var(--accent);
  font-weight: 500;
}
.eyebrow--center { text-align: center; }

.section-title {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: clamp(1.8rem, 3.2vw, 2.6rem);
  letter-spacing: -0.01em;
  margin: 0.4rem 0 0;
  color: var(--paper);
}

/* ---------- Boutons ---------- */
.btn {
  font-family: var(--font-body);
  font-weight: 600;
  font-size: 0.95rem;
  padding: 0.78rem 1.5rem;
  border-radius: 4px;
  border: 1px solid transparent;
  cursor: pointer;
  transition: transform 0.15s ease, background 0.2s ease, border-color 0.2s ease;
}
.btn:active { transform: scale(0.97); }
.btn--primary {
  background: var(--accent);
  color: var(--ink);
}
.btn--primary:hover { background: #ff6f4f; }
.btn--ghost {
  background: transparent;
  border-color: var(--panel-line);
  color: var(--paper);
}
.btn--ghost:hover { border-color: var(--paper-dim); }
.btn--text {
  background: transparent;
  color: var(--paper);
  padding: 0.78rem 0.4rem;
}
.btn--text:hover { color: var(--accent); }
.btn--lg { padding: 1rem 2.2rem; font-size: 1.05rem; }



/* ---------- Hero ---------- */
.hero {
  position: relative;
  z-index: 2;
  max-width: 880px;
  margin: 0 auto;
  padding: 3.5rem clamp(1.25rem, 5vw, 2rem) 2rem;
  text-align: left;
}

.hero__plate {
  position: absolute;
  top: 0;
  right: clamp(0rem, 5vw, 2rem);
  display: flex;
  gap: 0.5rem;
  opacity: 0.5;
}
.hero__plate span {
  font-family: var(--font-display);
  font-size: 0.75rem;
  color: var(--paper-dim);
  border: 1px solid var(--panel-line);
  border-radius: 50%;
  width: 28px;
  height: 28px;
  display: grid;
  place-items: center;
}
@media (max-width: 640px) { .hero__plate { display: none; } }

.hero__title {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: clamp(2.4rem, 6vw, 4rem);
  line-height: 1.05;
  letter-spacing: -0.01em;
  margin: 1rem 0 0;
  color: var(--paper);
}
.hero__title-line { color: var(--paper-dim); }

.hero__lead {
  font-size: 1.08rem;
  color: var(--paper-dim);
  max-width: 540px;
  margin: 1.25rem 0 0;
}

.hero__actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 1.75rem 0 0;
  flex-wrap: wrap;
}

/* ---------- Mixeur (signature) ---------- */
.mixer {
  margin-top: 4rem;
  background: var(--panel);
  border: 1px solid var(--panel-line);
  border-radius: 10px;
  padding: clamp(1.5rem, 4vw, 2.5rem);
}
.mixer__head h2 {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 1.4rem;
  margin: 0;
  color: var(--paper);
}
.mixer__head p {
  margin: 0.3rem 0 0;
  color: var(--paper-dim);
  font-size: 0.92rem;
}

.mixer__board { margin-top: 2rem; }

.mixer__rail {
  position: relative;
  height: 44px;
  display: flex;
  align-items: center;
  cursor: pointer;
  touch-action: none;
}
.mixer__track {
  position: relative;
  width: 100%;
  height: 4px;
  background: var(--panel-line);
  border-radius: 2px;
  overflow: hidden;
}
.mixer__fill {
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, var(--accent), #ffb23a);
  transition: width 0.25s ease;
}
.mixer__handle {
  position: absolute;
  top: 50%;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: var(--ink);
  border: 3px solid var(--accent);
  transform: translate(-50%, -50%);
  transition: left 0.25s ease;
  display: grid;
  place-items: center;
}
.mixer__handle-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--accent);
}

.mixer__labels {
  display: flex;
  justify-content: space-between;
  list-style: none;
  margin: 0.75rem 0 0;
  padding: 0;
}
.mixer__labels li {
  font-size: 0.82rem;
  color: var(--paper-dim);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.4rem;
  flex: 1;
  transition: color 0.2s ease;
}
.mixer__labels li:first-child { align-items: flex-start; }
.mixer__labels li:last-child { align-items: flex-end; }
.mixer__labels-tick {
  width: 1px;
  height: 8px;
  background: var(--panel-line);
}
.mixer__labels li.is-active {
  color: var(--paper);
  font-weight: 600;
}
.mixer__labels li.is-active .mixer__labels-tick {
  background: var(--accent);
}

/* Result card */
.result-card {
  margin-top: 2rem;
  background: var(--ink-soft);
  border: 1px solid var(--panel-line);
  border-radius: 8px;
  padding: 1.5rem;
}
.result-card__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.result-card__tag {
  font-family: var(--font-display);
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--ink);
  padding: 0.25rem 0.6rem;
  border-radius: 3px;
  font-weight: 600;
}
.result-card__duration {
  font-size: 0.82rem;
  color: var(--paper-dim);
}
.result-card h3 {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 1.3rem;
  margin: 0.9rem 0 0;
  color: var(--paper);
}
.result-card__desc {
  color: var(--paper-dim);
  font-size: 0.95rem;
  margin: 0.5rem 0 0;
  max-width: 560px;
}
.result-card__blocks {
  list-style: none;
  margin: 1.25rem 0 0;
  padding: 0;
  display: grid;
  gap: 0.6rem;
}
.result-card__blocks li {
  display: flex;
  justify-content: space-between;
  border-top: 1px solid var(--panel-line);
  padding-top: 0.6rem;
  font-size: 0.9rem;
}
.result-card__block-name { color: var(--paper); font-weight: 500; }
.result-card__block-detail { color: var(--paper-dim); font-family: var(--font-display); }

.fade-slide-enter-active, .fade-slide-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.fade-slide-enter-from { opacity: 0; transform: translateY(6px); }
.fade-slide-leave-to { opacity: 0; transform: translateY(-6px); }

/* ---------- Programmes ---------- */
.programmes {
  position: relative;
  z-index: 2;
  max-width: 1180px;
  margin: 6rem auto 0;
  padding: 0 clamp(1.25rem, 5vw, 2rem);
  text-align: center;
}
.cards {
  margin-top: 2.5rem;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.25rem;
}
@media (max-width: 980px) { .cards { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 560px) { .cards { grid-template-columns: 1fr; } }

.card {
  text-align: left;
  background: var(--panel);
  border: 1px solid var(--panel-line);
  border-radius: 8px;
  padding: 1.5rem;
  transition: border-color 0.2s ease, transform 0.2s ease;
}
.card:hover {
  border-color: var(--card-color);
  transform: translateY(-3px);
}
.card__icon {
  width: 40px;
  height: 40px;
  color: var(--card-color);
}
.card__icon svg { width: 100%; height: 100%; }
.card h3 {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 1.05rem;
  margin: 1rem 0 0;
  color: var(--paper);
}
.card p {
  font-size: 0.88rem;
  color: var(--paper-dim);
  margin: 0.5rem 0 0;
}

/* ---------- Méthode ---------- */
.methode {
  position: relative;
  z-index: 2;
  max-width: 1180px;
  margin: 7rem auto 0;
  padding: 0 clamp(1.25rem, 5vw, 2rem);
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 3rem;
  align-items: center;
}
@media (max-width: 860px) {
  .methode { grid-template-columns: 1fr; }
}

.steps {
  list-style: none;
  padding: 0;
  margin: 2rem 0 0;
  display: grid;
  gap: 1.5rem;
}
.steps li {
  border-left: 2px solid var(--panel-line);
  padding-left: 1.25rem;
}
.steps h4 {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 1.05rem;
  margin: 0;
  color: var(--paper);
}
.steps p {
  font-size: 0.92rem;
  color: var(--paper-dim);
  margin: 0.35rem 0 0;
}

.methode__visual {
  display: flex;
  justify-content: center;
}
.bar-loader {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}
.bar-loader__plate {
  width: 14px;
  border-radius: 3px;
  background: linear-gradient(180deg, var(--accent), #ffb23a);
  animation: pulse 1.8s ease-in-out infinite;
}
.bar-loader__plate:nth-child(1) { height: 50px; animation-delay: 0s; }
.bar-loader__plate:nth-child(2) { height: 90px; animation-delay: 0.15s; }
.bar-loader__plate:nth-child(3) { height: 130px; animation-delay: 0.3s; }
.bar-loader__plate:nth-child(4) { height: 100px; animation-delay: 0.45s; }
.bar-loader__plate:nth-child(5) { height: 70px; animation-delay: 0.6s; }
.bar-loader__plate:nth-child(6) { height: 40px; animation-delay: 0.75s; }

@keyframes pulse {
  0%, 100% { opacity: 0.55; }
  50% { opacity: 1; }
}
@media (prefers-reduced-motion: reduce) {
  .bar-loader__plate { animation: none; opacity: 0.85; }
}

/* ---------- CTA final ---------- */
.final-cta {
  position: relative;
  z-index: 2;
  text-align: center;
  max-width: 700px;
  margin: 8rem auto 0;
  padding: 0 clamp(1.25rem, 5vw, 2rem) 5rem;
}
.final-cta h2 {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: clamp(1.8rem, 4vw, 2.6rem);
  margin: 0 0 1.75rem;
  color: var(--paper);
}

/* ---------- Footer ---------- */
.footer {
  position: relative;
  z-index: 2;
  border-top: 1px solid var(--panel-line);
  padding: 1.75rem clamp(1.25rem, 5vw, 2rem);
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-family: var(--font-display);
  font-size: 0.85rem;
  color: var(--paper-dim);
  max-width: 1280px;
  margin: 0 auto;
}
.footer__copy {
  font-family: var(--font-body);
  font-size: 0.8rem;
}
@media (max-width: 560px) {
  .footer { flex-direction: column; gap: 0.5rem; text-align: center; }
}
</style>
