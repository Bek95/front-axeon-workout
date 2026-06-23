<template>
  <div class="library-page">
    <div class="grain" aria-hidden="true"></div>

    <header class="lib-header">
      <div class="lib-header__titles">
        <p class="eyebrow">Index Technique</p>
        <h1 class="lib-title">Librairie d'exercices</h1>
        <p class="lib-lead">Consulte le catalogue de mouvements pour parfaire l'exécution de ton mix.</p>
      </div>

      <div class="search-bar">
        <input
          v-model="filters.search"
          type="text"
          :placeholder="currentLocale === 'fr' ? 'Rechercher un mouvement...' : 'Search exercise...'"
        />
      </div>
    </header>

    <div class="lib-layout">
      <aside class="filters-sidebar">
        <div class="sidebar-head">
          <h3>Filtres de tri</h3>
          <button type="button" class="btn-reset" @click="resetFilters">Réinitialiser</button>
        </div>

        <div class="filters-group">
          <label class="filter-label">Nombre d'exercices à afficher</label>
          <select v-model.number="filters.per_page" class="filter-select" @change="fetchExercises">
            <option v-for="item in perPage" :key="item.id" :value="item.value">
              {{ item.value }} exercices
            </option>
          </select>
        </div>

        <div class="filters-group">
          <label class="filter-label">Groupe Musculaire</label>
          <div class="checkbox-list">
            <label v-for="m in muscleOptions" :key="m.id" class="filter-cb">
              <input type="checkbox" :value="m.id" v-model="filters.muscles_group" @change="fetchExercises" />
              <span>{{ m.name }}</span>
            </label>
          </div>
        </div>

        <div class="filters-group">
          <label class="filter-label">Équipement</label>
          <div class="checkbox-list">
            <label v-for="eq in equipmentOptions" :key="eq" class="filter-cb">
              <input type="checkbox" :value="eq" v-model="filters.equipment" />
              <span>{{ eq }}</span>
            </label>
          </div>
        </div>

        <div class="filters-group">
          <label class="filter-label">Type de Mouvement</label>
          <div class="checkbox-list">
            <label v-for="mv in movementOptions" :key="mv" class="filter-cb">
              <input type="checkbox" :value="mv" v-model="filters.movement_type" />
              <span class="uppercase-tag">{{ mv }}</span>
            </label>
          </div>
        </div>

        <div class="filters-group">
          <label class="filter-label">Mécanique</label>
          <select v-model="filters.mechanic" class="filter-select">
            <option value="">Tous</option>
            <option value="isolation">Isolation</option>
            <option value="compound">Polyarticulaire (Compound)</option>
          </select>
        </div>
      </aside>

      <main class="exercises-main">
        <div v-if="loading" class="loading-state">
          <div class="spinner"></div>
          <p>Indexation de la forge en cours...</p>
        </div>

        <div v-else-if="exercises.length === 0" class="empty-state">
          <p>Aucun mouvement ne correspond aux filtres appliqués.</p>
        </div>

        <div v-else class="exercises-grid">
          <article v-for="exo in exercises" :key="exo.id" class="exo-card">
            <div class="exo-card__badges">
    <span class="badge badge--accent" v-if="exo.muscle_group">
      {{ typeof exo.muscle_group.name === 'object' ? exo.muscle_group.name[currentLocale] : exo.muscle_group.name }}
    </span>
              <span v-if="exo.movement_type" class="badge">{{ exo.movement_type }}</span>
              <span v-if="exo.mechanic" class="badge badge--outline">{{ exo.mechanic }}</span>
            </div>

            <h2 class="exo-card__title">{{ exo.name?.[currentLocale] || exo.name }}</h2>
            <p class="exo-card__description">{{ exo.description?.[currentLocale] || exo.description }}</p>

            <div class="exo-card__instructions">
              <h4>Instructions :</h4>
              <p class="pre-line">{{ exo.instructions?.[currentLocale] || exo.instructions }}</p>
            </div>

            <div class="exo-card__footer">
    <span v-if="exo.secondary_muscle_group" class="secondary-muscles">
      Synergie : {{ typeof exo.secondary_muscle_group.name === 'object' ? exo.secondary_muscle_group.name[currentLocale] : exo.secondary_muscle_group.name }}
    </span>
            </div>
          </article>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import api from '@/services/api.js'

