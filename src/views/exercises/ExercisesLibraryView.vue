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
          <select v-model.number="filters.per_page" class="filter-select" @change="changePerPage">
            <option v-for="item in perPage" :key="item.id" :value="item.value">
              {{ item.value }} exercices
            </option>
          </select>
        </div>

        <div class="filters-group">
          <label class="filter-label">Groupe Musculaire</label>
          <div class="checkbox-list wrapper scroll-force">
            <label v-for="m in muscleOptions" :key="m.id" class="filter-cb">
              <input type="checkbox" :value="m.id" v-model="filters.muscles_group" @change="triggerFetch" />
              <span>{{ m.name }}</span>
            </label>
          </div>
        </div>

        <div class="filters-group">
          <label class="filter-label">Équipement</label>
          <div class="checkbox-list wrapper scroll-force">
            <label v-for="eq in equipmentOptions" :key="eq.id" class="filter-cb">
              <input type="checkbox" :value="eq.id" v-model="filters.equipment" @change="triggerFetch" />
              <span>{{ eq.name }}</span>
            </label>
          </div>
        </div>

        <div class="filters-group">
          <label class="filter-label">Type de Mouvement</label>
          <div class="checkbox-list">
            <label v-for="mv in movementOptions" :key="mv.name" class="filter-cb">
              <input type="checkbox" :value="mv.name" v-model="filters.movement_type" @change="triggerFetch" />
              <span>{{ mv.label }}</span>
            </label>
          </div>
        </div>

        <div class="filters-group">
          <label class="filter-label">Type d'éxécution</label>
          <select v-model="filters.execution_type" class="filter-select" @change="triggerFetch">
            <option value="">Tous</option>
            <option v-for="val in executionTypeOptions" :key="val.name" :value="val.name">{{ val.label }}</option>
          </select>
        </div>

        <div class="filters-group">
          <label class="filter-label">Mécanique</label>
          <select v-model="filters.mechanic" class="filter-select" @change="triggerFetch">
            <option value="">Tous</option>
            <option v-for="val in mechanicTypeOptions" :key="val.name" :value="val.name">{{ val.label }}</option>
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

        <div v-else>
          <div class="exercises-grid">
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

          <div v-if="pagination.last_page > 1" class="pagination-container">
            <button
              class="pagination-btn"
              :disabled="pagination.current_page === 1"
              @click="changePage(pagination.current_page - 1)"
            >
              &laquo; Précédent
            </button>

            <div class="pagination-pages">
              <template v-for="(page, index) in visiblePages" :key="index">
                <button
                  v-if="page !== '...'"
                  class="page-number"
                  :class="{ 'page-number--active': page === pagination.current_page }"
                  @click="changePage(page)"
                >
                  {{ page }}
                </button>

                <span v-else class="pagination-ellipsis">...</span>
              </template>
            </div>

            <button
              class="pagination-btn"
              :disabled="pagination.current_page === pagination.last_page"
              @click="changePage(pagination.current_page + 1)"
            >
              Suivant &raquo;
            </button>
          </div>
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
const loadingEquipment = ref(false)
const loadingMovementType = ref(false)
const loadingExecutionType = ref(false)
const loadingMechanicType = ref(false)

//  État pour stocker la structure du Paginator Laravel
const pagination = reactive({
  current_page: 1,
  last_page: 1,
  total: 0
})

const equipmentOptions = ref([])
const movementOptions = ref([])
const executionTypeOptions = ref([])
const mechanicTypeOptions = ref([])

// Variables d'état pour les filtres
const filters = reactive({
  search: '',
  mechanic: '',
  equipment: [],
  muscles_group: [],
  movement_type: [],
  execution_type: '',
  per_page: 10,
  page: 1, //  Étape essentielle : Suivi de la page en cours
})

let optionId = 0
const perPage = ref([
  {id: optionId++, value: 5},
  {id: optionId++, value: 10},
  {id: optionId++, value: 20},
  {id: optionId++, value: 50},
  {id: optionId++, value: 100}
])

// Fonction de navigation
function changePage(newPage) {
  filters.page = newPage
  fetchExercises()
}

