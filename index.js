const { create, decryptMedia } = require('@open-wa/wa-automate')
const fs = require('fs')
const moment = require('moment')
const { isNullOrUndefined } = require('util');
const malScraper = require('mal-scraper')
const urlShortener = require('./lib/shortener')
const color = require('./lib/color.js')
const gTTs = require('gtts');
const axios = require('axios')
const puppeteer = require('puppeteer')
const striptags = require('striptags');
const Jimp = require('jimp')
const translatte = require('translatte')
const parseString = require('xml2js').parseString;
const cron = require('node-cron');
const google = require('google-it')
const {wallpaperanime, quotes} =  require('./lib/functions')
const {tiktok, instagram, facebook, youtube, likee,twitter} = require('./lib/dl-video')
let setting = JSON.parse(fs.readFileSync('./settings/setting.json'));
let muted = JSON.parse(fs.readFileSync('./settings/muted.json'));
let limit = JSON.parse(fs.readFileSync('./settings/limit.json'));
let msgLimit = JSON.parse(fs.readFileSync('./settings/msgLimit.json'));
let banned = JSON.parse(fs.readFileSync('./settings/banned.json'));
let info = fs.readFileSync('./settings/info.txt', {encoding: 'utf-8'});
const {help,license,donasi,bahasa,surah,sensor,help2,chromArgs,commandArray} = require('./settings/help.js');
let {prefix, banChats, restartState: isRestart,mtc: mtcState} = setting
const sAdmin = setting.sAdmin
const serverOption = {
    headless: true,
    qrRefreshS: 20,
    qrTimeout: 0,
    authTimeout: 0,
    autoRefresh: true,
    cacheEnabled: false,
    chromiumArgs: chromArgs
}
let state = {
    status: () => {
        if(banChats){
            return 'Nonaktif'
        }else if(mtcState){
            return 'Nonaktif'
        }else if(!mtcState){
            return 'Aktif'
        }else{
            return 'Aktif'
        }
    }
}
//client sendingMessage after #bot restart command
function restartAwal(client){
    setting.restartState = false
    isRestart = false
    client.sendText(setting.restartId, 'Restart Succesfull!')
    setting.restartId = 'undefined'
    fs.writeFileSync('./settings/setting.json', JSON.stringify(setting, null,2));
    fs.writeFileSync('./settings/limit.json', JSON.stringify(limit));
    fs.writeFileSync('./settings/muted.json', JSON.stringify(muted, null,2));
    fs.writeFileSync('./settings/msgLimit.json', JSON.stringify(msgLimit));
    fs.writeFileSync('./settings/banned.json', JSON.stringify(banned));
}
const opsys = process.platform;
if (opsys === "win32" || opsys === "win64") {
    serverOption['executablePath'] = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';
} else if (opsys === "linux") {
    serverOption['executablePath'] = '/usr/bin/google-chrome-stable';
} else if (opsys === "darwin") {
    serverOption['executablePath'] = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
}
// BEGIN HELPER FUNCTION
if (typeof Array.prototype.splice === 'undefined') {
    Array.prototype.splice = function (index, howmany, elemes) {
        howmany = typeof howmany === 'undefined' || this.length;
        var elems = Array.prototype.slice.call(arguments, 2), newArr = this.slice(0, index), last = this.slice(index + howmany);
        newArr = newArr.concat.apply(newArr, elems);
        newArr = newArr.concat.apply(newArr, last);
        return newArr;
    }
}
const isMuted = (chatId) => {
    if(muted.includes(chatId)){
        return false
    }else{
        return true
    }
}
function curlyRemover(chat) {
    if (chat !== undefined) {
        let sr = /{(.*?)}/g;
        let ket = chat.toString().replace(sr, '');
        return ket;
    }
    return chat;
}
function banChat () {
    if(banChats == true) {
        return false
    }else{
        return true
    }
}
function filterWord(text) {
    let arrWord = sensor;
    if (arrWord.includes(text.toLowerCase())) {
        return false;
    } else {
        return true;
    }
}
const capitalize = (str) => {
    if (typeof str !== 'string') return ''
    return str.charAt(0).toUpperCase() + str.slice(1)
}
// END HELPER FUNCTION
const startServer = async (from) => {
    create('XyZ', serverOption)
    .then(client => {
        cron.schedule('* * * * *', () =>  {
        const obj = [{id: "6281297980063@c.us", msg: 1}]
        msgLimit = obj
        fs.writeFileSync('./settings/msgLimit.json', JSON.stringify(obj))
        });
        cron.schedule("0 55 20 * * *", async function(){
            let chats = await client.getAllChats()
            let sjfk = await client.getAllGroups()
            for(let gcList of sjfk){
                await client.sendText(gcList.contact.id,`Maaf, bot melakukan pembersihan group harian :D`).then(async () => {
                    client.deleteChat(gcList.contact.id)
                    client.leaveGroup(gcList.contact.id)
            })}
            for(let xchat of chats){
                await client.deleteChat(xchat)
            }
        console.log(color.green('~> [INFO] Deleted all chats'));
        });
        console.log('~>',color('[DEV] ItzNgga BOT!'))
        console.log('~>',color('[SERVER] Server Started!'))
        //CALLING the #bot restart function
        if(isRestart){restartAwal(client);}
        client.onStateChanged(state => {
            console.log('~>',color('[State Changed]'), color(state))
            if (state === 'CONFLICT') client.forceRefocus()
        })
        //BLOCK CONTACT WHILE TARGET CALLING BOT
        client.onIncomingCall(call => {
            client.sendText(call.peerJid, 'Maaf ya, Telp = Blok\ndan tidak akan bisa UNBLOK!').then(() => {
                client.contactBlock(call.peerJid).then(() => {
                    banned.push(call.peerJid)
                    fs.writeFileSync('./settings/banned.json', JSON.stringify(banned))
                });
            });
        })
        //WHEN BOT IS ADDED TO A GROUP
        client.onAddedToGroup(async (chat) => {
            if(mtcState === false){
                const groups = await client.getAllGroups()
                if(groups.length > 25){
                    await client.sendText(chat.id, 'Maaf, Jumlah group bot sudah penuh').then(async () =>{
                        client.deleteChat(chat.id)
                        client.leaveGroup(chat.id)
                    })
                }else{
                    if(chat.groupMetadata.participants.length < 25){
                        await client.sendText(chat.id, 'Maaf, BOT keluar jika member group tidak melebihi 25 orang').then(async () =>{
                            client.deleteChat(chat.id)
                            client.leaveGroup(chat.id)
                        })
                    }else{
                        if(!chat.isReadOnly)client.sendText(chat.id, 'Halo semuanya, saya adalah xYz BOT. gunakan '+prefix+'help untuk menggunakan saya :D')
                    }
                }
            }else{
                await client.sendText(chat.id, 'Bot sedang maintenance, coba lain hari').then(async () => {
                    client.deleteChat(chat.id)
                    client.leaveGroup(chat.id)
                })
            }
        })
        // listening on message
        client.onMessage(async (message) => {
            try {
                const { type, body, id, from, t, sender, isGroupMsg, chat, chatId, caption, isMedia, mimetype, quotedMsg } = message
                if (body == undefined) return
                const serial = sender.id
                const isSadmin = serial === sAdmin
                let { pushname, verifiedName } = sender
                pushname = pushname || veriedName
                const { formattedTitle } = chat
                const botNumber = await client.getHostNumber()
                const groupId = isGroupMsg ? chat.groupMetadata.id : ''
                const groupAdmins = isGroupMsg ? await client.getGroupAdmins(groupId) : ''
                const groupMembers = isGroupMsg ? await client.getGroupMembersId(groupId) : ''
                const isGroupAdmins = isGroupMsg ? groupAdmins.includes(sender.id) : false
                const isBanned = banned.includes(serial)
                const isBotGroupAdmins = isGroupMsg ? groupAdmins.includes(botNumber + '@c.us') : false
                const commands = commandArray
                const cmds = commands.map(x => x + '\\b').join('|')
                const cmd = type === 'chat' ? body.match(new RegExp(cmds, 'g')) : type === 'image' && caption ? caption : ''
                const time = moment(t * 1000).format('HH:mm:ss')
                const isUrl = new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/gi);
                const uaOverride = "WhatsApp/2.2029.4 Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36";
                const reply = (message) => {
                    client.reply(chatId, message, id, true)
                }
                // BEGIN HELPER FUNCTION
                function isMsgLimit(id){
                    if (isSadmin) {return false;}
                    let found = false;
                    for (let i of msgLimit){
                        if(i.id === id){
                            if (i.msg >= 12) {
                                found === true
                                reply('*[ANTI-SPAM]*\nMaaf, akun anda kami blok karena SPAM, dan tidak bisa di UNBLOK!')
                                client.contactBlock(id)
                                banned.push(id)
                                fs.writeFileSync('./settings/banned.json', JSON.stringify(banned))
                                return true;
                            }else if(i.msg >= 7 && !i.msg >= 12){
                                found === true
                                reply('*[ANTI-SPAM]*\nNomor anda terdeteksi spam!\nMohon tidak spam 5 pesan lagi atau nomor anda AUTO BLOK!')
                                return true
                            }else{
                                found === true
                                return false;
                            }   
                        }
                    }
                    if (found === false){
                        let obj = {id: `${id}`, msg:1};
                        msgLimit.push(obj);
                        fs.writeFileSync('./settings/msgLimit.json',JSON.stringify(msgLimit));
                        return false;
                    }  
                }
                function addMsgLimit(id){
                    if (isSadmin) {return;}
                    var found = false
                    Object.keys(msgLimit).forEach((i) => {
                        if(msgLimit[i].id == id){
                            found = i
                        }
                    })
                    if (found !== false) {
                        msgLimit[found].msg += 1;
                        fs.writeFileSync('./settings/msgLimit.json',JSON.stringify(msgLimit));
                    }
                    
                }
                function isLimit(id){
                    if (isSadmin) {return false;}
                    let found = false;
                    for (let i of limit){
                        if(i.id === id){
                            let limits = i.limit;
                            if (limits > 24) {
                                found = true;
                                reply('Perintah BOT anda sudah mencapai batas, coba esok hari :)')
                                return true;
                            }else{
                                limit
                                found = true;
                                return false;
                            }
                        }
                    }
                    if (found === false){
                        let obj = {id: `${id}`, limit:1};
                        limit.push(obj);
                        fs.writeFileSync('./settings/limit.json',JSON.stringify(limit));
                        return false;
                    }  
                }
                function limitAdd (id) {
                    if (isSadmin) {return;}
                    var found = false;
                    Object.keys(limit).forEach((i) => {
                        if(limit[i].id == id){
                            found = i
                        }
                    })
                    if (found !== false) {
                        limit[found].limit += 1;
                        fs.writeFileSync('./settings/limit.json',JSON.stringify(limit));
                    }
                }
                const msgs = (message) => {
                    if(!message) return 'Message'
                    if(message.length >= 10){
                        return `${message.substr(0, 15)}`
                    }else{
                        return `${message}`
                    }
                }
                // END HELPER FUNCTION
                if(body === prefix+'mute' && isMuted(chatId) == true){
                    if(isMsgLimit(serial)){
                        return
                    }else{
                        addMsgLimit(serial)
                    }
                    muted.push(chatId)
                    fs.writeFileSync('./settings/muted.json', JSON.stringify(muted, null, 2))
                    reply(`Bot telah di mute pada chat ini! ${prefix}unmute untuk unmute!`)
                }
                if(body === prefix+'unmute' && isMuted(chatId) == false){
                    if(isMsgLimit(serial)){
                        return
                    }else{
                        addMsgLimit(serial)
                    }
                    let index = muted.indexOf(chatId);
                    muted.splice(index,1)
                    fs.writeFileSync('./settings/muted.json', JSON.stringify(muted, null, 2))
                    reply(`Bot telah di unmute!`)
                }
                if(body == prefix+'info'){
                    let hasilx = info.replace('%state', state.status)
                    reply(hasilx)
                }
                if(body == "Assalamualaikum" || body == "Assalamu'alaikum" || body == "Samlikum"){
                    reply('Walaikumsalam Wr Wb')
                }
                if (isMuted(chatId) && !mtcState && banChat() && !isBanned || isSadmin ) {
                    const args = body.trim().split(' ')
                    if(!isSadmin){
                        if(!cmd) return
                        const argsList = args.join(" ")
                        if(argsList !== undefined && argsList.match(new RegExp(`\\[`, 'gi')) && argsList.match(new RegExp(`]`, 'gi'))) return await client.sendText(from,'perintah tidak boleh pakai []!')
                    }
                    if(body == prefix+'help 2'){
                        client.sendText(from, help2)
                        return
                    }
                    if(body.startsWith('#bot block ')){
                        if(!isSadmin) return
                        if(args.length >= 3){
                            let block = `${args[2]}@c.us`
                            await client.contactBlock(block).then(() => {
                                reply(`Sukses blok ${args[2]}!`)
                            })
                            return
                        }
                    }
                    if(body == prefix+'sticker' || body == prefix+'stiker' || caption == prefix+'sticker' || caption == prefix+'stiker'){
                        if (isMedia) {
                            const mediaData = await decryptMedia(message, uaOverride)
                            const imageBase64 = `data:image/jpeg;base64,${mediaData.toString('base64')}`
                            await client.sendImageAsSticker(from, imageBase64)
                            limitAdd(serial)
                        } else if (quotedMsg && quotedMsg.type == 'image') {
                            const mediaData = await decryptMedia(quotedMsg)
                            const imageBase64 = `data:image/jpeg;base64,${mediaData.toString('base64')}`
                            await client.sendImageAsSticker(from, imageBase64)
                            limitAdd(serial)
                        } else if (args.length == 2) {
                            const url = args[1]
                            if (url.match(isUrl)) {
                            limitAdd(serial)
                            await client.sendStickerfromUrl(from, url, {method: 'get'})
                                    .then(r => { if (!r) client.sendText(from, 'Maaf, link yang kamu kirim tidak memuat gambar.') })
                                    .catch(err => console.log('Caught exception: ', err))
                            } else {
                                client.sendText(from, 'Maaf, link yang kamu kirim tidak valid.')
                            }
                        } else {
                            client.sendText(from, `Tidak ada gambar! Untuk membuat sticker kirim gambar dengan caption \n${prefix}stiker`)
                        }
                    }
                        if (cmd) {
                            if (!isGroupMsg) console.log('~>',color('[EXEC]', 'yellow'), time, color(msgs(cmd.toString())), 'from', color(pushname))
                            if (isGroupMsg) console.log('~>',color('[EXEC]', 'yellow'), time, color(msgs(cmd.toString())), 'from', color(pushname), 'in', color(formattedTitle))
                            if(isMsgLimit(serial)){
                                return
                            }else{
                                addMsgLimit(serial)
                            }
                            switch (cmd[0]) {
                            case prefix+'menu':
                            case prefix+'help':
                                client.sendText(from, help)
                            break
                            case prefix+'activate':
                                if(args[1]){
                                    const premis = addKey(serial, args[1])
                                    if(!premis == 'Key yang anda berikan invalid!'){
                                        client.sendText(from, 'Nomor anda telah terdaftar sebagai akun premium di BOT ini!')
                                    }else{
                                        client.sendText(from, premis)
                                    }
                                }
                            break
                            case '#donasi':
                                client.sendText(from, donasi)
                                break
                            case prefix+'bahasa':
                                client.sendText(from,bahasa)
                                break
                            case prefix+'list surah':
                                client.sendText(from, surah)
                                break
                            case prefix+'join':
                                if(isLimit(serial) && !args.length <= 2) return
                                if(isSadmin){
                                    await client.joinGroupViaLink(args[1]).then(async () => {
                                        await client.sendText(from, 'Berhasil join ke group via link!')
                                        limitAdd(serial)
                                    }).catch(err => {
                                        return client.sendText(from, 'Link group tidak valid!')
                                    })
                                }
                                let group = await client.getAllGroups()
                                if(group.length > 25){
                                    return client.sendText(from, 'Maaf, Batas group yang dapat bot tampung sudah penuh')
                                }else{
                                    const log = await client.inviteInfo(args[1])
                                    if(log.size < 25 && !isSadmin) {
                                        return client.sendText(from, '[GAGAL] Group target tidak memiliki member melebihi 25')
                                    }else{
                                        await client.joinGroupViaLink(args[1]).then(async () => {
                                            await client.sendText(from, 'Berhasil join ke group via link!')
                                            limitAdd(serial)
                                        }).catch(err => {
                                            return client.sendText(from, 'Link group tidak valid!')
                                        })
                                    }
                                }
                                break
                            case prefix+'bug report':
                                const bug = body.slice(12)
                                if(!args[2]) return
                                if(isGroupMsg){
                                    client.sendText(sAdmin, `*[BUG REPORT]*\nNO PENGIRIM : wa.me/${serial.match(/\d+/g)}\nGroup : ${formattedTitle}\n\n${bug}`)
                                    reply('Masalah telah di laporkan ke owner BOT, laporan palsu/main2 tidak akan ditanggapi.')
                                }else{
                                    client.sendText(sAdmin, `*[BUG REPORT]*\nNO PENGIRIM : wa.me/${serial.match(/\d+/g)}\n\n${bug}`)
                                    reply('Masalah telah di laporkan ke owner BOT, laporan palsu/main2 tidak akan ditanggapi.')
                                }
                                break
                            case '#bot unblock':
                                if(!isSadmin) return
                                if(args.length >= 3){
                                    let unblock = `${args[2]}@c.us`
                                    await client.contactUnblock(unblock).then(()=>{
                                        reply(`Sukses unblok ${args[2]}!`)
                                })
                                }
                                break
                            case prefix+'limit':
                                var found = false
                                for(let lmt of limit){
                                    if(lmt.id === serial){
                                        reply(`Kuota limit media anda tersisa : *${25-lmt.limit}*`)
                                        found = true
                                    }
                                }
                                if (found === false){
                                    let obj = {id: `${serial}`, limit:1};
                                    limit.push(obj);
                                    fs.writeFile('./settings/limit.json',JSON.stringify(limit,null, 2), function(err){if(err) console.log(err)});
                                    reply(`Kuota limit media anda tersisa : *25*`)
                                }
                                break
                            case prefix+'translate':
                                if(args[1] == undefined || args[2] == undefined) return
                                if(isLimit(serial)) return
                                if(args.length >= 2){
                                    var codelang = args[1]
                                    var text = body.slice(11+codelang.length);
                                    translatte(text, {to: codelang}).then(res => {
                                        client.sendText(from,res.text);
                                        limitAdd(serial)
                                    }).catch(err => {
                                        client.sendText(from,`[ERROR] Teks tidak ada, atau kode bahasa ${codelang} tidak support\n~> *${prefix}bahasa* untuk melihat list kode bahasa`);
                                    });
                                }
                            break
                            case '#lkey list':
                                if(!isSadmin) return
                                let hasil, i = 1;
                                for(let index of JSON.parse(fs.readFileSync('./settings/premicode.json'))){
                                    hasil += i+'. '+index
                                }
                                client.sendText(from, hasil)
                                break
                            case '#lkey add':
                                if(!isSadmin) return
                                let keys = JSON.parse(fs.readFileSync('./settings/premicode.json'))
                                keys.push(args[2])
                                fs.writeFileSync('./settings/premicode.json', JSON.stringify(keys))
                                client.sendText(from, 'Success!')
                                break
                            case prefix+'ipcheck':
                                if(isLimit(serial)) return
                                if(!args.lenght >= 2) return
                                axios.get(`http://beta.moe.team/api/iplookup?apikey=McJNTmAfdBmO1hYk7gREmVBmtrxiywJtqN3uI7ZRNlMK7MiMwLVUVUQUzAtt6qrv&ip=${args[1]}`).then((res) => {
                                    let hs = res.data.result
                                    client.sendText(from, `╭───[ Hasil Tracking IP ]───\n├ Info dibawah mungkin tidak akurat\n├ IP : ${hs.query}\n├ Hostname : ${hs.asname}\n├ ASN : ${hs.as}\n├ ISP : ${hs.isp}\n├ Latitude : ${hs.lat}\n├ Longitude : ${hs.lon}\n├ Benua : ${hs.continent}\n├ Negara : ${hs.country}\n├ Provinsi : ${hs.region}\n├ Kota : ${hs.city}\n├ Map : https://www.google.com/maps/search/?api=1&query=${hs.lat},${hs.lon}\n╰───[ xYz WhatssApp Bot ]───`);
                                }).catch(err => {
                                    client.sendText(from,`Alamat ip tidak ada atau tidak valid`)
                                })
                                limitAdd(serial)
                                break
                            case prefix+'qnime':
                                if(isLimit(serial)) return
                                if(args[1]){
                                    if(args[1] === 'anime'){
                                        const anime = body.slice(13)
                                        axios.get('https://animechanapi.xyz/api/quotes?anime='+anime).then(({ data }) => {
                                            let quote = data.data[0].quote 
                                            let char = data.data[0].character
                                            let anime = data.data[0].anime
                                            client.sendText(from, `"${quote}"\n\n${char} from ${anime}`)
                                            limitAdd(serial)
                                        }).catch(err => {
                                            client.sendText('Quote Char/Anime tidak ditemukan!')
                                        })
                                    }else{
                                        const char = body.slice(12)
                                        axios.get('https://animechanapi.xyz/api/quotes?char='+char).then(({ data }) => {
                                            let quote = data.data[0].quote 
                                            let char = data.data[0].character
                                            let anime = data.data[0].anime
                                            client.sendText(from, `"${quote}"\n\n${char} from ${anime}`)
                                            limitAdd(serial)
                                        }).catch(err => {
                                            client.sendText('Quote Char/Anime tidak ditemukan!')
                                        })
                                    }
                                }else{
                                    axios.get('https://animechanapi.xyz/api/quotes/random').then(({ data }) => {
                                        let quote = data.data[0].quote 
                                        let char = data.data[0].character
                                        let anime = data.data[0].anime
                                        client.sendText(from, `"${quote}"\n\n${char} from ${anime}`)
                                        limitAdd(serial)
                                    }).catch(err => {
                                        console.log(err)
                                    })
                                }
                            break
                            case prefix+'1cak':
                                return client.sendText(from,'1cak sedang di disable karena server penyedia gambar OFFLANE')
                                if(isLimit(serial)) return
                                axios.get(`https://rest.farzain.com/api/1cak.php?apikey=3Ot5wNlKgSNK0MFVR0MEILiEq`).then((res) => {
                                    let title = res.data.title
                                    let url = res.data.img
                                    console.log(url)
                                    client.sendFileFromUrl(from,url, 'image.jpg', title)
                                    limitAdd(serial)
                                })
                                break
                            case prefix+'speed':
                            case prefix+'ping':
                                var now = require("performance-now")
                                const timestamp = now();
                                const latensi = now() - timestamp
                                client.sendText(from, `${latensi.toFixed(5)} detik`)
                            break
                            case prefix+'qrcode':
                                if(isLimit(serial)) return
                                if(!args.lenght >= 2) return
                                let qrcodes = body.slice(8)
                                await client.sendFileFromUrl(from, `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${qrcodes}`, 'gambar.png', 'Process sukses! #xYz BOT')
                                limitAdd(serial)
                                break
                            case prefix+'igstalk':
                                if(isLimit(serial)) return
                                if(!args.lenght >= 2) return
                                if(!args[1]) return
                                let usrname = args[1]
                                if (usrname.includes('@')) {
                                    usrname = usrname.replace('@', '');
                                }
                                const browser = await puppeteer.launch({
                                    headless: true,
                                    args: [
                                      "--no-sandbox",
                                      "--disable-setuid-sandbox",
                                      "--disable-dev-shm-usage",
                                      "--disable-accelerated-2d-canvas",
                                      "--disable-gpu",
                                      "--window-size=1920x1080",
                                    ],
                                  });
                                  
                                  const page = await browser.newPage();
                                  await page.setRequestInterception(true);
                                  page.on('request', request => {
                                    if (request.resourceType() === 'image' || request.resourceType() === 'stylesheet')
                                      request.abort();
                                    else
                                      request.continue();
                                  });
                                  await page
                                    .goto(`https://www.mystalk.net/profile/${usrname}/`, {
                                      waitUntil: "networkidle2",
                                    })
                                    .then(async () => {
                                    page.setViewport({ width: 420, height: 840 , deviceScaleFactor:2});
                                    const post = await (await (await page.$('#section-main > div.user-profile-area > div > div > div.col-md-5 > div > span:nth-child(1) > b')).getProperty('innerHTML')).jsonValue();
                                    let prvate;
                                    const username = await (await (await page.$('#section-main > div.user-profile-area > div > div > div.col-md-7 > div > div > div > h1 > span.user-name')).getProperty('innerHTML')).jsonValue();
                                    const full_name = await (await (await page.$('#section-main > div.user-profile-area > div > div > div.col-md-7 > div > div > div > h1 > span.name')).getProperty('innerHTML')).jsonValue();
                                    const biography = await (await (await page.$('#section-main > div.user-profile-area > div > div > div.col-md-7 > div > div > p')).getProperty('innerHTML')).jsonValue();
                                    if(await page.$('#section-main > div.private-warning > div > span') !== null) prvate = true;
                                    else prvate = false;
                                    const followers = await (await (await page.$('#section-main > div.user-profile-area > div > div > div.col-md-5 > div > span:nth-child(2) > b')).getProperty('innerHTML')).jsonValue();
                                    const followed = await (await (await page.$('#section-main > div.user-profile-area > div > div > div.col-md-5 > div > span:nth-child(3) > b')).getProperty('innerHTML')).jsonValue();
                                    if (prvate === true) {
                                        prvate = 'Iya';
                                    } else {
                                        prvate = 'Tidak';
                                    }
                                    let hasil = `╭──[ Hasil Stalk IG ]───\n├ Username : ${username}\n├ Nama : ${full_name}\n├ Bio : ${biography}\n├ Jumlah Post : ${post}\n├ Mengikuti : ${followed}\n├ Pengikut : ${followers}\n├ Akun Private?  : ${prvate}\n╰──[ xYz WhatsApp Bot ]───`;
                                    client.sendText(from, hasil);
                                    limitAdd(serial);
                                    browser.close();
                                    }).catch((err) => {
                                        client.sendText(from,`[GAGAL] Username tidak ditemukan!`
                                    );
                                    browser.close();
                                    });
                            break
                            case prefix+'ban':
                                if(!isSadmin) return
                                banned.push(args[1])
                                fs.writeFileSync('./settings/banned.json', JSON.stringify(banned))
                                client.sendText(from, 'Succes ban target!')
                                break
                            case prefix+'unban':
                                if(!isSadmin) return
                                let inx = banned.indexOf(args[1])
                                banned.splice(inx,1)
                                fs.writeFileSync('./settings/banned.json', JSON.stringify(banned))
                                client.sendText(from, 'Succes unban target!')
                                break
                            case prefix+'gtts':
                                if(isLimit(serial)) return  
                                if(args[0] == undefined || args[1] == undefined) return
                                let gttsText = body.slice(6);
                                if(gttsText.length >= 250) return client.sendText(from,'Teks Kepanjangan :(')
                                var gtts = new gTTs(gttsText, 'id');
                                gtts.save('./gtts/gtts.mp3', function () {
                                    client.sendPtt(from, './gtts/gtts.mp3')
                                    limitAdd(serial)
                                })
                                break
                            case '@6289654471026':
                                await client.sendTextWithMentions(chatId, `Hai @${serial.match(/\d+/g)}, ada yang bisa saya bantu? ${prefix}help untuk melihat list perintah :D`)
                                break
                            case prefix+'lang':
                                if(isLimit(serial)) return
                                if(args[1] == undefined || args[2] == undefined) return
                                let lang = body.split(' ')[1];
                                let langText = body.slice(6+lang.length);
                                if(langText.length >= 250) return client.sendText(from,'Teks Kepanjangan :(')
                                var gtts = new gTTs(langText, lang);
                                gtts.save('./gtts/lang.mp3', function () {
                                    client.sendPtt(from, './gtts/lang.mp3')
                                    limitAdd(serial)
                                })
                                break
                            case prefix+'cekresi':
                                if(isLimit(serial)) return
                                if(!args.lenght >= 3 ) return
                                let kurir = args[2];
                                let resi = args[1];
                                let courir = ['jne', 'pos', 'jnt', 'sicepat', 'tiki', 'anteraja', 'wahana', 'ninja', 'lion', 'lek'];
                                let chkKurir = courir.includes(kurir.toLowerCase());
                                if (chkKurir === true) {
                                    const apikeys = () => {
                                        const ran = Math.floor(Math.random() * 3);
                                        switch (ran) {
                                            case 0:
                                                return '613365e93ec2e9891024176f1b7ee60d3714256b27b1c43dbc82518383323d3c'
                                            case 1:
                                                return '4830e97d5f6e9122e71fde868b33ef79963203187ec608c2a1742517fa1a9424'
                                            case 2:
                                                return 'e84bd4628941e71d9074c3c233dc76cbcbdb8cceb9ae6aebbc1e163599af006f'
                                        }
                                    }
                                    axios.get(`https://api.binderbyte.com/cekresi?awb=${resi}&api_key=${apikeys()}&courier=${kurir}`).then((res) => {
                                        if (res.data.result === true) {
                                            client.sendText(from,'Tunggu sebentar ya kaka :D')
                                            let bn = res.data.data;
                                            let hasil = `╭──────[ Informasi Tracking ]──────\n├> Kurir   : ${bn.courier}\n├> Resi    : ${bn.waybill}\n├> Dikirim : ${bn.shipped}`;
                                            if (bn.received !== '' || bn.received !== null || bn.received !== undefined || bn.received !== '') {
                                                hasil += `\n├> Diterima Oleh : ${bn.received.name}\n├> Tanggal : ${bn.received.date}\n├> Status : ${bn.received.status}`;
                                            }
                                            hasil += `\n├────────────────\n├> Tracking : `;
                                            let track = bn.tracking;
                                            Object.keys(track).reverse().forEach(function (i) {
                                                hasil += `\n├────────────────\n├> Tanggal   : ${track[i].date}\n├> Deskripsi : ${track[i].desc}\n├> Status    : ${track[i].status}\n├────────────────`;
                                            });
                                            hasil += '\n╰──[ xYz WhatsApp Bot ]───';
                                            client.sendText(from,hasil);
                                            limitAdd(serial);
                                        } else {
                                            client.sendText(from,'Kode resi invalid / kadaluarsa');
                                        }
                                    }).catch(err => {
                                        console.log(err)
                                        client.sendText(from,'Server sedang dalam masalah, coba lagi nanti');
                                    })
                                } else {
                                    client.sendText(from,`Kurir ${kurir} tidak ada atau penulisan salah!`);
                                    client.sendText(from,'Contoh kurir : jne, pos, jnt, sicepat, tiki, anteraja, wahana, ninja, lion, lek');
                                }
                                break
                            case prefix+'quran':
                                axios.get('https://api.banghasan.com/quran/format/json/acak').then((res) => {
                                    const sr = /{(.*?)}/gi;
                                    const hs = res.data.acak.id.ayat;
                                    const ket = `${hs}`.replace(sr, '');
                                    let hasil = `[${ket}]   ${res.data.acak.ar.teks}\n\n${res.data.acak.id.teks}(QS.${res.data.surat.nama}, Ayat ${ket})`;
                                    client.sendText(from, hasil);
                                })
                                break
                            case prefix+'surah':
                                if(!args.lenght >= 3) return
                                const dictzk = body.split(' ')[1];
                                const ayat = body.split(' ')[3];
                                if (!isNaN(dictzk) && dictzk <= 114) {
                                    if (ayat !== undefined) {
                                        axios.get(`https://api.banghasan.com/quran/format/json/surat/${dictzk}/ayat/${ayat}`).then((res) => {
                                            if (isNullOrUndefined(res.data.ayat.error) === true) {
                                                let hasil = `Surah ${res.data.surat.nama} ayat ${ayat} : \n\n`;
                                                let indexs = res.data.ayat.data.ar;
                                                let a = res.data.ayat.data.idt;
                                                let b = res.data.ayat.data.id;
                                                Object.keys(indexs).forEach(function (i) {
                                                    hasil += `[${indexs[i].ayat}]  ${indexs[i].teks}\n`;
                                                    hasil += `\n${striptags(a[i].teks)}\n`;
                                                    hasil += `\nArtinya : ${curlyRemover(b[i].teks)}\n`;
                                                })
                                                client.sendText(from,hasil);
                                            } else {
                                                client.sendText(from,`Error, ayat ${ayat} surah ${dictzk} tidak valid`);
                                            }
                                        })
                                    } else {
                                        axios.get(`https://api.banghasan.com/quran/format/json/surat/${dictzk}`).then((res) => {
                                            const sr = /<(.*?)>/gi;
                                            const hs = res.data.hasil[0];
                                            const ket = `${hs.keterangan}`.replace(sr, '');
                                            client.sendText(from,`╭───[ Hasil Surah ]───\n├ Nomor Surah : ${hs.nomor}\n├ Nama Surah : ${hs.nama}\n├ Asma Surah : ${hs.asma}\n├ Jumlah Ayat : ${hs.ayat}\n├ Tipe Surah : ${hs.type}\n├ Urut : ${hs.urut}\n├ Rukuk Surah : ${hs.rukuk}\n├ Arti Surah : ${hs.arti}\n╰──[ Surah ${hs.nama} ]───\n\n${ket}`);
                                        })
                                    }
                                } else {
                                    client.sendText(from,`Error, nomor surah ${dictzk} tidak valid\n*${prefix}list surah* ~> menampilkan list surah`);
                                }
                            break
                            case prefix+'bmkg':
                                if(isLimit(serial)) return
                                axios.get('https://data.bmkg.go.id/autogempa.xml').then((res) => {
                                    parseString(res.data, function (err, result) {
                                        result = result.Infogempa.gempa[0];
                                        let hasils = `╭──[ Info Gempa BMKG Terbaru ]───\n├ Tanggal : ${result.Tanggal}\n├ Jam : ${result.Jam}\n├ Magnitudo : ${result.Magnitude}\n├ Kedalaman : ${result.Kedalaman}\n├ Lintang : ${result.Lintang}\n├ Bujur : ${result.Bujur}\n├ Lokasi 1 : ${result.Wilayah1}\n├ Lokasi 2 : ${result.Wilayah2}\n├ Lokasi 3 : ${result.Wilayah3}\n├ Lokasi 4 : ${result.Wilayah4}\n├ Lokasi 5 : ${result.Wilayah5}\n├ Potensi : ${result.Potensi}\n╰──[ xYz WhatsApp Bot ]───`;
                                        client.sendText(from, hasils)
                                        limitAdd(serial)
                                });})
                                break
                            case prefix+'google':
                                if(isLimit(serial)) return
                                var googleQuery = body.slice(8)
                                if(googleQuery == undefined || googleQuery == ' ') return
                                google({ 'query': googleQuery, 'limit': '2' }).then(results => {
                                    let vars = results[0];
                                    client.sendText(from, `*[Hasil Pencarian Google]*\n\nJudul : \n${vars.title}\n\nDeskripsi : \n${vars.snippet}\n\nLink : \n${vars.link}`);
                                }).catch(e => {
                                    client.sendText(e);
                                })
                                limitAdd(serial)
                                break
                            case '#bot restart':
                                if(isSadmin){
                                    client.sendText(from, '*[WARN]* Restarting ...')
                                    setting.restartState = true
                                    setting.restartId = chatId
                                    fs.writeFileSync('./settings/setting.json', JSON.stringify(setting, null,2));
                                    fs.writeFileSync('./settings/limit.json', JSON.stringify(limit));
                                    fs.writeFileSync('./settings/muted.json', JSON.stringify(muted, null,2));
                                    fs.writeFileSync('./settings/msgLimit.json', JSON.stringify(msgLimit));
                                    fs.writeFileSync('./settings/banned.json', JSON.stringify(banned));
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
                                    }}
                                    var os = new os_func();
                                    os.execCommand('pm2 restart index').then(res=> {
                                    }).catch(err=> {
                                        console.log("os >>>", err);
                                    })
                                }
                                break
                            case prefix+'banchat on':
                                if(setting.banChats === true) return
                                if(!isSadmin) return
                                setting.banChats = true
                                banChats = true
                                fs.writeFileSync('./settings/setting.json', JSON.stringify(setting, null, 2))
                                reply('Global chat has been disabled!')
                                break
                            case prefix+'banchat off':
                                if(setting.banChats === false) return
                                if(!isSadmin) return
                                setting.banChats = false
                                banChats = false
                                fs.writeFileSync('./settings/setting.json', JSON.stringify(setting, null, 2))
                                reply('Global chat has been enabled!')
                                break
                            case '#mtc start':
                                if(mtcState === true) return
                                if(!isSadmin) return
                                setting.mtc = true
                                fs.writeFileSync('./settings/setting.json', JSON.stringify(setting, null, 2))
                                const chgdf = await client.getAllChatIds();
                                for(let ids of chgdf){
                                    var chk = await client.getChatById(ids)
                                    if(!chk.isReadOnly ) client.sendText(ids, '*[INFO]* Bot sedang melakukan maintenance\n\nSemua perintah bot di hentikan')
                                }
                                reply('Maintenance sudah di Umumkan!')
                                break
                            case '#mtc stop':
                                if(mtcState === false) return
                                if(!isSadmin) return
                                setting.mtc = false
                                fs.writeFileSync('./settings/setting.json', JSON.stringify(setting, null, 2))
                                const chatsb = await client.getAllChatIds();
                                for(let ids of chatsb){
                                    var chk = await client.getChatById(ids)
                                    if(!chk.isReadOnly ) client.sendText(ids, '*[INFO]* Bot selesai melakukan maintenance')
                                }
                                reply('Maintenance sudah di Umumkan!')
                                break
                            case '#bc':
                                if(!isSadmin) return
                                let dict = body.slice(4)
                                const chatsz = await client.getAllChatIds();
                                if(quotedMsg && quotedMsg.type == 'image'){
                                    const mediaData = await decryptMedia(quotedMsg)
                                    const imageBase64 = `data:${quotedMsg.mimetype};base64,${mediaData.toString('base64')}`
                                    for(let ids of chatsz){
                                        var chk = await client.getChatById(ids)
                                        if(!chk.isReadOnly) client.sendImage(ids, imageBase64, 'gambar.jpeg', dict)
                                    }
                                    reply('Broadcast sukses!')
                                }else{
                                    for(let ids of chatsz){
                                        var chk = await client.getChatById(ids)
                                        if(!chk.isReadOnly && isMuted(ids)) client.sendText(ids, dict)
                                    }
                                    reply('Broadcast sukses!')
                                }
                                break
                            case prefix+'leave':
                                if (!isGroupMsg) return client.reply(from, 'Maaf, perintah ini hanya dapat dipakai didalam grup!', id)
                                if (!isGroupAdmins) return client.reply(from, 'Maaf, perintah ini hanya dapat dilakukan oleh admin grup!', id)
                                await client.sendText(from,'Goodbye minna :)').then(async () => {
                                    client.deleteChat(chatId)
                                    client.leaveGroup(chatId)
                                })
                                break
                            case '#bot clearall':
                                if(!isSadmin) return
                                client.sendText(from, 'Genosida di mulai!')
                                const groupCount = await client.getAllChatIds()
                                const lkist = await client.getAllGroups()
                                for(let gcList of lkist){
                                    await client.sendText(gcList.contact.id,`Maaf, bot overload dan tercatat ${groupCount.length} chat aktif`).then(async () => {
                                    client.deleteChat(gcList.contact.id)
                                    client.leaveGroup(gcList.contact.id)
                                })
                                }
                                for(let xchat of groupCount){
                                    await client.deleteChat(xchat)
                                }
                                client.sendText(from, 'sukses!')
                                break
                            case prefix+'tiktok':
                            if(isLimit(serial)) return
                            if (args.length == 2) {
                                const url = args[1]
                                if (!url.match(isUrl) && !url.includes('tiktok.com')) return client.sendText(from, 'Maaf, link yang kamu kirim tidak valid')
                                client.sendText(from, '⏳ Tunggu yaa, sedang proses . . . ⏳')
                                await tiktok(url)
                                .then((videoMeta) => {
                                    const filename = videoMeta.authorMeta.name + '.mp4'
                                    const caps = `\nUsername: ${videoMeta.authorMeta.name} \nMusic: ${videoMeta.musicMeta.musicName} \nView: ${videoMeta.playCount.toLocaleString()} \nLike: ${videoMeta.diggCount.toLocaleString()} \nComment: ${videoMeta.commentCount.toLocaleString()} \nShare: ${videoMeta.shareCount.toLocaleString()} \nCaption: ${videoMeta.text.trim() ? videoMeta.text : '-'} \n\nProcessing Sukses #xYz BOT!`
                                    // client.sendFileFromUrl(from,videoMeta.url, filename, videoMeta.NoWaterMark ? caps : `⚠ Video tanpa watermark tidak tersedia. \n\n${caps}`)
                                    limitAdd(serial)
                                    client.sendFile(from,videoMeta.urlbase64, filename, videoMeta.NoWaterMark ? caps : `⚠ Video tanpa watermark tidak tersedia. \n\n${caps}`)
                                    .catch(err => console.log('Caught exception: ', err))
                                }).catch((err) => {
                                    // client.sendText(from, 'Gagal mengambil metadata, link yang kamu kirim tidak valid')
                                    client.sendText(from, `Error, user private atau link salah`)
                                });
                            }
                            break
                            case prefix+'mnt':
                                client.sendText(from, license)
                                break
                            case prefix+'creator':
                                client.sendContact(chatId, `6281297980063@c.us`)
                                break
                            case prefix+'ig':
                            case prefix+'instagram':
                                return reply('Server downloader sedang bermasalah')
                                if(isLimit(serial)) return
                                if (args.length == 2) {
                                    const url = args[1]
                                    if (!url.match(isUrl) && !url.includes('instagram.com')) return client.sendText(from, 'Maaf, link yang kamu kirim tidak valid')
                                    client.sendText(from, '⏳ Tunggu yaa, sedang proses . . . ⏳')
                                    instagram(url)
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
                                            limitAdd(serial)
                                        } catch (err) {
                                            client.sendText(from, `Error, ` + err)
                                        }
                                    })
                                        .catch((err) => {
                                            // client.sendText(from, `Error, url tidak valid atau tidak memuat video \n\n${err}`)
                                            client.sendText(from, `Error, user private atau link salah \n\n\ ${err} `)
                                        });
                                }
                                break
                            case prefix+'twt':
                            case prefix+'twitter':
                                if(isLimit(serial)) return
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
                                            limitAdd(serial)
                                        } catch (err) {
                                            client.sendText(from, `Error, ` + err)
                                        }
                                    })
                                        .catch((err) => {
                                            // client.sendText(from, `Error, url tidak valid atau tidak memuat video \n\n${err}`)
                                            client.sendText(from, `Error, user private atau link salah \n\n\ ${err} `)
                                        })
                                    }
                                break
                            case prefix+'fb':
                            case prefix+'facebook':
                            if(isLimit(serial)) return
                            if (args.length == 2) {
                                let url = args[1]
                                if(!url.match(new RegExp('https://','gi'))) url = 'https://'+url
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
                                            limitAdd(serial)
                                        } catch (err) {
                                            client.sendText(from, `Error, ` + err)
                                        }
                                    })
                                        .catch((err) => {
                                            // client.sendText(from, `Error, url tidak valid atau tidak memuat video \n\n${err}`)
                                            client.sendText(from, `Error, user private atau link salah \n\n${err}`)
                                        })
                                    }
                                break
                            case prefix+'yt':
                            case prefix+'youtube':
                            if(isLimit(serial)) return
                            if (args.length == 2) {
                                let url = args[1]
                                if(!url.match(new RegExp('https://','gi'))) url = 'https://'+url
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
                                        limitAdd(serial)
                                    } catch (err) {
                                        client.sendText(from, `Error, ` + err)
                                    }
                                })
                                .catch((err) => {
                                    // client.sendText(from, `Error, url tidak valid atau tidak memuat video \n\n${err}`)
                                    client.sendText(from, `Error, user private atau link salah \n\n${err}`)
                                })
                            }
                            break
                            case prefix+'likee' :
                            case prefix+'like' :
                            if(isLimit(serial)) return
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
                                        limitAdd(serial)
                                    } catch (err) {
                                        client.sendText(from, `Error, ` + err)
                                    }
                                })
                                .catch((err) => {
                                    client.sendText(from, `Error, url tidak valid atau tidak memuat video \n\n${err}`)
                                })
                            }
                            break
                            case prefix+'nhder':
                                if(isLimit(serial)) return
                                if (args.length >=2){
                                    const code = args[1]
                                    const url = 'https://nhder.herokuapp.com/download/nhentai/'+code+'/zip'
                                    const short = []
                                    const shortener = await urlShortener(url)
                                    // console.log('Shortlink: '+ shortener)
                                    url['short'] = shortener
                                    short.push(url)
                                    const caption = `Link: ${shortener}\n\nProcessing Sukses #xYz BOT!`
                                    client.sendText(from, caption)
                                    limitAdd(serial)
                                } else {
                                    client.sendText(from, 'Maaf tolong masukan code nuclear')
                                }
                                break
                            case prefix+'ytmp3':
                                if(isLimit(serial)) return
                                if (args.length >= 2) {
                                    let url = args[1]
                                    if(!url.match(new RegExp('https://','gi'))) url = 'https://'+url
                                    var videoid = url.match(/(?:https?:\/{2})?(?:w{3}\.)?youtu(?:be)?\.(?:com|be)(?:\/watch\?v=|\/)([^\s&]+)/);
                                    if(videoid === null) {
                                        return client.sendText(from,"Videonya gavalid gan.");
                                     }fs.access('audio/'+videoid[1]+'.mp3', (err) => {
                                        if(!err){
                                            client.sendText(from,'Tunggu sebentar ya kaka :D')
                                            client.sendFile(from,'audio/'+ videoid[1] +'.mp3', `${videoid[1]}.mp3`)
                                            limitAdd(serial);
                                        }else{
                                            async function ytmp3(){
                                                client.sendText(from,'Tunggu sebentar ya kaka :D')
                                                const ffmpeg = require('fluent-ffmpeg');
                                                const ytdl = require("ytdl-core")
                                                ytdl.getInfo(videoid[1]).then(info => {
                                                if (info.videoDetails.lengthSeconds > 1000){
                                                    client.sendText(from,"Videonya terlalu panjang gan, coba yang lain :v")
                                                }else{
                                                    let stream = ytdl(videoid[1], {
                                                        quality: 'highestaudio',
                                                      });
                                                      ffmpeg(stream)
                                                      .audioBitrate(128)
                                                      .save(`audio/${videoid[1]}.mp3`)
                                                      .on('end', () => {
                                                        client.sendFile(from,'audio/'+ videoid[1] +'.mp3', `${videoid[1]}.mp3`)
                                                      });
                                                    limitAdd(serial);
                                                }
                                                });
                                            }
                                            ytmp3();
                                        }
                                    })
                                }
                            break
                            case prefix+'wanime':
                                if(isLimit(serial)) return
                                const result = await wallpaperanime()
                                client.sendFileFromUrl(from, result)
                                limitAdd(serial)
                            break
                            case prefix+'waifu':
                            case prefix+'Waifu':
                                if(isLimit(serial)) return
                                q8 = q2 = Math.floor(Math.random() * 98) + 10;
                                client.sendFileFromUrl(from, 'http://randomwaifu.altervista.org/images/00'+q8+'.png', 'Waifu.png','Gimana bro?');
                                limitAdd(serial)
                                break
                            case prefix+'kucing':
                                if(isLimit(serial)) return
                                q2 = Math.floor(Math.random() * 900) + 300;
                                q3 = Math.floor(Math.random() * 900) + 300;
                                client.sendFileFromUrl(from, 'http://placekitten.com/'+q3+'/'+q2, 'kucing.png','Kucing nih');
                                limitAdd(serial)
                            break
                            case prefix+'wallpaper':
                                if(isLimit(serial)) return
                                client.sendFileFromUrl(from, 'https://source.unsplash.com/1280x720/?nature','wp.jpeg')
                                limitAdd(serial)
                            break
                            case prefix+'corona':
                                if(isLimit(serial)) return
                                function intl(str) {
                                    var nf = Intl.NumberFormat();
                                    return nf.format(str);
                                }
                                if(args[1]){
                                    if(args[1] === 'prov'){
                                        const province = body.slice(13).toLowerCase()
                                        axios.get('https://indonesia-covid-19.mathdro.id/api/provinsi/').then(({data}) => {
                                            var founded = false
                                            data.data.find(i => {
                                                if(i.provinsi.toLowerCase() == province){
                                                    founded = true
                                                    client.sendText(from, `╭──[ Kasus di ${i.provinsi} ]───\n├ Positif : ${intl(i.kasusPosi)} Kasus\n├ Sembuh : ${intl(i.kasusSemb)} Kasus\n├ Meninggal : ${intl(i.kasusMeni)} Kasus\n├ Tetap Jaga Kesehatan dan #STAYATHOME\n╰──[ xYz WhatsApp Bot ]───`)
                                                    limitAdd(serial)
                                                }
                                            })
                                            if(founded == false) return client.sendText(from, `Provinsi ${province} tidak valid, gunakan format formal seperti : DKI Jakarta`)
                                        })
                                    }
                                }else{
                                    axios.all([
                                        axios.get('https://covid19.mathdro.id/api'),
                                        axios.get('https://covid19.mathdro.id/api/countries/id')
                                    ]).then((res) => {
                                        var hasil = res[0].data;
                                        var id = res[1].data;
                                        var date = new Date(id.lastUpdate);
                                        date = moment(date).fromNow();
                                        translatte(date, {to: 'id'}).then(res => {
                                            date = res.text
                                            client.sendText(from, `╭──[ Kasus Covid19 di Dunia]───\n├ Positif : ${intl(hasil.confirmed.value)} Kasus\n├ Sembuh : ${intl(hasil.recovered.value)} Kasus\n├ Meninggal : ${intl(hasil.deaths.value)} Kasus\n├──[ Kasus Covid19 di Indonesia]───\n├ Positif : ${intl(id.confirmed.value)} Kasus \n├ Sembuh : ${intl(id.recovered.value)} Kasus \n├ Meninggal : ${intl(id.deaths.value)} Kasus\n├ Update Terakhir : ${date}\n├ Tetap Jaga Kesehatan dan #STAYATHOME\n╰──[ xYz WhatsApp Bot ]───`)
                                            limitAdd(serial)
                                        })
                                    })
                                }
                                break
                            case prefix+'anime':
                            if(isLimit(serial)) return
                            if (args.length >=2) {
                                const animename = args[1]
                                malScraper.getInfoFromName(animename)
                                const { title, picture, score, synopsis, episodes, aired, rating, status } = await malScraper.getInfoFromName(animename)
                                await client.sendFileFromUrl(from, `${picture}`, 'Anime.png', '⛩️Title:'+`${title}`+'\n\n🎼️Score:'+`${score}`+'\n\n📙️Status:'+`${status}`+'\n\n🖼️Episodes:'+`${episodes}`+'\n\n✨️Rating:'+`${rating}`+'\n\n🌠️Synopsis:'+`${synopsis}`+'\n\n📆️Aired:'+`${aired}`+'.')
                                limitAdd(serial)
                            } else{
                                client.sendText(from, 'Maaf tolong masukan nama anime yang anda cari~')
                            }
                            break
                            case prefix+'quote':
                                if(isLimit(serial)) return
                                const getBijak = await quotes()
                                client.sendText(from, getBijak);
                                limitAdd(serial)
                            break
                            case prefix+'quoteit':
                                if(isLimit(serial)) return
                                let quotedText = body.slice(9);
                                if(quotedText == undefined || quotedText == ' ') return
                                async function processImgs() {
                                function checks(){
                                    if (quotedText.length <= 20) {
                                        return Jimp.FONT_SANS_64_WHITE;
                                    }else if (quotedText.length > 20){
                                        return Jimp.FONT_SANS_32_WHITE;
                                    }else if(quotedText.length >= 170){
                                        return Jimp.FONT_SANS_8_WHITE;
                                    }
                                }
                                let image = await Jimp.read('https://picsum.photos/1000/800');
                                Jimp.loadFont(checks()).then(font => {
                                    var w = image.bitmap.width;
                                    var h = image.bitmap.height;
                                    var textWidth = Jimp.measureText(font, quotedText);
                                    var textHight = Jimp.measureTextHeight(font, quotedText);
                                    image
                                    .print(font, w/2 - textWidth/2, h/2 - textHight/2,
                                        {   
                                        text: quotedText,
                                        alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,                                                                                                                      
                                        alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE,
                                        }, textWidth, textHight).quality(75).color([{apply:'darken', params: [10]}], function(err){ 
                                        if (err) throw err; 
                                    }) 
                                    .write('./quote/quoteIt.jpeg', function (err) {
                                        if (err) throw err;
                                        client.sendFile(from, './quote/quoteIt.jpeg','quoteIt.jpeg', 'QuoteIt sukses! #xYz BOT');
                                        limitAdd(serial);
                                    });});}
                                    await processImgs();
                            break
                        }
                    }
                    if(caption == undefined) return
                    if(caption == prefix+'compress' && isMedia){
                        if (isLimit(serial)) return
                        const gambar = await decryptMedia(message, uaOverride)
                        async function processImg() {
                            let image = await Jimp.read(gambar);
                            image.quality(95).write('./quote/compressed.jpeg', function (err) {
                                if (err) throw err;
                                client.sendFile(from, './quote/compressed.jpeg','compressed.jpg', 'Copmpress sukses! #xYz BOT');
                                limitAdd(serial);
                            });
                        }
                            await processImg();
                    }
                    if(caption == prefix+'wait' && isMedia){
                        if(isLimit(serial)) return
                        const fetch = require('node-fetch');
                        const mediaData = await decryptMedia(message, uaOverride)
                        const attachmentData = `data:${mimetype};base64,${mediaData.toString('base64')}`
                        fetch("https://trace.moe/api/search", {
                          method: "POST",
                          body: JSON.stringify({ image: attachmentData }),
                          headers: { "Content-Type": "application/json" }
                        })
                          .then(res => res.json())
                          .then(result =>  {
                        var teks = `
                        
What Anime Is That ?

Echi / Tidak : *${result.docs[0].is_adult}*
Judul Jepang : *${result.docs[0].title}*
Ejaan Judul : *${result.docs[0].title_romaji}*
Ejaan Inggris : *${result.docs[0].title_english}*
Episode : *${result.docs[0].episode}*
Season  : *${result.docs[0].season}*
                        
                        `;
                        client.sendText(from,teks);
                        limitAdd(serial);
                         });
                    }
                }
            } catch (err) {
                console.log(color('[ERROR]', 'red'), err)
            }
        }) 
    })
}


process.on('Something went wrong', function (err) {
    console.log('Error eksepsi: ', err);
    });

startServer()
