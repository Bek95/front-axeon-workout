import { defineStore } from 'pinia'

export const useWorkoutDraft = defineStore('workoutDraft', {
  state: () => ({
    programTitle: '',
    currentSessionIndex: 0,
    sessions: [
      {
        id: crypto.randomUUID(),
        sessionName: 'Séance 1',
        blocks: [],
      },
    ],
  }),

  getters: {
    currentSession: (state) => state.sessions[state.currentSessionIndex] || null,
    canAddSession: (state) => state.sessions.length < 6,
    hasBlocksAnywhere: (state) => state.sessions.some(s => s.blocks.length > 0),
  },

  actions: {
    addSession() {
      if (this.sessions.length >= 6) return
      this.sessions.push({
        id: crypto.randomUUID(),
        sessionName: `Séance ${this.sessions.length + 1}`,
        blocks: [],
      })
      this.currentSessionIndex = this.sessions.length - 1
    },

    removeSession(index) {
      if (this.sessions.length <= 1) return
      this.sessions.splice(index, 1)
      if (this.currentSessionIndex >= this.sessions.length) {
        this.currentSessionIndex = this.sessions.length - 1
      }
    },

    selectSession(index) {
      this.currentSessionIndex = index
    },

    addBlock({ type, timeCaps, settings, exercises }) {
      if (!this.currentSession) return
      this.currentSession.blocks.push({
        front_block_uid: crypto.randomUUID(),
        type,
        timeCaps,
        exercises: exercises.map(e => ({ ...e, settings: { ...e.settings } })),
      })
    },

    removeBlock(uid) {
      if (!this.currentSession) return
      this.currentSession.blocks = this.currentSession.blocks.filter(
        b => b.front_block_uid !== uid
      )
    },

    moveBlock(uid, direction) {
      if (!this.currentSession) return
      const blocks = this.currentSession.blocks
      const i = blocks.findIndex(b => b.front_block_uid === uid)
      const j = i + direction
      if (i === -1 || j < 0 || j >= blocks.length) return
        ;[blocks[i], blocks[j]] = [blocks[j], blocks[i]]
    },

    reset() {
      this.$reset()
    },
  },
})
