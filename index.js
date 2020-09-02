const { create, decryptMedia } = require('@open-wa/wa-automate')
const fs = require('fs')
const moment = require('moment')
const { video } = require('tiktok-scraper')
const malScraper = require('mal-scraper')
const urlShortener = require('./lib/shortener')
const color = require('./lib/color')
const {ytmp3, wallpaperanime, corona, quotes} =  require('./lib/functions')
const {tiktok, instagram, facebook, youtube, likee,twitter} = require('./lib/dl-video')
const pm2 = require('pm2')
let setting = JSON.parse(fs.readFileSync('./settings/setting.json'));
let muted = JSON.parse(fs.readFileSync('./settings/muted.json'));
const {help,license} = require('./settings/help.js');
var isRestart = setting.restartState
var prefix = setting.prefix
var mtcState = setting.mtc
const sAdmin = setting.sAdmin

const serverOption = {
    headless: true,
    qrRefreshS: 20,
    qrTimeout: 0,
    authTimeout: 0,
    autoRefresh: true,
    cacheEnabled: false,
    chromiumArgs: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        //If Windows Chrome Headless not run
        '--disable-extensions'
    ]
}
function restartAwal(client){
    setting.restartState = false
    isRestart = false
    fs.writeFileSync('./settings/setting.json', JSON.stringify(setting, null,2));
    client.sendText(sAdmin, 'Restart Succesfull!')
}
const opsys = process.platform;
if (opsys === "win32" || opsys === "win64") {
    serverOption['executablePath'] = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';
} else if (opsys === "linux") {
    // serverOption['browserRevision'] = '737027';
    // serverOption['executablePath'] = '/usr/bin/chrome'
    serverOption['executablePath'] = '/usr/bin/google-chrome';
} else if (opsys === "darwin") {
    serverOption['executablePath'] = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
}
// USEFULL FUNCTION
const isMuted = (chatId) => {
    if(muted.includes(chatId)){
        return false
    }else{
        return true
    }
} 
const isMtc = () => {
    if(isMtc === true){
        return false
    }else{
        return true
    }
}
const startServer = async (from) => {
    create('Imperial', serverOption)
    .then(client => {
        console.log('[DEV] ItzNgga BOT!')
        console.log('[SERVER] Server Started!')
        if(isRestart){restartAwal(client);}
        // Force it to keep the current session
        client.onStateChanged(state => {
            console.log('[State Changed]', state)
            if (state === 'CONFLICT') client.forceRefocus()
        })
        client.onIncomingCall((call) => {
            client.sendText(call,peerJid._serialized,'Maaf ya telp = banned')
            client.contactBlock(call.peerJid._serialized);
        })
        // listening on message
        client.onMessage(async (message) => {
            try {
                const { type, body, id, from, t, sender, isGroupMsg, chat, chatId, caption, isMedia, mimetype, quotedMsg } = message
                const isSadmin = sender.id === sAdmin
                console.log(color('[INFO]' + color('sender is Admin ? ') +isSadmin, 'red'));
                let { pushname, verifiedName } = sender
                pushname = pushname || verifiedName
                const { formattedTitle } = chat
                const time = moment(t * 1000).format('DD/MM HH:mm:ss')
                const isUrl = new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/gi);
                const uaOverride = "WhatsApp/2.2029.4 Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36";
                if (!isGroupMsg) console.log(color('[MSG]'), color(time, 'yellow'), 'Message from', color(pushname))
                if (isGroupMsg) console.log(color('[MSG]'), color(time, 'yellow'), 'Message from', color(pushname), 'in', color(formattedTitle))
                
                if (isMuted(chatId) && isMtc && type == 'text' || type == 'image' || isSadmin ) {
                    const args = () => {if(type !== 'image' || !caption){body.trim().split(' ')}}
                    if(body == prefix+'sticker' || body == prefix+'stiker' || caption == prefix+'sticker' || caption == prefix+'stiker'){
                        if (isMedia) {
                            const mediaData = await decryptMedia(message, uaOverride)
                            const imageBase64 = `data:${mimetype};base64,${mediaData.toString('base64')}`
                            await client.sendImageAsSticker(from, imageBase64)
                        } else if (quotedMsg && quotedMsg.type == 'image') {
                            const mediaData = await decryptMedia(quotedMsg)
                            const imageBase64 = `data:${quotedMsg.mimetype};base64,${mediaData.toString('base64')}`
                            await client.sendImageAsSticker(from, imageBase64)
                        } else if (args.length == 2) {
                            const url = args[1]
                            if (url.match(isUrl)) {
                                await client.sendStickerfromUrl(from, url, {method: 'get'})
                                    .then(r => { if (!r) client.sendText(from, 'Maaf, link yang kamu kirim tidak memuat gambar.') })
                                    .catch(err => console.log('Caught exception: ', err))
                            } else {
                                client.sendText(from, 'Maaf, link yang kamu kirim tidak valid.')
                            }
                        } else {
                            client.sendText(from, 'Tidak ada gambar! Untuk membuat sticker kirim gambar dengan caption #stiker')
                        }
                    }else if (body == prefix+'help' || body == prefix+'menu'){
                        client.sendText(from, help)
                    }else if (body == '#bot restart'){
                        if(isSadmin){
                            client.sendText(from, '*[WARN]* Restarting ...')
                            setting.restartState = true
                            fs.writeFileSync('./settings/setting.json', JSON.stringify(setting, null, 2))
                            const spawn = require('child_process').exec;
                            function os_func() {
                                this.execCommand = function (cmd) {
                                    return new Promise((resolve, reject)=> {
                                    spawn(cmd, (error, stdout, stderr) => {
                                        if (error) {
                                            reject(error);
                                            return;
                                        }
                                        resolve(stdout)
                                    });
                                })
                            }
                            }
                            var os = new os_func();
                            os.execCommand('pm2 restart index').then(res=> {
                            }).catch(err=> {
                                console.log("os >>>", err);
                            })
                        }
                    }else if(body == prefix+'speed' || body == prefix+'ping'){
                        const timestamp = moment();
                        const latensi = moment.duration(moment() - timestamp).asSeconds();
                        client.sendText(from, `${latensi} detik`);
                    }else if(body.startsWith(prefix+'tiktok ')){
                        if (args.length == 2) {
                            const url = args[1]
                            if (!url.match(isUrl) && !url.includes('tiktok.com')) return client.sendText(from, 'Maaf, link yang kamu kirim tidak valid')
                            client.sendText(from, '⏳ Tunggu yaa, sedang proses . . . ⏳')
                            await tiktok(url)
                            .then((videoMeta) => {
                                const filename = videoMeta.authorMeta.name + '.mp4'
                                const caps = `\nUsername: ${videoMeta.authorMeta.name} \nMusic: ${videoMeta.musicMeta.musicName} \nView: ${videoMeta.playCount.toLocaleString()} \nLike: ${videoMeta.diggCount.toLocaleString()} \nComment: ${videoMeta.commentCount.toLocaleString()} \nShare: ${videoMeta.shareCount.toLocaleString()} \nCaption: ${videoMeta.text.trim() ? videoMeta.text : '-'} \n\nProcessing Sukses #xYz BOT!`
                                // client.sendFileFromUrl(from,videoMeta.url, filename, videoMeta.NoWaterMark ? caps : `⚠ Video tanpa watermark tidak tersedia. \n\n${caps}`)
                                client.sendFile(from,videoMeta.urlbase64, filename, videoMeta.NoWaterMark ? caps : `⚠ Video tanpa watermark tidak tersedia. \n\n${caps}`)
                                .catch(err => console.log('Caught exception: ', err))
                            }).catch((err) => {
                                // client.sendText(from, 'Gagal mengambil metadata, link yang kamu kirim tidak valid')
                                client.sendText(from, `Error, user private atau link salah`)
                            });
                        }else{
        
                        }
                    }else if(body.startsWith(prefix+'ig ') || body.startsWith(prefix+'instagram ')){
                        if (args.length == 2) {
                            const url = args[1]
                            if (!url.match(isUrl) && !url.includes('instagram.com')) return client.sendText(from, 'Maaf, link yang kamu kirim tidak valid')
                            client.sendText(from, '⏳ Tunggu yaa, sedang proses . . . ⏳')
                            instagram(url)
                            .then(async (videoMeta) => {
                                const content = []
                                for (var i = 0; i < videoMeta.length; i++) {
                                    await urlShortener(videoMeta[i].video)
                                        .then((result) => {
                                            // console.log('Shortlink: ' + result)
                                            content.push(`${i+1}. ${result}`)
                                        }).catch((err) => {
                                            client.sendText(from, `Error, ` + err)
                                        });
                                    }
                                    client.sendText(from, `Link Download:\n${content.join('\n')} \n\nDonasi: kamu dapat membantuku beli dimsum dengan menyawer melalui https://saweria.co/donate/yogasakti atau mentrakteer melalui https://trakteer.id/red-emperor \nTerimakasih.`)
                            }).catch((err) => {
                                console.error(err)
                                if (err == 'Not a video') return client.sendText(from, `Error, tidak ada video di link yang kamu kirim`)
                                client.sendText(from, `Error, user private atau link salah`)
                            });
                        }else{
    
                        }
                    }else if(body.startsWith(prefix+'tw ') || body.startsWith(prefix+'twitter ')){
                        if (args.length == 2) {
                            const url = args[1]
                            if (!url.match(isUrl) && !url.includes('twitter.com') || url.includes('t.co')) return client.sendText(from, 'Maaf, url yang kamu kirim tidak valid', id)
                            // await client.sendText('')
                            await client.sendText(from, '⏳ Tunggu yaa, sedang proses . . . ⏳')
                            twitter(url)
                            .then(async (videoMeta) => {
                                try {
                                    const title = videoMeta.response.title
                                    const thumbnail = videoMeta.response.thumbnail
                                    const links = videoMeta.response.links
                                    const shorts = []
                                    for (var i = 0; i < links.length; i++) {
                                        const shortener = await urlShortener(links[i].url)
                                        // console.log('Shortlink: ' + shortener)
                                        links[i]['short'] = shortener
                                        shorts.push(links[i])
                                    }
                                    const link = shorts.map((x) => `${x.resolution} Quality: ${x.short}`)
                                    const caption = `Text: ${title} \n\nLink Download: \n${link.join('\n')} \n\nProcessing Sukses #xYz BOT!`
                                    client.sendFileFromUrl(from,thumbnail, 'videos.jpg', caption )
                                } catch (err) {
                                    client.sendText(from, `Error, ` + err)
                                }
                            })
                                .catch((err) => {
                                    // client.sendText(from, `Error, url tidak valid atau tidak memuat video \n\n${err}`)
                                    client.sendText(from, `Error, user private atau link salah \n\n\ ${err} `)
                                })
                            }else{
    
                        }
                    }else if(body.startsWith(prefix+'fb ') || body.startsWith(prefix+'facebook ')){
                        if (args.length == 2) {
                        const url = args[1]
                        if (!url.match(isUrl) && !url.includes('facebook.com')) return client.sendText(from, 'Maaf, url yang kamu kirim tidak valid')
                        // await client.sendText(from, "*Scraping Metadata...*");
                        await client.sendText(from, '⏳ Tunggu yaa, sedang proses . . . ⏳')
                        facebook(url)
                            .then(async (videoMeta) => {
                                try {
                                    const title = videoMeta.response.title
                                    const thumbnail = videoMeta.response.thumbnail
                                    const links = videoMeta.response.links
                                    const shorts = []
                                    for (var i = 0; i < links.length; i++) {
                                        const shortener = await urlShortener(links[i].url)
                                        // console.log('Shortlink: ' + shortener)
                                        links[i]['short'] = shortener
                                        shorts.push(links[i])
                                    }
                                    const link = shorts.map((x) => `${x.resolution} Quality: ${x.short}`)
                                    const caption = `Text: ${title} \nLink Download: \n${link.join('\n')} \n\nProcessing Sukses #xYz BOT!`
                                    client.sendFileFromUrl(from,thumbnail, 'videos.jpg', caption )
                                } catch (err) {
                                    client.sendText(from, `Error, ` + err)
                                }
                            })
                                .catch((err) => {
                                    // client.sendText(from, `Error, url tidak valid atau tidak memuat video \n\n${err}`)
                                    client.sendText(from, `Error, user private atau link salah \n\n${err}`)
                                })
                            }else{
    
                            }
                    }else if(body.startsWith(prefix+'yt ') || body.startsWith(prefix+'youtube ')){
                        if (args.length == 2) {
                            const url = args[1]
                            if (!url.match(isUrl) && !url.includes('youtube.com')) return client.sendText(from, 'Maaf, url yang kamu kirim tidak valid')
                            // await client.sendText(from, "*Scraping Metadata...*");
                            await client.sendText(from, '⏳ Tunggu yaa, sedang proses . . . ⏳')
                            youtube(url)
                            .then(async (videoMeta) => {
                                try {
                                    const title = videoMeta.response.title
                                    const thumbnail = videoMeta.response.thumbnail
                                    const links = videoMeta.response.links
                                    const shorts = []
                                    for (var i = 0; i < links.length; i++) {
                                        const shortener = await urlShortener(links[i].url)
                                        // console.log('Shortlink: ' + shortener)
                                        links[i]['short'] = shortener
                                        shorts.push(links[i])
                                    }
                                    const link = shorts.map((x) => `${x.resolution} Quality: ${x.short}`)
                                    const caption = `Text: ${title} \nLink Download: \n${link.join('\n')} \n\nProcessing Sukses #xYz BOT!`
                                    client.sendFileFromUrl(from,thumbnail, 'videos.jpg', caption )
                                } catch (err) {
                                    client.sendText(from, `Error, ` + err)
                                }
                            })
                            .catch((err) => {
                                // client.sendText(from, `Error, url tidak valid atau tidak memuat video \n\n${err}`)
                                client.sendText(from, `Error, user private atau link salah \n\n${err}`)
                            })
                        }else{
        
                        }
                    }else if (body.startsWith(prefix+'likee ')){
                        if (args.length == 2) {
                            const url = args[1]
                            if (!url.match(isUrl) && !url.includes('likee.com')) return client.sendText(from, 'Maaf, url yang kamu kirim tidak valid')
                            // await client.sendText(from, "*Scraping Metadata...*");
                            // await client.sendText(from, '⏳ Tunggu yaa, sedang proses . . . ⏳')
                            await client.simulateTyping(from, true)
                            client.sendText(from, '⏳ Tunggu yaa, sedang proses . . . ⏳')
                            likee(url)
                            .then(async (videoMeta) => {
                                try {
                                    const title = videoMeta.response.title
                                    const thumbnail = videoMeta.response.thumbnail
                                    const links = videoMeta.response.links
                                    const shorts = []
                                    for (var i = 0; i < links.length; i++) {
                                        const shortener = await urlShortener(links[i].url)
                                        // console.log('Shortlink: ' + shortener)
                                        links[i]['short'] = shortener
                                        shorts.push(links[i])
                                    }
                                    const link = shorts.map((x) => `${x.resolution} Quality: ${x.short}`)
                                    const caption = `Tittle: ${title} \nLink Download: \n${link.join('\n')} \n\nProcessing Sukses #xYz BOT!`
                                    client.sendFileFromUrl(from,thumbnail, 'videos.jpg', caption )
                                } catch (err) {
                                    client.sendText(from, `Error, ` + err)
                                }
                            })
                            .catch((err) => {
                                client.sendText(from, `Error, url tidak valid atau tidak memuat video \n\n${err}`)
                            })
                        }else{
        
                        }
                    }else if(body.startsWith(prefix+'nhder ')){
                        if (args.length >=2){
                            await client.simulateTyping(from, true)
                            const code = args[1]
                            const url = 'https://nhder.herokuapp.com/download/nhentai/'+code+'/zip'
                            const short = []
                            const shortener = await urlShortener(url)
                            // console.log('Shortlink: '+ shortener)
                            url['short'] = shortener
                            short.push(url)
                            const caption = `Link: ${shortener}\n\nProcessing Sukses #xYz BOT!`
                            client.sendText(from, caption)
                        } else {
                            client.sendText(from, 'Maaf tolong masukan code nuclear')
                        }
                    }else if(body.startsWith(prefix+'ytmp3 ')){
                        if (args.length >= 2) {
                            const url = args[1]
                            youtube(url)
                            .then(async(videoMeta) =>{
                                try {
                                    const title = videoMeta.response.title
                                    const result = await ytmp3(url)
                                    const short = []
                                    const shortener = await urlShortener(result)
                                    // console.log('Shortlink: ' + shortener);
                                    result['short'] = shortener
                                    short.push(result)
                                    const caption = `Title: ${title} \n\nLink Download: ${shortener}`
                                    client.sendText(from, caption,id)
                                } catch (err) {
                                    client.sendText(from, `Error` + err)
                                }
                            })
                            .catch((err) => {
                                client.sendText(from, `Error, user private atau link salah \n\n${err}`)
                            })
                        }else{
    
                        }
                    }else if(body == prefix+'wanime'){
                        const result = await wallpaperanime()
                        client.sendFileFromUrl(from, result)
                    }else if(body == prefix+'waifu'){
                        q8 = q2 = Math.floor(Math.random() * 98) + 10;
                        client.sendFileFromUrl(from, 'http://randomwaifu.altervista.org/images/00'+q8+'.png', 'Waifu.png', 'Dia bukan bro?');
                    }else if (body == prefix+'kucing'){
                        q2 = Math.floor(Math.random() * 900) + 300;
                        q3 = Math.floor(Math.random() * 900) + 300;
                        client.sendFileFromUrl(from, 'http://placekitten.com/'+q3+'/'+q2, 'kucing.png','Kucing');
                    }else if(body == prefix+'wallpaper'){
                        client.sendFileFromUrl(from, 'https://source.unsplash.com/1280x720/?nature','wp.jpeg')
                    }else if (body == prefix+'quote'){
                        const getBijak = await quotes()
                        client.sendText(from, getBijak);
                    }else if (body.startsWith(prefix+'anime ')){
                        const animename = body.slice(7);
                        malScraper.getInfoFromName(animename)
                        const { title, picture, score, synopsis, episodes, aired, rating, status } = await malScraper.getInfoFromName(animename)
                        await client.sendFileFromUrl(from, `${picture}`, 'Anime.png', '⛩️Title:'+`${title}`+'\n\n🎼️Score:'+`${score}`+'\n\n📙️Status:'+`${status}`+'\n\n🖼️Episodes:'+`${episodes}`+'\n\n✨️Rating:'+`${rating}`+'\n\n🌠️Synopsis:'+`${synopsis}`+'\n\n📆️Aired:'+`${aired}`+'.')
                    }else if(body == prefix+'corona'){
                        const covid = await corona()
                        client.sendText(from, covid);
                    }else if(body == prefix+'mnt'){
                        client.sendText(from, license)
                    }else if (body == '?creator'){
                        client.sendContact(sAdmin)
                    }else{
                        client.markAsUnread(from)
                    }
                }
            } catch (err) {
                console.log(color('[ERROR]', 'red'), err)
            }
        }) 
    })
}


process.on('Something went wrong', function (err) {
    console.log('Caught exception: ', err);
    });

startServer()
