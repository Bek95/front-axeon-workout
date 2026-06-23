import axios from 'axios'
import { useAuthStore } from '@/stores/auth'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
})

// Intercepteur de requête (ajoute le token)
api.interceptors.request.use((config) => {
  const authStore = useAuthStore()
  if (authStore.token) {
    config.headers.Authorization = `Bearer ${authStore.token}`
  }
  return config
}, (error) => Promise.reject(error))

// INTERCEPTEUR DE RÉPONSE
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const authStore = useAuthStore()

    // 1. On vérifie si c'est une erreur 401
    if (error.response && error.response.status === 401) {

      // 2. LA SÉCURITÉ : Si l'URL contient "logout", on ne fait RIEN.
      // On laisse la fonction logout() du store gérer son propre échec.
      if (error.config.url && error.config.url.includes('logout')) {
        return Promise.reject(error)
      }

      // 3. Sinon (pour toutes les autres routes de l'application),
      // si on prend un 401, on déconnecte l'utilisateur de force.
      authStore.logout()
    }

    return Promise.reject(error)
  }
)

export default api
