<script setup>
// 1. AJOUT de 'useRouter' dans l'import de 'vue-router'
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/services/api.js'
import { useAuthStore } from "@/stores/auth.js"


// constantes
const mode = ref('login') // 'login' | 'signup'
const showPassword = ref(false)
const loading = ref(false) // Servira à animer ton super bouton

const form = reactive({
  name: '',
  email: '',
  password: '',
  remember: false,
})

const errorMessage = ref('')
const errors = reactive({ email: '' })

// 3. Initialisation du routeur pour ce composant
const router = useRouter()
const authStore = useAuthStore()

function validateEmail() {
  if (!form.email) {
    errors.email = ''
    return
  }
  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)
  errors.email = valid ? '' : 'Adresse email invalide.'
}

/* Force du mot de passe */
const strengthScore = computed(() => {
  const p = form.password
  let score = 0
  if (p.length >= 8) score++
  if (p.length >= 12) score++
  if (/[A-Z]/.test(p) && /[a-z]/.test(p)) score++
  if (/[0-9]/.test(p)) score++
  if (/[^A-Za-z0-9]/.test(p)) score++
  return Math.min(score, 4)
})
const strengthPercent = computed(() => (strengthScore.value / 4) * 100)
const strengthLabel = computed(() => {
  const labels = ['Trop court', 'Faible', 'Correct', 'Solide', 'Béton']
  return labels[strengthScore.value]
})
const strengthColor = computed(() => {
  const colors = ['#FF5A36', '#FF5A36', '#E8965A', '#C2A368', '#3DBE6C']
  return colors[strengthScore.value]
})

// 4. fonction de login optimisée
const handleLogin = async () => {
  try {
    errorMessage.value = ''
    loading.value = true // Lance la petite animation de chargement sur ton bouton !

    const response = await api.post('users/login', {
      email: form.email,
      password: form.password,
    })

    // console.log("Réponse Laravel Sanctum :", response)
    const token = response.data.access_token

    // on récupere le bool envoyé par l'api pour savoir si le user a un profile afin de le rediriger pour completer son profile
    const hasProfile = response.data.hasProfile

    // On enregistre le token dans le store
    authStore.login(token)

    // Redirection immédiate vers la page profile pour compléter les infos
    if (!hasProfile) {
      router.push({ name: 'profile' })
    }

    if (hasProfile) {
      router.push({ name: 'home' })
    }





  } catch (error) {
    // Si l'API renvoie une erreur (ex: mauvais identifiants), on capture le message
    errorMessage.value = error.response?.data?.message || "Identifiants incorrects."
  } finally {
    loading.value = false // Coupe le chargement quoi qu'il arrive
  }
}

/* Petites barres décoratives de la colonne visuelle */
const barHeights = [40, 70, 100, 65, 85, 50]
</script>