// Sécurité : si on change le nombre d'éléments par page, on repasse à la page 1
function changePerPage() {
  filters.page = 1
  fetchExercises()
}

// Sécurité : si on change un filtre, on repasse à la page 1 pour éviter d'être hors-zone
function triggerFetch() {
  filters.page = 1
  fetchExercises()
}

// Appel API principal
async function fetchExercises() {
  loading.value = true
  try {
    const params = {}

    if (filters.page) params.page = filters.page
    if (filters.per_page) params.per_page = filters.per_page
    if (filters.muscles_group && filters.muscles_group.length > 0) params.muscles_group = filters.muscles_group
    if (filters.equipment && filters.equipment.length > 0) params.equipment = filters.equipment
    if (filters.movement_type && filters.movement_type.length > 0) params.movement_type = filters.movement_type
    if (filters.execution_type && filters.execution_type.length > 0) params.execution_type = filters.execution_type
    if (filters.mechanic && filters.mechanic.length > 0) params.mechanic = filters.mechanic

    const response = await api.get('exercises', { params })

    // 🔹 MODIFICATION ICI : On va chercher dans response.data.meta
    if (response.data && response.data.meta) {
      allExercises.value = response.data.data || []
      pagination.current_page = response.data.meta.current_page
      pagination.last_page = response.data.meta.last_page
      pagination.total = response.data.meta.total
    } else {
      // Sécurité si un jour l'API renvoie un tableau brut
      allExercises.value = Array.isArray(response.data) ? response.data : (response.data.data || [])
      pagination.last_page = 1
    }
  } catch (error) {
    console.error('Erreur API ForgeX:', error)
  } finally {
    loading.value = false
  }
}

// Récupération des données secondaires
async function fetchMechanics() {
  loadingMechanicType.value = true
  try {
    const response = await api.get('/mechanic-types')
    mechanicTypeOptions.value = Array.isArray(response.data) ? response.data : (response.data || [])
  } catch (error) {
    console.error('Error fetching mechanics', error)
  } finally {
    loadingMechanicType.value = false
  }
}

async function fetchMuscleGroup() {
  loadingMuscles.value = true
  try {
    const response = await api.get('/muscles-group')
    const rawData = Array.isArray(response.data) ? response.data : (response.data.data || [])
    muscleOptions.value = rawData.sort((a, b) => a.name.localeCompare(b.name, 'fr', { sensitivity: 'base' }))
  } catch (error) {
    console.error('Erreur API ForgeX: ' + error)
  } finally {
    loadingMuscles.value = false
  }
}

async function fetchExecutionType() {
  loadingExecutionType.value = true
  try {
    const response = await api.get('/execution-types')
    executionTypeOptions.value = Array.isArray(response.data) ? response.data : (response.data.data || [])
  } catch (error) {
    console.error('Erreur API ForgeX: ' + error)
  } finally {
    loadingExecutionType.value = false
  }
}

async function fetchMovementTypes() {
  loadingMovementType.value = true
  try {
    const response = await api.get('/movement-types')
    movementOptions.value = Array.isArray(response.data) ? response.data : (response.data.data || [])
  } catch (error) {
    console.error('Erreur API ForgeX: ' + error)
  } finally {
    loadingMovementType.value = false
  }
}

async function fetchEquipment() {
  loadingEquipment.value = true
  try {
    const response = await api.get('/equipments')
    const rawData = Array.isArray(response.data) ? response.data : (response.data.data || [])
    equipmentOptions.value = rawData.sort((a, b) => a.name.localeCompare(b.name, 'fr', { sensitivity: 'base' }))
  } catch (error) {
    console.error('Erreur API ForgeX: ' + error)
  } finally {
    loadingEquipment.value = false
  }
}

