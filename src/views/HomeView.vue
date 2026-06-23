<template>
  <div class="dashboard">
    <header class="dash-head">
      <h1 class="dash-head__title">
        Prêt pour la forge, <span class="accent">{{ authStore.user?.pseudo || 'Athlète' }}</span> ?
      </h1>
      <p class="dash-head__lead">{{ formattedDate }} — Ne rate pas ta fenêtre d'intensité aujourd'hui.</p>
    </header>

    <section class="dash-body">

      <div v-if="workouts.length === 0" class="empty-forge">
        <div class="empty-forge__visual">
          <span class="mark">FX</span>
        </div>
        <h2 class="empty-forge__title">Aucun entraînement dans ton planning</h2>
        <p class="empty-forge__text">
          Force pure, cardio CrossFit ou fonctionnel... Combine tes objectifs et génère ta première séance sur-mesure.
        </p>
        //todo a faire mettre en place la redirection
<!--        <router-link :to="{ name: 'create-program' }" class="btn btn&#45;&#45;primary">-->
          Créer mon premier programme
<!--        </router-link>-->
      </div>

      <div v-else class="workout-grid">
        <div class="workout-section-title">
          <h2>Tes programmes récents</h2>
          <router-link :to="{ name: 'create-program' }" class="btn btn--ghost btn--sm">
            + Nouveau mix
          </router-link>
        </div>

        <div class="grid">
          <div v-for="w in workouts" :key="w.id" class="workout-card">
            <span class="workout-card__tag">{{ w.type }}</span>
            <h3>{{ w.name }}</h3>
            <p>{{ w.duration }} min · {{ w.exercises_count }} exercices</p>
            <button class="btn btn--primary btn--sm">Lancer la séance</button>
          </div>
        </div>
      </div>

      <div class="dash-explore">
        <h3>Explorer la bibliothèque</h3>
        <div class="explore-row">
            <div class="explore-card">
              <router-link :to="{ name: 'exercises-library' }" class="router-link-no-decoration">
              <h4>Librairie d'exercices</h4>
              <p>Révise les mouvements techniques (Clean & Jerk, Snatch, Muscle-up...)</p>
              </router-link>
            </div>

          <div class="explore-card">
            <h4>La Méthode ForgeX</h4>
            <p>Comprendre comment est calculé ton mix de force et d'intensité.</p>
          </div>
        </div>
      </div>

    </section>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth.js'

const authStore = useAuthStore()

// Pour l'instant on laisse le tableau vide pour afficher le super "Empty State"
// Plus tard, un appel api rechargera ce tableau : api.get('user/workouts')
const workouts = ref([])
const currentDate = ref(new Date())
const locale = ref('fr-FR') // todo a adapter plus tard

const formattedDate = computed(() => {
  return new Intl.DateTimeFormat(locale.value, {
    dateStyle: 'full', // 'full' (mardi 23 juin 2026), 'long', 'medium', 'short' (23/06/2026)
    // timeStyle: 'short' // Optionnel : pour mettre  l'heure  comme ceci par exemple(17:07)
  }).format(currentDate.value)
})

</script>

<style scoped>
.dashboard {
  max-width: 1280px;
  margin: 0 auto;
  padding: 2rem clamp(1.25rem, 5vw, 4rem);
}
.dash-head { margin-bottom: 3rem; }
.dash-head__title {
  font-family: 'Oswald', sans-serif;
  font-size: clamp(2rem, 4vw, 3rem);
  text-transform: uppercase;
  margin: 0;
}
.dash-head__lead { color: #a9a39a; margin-top: 0.5rem; }

/* Empty State Style (Esprit ForgeX) */
.empty-forge {
  background: #21252a;
  border: 1px solid #323840;
  border-radius: 8px;
  padding: 4rem 2rem;
  text-align: center;
  max-width: 640px;
  margin: 0 auto 4rem;
}
.empty-forge__visual {
  width: 50px;
  height: 50px;
  background: #ff5a36;
  color: #14171a;
  font-family: 'Oswald', sans-serif;
  font-weight: 700;
  display: grid;
  place-items: center;
  margin: 0 auto 1.5rem;
  border-radius: 4px;
}
.empty-forge__title { font-family: 'Oswald', sans-serif; font-size: 1.5rem; margin-bottom: 0.5rem; }
.empty-forge__text { color: #a9a39a; max-width: 400px; margin: 0 auto 2rem; font-size: 0.95rem; }

/* Exploration cards */
.dash-explore { margin-top: 4rem; }
.dash-explore h3 { font-family: 'Oswald', sans-serif; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 1.5rem;}
.explore-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; }
.explore-card {
  background: #1c2024;
  border: 1px solid #323840;
  padding: 1.5rem;
  border-radius: 6px;
  cursor: pointer;
  transition: border-color 0.2s;
}
.explore-card:hover { border-color: #ff5a36; }
.explore-card h4 { margin: 0 0 0.5rem 0; font-family: 'Oswald', sans-serif; font-size: 1.2rem; }
.explore-card p { color: #a9a39a; margin: 0; font-size: 0.9rem; }
</style>
