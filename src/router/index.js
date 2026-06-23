import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth' // On aura besoin du store !

import HomeView from "@/views/HomeView.vue"
import LoginView from '@/views/LoginView.vue'
import WelcomeView from '@/views/WelcomeView.vue'
import ProfileView from "@/views/users/profiles/ProfileView.vue"; // Ta page de présentation

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
    meta: { requiresAuth: true } //Cette page nécessite d'être connecté
  },
  {
    path: '/welcome',
    name: 'welcome',
    component: WelcomeView,
    meta: { guestOnly: true } //  Uniquement pour les invités (déconnectés)
  },
  {
    path: '/connexion',
    name: 'login',
    component: LoginView,
    meta: { guestOnly: true } //  Inutile d'y aller si on est déjà connecté
  },


  // users & profile
  {
    path: '/profile',
    name: 'profile',
    component: ProfileView,
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// Étape 2 : Le Gardien du Routeur (Navigation Guard)
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore() // On regarde si l'utilisateur a un token

  // Cas 1 : La page demande d'être connecté, mais l'utilisateur ne l'est pas
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'welcome' }) // ➡Redirection forcée vers Welcome
  }

  // Cas 2 : L'utilisateur est connecté mais essaie d'aller sur Welcome ou Connexion
  else if (to.meta.guestOnly && authStore.isAuthenticated) {
    next({ name: 'home' }) //  Redirection vers sa page d'accueil privée
  }

  // Cas 3 : Tout est ok, on le laisse passer
  else {
    next()
  }
})

export default router
