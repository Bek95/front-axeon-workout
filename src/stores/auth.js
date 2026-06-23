import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/services/api.js'

export const useAuthStore = defineStore('auth', () => {
  // On initialise le token avec ce qui est potentiellement déjà dans le localStorage
  const token = ref(localStorage.getItem('user_token') || null)
  const user = ref(null) // Pour stocker les infos de l'utilisateur plus tard (nom, email...)

  // Un "getter" (computed) pour savoir facilement si l'utilisateur est connecté
  const isAuthenticated = computed(() => !!token.value)

  // L'action pour se connecter
  function login(newToken) {
    token.value = newToken
    localStorage.setItem('user_token', newToken) // Sauvegarde locale
  }

  // L'action pour se déconnecter
  async function logout() {
    try {
      // 1. On dit à Laravel Sanctum de révoquer/supprimer ce token
      await api.post('users/logout')
    } catch (error) {
      // Si le token était déjà expiré côté serveur, Laravel peut renvoyer une erreur.
      // On la capture ici pour éviter que le front ne bloque.
      console.log("Le token était déjà invalide côté serveur.")
    } finally {
      // 2. Quoi qu'il arrive (succès ou erreur API), on nettoie le navigateur
      token.value = null
      user.value = null
      localStorage.removeItem('user_token')
    }
  }

  return { token, user, isAuthenticated, login, logout }
})
