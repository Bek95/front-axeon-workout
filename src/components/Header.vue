<script setup>
import { useAuthStore } from "@/stores/auth.js";
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

// On supprime la constante figée
const handleLogout = async () => {
  await authStore.logout()
  router.push({ name: 'welcome' })
}
</script>

<template>
  <header class="nav">
    <div class="nav__brand">
      <span class="nav__mark">FX</span>
      <span class="nav__name">FORGE<span class="accent">X</span></span>
    </div>

    <nav class="nav__links">
      <a href="#mix">Le mix</a>
      <a href="#programmes">Programmes</a>
      <a href="#methode">Méthode</a>
      <a href="#methode">Créer son programmes</a>
      <a href="#methode">Librairie d'exercices</a>
    </nav>

    <div v-if="authStore.isAuthenticated">
      <button class="btn btn--ghost nav__cta" @click="handleLogout">Se déconnecter</button>
    </div>
    <div v-else>
      <router-link :to="{name: 'login'}">
        <button class="btn btn--ghost nav__cta">Se connecter</button>
      </router-link>
    </div>
  </header>
</template>

<style scoped>

/* ---------- Nav ---------- */
.nav {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem clamp(1.25rem, 5vw, 4rem);
  max-width: 1280px;
  margin: 0 auto;
}
.nav__brand { display: flex; align-items: center; gap: 0.6rem; }
.nav__mark {
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  background: var(--accent);
  color: var(--ink);
  font-family: var(--font-display);
  font-weight: 700;
  border-radius: 4px;
  font-size: 0.85rem;
}
.nav__name {
  font-family: var(--font-display);
  font-weight: 600;
  letter-spacing: 0.04em;
  font-size: 1.1rem;
}
.nav__links {
  display: flex;
  gap: 2rem;
}
.nav__links a {
  color: var(--paper-dim);
  text-decoration: none;
  font-size: 0.92rem;
  font-weight: 500;
  transition: color 0.15s ease;
}
.nav__links a:hover { color: var(--paper); }
@media (max-width: 760px) {
  .nav__links { display: none; }
}


</style>