<template>
  <div class="auth-page">
    <div class="grain" aria-hidden="true"></div>

    <!-- Colonne formulaire -->
    <main class="auth-main">
      <header class="auth-nav">
        <a href="/" class="auth-nav__brand">
          <span class="auth-nav__mark">FX</span>
          <span class="auth-nav__name">FORGE<span class="accent">X</span></span>
        </a>
      </header>

      <div class="auth-card">
        <div v-if="mode === 'login'">
          <p class="eyebrow">Accès programme</p>
          <h1 class="auth-title">Reprends ta séance.</h1>
          <p class="auth-lead">
            Connecte-toi pour retrouver ton mix et la suite de ton programme.
          </p>
        </div>
        <div v-if="mode === 'signup'">
          <p class="eyebrow">Ton entraînement</p>
          <h1 class="auth-title">n'a pas une seule case à cocher.</h1>
          <p class="auth-lead">
            Force pure, intensité façon CrossFit, mouvements fonctionnels du quotidien —
            ou les trois en même temps.
          </p>
        </div>

        <!-- Tabs connexion / inscription -->
        <div class="auth-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            :aria-selected="mode === 'login'"
            :class="{ 'is-active': mode === 'login' }"
            @click="mode = 'login'"
          >
            Connexion
          </button>
          <button
            type="button"
            role="tab"
            :aria-selected="mode === 'signup'"
            :class="{ 'is-active': mode === 'signup' }"
            @click="mode = 'signup'"
          >
            Inscription
          </button>
          <span class="auth-tabs__fill" :style="{ left: mode === 'login' ? '0%' : '50%' }"></span>
        </div>

        <form class="auth-form" @submit.prevent="handleLogin">
          <label class="field">
            <span class="field__label">Email</span>
            <input
              v-model="form.email"
              type="email"
              placeholder="toi@exemple.com"
              autocomplete="email"
              required
              :class="{ 'field--error': errors.email }"
              @blur="validateEmail"
            />
            <span v-if="errors.email" class="field__error">{{ errors.email }}</span>
          </label>

          <label class="field">
            <span class="field__label-row">
              <span class="field__label">Mot de passe</span>
              <a v-if="mode === 'login'" href="#" class="field__hint">Mot de passe oublié&nbsp;?</a>
            </span>
            <div class="field__password">
              <input
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="••••••••"
                :autocomplete="mode === 'login' ? 'current-password' : 'new-password'"
                required
                minlength="8"
              />
              <button
                type="button"
                class="field__toggle"
                :aria-label="showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'"
                @click="showPassword = !showPassword"
              >
                <svg v-if="!showPassword" viewBox="0 0 24 24" fill="none"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" stroke="currentColor" stroke-width="1.6"/><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.6"/></svg>
                <svg v-else viewBox="0 0 24 24" fill="none"><path d="M3 3l18 18M10.6 10.6a3 3 0 0 0 4.2 4.2M6.6 6.7C4.4 8.1 3 10 3 10s3.5 7 10 7c1.7 0 3.2-.4 4.4-1M19.4 17.3C20.8 15.7 21 14 21 14s-1.4-2.8-4.4-4.7" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>
              </button>
            </div>
            <span v-if="mode === 'signup'" class="field__meter">
              <span
                class="field__meter-fill"
                :style="{ width: strengthPercent + '%', background: strengthColor }"
              ></span>
            </span>
            <span v-if="mode === 'signup' && form.password" class="field__hint-text">{{ strengthLabel }}</span>
          </label>

          <label class="checkbox" v-if="mode === 'login'">
            <input v-model="form.remember" type="checkbox" />
            <span>Rester connecté</span>
          </label>

          <button type="submit" class="btn btn--primary btn--block" :disabled="loading">
            <span class="btn__plate" :class="{ 'is-loading': loading }" aria-hidden="true"></span>
            <span>{{ loading ? 'Connexion…' : mode === 'login' ? 'Se connecter' : 'Créer mon compte' }}</span>
          </button>
        </form>

        <div class="auth-divider"><span>ou</span></div>

        <div class="auth-socials">
          <button type="button" class="btn btn--ghost btn--block">
            <svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M21.8 12.2c0-.7-.06-1.4-.18-2H12v3.9h5.5a4.7 4.7 0 0 1-2 3.1v2.6h3.3c1.9-1.8 3-4.4 3-7.6Z" opacity=".55"/><path fill="currentColor" d="M12 22c2.7 0 5-.9 6.7-2.4l-3.3-2.6c-.9.6-2.1 1-3.4 1-2.6 0-4.8-1.7-5.6-4.1H2.9v2.7C4.6 19.7 8 22 12 22Z" opacity=".75"/><path fill="currentColor" d="M6.4 13.9a6 6 0 0 1 0-3.8V7.4H2.9a10 10 0 0 0 0 9.2l3.5-2.7Z" opacity=".4"/><path fill="currentColor" d="M12 6.1c1.5 0 2.8.5 3.8 1.5l2.9-2.8C16.9 3.1 14.6 2 12 2 8 2 4.6 4.3 2.9 7.4l3.5 2.7c.8-2.4 3-4 5.6-4Z"/></svg>
            Continuer avec Google
          </button>
        </div>

        <p class="auth-switch">
          <template v-if="mode === 'login'">
            Pas encore de compte&nbsp;?
            <button type="button" @click="mode = 'signup'">Crée le tien</button>
          </template>
          <template v-else>
            Déjà un compte&nbsp;?
            <button type="button" @click="mode = 'login'">Connecte-toi</button>
          </template>
        </p>
      </div>

      <footer class="auth-footer">
        <span>© 2026 ForgeX</span>
        <span class="auth-footer__sep">·</span>
        <a href="#">Confidentialité</a>
        <span class="auth-footer__sep">·</span>
        <a href="#">Conditions</a>
      </footer>
    </main>

    <!-- Colonne visuelle -->
    <aside class="auth-visual" aria-hidden="true">
      <div class="auth-visual__plate">
        <span>20</span><span>15</span><span>10</span><span>5</span>
      </div>

      <div class="auth-visual__content">
        <p class="auth-visual__quote">
          « Force, intensité ou fonctionnel — ton mix te suit séance après séance. »
        </p>

        <div class="auth-visual__bars">
          <div class="bar" v-for="(h, i) in barHeights" :key="i" :style="{ height: h + '%' }"></div>
        </div>

        <ul class="auth-visual__stats">
          <li><strong>4</strong><span>profils d'entraînement</span></li>
          <li><strong>100%</strong><span>programme adapté</span></li>
        </ul>
      </div>
    </aside>
  </div>
