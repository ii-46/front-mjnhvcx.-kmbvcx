// Utilities
import {defineStore} from 'pinia'

export const useAppStore = defineStore('app', {
    state: () => ({
        preloading: true,
        isLogin: false,
        theme: 'light'
    }),
    actions: {
        onToggleTheme() {
            this.theme = this.theme === 'light' ? 'dark' : 'light'
        }
    }
})
