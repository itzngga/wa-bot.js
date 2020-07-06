const consola = require('consola')
const pm2 = require('pm2')
pm2.connect((error) => {
    if (error) {
      console.error(error)
      process.exit(2)
    }
  
    pm2.start({ script: 'bot.js', error_log: 'BOTerror.log' }, (error, apps) => {
      pm2.disconnect() // Disconnects from PM2
  
      if (error) {
        console.error(error)
        process.exit(2)
      }
    })
  
    // Kill the process if taking longer than expected
    setInterval(() => {
      pm2.describe('bot', (error, scripts) => {
        const exitTimeout = 60
        const uptime = Date.now() - scripts[0].pm2_env.pm_uptime
  
        if (uptime > exitTimeout * 60 * 1000) {
          console.info(`Closing cluster after ${exitTimeout} minutes...`)
  
          pm2.restart('domains', (error) => {
            if (error) {
              console.error(error)
              process.exit(2)
            }
          })
        }
      })
    }, 30 * 1000)
  })