</template>

<style scoped>
.auth-page {
  --ink: #14171a;
  --ink-soft: #1c2024;
  --panel: #21252a;
  --panel-line: #323840;
  --paper: #d9d2c5;
  --paper-dim: #a9a39a;
  --accent: #ff5a36;
  --accent-dim: #ff5a3633;

  --font-display: 'Oswald', 'Barlow Condensed', sans-serif;
  --font-body: 'Inter', system-ui, sans-serif;

  background: var(--ink);
  color: var(--paper);
  font-family: var(--font-body);
  position: relative;
  min-height: 100vh;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 0.85fr);
  line-height: 1.5;
}

@import url('https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap');

.auth-page :focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 3px;
}

.accent { color: var(--accent); }

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
  margin: 0;
}

@media (max-width: 920px) {
  .auth-page { grid-template-columns: 1fr; }
}

/* ---------- Colonne principale ---------- */
.auth-main {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  padding: 0 clamp(1.25rem, 5vw, 4rem);
}

.auth-nav {
  padding: 1.75rem 0;
}
.auth-nav__brand {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  text-decoration: none;
  color: var(--paper);
}
.auth-nav__mark {
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  background: var(--accent);
  color: var(--ink);
  font-family: var(--font-display);
  font-weight: 700;
  border-radius: 4px;
  font-size: 0.78rem;
}
.auth-nav__name {
  font-family: var(--font-display);
  font-weight: 600;
  letter-spacing: 0.04em;
  font-size: 1.02rem;
}

.auth-card {
  flex: 1;
  max-width: 420px;
  width: 100%;
  margin: 1.5rem 0;
  display: flex;
  flex-direction: column;
}

.auth-title {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: clamp(1.9rem, 4vw, 2.4rem);
  letter-spacing: -0.01em;
  margin: 0.6rem 0 0;
  color: var(--paper);
}
.auth-lead {
  font-size: 0.96rem;
  color: var(--paper-dim);
  margin: 0.6rem 0 0;
}

/* Tabs */
.auth-tabs {
  position: relative;
  display: flex;
  margin: 1.75rem 0 0;
  background: var(--panel);
  border: 1px solid var(--panel-line);
  border-radius: 6px;
  padding: 4px;
}
.auth-tabs button {
  flex: 1;
  position: relative;
  z-index: 1;
  background: transparent;
  border: none;
  padding: 0.6rem 0;
  font-family: var(--font-body);
  font-weight: 600;
  font-size: 0.88rem;
  color: var(--paper-dim);
  cursor: pointer;
  border-radius: 4px;
  transition: color 0.2s ease;
}
.auth-tabs button.is-active { color: var(--ink); }
.auth-tabs__fill {
  position: absolute;
  top: 4px;
  bottom: 4px;
  width: calc(50% - 4px);
  background: var(--accent);
  border-radius: 4px;
  transition: left 0.25s ease;
}

/* Formulaire */
.auth-form {
  margin-top: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}
.field__label {
  font-size: 0.82rem;
  font-weight: 500;
  color: var(--paper-dim);
}
.field__label-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}
.field__hint {
  font-size: 0.78rem;
  color: var(--accent);
  text-decoration: none;
}
.field__hint:hover { text-decoration: underline; }

