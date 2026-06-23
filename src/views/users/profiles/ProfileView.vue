<template>
  <div class="profile-page">
    <div class="grain" aria-hidden="true"></div>

    <main class="wizard">
      <!-- Progression -->
      <div class="progress">
        <div class="progress__bar">
          <div class="progress__fill" :style="{ width: progressPercent + '%' }"></div>
        </div>
        <p class="progress__text">Étape {{ currentStep + 1 }} / {{ steps.length }}</p>
      </div>

      <!-- Contenu des étapes -->
      <div class="wizard__container">
        <transition name="slide-fade" mode="out-in">
          <!-- Étape 1 : Identité -->
          <section v-if="currentStep === 0" key="identity" class="step">
            <div class="step__head">
              <p class="eyebrow">Commençons</p>
              <h1 class="step__title">Qui es-tu&nbsp;?</h1>
              <p class="step__lead">Crée ton pseudo et ajoute tes nom/prénom si tu veux.</p>
            </div>

            <form class="step__form" @submit.prevent="nextStep">
              <label class="field">
                <span class="field__label">Pseudo<span class="required">*</span></span>
                <input
                  v-model="form.pseudo"
                  type="text"
                  placeholder="Nouveau membre"
                  maxlength="255"
                  :class="{ 'field--error': errors.pseudo }"
                  @blur="validatePseudo"
                />
                <span v-if="errors.pseudo" class="field__error">{{ errors.pseudo }}</span>
                <span v-else class="field__hint">Unique, 255 caractères max</span>
              </label>

              <div class="fields-row">
                <label class="field">
                  <span class="field__label">Prénom</span>
                  <input
                    v-model="form.first_name"
                    type="text"
                    placeholder="Ex: Jean"
                    maxlength="255"
                  />
                </label>
                <label class="field">
                  <span class="field__label">Nom</span>
                  <input
                    v-model="form.last_name"
                    type="text"
                    placeholder="Ex: Dupont"
                    maxlength="255"
                  />
                </label>
              </div>

              <div class="step__actions">
                <button type="submit" class="btn btn--primary btn--block">
                  Suivant
                </button>
              </div>
            </form>
          </section>

          <!-- Étape 2 : Mensurations -->
          <section v-else-if="currentStep === 1" key="measurements" class="step">
            <div class="step__head">
              <p class="eyebrow">Tes données</p>
              <h1 class="step__title">Mensurations</h1>
              <p class="step__lead">Âge, taille, poids — optionnels mais utiles pour affiner ton programme.</p>
            </div>

            <form class="step__form" @submit.prevent="nextStep">
              <label class="field">
                <span class="field__label">Âge</span>
                <input
                  v-model.number="form.age"
                  type="number"
                  placeholder="Ex: 28"
                  min="13"
                  max="120"
                  :class="{ 'field--error': errors.age }"
                  @blur="validateAge"
                />
                <span v-if="errors.age" class="field__error">{{ errors.age }}</span>
                <span v-else class="field__hint">Entre 13 et 120 ans</span>
              </label>

              <div class="fields-row">
                <label class="field">
                  <span class="field__label">Taille</span>
                  <div class="field__with-unit">
                    <input
                      v-model.number="form.height"
                      type="number"
                      placeholder="170"
                      min="50"
                      max="250"
                      :class="{ 'field--error': errors.height }"
                      @blur="validateHeight"
                    />
                    <select v-model="form.height_unity" class="field__unit">
                      <option value="cm">cm</option>
                      <option value="inch">inch</option>
                    </select>
                  </div>
                  <span v-if="errors.height" class="field__error">{{ errors.height }}</span>
                  <span v-else class="field__hint">50 à 250 {{ form.height_unity }}</span>
                </label>

                <label class="field">
                  <span class="field__label">Poids</span>
                  <div class="field__with-unit">
                    <input
                      v-model.number="form.weight"
                      type="number"
                      placeholder="75"
                      min="30"
                      max="300"
                      :class="{ 'field--error': errors.weight }"
                      @blur="validateWeight"
                    />
                    <select v-model="form.weight_unity" class="field__unit">
                      <option value="kg">kg</option>
                      <option value="lb">lb</option>
                    </select>
                  </div>
                  <span v-if="errors.weight" class="field__error">{{ errors.weight }}</span>
                  <span v-else class="field__hint">30 à 300 {{ form.weight_unity }}</span>
                </label>
              </div>

              <div class="step__actions">
                <button type="button" class="btn btn--ghost" @click="prevStep">Retour</button>
                <button type="submit" class="btn btn--primary">Suivant</button>
              </div>
            </form>
          </section>

          <!-- Étape 3 : Contact -->
          <section v-else-if="currentStep === 2" key="contact" class="step">
            <div class="step__head">
              <p class="eyebrow">Contact</p>
              <h1 class="step__title">Téléphone</h1>
              <p class="step__lead">Pour qu'on puisse te joindre si besoin (optionnel).</p>
            </div>

            <form class="step__form" @submit.prevent="nextStep">
              <label class="field">
                <span class="field__label">Numéro de téléphone</span>
                <input
                  v-model="form.phone_number"
                  type="tel"
                  placeholder="Ex: +33 6 12 34 56 78"
                  maxlength="120"
                />
                <span class="field__hint">Jusqu'à 120 caractères</span>
              </label>

              <div class="step__actions">
                <button type="button" class="btn btn--ghost" @click="prevStep">Retour</button>
                <button type="submit" class="btn btn--primary">Suivant</button>
              </div>
            </form>
          </section>

          <!-- Étape 4 : Localisation -->
          <section v-else-if="currentStep === 3" key="location" class="step">
            <div class="step__head">
              <p class="eyebrow">Localisation</p>
              <h1 class="step__title">Où t'entraînes-tu&nbsp;?</h1>
              <p class="step__lead">Pays, ville, code postal, adresse — tout optionnel.</p>
            </div>

            <form class="step__form" @submit.prevent="submitForm">
              <label class="field">
                <span class="field__label">Pays</span>
                <input
                  v-model="form.location.country"
                  type="text"
                  placeholder="Ex: France"
                  maxlength="100"
                />
              </label>

              <div class="fields-row">
                <label class="field">
                  <span class="field__label">Ville</span>
                  <input
                    v-model="form.location.city"
                    type="text"
                    placeholder="Ex: Paris"
                    maxlength="100"
                  />
                </label>
                <label class="field">
                  <span class="field__label">Code postal</span>
                  <input
                    v-model="form.location.zipcode"
                    type="text"
                    placeholder="Ex: 75001"
                    maxlength="100"
                  />
                </label>
              </div>

              <label class="field">
                <span class="field__label">Adresse</span>
                <input
                  v-model="form.location.address"
                  type="text"
                  placeholder="Ex: 123 Rue de Rivoli"
                  maxlength="300"
                />
              </label>

              <div class="step__actions">
                <button type="button" class="btn btn--ghost" @click="prevStep">Retour</button>
                <button type="submit" class="btn btn--primary" :disabled="loading">
                  {{ loading ? 'Validation…' : 'Valider mon profil' }}
                </button>
              </div>
            </form>
          </section>

          <!-- Étape 5 : Succès -->
          <section v-else-if="currentStep === 4" key="success" class="step step--success">
            <div class="step__head" style="text-align: center; margin: 0 auto;">
              <div class="success-icon" aria-hidden="true">
                <svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="22" stroke="currentColor" stroke-width="2" fill="none"/><path d="M16 24l5 5 10-10" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>
              </div>
              <p class="eyebrow" style="text-align: center;">Succès</p>
              <h1 class="step__title">Bienvenue, {{ form.pseudo || 'membre' }}!</h1>
              <p class="step__lead">Ton profil est prêt. Commence à générer tes programmes.</p>
            </div>

            <div class="step__actions" style="margin-top: 2rem;">
              <button type="button" class="btn btn--primary btn--block" @click="goToDashboard">
                Aller au dashboard
              </button>
            </div>
          </section>
        </transition>
      </div>

      <!-- Skip button (toutes étapes sauf succès) -->
      <div v-if="currentStep < 4" class="wizard__skip">
        <button type="button" class="btn btn--text" @click="handleSkip">
          Compléter plus tard
        </button>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/services/api.js'
