<template>
  <div class="forge-form">

    <header class="forge-head">
      <p class="forge-head__eyebrow">Nouveau mix</p>
      <h1 class="forge-head__title">Compose ton <span class="accent">programme</span></h1>
      <p class="forge-head__lead">
        Crée une ou plusieurs séances (jusqu'à 6) et configure leurs blocs avant de tout valider.
      </p>
    </header>

    <!-- Titre Global du Programme -->
    <section class="workout-title field">
      <label class="field__label" for="workout-title">Nom du programme</label>
      <input id="workout-title" class="input-axeon" type="text" v-model="draft.programTitle" placeholder="Ex: Programme Volume Hypertrophie">
    </section>

    <!-- CAROUSEL DE SÉANCES -->
    <div v-show="draft.hasBlocksAnywhere" class="sessions-preview">
      <section class="carousel-section">
        <div class="carousel-header">
          <h2 class="field-block__title">Séances du programme : {{ draft.sessions.length }}</h2>
        </div>

        <div class="carousel-container">
          <div
            v-for="(session, index) in draft.sessions"
            :key="session.id"
            class="session-card"
            :class="{ 'session-card--active': draft.currentSessionIndex === index }"
            @click="draft.selectSession(index)"
          >
            <div class="session-card__head">
              <span class="session-card__badge">Séance {{ index + 1 }}</span>
              <button
                v-if="draft.sessions.length > 1"
                type="button"
                class="icon-btn icon-btn--danger"
                aria-label="Supprimer la séance"
                @click.stop="draft.removeSession(index)"
              >✕</button>
            </div>

            <h3 class="session-card__title">{{ session.sessionName || 'Sans nom' }}</h3>

            <!-- Contenu détaillé visible dans la carte -->
            <div class="session-card__content">
              <p v-if="session.blocks.length === 0" class="session-card__empty">Aucun bloc configuré</p>
              <ul v-else class="session-card__preview-list">
                <li v-for="(block, bIdx) in session.blocks" :key="block.front_block_uid">
                  <strong>{{ bIdx + 1 }}. {{ blockLabel(block.type) }}</strong>
                  <span class="preview-exos-count">({{ block.exercises.length }} exo{{ block.exercises.length > 1 ? 's' : '' }})</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>

    <div class="mb-3 d-flex flex-row-reverse">
      <button
        type="button"
        class="btn btn--outline"
        :disabled="!draft.canAddSession"
        @click="draft.addSession"
      >
        + Ajouter une séance
      </button>
    </div>

    <!-- ÉDITEUR DE LA SÉANCE SÉLECTIONNÉE -->
    <div v-if="draft.currentSession" class="forge-grid">

      <!-- Récapitulatif des blocs validés de la séance courante -->
      <section v-if="draft.currentSession.blocks.length" class="field-block">
        <h2 class="field-block__title">
          Blocs de : {{ draft.currentSession.sessionName }} ({{ draft.currentSession.blocks.length }})
        </h2>
        <ol class="block-list">
          <li v-for="(block, i) in draft.currentSession.blocks" :key="block.front_block_uid" class="block-card">
            <div class="block-card__head">
              <strong class="block-card__title">
                {{ i + 1 }}. {{ blockLabel(block.type) }}
                <span v-if="blockWithTimeCaps.includes(block.type)">Durée : {{ blockTimeCaps(block) }} min</span>
              </strong>
              <div class="block-card__actions">
                <button type="button" class="icon-btn" :disabled="i === 0"
                        aria-label="Monter le bloc" @click="draft.moveBlock(block.front_block_uid, -1)">↑</button>
                <button type="button" class="icon-btn" :disabled="i === draft.currentSession.blocks.length - 1"
                        aria-label="Descendre le bloc" @click="draft.moveBlock(block.front_block_uid, 1)">↓</button>
                <button type="button" class="icon-btn icon-btn--danger"
                        aria-label="Supprimer le bloc" @click="draft.removeBlock(block.front_block_uid)">✕</button>
              </div>
            </div>
            <ul class="block-card__exos">
              <li v-for="(exo, k) in block.exercises" :key="k">
                <span>{{ exo.name }}</span>
                <span class="block-card__detail" v-if="blockWithTimeCaps.includes(block.type)">
                  {{ exo.settings.reps }} reps
                </span>
                <span class="block-card__detail" v-else>
                  {{ exo.settings.sets }} × {{ exo.settings.reps }} · repos {{ exo.settings.restTime }} s
                </span>
              </li>
            </ul>
          </li>
        </ol>
      </section>

      <!-- Éditeur de bloc en cours -->
      <section class="field-block">

        <div class="field">
          <label class="field__label" for="session-name">Nom de la séance actuelle</label>
          <input id="session-name" class="input-axeon" type="text" v-model="draft.currentSession.sessionName">
        </div>

        <div v-if="blockTypes.length" class="field">
          <h2 class="field-block__title">Type de bloc</h2>
          <div class="chip-row">
            <button
              v-for="item in blockTypes"
              :key="item.key"
              type="button"
              class="chip"
              :class="{ 'chip--active': form.type === item.key }"
              @click="toggleType(item.key)"
            >
              {{ item.value }}
            </button>
          </div>
        </div>

        <div v-if="isVisible" class="block-editor">

          <div v-if="blockWithTimeCaps.includes(blockType)">
            <div class="field">
              <label class="field__label" for="time-caps">Temps de travail</label>
              <div class="input-with-unit">
                <input id="time-caps" class="input-axeon input-width-numbers" type="number" min="0"
                       v-model.number="settings.timeCaps" />
                <span>minutes</span>
              </div>
            </div>
          </div>

          <div v-else>
            <div class="field">
              <label class="field__label" for="rest-time">Temps de repos</label>
              <div class="input-with-unit">
                <input id="rest-time" class="input-axeon input-width-numbers" type="number" min="0"
                       v-model.number="settings.restTime" />
                <span>sec</span>
              </div>
            </div>
          </div>

          <div class="field search-wrapper">
            <label class="field__label" for="exo-search">Exercice</label>
            <input
              id="exo-search"
              class="input-axeon"
              :class="{ 'search-input--error': showError }"
              type="text"
              v-model="searchQuery"
              @focus="showDropDown = true"
              placeholder="Rechercher un exercice..." />
            <div v-show="showError" class="field-error">Veuillez sélectionner un exercice</div>

            <div v-if="showDropDown && searchQuery" class="search-dropdown">
              <button
                v-for="exo in filteredExercices"
                :key="exo.id"
                type="button"
                class="dropdown-item"
                @click="selectExo(exo)"
              >
                {{ exo.name }}
              </button>
              <div v-if="filteredExercices.length === 0" class="dropdown-item">
                Aucun exercice trouvé
              </div>
            </div>
          </div>

          <div class="field-row">
            <div v-if="!blockWithTimeCaps.includes(blockType)" class="field">
              <label class="field__label" for="sets">Séries</label>
              <input id="sets" class="input-axeon" type="number" min="1" v-model.number="settings.sets" />
            </div>
            <div class="field">
              <label class="field__label" for="reps">Reps</label>
              <input id="reps" class="input-axeon" type="number" min="0" v-model.number="settings.reps" />
            </div>
          </div>

          <button type="button" class="chip" @click="addExercise">Ajouter l'exercice</button>

          <!-- Exercices du bloc en cours -->
          <ul v-if="trainingBlock.length" class="current-list">
            <li v-for="(exo, i) in trainingBlock" :key="i">
              <span>{{ exo.name }}</span>
              <span class="block-card__detail" v-if="blockWithTimeCaps.includes(blockType)">
                {{ exo.settings.reps }} répétitions
              </span>
              <span class="block-card__detail" v-else>
                {{ exo.settings.sets }} × {{ exo.settings.reps }} · repos {{ exo.settings.restTime }} s
              </span>
              <button type="button" class="icon-btn icon-btn--danger"
                      aria-label="Retirer l'exercice" @click="removeExercise(i)">✕</button>
            </li>
          </ul>

          <button type="button" class="btn btn--primary" :disabled="!trainingBlock.length" @click="validateBlock">
            Valider le bloc
          </button>
        </div>
      </section>
    </div>

    <!-- Actions globales (marche pour 1 ou plusieurs séances dès qu'il y a du contenu) -->
    <div class="forge-actions">
      <button type="button" class="btn btn--primary" :disabled="!canSubmit" @click="submit">
        Enregistrer
      </button>
    </div>

  </div>
</template>

<script setup>
import { reactive, ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/services/api.js'
import { useWorkoutDraft } from '@/stores/workoutDraft.js'

const router = useRouter()
const draft = useWorkoutDraft()

const defaultSettings = () => ({
  timeCaps: null,
  restTime: null,
  sets: null,
  reps: null,
})

const blockTypes = ref([])
const exercicesForDropDown = ref([])
const searchQuery = ref('')
const showDropDown = ref(false)
const showError = ref(false)
const selectedExo = ref(null)
const settings = ref(defaultSettings())
const trainingBlock = ref([])
const form = reactive({ type: null })
const timeCaps = ref(0)
const blockWithTimeCaps = ref(['AMRAP'])

const isVisible = computed(() => form.type !== null)
const canSubmit = computed(() => draft.programTitle.trim() !== '' && draft.hasBlocksAnywhere)

const filteredExercices = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  if (!query) return exercicesForDropDown.value
  return exercicesForDropDown.value.filter(exo => exo.name?.toLowerCase().includes(query))
})

const blockLabel = (key) => blockTypes.value.find(t => t.key === key)?.value ?? key
const blockTimeCaps = (item) => item?.exercises[0]?.settings?.timeCaps

function toggleType(key) {
  form.type = form.type === key ? null : key
}

const blockType = computed(() => form.type)

function selectExo(exo) {
  searchQuery.value = exo.name
  selectedExo.value = exo
  showDropDown.value = false
  showError.value = false
}

function addExercise() {
  if (!selectedExo.value) {
    showError.value = true
    return
  }

  if (blockWithTimeCaps.value.includes(blockType.value)) {
    if (settings.value.timeCaps !== 0) {
      timeCaps.value = settings.value.timeCaps
    }
  }

  trainingBlock.value.push({
    exercise_uuid: selectedExo.value.id,
    name: selectedExo.value.name,
    timeCaps: timeCaps.value,
    settings: { ...settings.value },
  })

  searchQuery.value = ''
  selectedExo.value = null
  showError.value = false
}

function removeExercise(index) {
  trainingBlock.value.splice(index, 1)
}

function validateBlock() {
  if (!trainingBlock.value.length) return
  draft.addBlock({
    type: form.type,
    timeCaps: timeCaps.value,
    exercises: trainingBlock.value,
  })
  trainingBlock.value = []
  settings.value = defaultSettings()
  form.type = null
  timeCaps.value = 0
}

async function submit() {
  try {
    const payload = {
      title: draft.programTitle,
      sessions: draft.sessions.map(s => ({
        session_name: s.sessionName,
        blocks: s.blocks,
      })),
    }

    const response = await api.post('workouts', payload)
    console.log('Réponse API :', response)
    draft.reset()
    // router.push({ name: 'dashboard' })
  } catch (error) {
    console.error('Erreur lors de la sauvegarde du programme', error)
  }
}

onMounted(async () => {
  try {
    const [typesRes, exosRes] = await Promise.all([
      api.get('block-types'),
      api.get('exercises/all'),
    ])

    if (Array.isArray(typesRes.data)) blockTypes.value = typesRes.data
    exercicesForDropDown.value = (exosRes.data?.data ?? []).map(exo => ({
      id: exo.uuid,
      name: exo.name?.fr || exo.name
    }))
  } catch (error) {
    console.error('Erreur de chargement des données', error)
  }
})
</script>

<style scoped>
.forge-form {
  max-width: 880px;
  margin: 0 auto;
  padding: 3rem clamp(1.25rem, 5vw, 4rem) 6rem;
}

/* En-tête */
.forge-head { margin-bottom: 3rem; }
.forge-head__eyebrow {
  color: #ff5a36;
  font-family: 'Oswald', sans-serif;
  font-size: 0.85rem;
  margin: 0 0 0.5rem;
}
.forge-head__title {
  font-family: 'Oswald', sans-serif;
  font-size: clamp(1.8rem, 4vw, 2.6rem);
  text-transform: uppercase;
  margin: 0;
}
.forge-head__title .accent { color: #ff5a36; }
.forge-head__lead { color: #a9a39a; margin-top: 0.5rem; max-width: 480px; line-height: 1.6; }

/* Carousel de séances */
.carousel-section {
  margin-bottom: 2rem;
}
.carousel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}
.carousel-container {
  display: flex;
  gap: 1rem;
  overflow-x: auto;
  padding-bottom: 1rem;
  scroll-snap-type: x mandatory;
}
.session-card {
  flex: 0 0 240px;
  scroll-snap-align: start;
  background: #1c2024;
  border: 1px solid #323840;
  border-radius: 8px;
  padding: 1.25rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.session-card:hover {
  border-color: #ff5a36;
}
.session-card--active {
  background: #21252a;
  border-color: #ff5a36;
  box-shadow: 0 0 12px rgba(255, 90, 54, 0.2);
}
.session-card__head {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.session-card__badge {
  font-size: 0.75rem;
  font-family: 'Oswald', sans-serif;
  text-transform: uppercase;
  color: #ff5a36;
}
.session-card__title {
  font-size: 1.05rem;
  color: #fff;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.session-card__content {
  margin-top: 0.5rem;
  border-top: 1px solid #323840;
  padding-top: 0.5rem;
  min-height: 50px;
}
.session-card__empty {
  font-size: 0.78rem;
  color: #70757d;
  font-style: italic;
  margin: 0;
}
.session-card__preview-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
.session-card__preview-list li {
  font-size: 0.8rem;
  color: #d9d2c5;
  display: flex;
  justify-content: space-between;
}
.preview-exos-count {
  color: #a9a39a;
  font-size: 0.75rem;
}

/* Blocs & Formulaire */
.workout-title {
  background: #21252a;
  border: 1px solid #323840;
  border-radius: 8px;
  padding: 1.75rem clamp(1.25rem, 4vw, 2rem);
  margin-bottom: 2rem;
}
.forge-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  margin-bottom: 2.5rem;
}
.field-block {
  background: #1c2024;
  border: 1px solid #323840;
  border-radius: 8px;
  padding: clamp(1.25rem, 4vw, 2.5rem);
  display: flex;
  flex-direction: column;
  gap: 2rem;
}
.field-block__title {
  font-family: 'Oswald', sans-serif;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  font-size: 0.85rem;
  color: #a9a39a;
  margin: 0;
}

.field { display: flex; flex-direction: column; gap: 0.6rem; }
.field__label {
  font-family: 'Oswald', sans-serif;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  font-size: 0.85rem;
  color: #a9a39a;
}
.field-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1.25rem;
}
.input-with-unit { display: flex; align-items: center; gap: 0.75rem; }
.input-with-unit .input-axeon { max-width: 120px; }

/* Chips */
.chip-row { display: flex; flex-wrap: wrap; gap: 0.75rem; }
.chip {
  background: transparent;
  border: 1px solid #323840;
  color: #a9a39a;
  padding: 0.55rem 1.1rem;
  border-radius: 999px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: border-color 0.2s, color 0.2s, background 0.2s;
}
.chip:hover { border-color: #ff5a36; color: #f4f1ea; }
.chip--active {
  background: #ff5a36;
  border-color: #ff5a36;
  color: #14171a;
  font-weight: 600;
}

/* Éditeur de bloc */
.block-editor {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 1.75rem;
  padding-top: 2rem;
  border-top: 1px solid #323840;
}
.block-editor > .field,
.block-editor > .field-row,
.block-editor > .current-list { width: 100%; }

/* Recherche */
.search-wrapper { position: relative; }
.search-dropdown {
  position: absolute;
  top: calc(100% + 6px);
  left: 0; right: 0;
  background: #282840;
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 12px;
  max-height: 240px;
  overflow-y: auto;
  z-index: 1050;
  box-shadow: 0 12px 40px rgba(0,0,0,0.5);
}
.dropdown-item {
  width: 100%;
  background: transparent;
  border: none;
  color: #c0c0e0;
  padding: 0.8rem 1.1rem;
  text-align: left;
  font-family: 'Epilogue', sans-serif;
  font-size: 0.85rem;
  cursor: pointer;
}
.dropdown-item:hover { background: rgba(255,255,255,0.07); color: #fff; }

/* Listes */
.block-list, .block-card__exos, .current-list {
  list-style: none;
  margin: 0;
  padding: 0;
}
.block-list { display: flex; flex-direction: column; gap: 1rem; }
.block-card {
  background: #21252a;
  border: 1px solid #323840;
  border-radius: 8px;
  padding: 1.1rem 1.25rem;
}
.block-card__head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.75rem;
}
.block-card__title {
  font-family: 'Oswald', sans-serif;
  text-transform: uppercase;
  color: #d9d2c5;
}
.block-card__actions { display: flex; gap: 0.4rem; }
.block-card__exos li, .current-list li {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  border-top: 1px solid #323840;
  padding-top: 0.5rem;
  font-size: 0.9rem;
}
.current-list { display: flex; flex-direction: column; gap: 0.5rem; }
.block-card__detail { color: #a9a39a; font-size: 0.82rem; margin-left: auto; }

.icon-btn {
  background: transparent;
  border: 1px solid #323840;
  color: #a9a39a;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  cursor: pointer;
}
.icon-btn:hover:not(:disabled) { border-color: #ff5a36; color: #f4f1ea; }
.icon-btn:disabled { opacity: 0.35; cursor: not-allowed; }
.icon-btn--danger:hover:not(:disabled) { border-color: #f87171; color: #f87171; }

/* Boutons */
.btn {
  border: none;
  border-radius: 4px;
  font-family: 'Oswald', sans-serif;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  font-size: 0.95rem;
  cursor: pointer;
}
.btn--primary { background: #ff5a36; color: #14171a; padding: 0.9rem 2rem; }
.btn--primary:hover:not(:disabled) { opacity: 0.9; }
.btn--primary:disabled { opacity: 0.4; cursor: not-allowed; }
.btn--outline {
  background: transparent;
  border: 1px solid #ff5a36;
  color: #ff5a36;
  padding: 0.4rem 0.8rem;
  font-size: 0.8rem;
}
.btn--outline:hover:not(:disabled) { background: #ff5a36; color: #14171a; }
.btn--outline:disabled { opacity: 0.3; cursor: not-allowed; }

.forge-actions { display: flex; justify-content: flex-end; }
</style>
