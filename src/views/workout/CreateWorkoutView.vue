<template>
  <div class="forge-form">

    <header class="forge-head">
      <p class="forge-head__eyebrow">Nouveau mix</p>
      <h1 class="forge-head__title">Compose ta prochaine <span class="accent">séance</span></h1>
      <p class="forge-head__lead">
        Choisis tes blocs et tes exercices, la Méthode ForgeX s'occupe du reste.
      </p>
    </header>

    <section class="workout-title field">
      <label class="field__label" for="workout-title">Nom du programme</label>
      <input id="workout-title" class="input-axeon" type="text" v-model="draft.programTitle">
    </section>

    <div class="forge-grid">

      <!-- Récapitulatif des blocs validés -->
      <section v-if="draft.blocks.length" class="field-block">
        <h2 class="field-block__title">Blocs de la séance ({{ draft.blocks.length }})</h2>
        <ol class="block-list">
          <li v-for="(block, i) in draft.blocks" :key="block.uid" class="block-card">
            <div class="block-card__head">
              <strong class="block-card__title">{{ i + 1 }}. {{ blockLabel(block.type) }} <span v-if="blockWithTimeCaps.includes(block.type)">Durée  : {{  blockTimeCaps(block) }} minutes</span></strong>
              <div class="block-card__actions">
                <button type="button" class="icon-btn" :disabled="i === 0"
                        aria-label="Monter le bloc" @click="draft.moveBlock(block.uid, -1)">↑</button>
                <button type="button" class="icon-btn" :disabled="i === draft.blocks.length - 1"
                        aria-label="Descendre le bloc" @click="draft.moveBlock(block.uid, 1)">↓</button>
                <button type="button" class="icon-btn icon-btn--danger"
                        aria-label="Supprimer le bloc" @click="draft.removeBlock(block.uid)">✕</button>
              </div>
            </div>
            <ul class="block-card__exos">
              <li v-for="(exo, k) in block.exercises" :key="k">
                <span>{{ exo.name }}</span>
                <span class="block-card__detail" v-if="blockWithTimeCaps.includes(block.type)">
                  {{ exo.settings.reps }} · reps
                </span>
                <span class="block-card__detail" v-else>
                  {{ exo.settings.sets }} × {{ exo.settings.reps }} · repos {{ exo.settings.restTime }} s
                </span>
              </li>
            </ul>
          </li>
        </ol>
      </section>

      <!-- Éditeur du bloc en cours -->
      <section class="field-block">

        <div class="field">
          <label class="field__label" for="session-name">Nom de la séance</label>
          <input id="session-name" class="input-axeon" type="text" v-model="draft.sessionName">
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
              <label class="field__label" for="rest-time">Temps de  travail</label>
              <div class="input-with-unit">
                <input id="rest-time" class="input-axeon input-width-numbers" type="number" min="0"
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
              <!-- pour blocs avec un temps réparti -->
              <span class="block-card__detail" v-if="blockWithTimeCaps.includes(blockType)">
                {{ exo.settings.reps }} - répétitions
              </span>
              <!-- pour blocs avec des séries -->
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

    <div class="forge-actions">
      <button type="button" class="btn btn--primary" :disabled="!canSubmit" @click="submit">
        Forger ma séance
      </button>
    </div>

  </div>
</template>

<script setup>
import {reactive, ref, computed, onMounted, watch} from 'vue'
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
const trainingBlock = ref([])            // exercices du bloc en cours d'édition
const form = reactive({ type: null })
const timeCaps = ref(0)
const blockWithTimeCaps = ref([
  'AMRAP'
])

const isVisible = computed(() => form.type !== null)
const canSubmit = computed(() => draft.blocks.length > 0 && draft.sessionName.trim() !== '')

const filteredExercices = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  if (!query) return exercicesForDropDown.value
  return exercicesForDropDown.value.filter(exo => exo.name?.toLowerCase().includes(query))
})

const blockLabel = (key) => blockTypes.value.find(t => t.key === key)?.value ?? key
const blockTimeCaps = (item) => {
  if (item) {
    return item.exercises[0].settings.timeCaps
  }
}
function toggleType(key) {
  form.type = form.type === key ? null : key
}

const blockType = computed(() => {
  return form.type
})

watch(blockType, (val) => {
  console.log('blockType', blockType, 'val : ', val)
})


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

  console.log('block type : ', blockType.value)

  if (blockWithTimeCaps.value.includes(blockType.value)) {
    console.log('times caps setting : ', settings.value.timeCaps)
    if (settings.value.timeCaps !== 0) {
      console.log('value : ', settings.value.timeCaps)
      timeCaps.value = settings.value.timeCaps
      console.log('time value : ', timeCaps.value)
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
  console.log('draft : ', draft)
  console.log('trainingBlock : ', trainingBlock)
  try {
    const response = await api.post('workouts', {
      title: draft.programTitle,
      session_name: draft.sessionName,
      blocks: draft.blocks,
    })

    console.log('reponse API : ', response);
    draft.reset()
    // router.push({ name: 'dashboard' })
  } catch (error) {
    console.error('Error saving workout', error)
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
      exercise_uuid: exo.id,
      name: exo.name.fr
    }))
  } catch (error) {
    console.error('Error fetching form data', error)
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

/* Blocs */
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
  margin: 0 0 0.6rem;
}

/* Champs */
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
.chip:focus-visible { outline: 2px solid #ff5a36; outline-offset: 2px; }
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
  transition: background 0.1s, color 0.1s;
}
.dropdown-item:hover { background: rgba(255,255,255,0.07); color: #fff; }
.dropdown-item:first-child { border-radius: 12px 12px 0 0; }
.dropdown-item:last-child { border-radius: 0 0 12px 12px; }

/* Listes : exercices en cours + blocs validés */
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
  letter-spacing: 0.03em;
  color: #d9d2c5;
}
.block-card__actions { display: flex; gap: 0.4rem; }
.block-card__exos { display: flex; flex-direction: column; gap: 0.5rem; }
.block-card__exos li,
.current-list li {
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
  transition: border-color 0.2s, color 0.2s;
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
  transition: opacity 0.2s;
}
.btn--primary { background: #ff5a36; color: #14171a; padding: 0.9rem 2rem; }
.btn--primary:hover:not(:disabled) { opacity: 0.9; }
.btn--primary:disabled { opacity: 0.4; cursor: not-allowed; }

.forge-actions { display: flex; justify-content: flex-end; }
</style>
