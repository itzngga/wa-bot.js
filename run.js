const pm2 = require('pm2')
const cron = require('node-cron');
const fs = require('fs');
pm2.connect((error) => {
    if (error) {
      console.error(error)
    }
    pm2.start({ script: 'index.js' }, (error, apps) => {
      pm2.disconnect() // Disconnects from PM2
      if (error) {
        console.error(error)
      }
    })

    cron.schedule("0 0 21 * * *", function(){
      let settings = JSON.parse(fs.readFileSync('./settings/setting.json'))
      settings.banChats = true
      fs.writeFileSync('./settings/setting.json',JSON.stringify(settings,null,2))
      pm2.restart('index', (error) => {
        if (error) {
          console.error(error)
        }
      })
      console.log('[INFO] chat enabled');
    })

    cron.schedule("0 0 0 * * *", function(){
      let obj = [{id: "6281297980063@c.us", limit: 1}];
      fs.writeFileSync('./settings/limit.json', JSON.stringify(obj));
      pm2.restart('index', (error) => {
        if (error) {
          console.error(error)
        }
      })
      console.log('[INFO] Limit restarted!');
    })

    cron.schedule("0 0 9 * * *", function(){
      let settings = JSON.parse(fs.readFileSync('./settings/setting.json'))
      settings.banChats = false
      fs.writeFileSync('./settings/setting.json',JSON.stringify(settings,null,2))
      pm2.restart('index', (error) => {
        if (error) {
          console.error(error)
        }
      })
      console.log('[INFO] chat enabled');
    })
    setInterval(() => {
      pm2.describe('index', (error, scripts) => {
        const uptime = Date.now() - scripts[0].pm2_env.pm_uptime
        if (uptime > 3600000) {
          console.log(`Restart after 1 hour...`)
          pm2.restart('index', (error) => {
            if (error) {
              console.error(error)
            }
          })
        }
      })
    }, 30 * 1000)
  })