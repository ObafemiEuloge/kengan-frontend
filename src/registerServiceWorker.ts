import { registerSW } from 'virtual:pwa-register'

const updateSW = registerSW({
  onNeedRefresh() {
    // Show a notification or modal to the user
    const shouldRefresh = window.confirm(
      'Une nouvelle version est disponible. Voulez-vous mettre à jour?'
    )
    if (shouldRefresh) {
      updateSW(true)
    }
  },
  onOfflineReady() {
    console.log('App ready to work offline')
  }
})

export default updateSW