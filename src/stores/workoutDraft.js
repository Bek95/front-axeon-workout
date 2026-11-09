import { defineStore } from 'pinia'

export const useWorkoutDraft = defineStore('workoutDraft', {
  state: () => ({
    programTitle: '',
    sessionName: '',
    blocks: [],
  }),
  actions: {
    addBlock({ type, timeCaps, settings, exercises }) {
      this.blocks.push({
        front_block_uid: crypto.randomUUID(),
        type,
        timeCaps,
        exercises: exercises.map(e => ({ ...e, settings: { ...e.settings } })),
      })
    },
    removeBlock(uid) {
      this.blocks = this.blocks.filter(b => b.uid !== uid)
    },
    moveBlock(uid, direction) {            // direction : -1 (monter) ou +1 (descendre)
      const i = this.blocks.findIndex(b => b.uid === uid)
      const j = i + direction
      if (i === -1 || j < 0 || j >= this.blocks.length) return
        ;[this.blocks[i], this.blocks[j]] = [this.blocks[j], this.blocks[i]]
    },
    reset() {
      this.$reset()
    },
  },
})