import { useAuthStore } from "@/stores/auth.js"

const router = useRouter()
const authStore = useAuthStore()

const currentStep = ref(0)
const loading = ref(false)

const steps = ['identity', 'measurements', 'contact', 'location', 'success']

const form = reactive({
  pseudo: 'Nouveau membre',
  first_name: '',
  last_name: '',
  age: null, // Initialisé à null plutôt que 0 pour éviter d'afficher un 0 moche dans l'input
  height: null,
  height_unity: 'cm',
  weight: null,
  weight_unity: 'kg',
  phone_number: '',
  location: {
    country: '',
    city: '',
    zipcode: '',
    address: '',
  },
})

const errors = reactive({
  pseudo: '',
  age: '',
  height: '',
  weight: '',
})

/* Validation pseudo */
function validatePseudo() {
  const val = form.pseudo?.trim()
  if (!val) {
    errors.pseudo = 'Le pseudo ne peut pas être vide.'
    return false
  }
  if (val.length > 255) {
    errors.pseudo = '255 caractères max.'
    return false
  }
  errors.pseudo = ''
  return true
}

/* Validation âge */
function validateAge() {
  if (!form.age) {
    errors.age = ''
    return true
  }
  if (form.age < 13 || form.age > 120) {
    errors.age = 'Entre 13 et 120 ans.'
    return false
  }
  errors.age = ''
  return true
}