const currentLocale = ref('fr')
const allExercises = ref([]) // Source brute de l'API
const loading = ref(false)
const muscleOptions = ref([])
const loadingMuscles = ref(false)

// Récupération des groupes musculaires
async function fetchMuscleGroup() {
  loadingMuscles.value = true
  try {
    const response = await api.get('/muscles-group')
    const rawData = Array.isArray(response.data) ? response.data : (response.data.data || [])

    muscleOptions.value = rawData.sort((a, b) => {
      return a.name.localeCompare(b.name, 'fr', { sensitivity: 'base' })
    })
  } catch (error) {
    console.error('Erreur API ForgeX: ' + error)
  } finally {
    loadingMuscles.value = false
  }
}

const equipmentOptions = ref(['dumbbell', 'barbell', 'kettlebell', 'bodyweight'])
const movementOptions = ref(['push', 'pull', 'legs', 'core'])

// Variables d'état pour les filtres
const filters = reactive({
  search: '',
  mechanic: '',
  equipment: [],
  muscles_group: [],
  movement_type: [],
  per_page: 10,
})

let optionId = 0
const perPage = ref([
  {id: optionId++, value: 5},
  {id: optionId++, value: 10},
  {id: optionId++, value: 20},
  {id: optionId++, value: 50},
  {id: optionId++, value: 100}
])

// Appel API principal
async function fetchExercises() {
  loading.value = true
  try {
    const params = {}

    if (filters.per_page) params.per_page = filters.per_page
    if (filters.muscles_group && filters.muscles_group.length > 0) {
      params.muscles_group = filters.muscles_group
    }

    const response = await api.get('exercises', { params })
    allExercises.value = Array.isArray(response.data) ? response.data : (response.data.data || [])
  } catch (error) {
    console.error('Erreur API ForgeX:', error)
  } finally {
    loading.value = false
  }
}

// Propriété calculée corrigée
const exercises = computed(() => {
  if (!allExercises.value || allExercises.value.length === 0) return []

  return allExercises.value.filter(exo => {
    // 1. Filtre textuel
    if (filters.search) {
      const query = filters.search.toLowerCase()
      const nameFR = exo.name?.fr?.toLowerCase() || ''
      const nameEN = exo.name?.en?.toLowerCase() || ''
      if (!nameFR.includes(query) && !nameEN.includes(query)) return false
    }

    // 2. Filtre mécanique
    if (filters.mechanic && exo.mechanic !== filters.mechanic) return false

    // 3. Filtre type de mouvement
    if (filters.movement_type.length > 0 && !filters.movement_type.includes(exo.movement_type)) return false

    // 4. Filtre groupe musculaire (CORRIGÉ : On compare l'ID avec l'ID, pas le slug)
    if (filters.muscles_group.length > 0) {
      const matchPrincipal = filters.muscles_group.includes(exo.muscle_group?.id)
      const matchSecondaire = filters.muscles_group.includes(exo.secondary_muscle_group?.id)

      if (!matchPrincipal && !matchSecondaire) return false
    }

    return true
  })
})

function resetFilters() {
  filters.search = ''
  filters.mechanic = ''
  filters.equipment = []
  filters.muscles_group = []
  filters.movement_type = []
  filters.per_page = 10
  fetchExercises() // Relance la recherche globale après reset
}

onMounted(() => {
  fetchExercises()
  fetchMuscleGroup()
})
</script>