const exercises = computed(() => {
  if (!allExercises.value || allExercises.value.length === 0) return []

  return allExercises.value.filter(exo => {
    if (filters.search) {
      const query = filters.search.toLowerCase()
      const nameFR = exo.name?.fr?.toLowerCase() || ''
      const nameEN = exo.name?.en?.toLowerCase() || ''
      if (!nameFR.includes(query) && !nameEN.includes(query)) return false
    }

    if (filters.mechanic.length > 0) {
      const exoMechanicType = (exo.mechanic || '').toUpperCase()
      if (!filters.mechanic.includes(exoMechanicType)) return false
    }

    if (filters.movement_type.length > 0) {
      const exoMoveType = (exo.movement_type || '').toUpperCase()
      if (!filters.movement_type.includes(exoMoveType)) return false
    }

    if (filters.muscles_group.length > 0) {
      const matchPrincipal = filters.muscles_group.includes(exo.muscle_group?.id)
      const matchSecondaire = filters.muscles_group.includes(exo.secondary_muscle_group?.id)
      if (!matchPrincipal && !matchSecondaire) return false
    }

    return true
  })
})

// Propriété calculée pour générer les pages visibles avec des "..."
const visiblePages = computed(() => {
  const current = pagination.current_page
  const last = pagination.last_page
  const delta = 1 // Nombre de pages à afficher avant et après la page courante

  const pages = []

  for (let i = 1; i <= last; i++) {
    // On garde toujours la première page, la dernière page, et les pages autour de la page courante
    if (i === 1 || i === last || (i >= current - delta && i <= current + delta)) {
      pages.push(i)
    } else if (pages[pages.length - 1] !== '...') {
      // On ajoute les points de suspension si ce n'est pas déjà fait
      pages.push('...')
    }
  }

  return pages
})

function resetFilters() {
  filters.search = ''
  filters.mechanic = ''
  filters.equipment = []
  filters.muscles_group = []
  filters.movement_type = []
  filters.execution_type = ''
  filters.per_page = 10
  filters.page = 1
  fetchExercises()
}

onMounted(() => {
  fetchExercises()
  fetchMuscleGroup()
  fetchEquipment()
  fetchMovementTypes()
  fetchExecutionType()
  fetchMechanics()
})
</script>

<style scoped>
/* Conteneur principal */
.scroll-force {
  max-height: 200px;
  overflow-y: scroll; /* Force l'existence du scroll vertical */

  /* Pour Firefox */
  scrollbar-color: var(--accent, #ff5a36) var(--panel, #21252a);
  scrollbar-width: thin;
}

/* --- Pour Chrome, Safari, Edge (Force la visibilité permanente) --- */

/* 1. On définit la largeur de la barre */
.scroll-force::-webkit-scrollbar {
  width: 6px; /* Une barre fine mais bien visible */
  display: block; /* Force l'affichage */
}

/* 2. La piste (le fond de la barre) */
.scroll-force::-webkit-scrollbar-track {
  background: var(--ink-soft, #1c2024); /* Fond sombre qui s'intègre à ton panneau */
  border-radius: 10px;
}

/* 3. Le curseur (la barre qui bouge) */
.scroll-force::-webkit-scrollbar-thumb {
  background-color: var(--accent, #ff5a36); /* Ta couleur orange/rouge */
  border-radius: 10px;
}

/* 4. Effet de survol optionnel pour la finition UI */
.scroll-force::-webkit-scrollbar-thumb:hover {
  background-color: #e04525;
}
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

/* --- PAGINATION STYLES --- */
.pagination-container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 3rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--panel-line);
}

.pagination-btn {
  background: var(--panel);
  border: 1px solid var(--panel-line);
  color: var(--paper);
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.pagination-btn:hover:not(:disabled) {
  border-color: var(--accent);
  color: var(--accent);
}

.pagination-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.pagination-pages {
  display: flex;
  gap: 0.5rem;
}

.pagination-ellipsis {
  color: var(--paper-dim);
  padding: 0 0.5rem;
  display: flex;
  align-items: center;
  user-select: none;
}

.page-number {
  background: transparent;
  border: 1px solid var(--panel-line);
  color: var(--paper-dim);
  width: 36px;
  height: 36px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.page-number:hover {
  border-color: var(--accent);
  color: var(--paper);
}

.page-number--active {
  background: var(--accent);
  border-color: var(--accent);
  color: var(--ink);
}
</style>
