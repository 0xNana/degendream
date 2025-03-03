export function registerServiceWorker() {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
      try {
        // Register the service worker
        const registration = await navigator.serviceWorker.register('/sw.js')
        console.log('ServiceWorker registration successful:', registration)

        // Handle updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed') {
                if (navigator.serviceWorker.controller) {
                  // New content is available, show update prompt
                  if (window.confirm('New version available! Click OK to update.')) {
                    window.location.reload()
                  }
                }
              }
            })
          }
        })

        // Check for updates every hour
        setInterval(async () => {
          try {
            await registration.update()
            console.log('Service Worker checked for updates')
          } catch (error) {
            console.error('Error checking for Service Worker updates:', error)
          }
        }, 60 * 60 * 1000)

        // Handle offline functionality
        window.addEventListener('online', () => {
          console.log('Application is online')
        })

        window.addEventListener('offline', () => {
          console.log('Application is offline')
        })

        // Add beforeinstallprompt event
        let deferredPrompt: any
        window.addEventListener('beforeinstallprompt', (e) => {
          // Prevent Chrome 67 and earlier from automatically showing the prompt
          e.preventDefault()
          // Stash the event so it can be triggered later
          deferredPrompt = e
          // Show install button or prompt if needed
          console.log('App can be installed, prompt deferred')
        })

        // Track installation
        window.addEventListener('appinstalled', () => {
          console.log('PWA was installed')
          // Clear the deferredPrompt
          deferredPrompt = null
        })

      } catch (error) {
        console.error('ServiceWorker registration failed:', error)
        
        // Try to unregister any existing service workers if registration fails
        try {
          const registrations = await navigator.serviceWorker.getRegistrations()
          for (const registration of registrations) {
            await registration.unregister()
            console.log('ServiceWorker unregistered successfully')
          }
          // Retry registration after unregistering
          const newRegistration = await navigator.serviceWorker.register('/sw.js')
          console.log('ServiceWorker re-registered successfully:', newRegistration)
        } catch (retryError) {
          console.error('ServiceWorker recovery failed:', retryError)
        }
      }
    })

    // Handle service worker lifecycle
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.addEventListener('statechange', () => {
        console.log('ServiceWorker state changed:', navigator.serviceWorker.controller?.state)
      })
    }
  } else {
    console.log('Service workers are not supported')
  }
} 