<style scoped>
/* Conserve tes styles CSS actuels, ils sont parfaits */
.library-page {
  --ink: #14171a;
  --ink-soft: #1c2024;
  --panel: #21252a;
  --panel-line: #323840;
  --paper: #d9d2c5;
  --paper-dim: #a9a39a;
  --accent: #ff5a36;

  background: var(--ink);
  color: var(--paper);
  font-family: 'Inter', sans-serif;
  min-height: 100vh;
  padding: 2rem clamp(1.25rem, 5vw, 4rem);
}
.grain {
  position: fixed;
  inset: 0;
  pointer-events: none;
  opacity: 0.035;
  z-index: 1;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
}
.lib-header { display: flex; justify-content: space-between; align-items: flex-end; gap: 2rem; border-bottom: 1px solid var(--panel-line); padding-bottom: 2rem; margin-bottom: 2.5rem; }
@media (max-width: 768px) { .lib-header { flex-direction: column; align-items: stretch; } }
.eyebrow { font-family: 'Oswald', sans-serif; text-transform: uppercase; letter-spacing: 0.14em; font-size: 0.78rem; color: var(--accent); margin: 0; }
.lib-title { font-family: 'Oswald', sans-serif; font-size: clamp(2rem, 4vw, 2.8rem); text-transform: uppercase; margin: 0.4rem 0 0; }
.lib-lead { color: var(--paper-dim); margin: 0.4rem 0 0; font-size: 0.95rem; }
.search-bar input { background: var(--panel); border: 1px solid var(--panel-line); color: var(--paper); border-radius: 6px; padding: 0.8rem 1.2rem; width: 300px; font-size: 0.95rem; }
.search-bar input:focus { border-color: var(--accent); outline: none; }
@media (max-width: 768px) { .search-bar input { width: 100%; } }
.lib-layout { display: grid; grid-template-columns: 260px 1fr; gap: 3rem; }
@media (max-width: 920px) { .lib-layout { grid-template-columns: 1fr; } }
.filters-sidebar { background: var(--ink-soft); border: 1px solid var(--panel-line); border-radius: 8px; padding: 1.5rem; height: fit-content; }
.sidebar-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; border-bottom: 1px solid var(--panel-line); padding-bottom: 0.75rem; }
.sidebar-head h3 { font-family: 'Oswald', sans-serif; text-transform: uppercase; margin: 0; font-size: 1.1rem; }
.btn-reset { background: none; border: none; color: var(--accent); font-size: 0.8rem; cursor: pointer; font-weight: 600; }
.filters-group { margin-bottom: 1.5rem; }
.filter-label { display: block; font-size: 0.82rem; font-weight: 600; color: var(--paper-dim); margin-bottom: 0.6rem; text-transform: uppercase; letter-spacing: 0.05em;}
.checkbox-list { display: flex; flex-direction: column; gap: 0.5rem; }
.filter-cb { display: flex; align-items: center; gap: 0.6rem; font-size: 0.9rem; color: var(--paper); cursor: pointer; }
.filter-cb input { accent-color: var(--accent); width: 15px; height: 15px; }
.filter-select { width: 100%; background: var(--panel); border: 1px solid var(--panel-line); color: var(--paper); padding: 0.6rem; border-radius: 4px; }
.exercises-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 1.5rem; }
.exo-card { background: var(--panel); border: 1px solid var(--panel-line); border-radius: 6px; padding: 1.5rem; display: flex; flex-direction: column; transition: border-color 0.2s; }
.exo-card:hover { border-color: var(--accent); }
.exo-card__badges { display: flex; gap: 0.5rem; margin-bottom: 1rem; flex-wrap: wrap; }
.badge { font-size: 0.7rem; font-weight: 600; text-transform: uppercase; background: var(--panel-line); padding: 0.2rem 0.5rem; border-radius: 4px; letter-spacing: 0.02em; }
.badge--accent { background: var(--accent); color: var(--ink); }
.badge--outline { background: transparent; border: 1px solid var(--panel-line); color: var(--paper-dim); }
.exo-card__title { font-family: 'Oswald', sans-serif; font-size: 1.4rem; margin: 0 0 0.5rem 0; font-weight: 600; }
.exo-card__description { font-size: 0.9rem; color: var(--paper-dim); margin: 0 0 1.2rem 0; line-height: 1.4; }
.exo-card__instructions { background: var(--ink-soft); border-left: 2px solid var(--accent); padding: 0.75rem 1rem; border-radius: 0 4px 4px 0; font-size: 0.85rem; margin-top: auto; }
.exo-card__instructions h4 { margin: 0 0 0.4rem 0; font-weight: 600; color: var(--paper); }
.pre-line { white-space: pre-line; color: var(--paper-dim); margin: 0; line-height: 1.5; }
.exo-card__footer { margin-top: 1rem; font-size: 0.78rem; color: var(--paper-dim); }
.uppercase-tag { text-transform: uppercase; }
.loading-state, .empty-state { text-align: center; padding: 4rem 0; color: var(--paper-dim); grid-column: 1 / -1; }
.spinner { width: 30px; height: 30px; border: 3px solid var(--panel-line); border-top-color: var(--accent); border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto 1rem; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>