.field input[type="text"],
.field input[type="email"],
.field input[type="password"] {
  background: var(--panel);
  border: 1px solid var(--panel-line);
  border-radius: 6px;
  padding: 0.72rem 0.9rem;
  font-family: var(--font-body);
  font-size: 0.95rem;
  color: var(--paper);
  transition: border-color 0.18s ease;
}
.field input::placeholder { color: #6b7178; }
.field input:focus {
  border-color: var(--accent);
  outline: none;
}
.field input.field--error { border-color: #e25b4d; }

.field__error {
  font-size: 0.78rem;
  color: #ff8a76;
}

.field__password {
  position: relative;
  display: flex;
}
.field__password input { flex: 1; padding-right: 2.6rem; }
.field__toggle {
  position: absolute;
  right: 0.6rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: var(--paper-dim);
  cursor: pointer;
  display: grid;
  place-items: center;
  padding: 0.3rem;
}
.field__toggle:hover { color: var(--paper); }
.field__toggle svg { width: 18px; height: 18px; }

.field__meter {
  display: block;
  height: 3px;
  background: var(--panel-line);
  border-radius: 2px;
  overflow: hidden;
  margin-top: 0.3rem;
}
.field__meter-fill {
  display: block;
  height: 100%;
  transition: width 0.25s ease, background 0.25s ease;
}
.field__hint-text {
  font-size: 0.76rem;
  color: var(--paper-dim);
}

.checkbox {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  font-size: 0.86rem;
  color: var(--paper-dim);
  cursor: pointer;
}
.checkbox input {
  width: 16px;
  height: 16px;
  accent-color: var(--accent);
}

/* Boutons */
.btn {
  font-family: var(--font-body);
  font-weight: 600;
  font-size: 0.95rem;
  padding: 0.78rem 1.4rem;
  border-radius: 6px;
  border: 1px solid transparent;
  cursor: pointer;
  transition: transform 0.15s ease, background 0.2s ease, border-color 0.2s ease, opacity 0.2s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}
.btn:active { transform: scale(0.98); }
.btn:disabled { opacity: 0.7; cursor: progress; }
.btn--block { width: 100%; }
.btn--primary {
  background: var(--accent);
  color: var(--ink);
  position: relative;
  overflow: hidden;
}
.btn--primary:hover:not(:disabled) { background: #ff6f4f; }
.btn--ghost {
  background: transparent;
  border-color: var(--panel-line);
  color: var(--paper);
}
.btn--ghost:hover { border-color: var(--paper-dim); }

.btn__plate {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 2px solid var(--ink);
  border-top-color: transparent;
  display: none;
}
.btn__plate.is-loading {
  display: inline-block;
  animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
@media (prefers-reduced-motion: reduce) {
  .btn__plate.is-loading { animation: none; }
}

.auth-divider {
  display: flex;
  align-items: center;
  text-align: center;
  margin: 1.6rem 0;
  color: var(--paper-dim);
  font-size: 0.8rem;
}
.auth-divider::before,
.auth-divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--panel-line);
}
.auth-divider span { padding: 0 0.75rem; }

.auth-socials { display: flex; flex-direction: column; gap: 0.6rem; }

.auth-switch {
  margin: 1.75rem 0 0;
  text-align: center;
  font-size: 0.88rem;
  color: var(--paper-dim);
}
.auth-switch button {
  background: none;
  border: none;
  color: var(--accent);
  font-weight: 600;
  cursor: pointer;
  padding: 0;
  font-size: inherit;
}
.auth-switch button:hover { text-decoration: underline; }

.auth-footer {
  padding: 1.75rem 0;
  font-size: 0.78rem;
  color: var(--paper-dim);
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}
.auth-footer a { color: var(--paper-dim); text-decoration: none; }
.auth-footer a:hover { color: var(--paper); }
.auth-footer__sep { opacity: 0.5; }

/* Transitions */
.fade-slide-enter-active, .fade-slide-leave-active {
  transition: opacity 0.18s ease, transform 0.18s ease, max-height 0.18s ease;
}
.fade-slide-enter-from, .fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

/* ---------- Colonne visuelle ---------- */
.auth-visual {
  position: relative;
  z-index: 2;
  background: var(--panel);
  border-left: 1px solid var(--panel-line);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: clamp(2rem, 4vw, 3.5rem);
  overflow: hidden;
}
@media (max-width: 920px) { .auth-visual { display: none; } }

.auth-visual__plate {
  display: flex;
  gap: 0.5rem;
  opacity: 0.6;
}
.auth-visual__plate span {
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

.auth-visual__content {
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
  margin-top: auto;
}

.auth-visual__quote {
  font-family: var(--font-display);
  font-weight: 500;
  font-size: 1.3rem;
  line-height: 1.4;
  color: var(--paper);
  max-width: 360px;
  margin: 0;
}

.auth-visual__bars {
  display: flex;
  align-items: flex-end;
  gap: 0.5rem;
  height: 110px;
}
.bar {
  flex: 1;
  border-radius: 3px 3px 0 0;
  background: linear-gradient(180deg, var(--accent), #ffb23a);
  opacity: 0.85;
}

.auth-visual__stats {
  display: flex;
  gap: 2.5rem;
  list-style: none;
  padding: 0;
  margin: 0;
  border-top: 1px solid var(--panel-line);
  padding-top: 1.5rem;
}
.auth-visual__stats li {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}
.auth-visual__stats strong {
  font-family: var(--font-display);
  font-size: 1.6rem;
  color: var(--paper);
}
.auth-visual__stats span {
  font-size: 0.78rem;
  color: var(--paper-dim);
}
</style>