/* Validation taille */
function validateHeight() {
  if (!form.height) {
    errors.height = ''
    return true
  }
  if (form.height < 50 || form.height > 250) {
    errors.height = `Entre 50 et 250 ${form.height_unity}.`
    return false
  }
  errors.height = ''
  return true
}

/* Validation poids */
function validateWeight() {
  if (!form.weight) {
    errors.weight = ''
    return true
  }
  if (form.weight < 30 || form.weight > 300) {
    errors.weight = `Entre 30 et 300 ${form.weight_unity}.`
    return false
  }
  errors.weight = ''
  return true
}

/* Navigation wizard */
function nextStep() {
  let isValid = true

  if (currentStep.value === 0) {
    isValid = validatePseudo()
  } else if (currentStep.value === 1) {
    validateAge()
    validateHeight()
    validateWeight()
    isValid = !errors.age && !errors.height && !errors.weight
  }

  if (isValid && currentStep.value < steps.length - 1) {
    currentStep.value++
  }
}

function prevStep() {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

/* Soumission à ton API Laravel */
async function submitForm() {
  if (loading.value) return
  loading.value = true

  // Construction du payload attendu par ton API
  const payload = {
    pseudo: form.pseudo,
    first_name: form.first_name || null,
    last_name: form.last_name || null,
    phone_number: form.phone_number || null,
    age: form.age || null,
    height: form.height || null,
    height_unity: form.height_unity,
    weight: form.weight || null,
    weight_unity: form.weight_unity,
    country: form.location.country || null,
    city: form.location.city || null,
    zipcode: form.location.zipcode || null,
    address: form.location.address || null,
  }

  try {
    // 1. Envoi à l'API (l'intercepteur api.js passe automatiquement le Bearer Token !)
    await api.post('user/profile', payload)

    // 2. IMPORTANT : On met à jour le store si tu as un flag hasProfile dedans, pour débloquer les guards
    if ('hasProfile' in authStore) {
      authStore.hasProfile = true
    }

    // 3. Passage à l'écran de succès
    currentStep.value = 4
  } catch (error) {
    console.error('Erreur lors de la sauvegarde du profil:', error)
    alert(error.response?.data?.message || "Une erreur est survenue lors de l'enregistrement.")
  } finally {
    loading.value = false
  }
}

/* Actions de redirection finale */
function handleSkip() {
  // Optionnel : Tu peux décider d'envoyer un profil vide si l'utilisateur clique sur "Sauter"
  router.push({ name: 'home' })
}

function goToDashboard() {
  router.push({ name: 'home' })
}

const progressPercent = computed(() => {
  return (currentStep.value / (steps.length - 1)) * 100
})
</script>

<style scoped>
.profile-page {
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
  display: flex;
  flex-direction: column;
}

@import url('https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap');

.profile-page :focus-visible {
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

/* ---------- Nav ---------- */
.nav {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem clamp(1.25rem, 5vw, 4rem);
  border-bottom: 1px solid var(--panel-line);
}
.nav__brand {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}
.nav__mark {
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
.nav__name {
  font-family: var(--font-display);
  font-weight: 600;
  letter-spacing: 0.04em;
  font-size: 1.02rem;
}
.nav__close {
  background: none;
  border: none;
  color: var(--paper-dim);
  cursor: pointer;
  padding: 0.3rem;
  display: grid;
  place-items: center;
}
.nav__close:hover { color: var(--paper); }
.nav__close svg { width: 20px; height: 20px; }

/* ---------- Wizard ---------- */
.wizard {
  position: relative;
  z-index: 2;
  flex: 1;
  display: flex;
  flex-direction: column;
  max-width: 600px;
  margin: 0 auto;
  width: 100%;
  padding: 0 clamp(1.25rem, 5vw, 2rem);
  padding-top: 2rem;
  padding-bottom: 4rem;
}

.progress {
  margin-bottom: 3rem;
}
.progress__bar {
  position: relative;
  height: 3px;
  background: var(--panel-line);
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 0.6rem;
}
.progress__fill {
  height: 100%;
  background: linear-gradient(90deg, var(--accent), #ffb23a);
  transition: width 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}
.progress__text {
  font-size: 0.78rem;
  color: var(--paper-dim);
  margin: 0;
  text-align: right;
}

.wizard__container {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.step {
  display: flex;
  flex-direction: column;
}
.step--success { align-items: center; justify-content: center; }

.step__head {
  margin-bottom: 2rem;
}
.step__title {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: clamp(1.8rem, 4vw, 2.4rem);
  letter-spacing: -0.01em;
  margin: 0.6rem 0 0;
  color: var(--paper);
}
.step__lead {
  font-size: 0.96rem;
  color: var(--paper-dim);
  margin: 0.6rem 0 0;
}

.step__form {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

.fields-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.2rem;
}
@media (max-width: 560px) {
  .fields-row { grid-template-columns: 1fr; }
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
.required {
  color: var(--accent);
  margin-left: 0.25rem;
}

.field input[type="text"],
.field input[type="tel"],
.field input[type="email"],
.field input[type="number"],
.field select {
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
.field input:focus,
.field select:focus {
  border-color: var(--accent);
  outline: none;
}
.field input.field--error { border-color: #e25b4d; }

.field__error {
  font-size: 0.78rem;
  color: #ff8a76;
}
.field__hint {
  font-size: 0.76rem;
  color: var(--paper-dim);
}

.field__with-unit {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 0.6rem;
  align-items: stretch;
}
.field__unit {
  background: var(--panel);
  border: 1px solid var(--panel-line);
  border-radius: 6px;
  padding: 0.72rem 0.6rem;
  font-family: var(--font-body);
  font-size: 0.9rem;
  color: var(--paper);
  cursor: pointer;
  min-width: 60px;
}
.field__unit:focus { border-color: var(--accent); outline: none; }

.step__actions {
  display: flex;
  gap: 0.6rem;
  margin-top: 1.5rem;
}
.step__actions .btn { flex: 1; }

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
.btn:disabled { opacity: 0.6; cursor: not-allowed; }

.btn--primary {
  background: var(--accent);
  color: var(--ink);
}
.btn--primary:hover:not(:disabled) { background: #ff6f4f; }

.btn--ghost {
  background: transparent;
  border-color: var(--panel-line);
  color: var(--paper);
}
.btn--ghost:hover { border-color: var(--paper-dim); }

.btn--text {
  background: transparent;
  color: var(--paper-dim);
  padding: 0.6rem 0;
}
.btn--text:hover { color: var(--paper); }

.btn--block { width: 100%; }

/* Success icon */
.success-icon {
  width: 80px;
  height: 80px;
  color: var(--accent);
  margin: 0 auto 1.5rem;
}
.success-icon svg {
  width: 100%;
  height: 100%;
  animation: pulse-scale 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}
@keyframes pulse-scale {
  from { transform: scale(0.8); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

.wizard__skip {
  margin-top: auto;
  padding-top: 2rem;
  text-align: center;
  border-top: 1px solid var(--panel-line);
}

/* Transitions */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.slide-fade-enter-from {
  opacity: 0;
  transform: translateX(12px);
}
.slide-fade-leave-to {
  opacity: 0;
  transform: translateX(-12px);
}
</style>
