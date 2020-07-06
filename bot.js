const fs = require('fs');
const { Client, Location } = require('./index');
var parseString = require('xml2js').parseString;
const axios= require('axios').default;
const striptags = require('striptags');
const pm2 = require('pm2');
const { MessageMedia } = require('./index');
const path = require('path');
const gTTs = require('gtts');
const { isNullOrUndefined } = require('util');
const { send } = require('process');
const { resolve } = require('path');
let Sadmin = "6281297980063";
var datan = fs.readFileSync('./admin.json');
var set = fs.readFileSync('./setting.json');
const setting = JSON.parse(set);
const admin = JSON.parse(datan);
let yNumber;
const SESSION_FILE_PATH = './session.json';
let sessionCfg;
if (fs.existsSync(SESSION_FILE_PATH)) {
    sessionCfg = require(SESSION_FILE_PATH);
}
const client = new Client({ puppeteer: { headless: true, executablePath: 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe' }, session: sessionCfg});
client.initialize();

setInterval(() => {
    pm2.describe('bot', (error, scripts) => {
      const exitTimeout = 59
      const uptime = Date.now() - scripts[0].pm2_env.pm_uptime
      if (uptime > exitTimeout * 59 * 1000) {
        let hasil = JSON.stringify(setting, null, 2);
        fs.writeFileSync("setting.json", hasil);
      }
    })
  }, 30 * 1000)
client.on('qr', (qr) => {
    console.log('QR RECEIVED', qr);
});

client.on('authenticated', (session) => {
    console.log('AUTHENTICATED', session);
    sessionCfg=session;
    fs.writeFile(SESSION_FILE_PATH, JSON.stringify(session), function (err) {
        if (err) {
            console.error(err);
        }
    });
});

client.on('auth_failure', msg => {
    console.error('AUTHENTICATION FAILURE', msg);
});

client.on('ready', () => {
    console.log('BOT READY TO GO'); 
});
function curlyRemover(chat) {
    if (chat !== undefined){
        let sr = /{(.*?)}/g;
        let ket = chat.toString().replace(sr, '');
        return ket;
    }
    return chat;
}
function timer(ms) {
    const stop = new Date().getTime() + ms;
    while(new Date().getTime() < stop);
}
function generate(n) {
    var add = 1, max = 12 - add;   
    if ( n > max ) {
            return generate(max) + generate(n - max);
    }
    max        = Math.pow(10, n+add);
    var min    = max/10; 
    var number = Math.floor( Math.random() * (max - min + 1) ) + min;

    return ("" + number).substring(add); 
}
var isSimSimi = setting.isSimSimi;
var simSimichat = setting.simSimichat;
var isEnableChat = setting.isEnableChat;
client.on('message', async msg => {
    try {
        console.log("\x1b[32m"+'[INFO] MESSAGE RECEIVED --> '+`"${msg.body}"` + "\x1b[0m" + "\n");
        const chats = await msg.getChat();
        if (chats.isGroup) {
            const b = await msg.getContact();
            yNumber = b.id.user;
        } else {
            const b = await msg.getContact();
            yNumber = b.id.user;
        }
        let chkadmin = admin.includes(yNumber);
        let isSadmin = yNumber === Sadmin;
        console.log("\x1b[35m"+"[CHECKING] SENDER IS_ADMIN : " + isSadmin + "\x1b[0m");
        if (isEnableChat || isSadmin || chkadmin) {
            if (msg.body === ""){
                console.log("\x1b[31m" + "[INFO] MEDIA RECEIVED" + "\x1b[0m" + "\n");    
            }else if (msg.body == 'Assalamu\'alaikum') {
                // Send a new message as a reply to the current one
                msg.reply('Walaikumussalam wbrkt');
            } else if (msg.body == 'Assalamualaikum') {
                // Send a new message as a reply to the current one
                msg.reply('Walaikumussalam wbrkt');
            } else if (msg.body == 'Samlikum') {
                // Send a new message as a reply to the current one
                msg.reply('Walaikum');
            } else if (msg.body == '@bot') {
                // Send a new message as a reply to the current one
                msg.reply('Ya, saya aktif');
            } else if (msg.body == '@p') {
                // Send a new message as a reply to the current one
                msg.reply('Ya bro ada apa?');
            } else if (msg.body == '!ping') {
                // Send a new message to the same chat
                client.sendMessage(msg.from, 'pong');
            } else if(msg.body == '!everyone' && chkadmin) {
                const chat = await msg.getChat();
                if (chat.isGroup){
                    let text = "";
                    let mentions = [];
                    for(let participant of chat.participants) {
                        const contact = await client.getContactById(participant.id._serialized);
                        mentions.push(contact);
                        text += `@${participant.id.user} `;
                    }
                    chat.sendMessage(text, { mentions });
                } else {
                    msg.reply('This command can only be used in a group!');
                }
            } else if (msg.body.startsWith('!sendto ') && yNumber === Sadmin) {
                let number = msg.body.split(' ')[1];
                if (number.substr(0, 1) === "@") {
                    number = number.replace(/@/g, "");
                }
                if(number.charAt(0) !== "0"){
                    let messageIndex = msg.body.indexOf(number) + number.length;
                    let message = msg.body.slice(messageIndex, msg.body.length);
                    number = number.includes('@c.us') ? number : `${number}@c.us`;
                    let chat = await msg.getChat();
                    chat.sendSeen();
                    client.sendMessage(number, message);
                }else{
                    msg.reply("Invalid number format");
                }
            } else if (msg.body == '@bot uptime'){
                pm2.describe('bot', (error, scripts) => {
                    let uptime = scripts[0].pm2_env.pm_uptime
                    msg.reply(uptime);
                })
            } else if (msg.body.startsWith('!subject ') && chkadmin) {
                // Change the group subject
                let chat = await msg.getChat();
                if (chat.isGroup) {
                    let newSubject = msg.body.slice(9);
                    chat.setSubject(newSubject);
                } else {
                    msg.reply('This command can only be used in a group!');
                }
            } else if (msg.body.startsWith('!mimic ')) {
                // Replies with the same message
                msg.reply(msg.body.slice(6));
            } else if (msg.body.startsWith('!desc ') && chkadmin) {
                // Change the group description
                let chat = await msg.getChat();
                if (chat.isGroup) {
                    let newDescription = msg.body.slice(6);
                    chat.setDescription(newDescription);
                } else {
                    msg.reply('This command can only be used in a group!');
                }
            } else if (msg.body == '!leave' && chkadmin) {
                // Leave the group
                let chat = await msg.getChat();
                if (chat.isGroup) {
                    chat.leave();
                } else {
                    msg.reply('This command can only be used in a group!');
                }
            } else if (msg.body.startsWith('!join ') && chkadmin) {
                const inviteCode = msg.body.split(' ')[1];
                let code = inviteCode.slice(26);
                try {
                    await client.acceptInvite(code);
                    msg.reply('Joined the group!');
                } catch (e) {
                    msg.reply('That invite code seems to be invalid.');
                }
            } else if (msg.body == '!groupinfo') {
                let chat = await msg.getChat();
                if (chat.isGroup) {
                    msg.reply(`
---[Detail Group]---
Nama: ${chat.name}
Deskrpsi: ${chat.description}
Dibuat pada: ${chat.createdAt.toString()}
Dibuat oleh: ${chat.owner.user}
Jumlah anggota: ${chat.participants.length}
                    `);
                } else {
                    msg.reply('This command can only be used in a group!');
                }
            } else if (msg.body == '!chats' && chkadmin) {
                const chats = await client.getChats();
                client.sendMessage(msg.from, `The bot has ${chats.length} chats open.`);
            } else if (msg.body == '!info') {
                let info = client.info;
                client.sendMessage(msg.from, `
---[Informasi BOT]---
Nama Bot: ${info.pushname}
Creator: ${Sadmin}
Nomor Bot: ${info.me.user}
Platform: ${info.platform}
WhatsApp version: ${info.phone.wa_version}
                `);
            } else if (msg.body == '!nuked') {
                let hasil = generate(6);
                msg.reply(hasil);
            } else if (msg.body == '!mediainfo' && msg.hasMedia && chkadmin) {
                const attachmentData = await msg.downloadMedia();
                msg.reply(`
*Media info*
MimeType: ${attachmentData.mimetype}
Filename: ${attachmentData.filename}
Data (length): ${attachmentData.data.length}
                `);
            } else if (msg.body == '!quoteinfo' && msg.hasQuotedMsg && chkadmin) {
                const quotedMsg = await msg.getQuotedMessage();
    
                quotedMsg.reply(`
ID: ${quotedMsg.id._serialized}
Type: ${quotedMsg.type}
Author: ${quotedMsg.author || quotedMsg.from}
Timestamp: ${quotedMsg.timestamp}
Has Media? ${quotedMsg.hasMedia}
                `);
            } else if (msg.body == '!resend' && msg.hasQuotedMsg && chkadmin) {
                const chat = await msg.getChat();
                const quotedMsg = await msg.getQuotedMessage();
                if (quotedMsg.hasMedia) {
                    const attachmentData = await quotedMsg.downloadMedia();
                    chat.sendMessage(attachmentData, { caption: 'Nih biar g tenggelem', sendAudioAsVoice: true });
                }
            } else if (msg.body == '!location') {
                msg.reply(new Location(37.422, -122.084, 'Googleplex\nGoogle Headquarters'));
            } else if (msg.location) {
                msg.reply(msg.location);
            } else if (msg.body.startsWith('!kbbi ')) {
                const dict = msg.body.split(' ')[1];
                axios.get(`http://127.0.0.1:5000/kbbi/${dict}`).then((res) => {
                    msg.reply(res.data.hasil);
                })
                // var spawn = require("child_process").spawn;
                // var process = spawn('C:\\Users\\Admin01\\AppData\\Local\\Programs\\Python\\Python38\\python.exe',["pykbbi.py", dict]);
                // process.stdout.on('data', function(data) { 
                //     msg.reply(data.toString()); 
                // })
            } else if (msg.body.startsWith('!status ') && chkadmin) {
                const newStatus = msg.body.split(' ')[1];
                await client.setStatus(newStatus);
                msg.reply(`Status was updated to *${newStatus}*`);
            } else if (msg.body == '!me') {
                const contact = await msg.getContact();
                const chat = await msg.getChat();
                chat.sendMessage(`Halo @${contact.number}, Apa kabar?`, {
                    mentions: [contact]
                });
            } else if (msg.body == '!delete' && msg.hasQuotedMsg && chkadmin) {
                const quotedMsg = await msg.getQuotedMessage();
                if (quotedMsg.fromMe) {
                    quotedMsg.delete(true);
                } else {
                    msg.reply('I can only delete my own messages');
                }
            } else if (msg.body === '!arsip' && chkadmin) {
                const chat = await msg.getChat();
                chat.archive();
                msg.reply("Sekarang chat ini telah di arsipkan, pemilik bot tidak dapat melihat privasi anda");
            } else if (msg.body == '!bmkg') {
                axios.get('https://data.bmkg.go.id/autogempa.xml').then((res) => {
                    parseString(res.data, function (err, result) {
                        result = result.Infogempa.gempa[0];
                        let hasil = `╭──[ Info Gempa BMKG Terbaru ]───\n├ Tanggal : ${result.Tanggal}\n├ Jam : ${result.Jam}\n├ Magnitudo : ${result.Magnitude}\n├ Kedalaman : ${result.Kedalaman}\n├ Lintang : ${result.Lintang}\n├ Bujur : ${result.Bujur}\n├ Lokasi 1 : ${result.Wilayah1}\n├ Lokasi 2 : ${result.Wilayah2}\n├ Lokasi 3 : ${result.Wilayah3}\n├ Lokasi 4 : ${result.Wilayah4}\n├ Lokasi 5 : ${result.Wilayah5}\n├ Potensi : ${result.Potensi}\n╰──[ @ItzNgga WhatsApp Bot ]───`;
                        msg.reply(hasil);
                    });
                    
                })
            } else if (msg.body == '!corona') {
                axios.all([
                    axios.get('https://covid19.mathdro.id/api'),
                    axios.get("https://covid19.mathdro.id/api/countries/id")
                ]).then((res) => {
                    var hasil = res[0].data;
                    var id = res[1].data;
                    function intl(str) {
                        var nf = Intl.NumberFormat();
                        return nf.format(str);
                    }
                    var date = new Date(id.lastUpdate);
                    var bn = `╭──[ Kasus Covid19 di Dunia]───\n├ Positif : ${intl(hasil.confirmed.value)} Kasus\n├ Sembuh : ${intl(hasil.recovered.value)} Kasus\n├ Meninggal : ${intl(hasil.deaths.value)} Kasus\n├──[ Kasus Covid19 di Indonesia]───\n├ Positif : ${intl(id.confirmed.value)} Kasus \n├ Sembuh : ${intl(id.recovered.value)} Kasus \n├ Meninggal : ${intl(id.deaths.value)} Kasus\n├ ${date}\n├ Tetap Jaga Kesehatan dan #STAYATHOME\n╰──[ @ItzNgga WhatsApp Bot ]───`;
                    msg.reply(bn);
                })
            } else if (msg.body.startsWith('!ceknama ')) {
                const dict = msg.body.slice(9);
                axios.get(`http://beta.moe.team/api/artinama?apikey=McJNTmAfdBmO1hYk7gREmVBmtrxiywJtqN3uI7ZRNlMK7MiMwLVUVUQUzAtt6qrv&name=${dict}`).then((res) => {
                    msg.reply(res.data.result);
                })
            } else if (msg.body.startsWith('!ipcheck ')){
                const dict = msg.body.split(' ')[1];
                axios.get(`http://beta.moe.team/api/iplookup?apikey=McJNTmAfdBmO1hYk7gREmVBmtrxiywJtqN3uI7ZRNlMK7MiMwLVUVUQUzAtt6qrv&ip=${dict}`).then((res) => {
                    let hs = res.data.result
                    let hasil = `╭───[ Hasil Tracking IP ]───\n├ Info dibawah mungkin tidak akurat\n├ IP : ${hs.query}\n├ Hostname : ${hs.asname}\n├ ASN : ${hs.as}\n├ ISP : ${hs.isp}\n├ Latitude : ${hs.lat}\n├ Longitude : ${hs.lon}\n├ Benua : ${hs.continent}\n├ Negara : ${hs.country}\n├ Provinsi : ${hs.region}\n├ Kota : ${hs.city}\n├ Map : https://www.google.com/maps/search/?api=1&query=${hs.lat},${hs.lon}\n╰───[ @ItzNgga WhatssApp Bot ]───`;
                    msg.reply(hasil);
                }).catch(err => {
                    msg.reply("Alamat ip tidak ada atau tidak valid")
                })
            } else if (msg.body.startsWith("?apakah ")) {
                let int = Math.floor(Math.random() * 2);
                let hasil; 
                if (int === 1) {
                    hasil = "Iya";
                }else{
                    hasil = "Tidak";
                }
                msg.reply(hasil);
            } else if (msg.body.startsWith("?kapan ")) {
                let int = Math.floor(Math.random() * 9) + 1;
                let hasil;
                if (int === 1) {
                    hasil = "Besok";
                }else if (int === 2) {
                    hasil = "Kemarin";
                }else if (int === 3) {
                    hasil = "Lusa";
                }else if (int === 4) {
                    hasil = "Hari Ini";
                }else if (int === 5) {
                    hasil = "Minggu Depan";
                }else if (int === 6) {
                    hasil = "Bulan Depan";
                }else if (int === 7) {
                    hasil = "Tahun Depan";
                }else if (int === 8) {
                    hasil = "Sekarang";
                }else if (int === 9) {
                    hasil = "Gak Tau";
                }
                msg.reply(hasil);
            } else if (msg.body.startsWith("!game\n")) {
                let dict = msg.body.split('\n');
                let hasil;
                console.log(dict);
                var p1 = dict[1].replace(" ", "").replace("@", "");
                var p2 = dict[2].replace(" ", "").replace("@", "");
                var p3 = dict[3].replace(" ", "").replace("@", "");
                var p4 = dict[4].replace(" ", "").replace("@", "");
                var p5 = dict[5].replace(" ", "").replace("@", "");
                let int = Math.floor(Math.random() * 5);
                console.log(int);
                int = int + 1;
                var w1 = "false",w2 = "false",w3 = "false",w4 = "false",w5 = "false";
                if (int === 1){
                    w1 = "true";
                }else if (int === 2){
                    w2 = "true";
                }else if (int === 3){
                    w3 = "true";
                }else if (int === 4){
                    w4 = "true";
                }else if (int === 5){
                    w5 = "true";
                }
                let str = `{"game": [{"player_id": "1", "nomor": "${p1.split('+')[0]}", "alias": "${p1.split('+')[1].replace(" ", "")}", "isWerewolf": "${w1}", "isKilled": "false"}]}`;
                let parser = JSON.parse(str);
                let str1 = JSON.parse(`{"player_id": "2", "nomor": "${p2.split('+')[0]}", "alias": "${p2.split('+')[1].replace(" ", "")}", "isWerewolf": "${w2}", "isKilled": "false"}`);
                parser['game'].push(str1);
                let str2 = JSON.parse(`{"player_id": "3", "nomor": "${p3.split('+')[0]}", "alias": "${p3.split('+')[1].replace(" ", "")}", "isWerewolf": "${w3}", "isKilled": "false"}`);
                parser['game'].push(str2);
                let str3 = JSON.parse(`{"player_id": "4", "nomor": "${p4.split('+')[0]}", "alias": "${p4.split('+')[1].replace(" ", "")}", "isWerewolf": "${w4}", "isKilled": "false"}`);
                parser['game'].push(str3);
                let str4 = JSON.parse(`{"player_id": "5", "nomor": "${p5.split('+')[0]}", "alias": "${p5.split('+')[1].replace(" ", "")}", "isWerewolf": "${w5}", "isKilled": "false"}`);
                parser['game'].push(str4);
                var als = parser.game;
                let aliases = [`'${als[0].alias}'`,`'${als[1].alias}'`,`'${als[2].alias}'`,`'${als[3].alias}'`,`'${als[4].alias}'`];
                let telpun = [`'${als[0].nomor}'`,`'${als[1].nomor}'`,`'${als[2].nomor}'`,`'${als[3].nomor}'`,`'${als[4].nomor}'`];
                let isPlayer = telpun.includes(yNumber);
                let killeds = [];
                int -= 1;
                let noWW = als[int].nomor;
                aliasWW = als[int].alias;
                client.sendMessage(`${noWW}@c.us`, "[WW] Anda adalah werewolf, bersiaplah malam ini dan pilih korban anda");
                const chat = await msg.getChat();
                chat.sendMessage("[WW] Oke, peran werewolf sudah di berikan, hati2 dengan penyergapan mereka pada malam hari!");
                let chance = 1;
                gameLoop();
                function gameLoop() {
                    if (chance < 6){
                        chat.sendMessage("[WW] Malam Telah Datang...");
                        client.sendMessage(`${noWW}@c.us`, "[WW] Silahkan pilih korban anda, dengan alias (batas waktu 15 detik!)");
                        let killed = "undefined";
                        client.on('message', (msg) => {
                            if (msg.body === '/ww kill ' && isPlayer) {
                                if (!chat.isGroup) {
                                    killed = msg.body.split(' ')[2];
                                    if(aliases.includes(killed && !killeds.includes(killed))){
                                        if(killed === aliasWW){
                                            client.sendMessage(`${noWW}@c.us`, "[WW] Anda telah membunuh diri anda sendiri!");
                                            chat.sendMessage("[WW] Game telah berakhir karena Werewolfnya Bunuh diri :v");
                                            return false;
                                        }
                                        killeds.push(killed);
                                    }else{
                                        client.sendMessage(`${noWW}@c.us`, `[WW] ${killed} Sudah dibunuh!`);
                                    }
                                }
                            }
                        })
                        timer(16000);
                        if (killed !== "undefined") {
                            var v1=0,v2=0,v3=0,v4=0,v5=0,korban="undefined";
                            chat.sendMessage("[WW] Pagi Telah Datang...");
                            chat.sendMessage(`[WW] ${killed} ditemukan telah terbunuh oleh werewolf malam ini!`);
                            chat.sendMessage(`[WW] karena curiga, akhirnya kepala desa geram dan memutuskan voting untuk mencari werewolf dan membununya!, batas waktu vote adalah 25 detik!`)
                            client.on('message', (msg) => {
                                if (msg.body === '/ww vote ' && isPlayer) {
                                    if(killeds.length <= 5){
                                        korban = msg.body.split(' ')[2];
                                        Object.keys(aliases).forEach(function(i){
                                            if (aliases[i] === korban && !killeds.includes(korban)){
                                                if (i === 0) {
                                                    v1 += 1;
                                                }else if(i === 1){
                                                    v2 += 1;
                                                }else if(i === 2){
                                                    v3 += 1;
                                                }else if(i === 3){
                                                    v4 += 1;
                                                }else if(i === 4){
                                                    v5 += 1;
                                                }
                                            }else{
                                                chat.sendMessage(`[WW] ${korban} sudah terbunuh!`);
                                            }
                                        })
                                        chat.sendMessage(`[WW] @${yNumber} telah memvote ${korban}!`);
                                    }
                                }
                            });
                            timer(25000);
                            if(v1 === 0 && v2 === 0 && v3 === 0 && v4 === 0 && v5 === 0 && korban === "undefined"){
                                chat.sendMessage("[WW] Hari ini tidak ada yang terbunuh!");
                                return true;
                            }else if (korban === aliasWW) 
                            {
                                chat.sendMessage("[WW] Werewolf telah terbunuh dan game pun berakhir!");
                                return false;
                            }else if (v1 => 1){
                                killeds.push(korban);
                                chat.sendMessage(`[WW] ${korban} pun terbunuh dan ternyata bukan werewolf!`)
                                return true;
                            }else if (v2 => 1){
                                chat.sendMessage(`[WW] ${korban} pun terbunuh dan ternyata bukan werewolf!`)
                                killeds.push(korban);
                                return true;
                            }else if (v3 => 1){
                                chat.sendMessage(`[WW] ${korban} pun terbunuh dan ternyata bukan werewolf!`)
                                killeds.push(korban);
                                return true;
                            }else if (v4 => 1){
                                chat.sendMessage(`[WW] ${korban} pun terbunuh dan ternyata bukan werewolf!`)
                                killeds.push(korban);
                                return true;
                            }else if (v5 => 1){
                                chat.sendMessage(`[WW] ${korban} pun terbunuh dan ternyata bukan werewolf!`)
                                killeds.push(korban);
                                return true;
                            }
                        }else{
                            chat.sendMessage("[WW] Pagi Telah Datang...");
                            chat.sendMessage("[WW] Sepertinya Werewolf tidak membunuh siapapun hari ini!")
                            return true
                        }
                    }else{
                        chat.sendMessage(`[WW] ternyata selama ini ${aliasWW} adalah werewolf!`);
                        chat.sendMessage("[WW] akhirnya semua warga terbunuh karena dia memanggil temannya... GAME SELESAI!");
                        return false;
                    }
                }
            } else if (msg.body == "@bot restart" && isSadmin){
                console.log("[EVENT] Restarting...");
                msg.reply("*[WARNING]* Restarting...");
                pm2.restart("bot");
            } else if (msg.body.startsWith("!surah ")) {
                const dict = msg.body.split(' ')[1];
                let ayat = msg.body.split(' ')[3];
                if (!isNaN(dict) && dict <= 114) {
                    if (ayat !== undefined){
                        axios.get(`https://api.banghasan.com/quran/format/json/surat/${dict}/ayat/${ayat}`).then((res) => {
                            if (isNullOrUndefined(res.data.ayat.error) === true){
                                let hasil = `Surah ${res.data.surat.nama} ayat ${ayat} : \n\n`;
                                let indexs = res.data.ayat.data.ar;
                                let a = res.data.ayat.data.idt;
                                let b = res.data.ayat.data.id;
                                Object.keys(indexs).forEach(function(i){
                                hasil += `[${indexs[i].ayat}]  ${indexs[i].teks}\n`;
                                hasil += `\n${striptags(a[i].teks)}\n`;
                                hasil += `\nArtinya : ${curlyRemover(b[i].teks)}\n`;
                                })
                                msg.reply(hasil);
                            }else{
                                msg.reply(`Error, ayat ${ayat} surah ${dict} tidak valid`);
                            }
                        })
                    }else{
                        axios.get(`https://api.banghasan.com/quran/format/json/surat/${dict}`).then((res) => {
                        const sr = /<(.*?)>/gi;
                        const hs = res.data.hasil[0];
                        const ket = `${hs.keterangan}`.replace(sr, '');
                        msg.reply(`╭───[ Hasil Surah ]───\n├ Nomor Surah : ${hs.nomor}\n├ Nama Surah : ${hs.nama}\n├ Asma Surah : ${hs.asma}\n├ Jumlah Ayat : ${hs.ayat}\n├ Tipe Surah : ${hs.type}\n├ Urut : ${hs.urut}\n├ Rukuk Surah : ${hs.rukuk}\n├ Arti Surah : ${hs.arti}\n╰──[ Surah ${hs.nama} ]───\n
${ket}`);
                        })
                    }
                } else {
                    msg.reply(`Error, surah ${dict} tidak valid\nNggak pernah ngaji loe?`);
                }
            } else if (msg.body.startsWith('!gtts ')) {
                let dict = msg.body.slice(6);
                var gtts = new gTTs(dict, 'id');
                gtts.save('hasil.wav', function (err) {
                    if(err) { throw new Error(err)}
                    let hasil = fs.readFileSync('hasil.wav', {encoding: 'base64'});  
                    const media = new MessageMedia('audio/wav', hasil);
                    client.sendMessage(msg.from, media, { sendAudioAsVoice: true});
                })
            } else if (msg.body.startsWith('!lang ')) {
                let lang = msg.body.split(' ')[1];
                let dict = msg.body.slice(9);
                var gtts = new gTTs(dict, `${lang}`);
                gtts.save('hasil.wav', function (err) {
                    if(err) { throw new Error(err)}
                    const hasil = fs.readFileSync('hasil.wav', {encoding: 'base64'});
                    const media = new MessageMedia('audio/wav', hasil);
                    client.sendMessage(msg.from, media, { sendAudioAsVoice: true});
                })
            } else if (msg.body == '!1cak') {
                let chat = await msg.getChat();
                axios.get(`https://beta.moe.team/api/1cak/?apikey=McJNTmAfdBmO1hYk7gREmVBmtrxiywJtqN3uI7ZRNlMK7MiMwLVUVUQUzAtt6qrv`).then((res) => {
                    let title = res.data.result.title
                    let url = res.data.result.image
                    axios.get(url, {
                        responseType: 'arraybuffer'
                    })
                    .then((res) => {
                        const image = Buffer.from(res.data, 'binary').toString('base64');
                        const media = new MessageMedia('image/jpg', image);
                        chat.sendMessage(media, {caption: title});
                    })
                })
            } else if (msg.body.startsWith('!admin ') && yNumber === Sadmin) {
                try {
                    let dict = msg.body.split(' ')[1];
                    if(dict.charAt(0) !== "0"){
                        if(!isNaN(dict)){
                            console.log("Trying to add admin");
                            admin.push(dict);
                            var b = JSON.stringify(admin);
                            fs.writeFile("admin.json", b, finished);
                            function finished(err){
                                msg.reply(`Success menambahkan ${dict} ke admin!`);
                            }
                        }
                    }else{
                        msg.reply("Invalid nomor telpon")
                    }
                } catch (error) {
                    console.log(error);
                }
            } else if (msg.body == '@bot chat on' && isSadmin && isEnableChat === false) {
                isEnableChat = true;
                setting.isEnableChat = isEnableChat;
                msg.reply("Mode Chat Diaktifkan!");
                let hasil = JSON.stringify(setting, null, 2);
                fs.writeFileSync('setting.json', hasil);
            } else if (msg.body == '@bot chat off' && isSadmin && isEnableChat === true) {
                isEnableChat = false;
                msg.reply("Mode Chat Dinonaktifkan!");
                setting.isEnableChat = isEnableChat;
                let hasil = JSON.stringify(setting, null, 2);
                fs.writeFileSync('setting.json', hasil);
            } else if (msg.body.startsWith('!igstalk ')) {
                const dict = msg.body.split(' ')[1];
                axios.get(`https://beta.moe.team/api/igprofile/?apikey=McJNTmAfdBmO1hYk7gREmVBmtrxiywJtqN3uI7ZRNlMK7MiMwLVUVUQUzAtt6qrv&username=${dict}`).then((res) => {
                    let hs = res.data.result.user;
                    let prvate = hs.is_private;
                    let followers = hs.follower_count;
                    let followed = hs.following_count;
                    if (prvate === true){
                        prvate = "Iya";
                    }else{
                        prvate = "Tidak";
                    }
                    let hasil = `╭──[ Hasil Stalk IG ]───\n├ Username : ${hs.username}\n├ Nama : ${hs.full_name}\n├ Bio : ${hs.biography_with_entities.raw_text}\n├ Jumlah Media Post : ${hs.media_count}\n├ Mengikuti : ${followed}\n├ Pengikut : ${followers}\n├ Akun Private?  : ${prvate}\n╰──[ @ItzNgga WhatsApp Bot ]───`;
                    msg.reply(hasil);
                });
            } else if (msg.body == '!quran') {
                axios.get('https://api.banghasan.com/quran/format/json/acak').then((res) => {
                    const sr = /{(.*?)}/gi;
                    const hs = res.data.acak.id.ayat;
                    const ket = `${hs}`.replace(sr, '');
                    hasil = `[${ket}]   ${res.data.acak.ar.teks}\n\n${res.data.acak.id.teks}(QS.${res.data.surat.nama}, Ayat ${ket})`;
                    msg.reply(hasil);
                })
            } else if (msg.body === '!media') {
                let hasil = `╭─────[ Media Help List ]──────\n├> !cekresi [NoResi] [kurir] (cek resi)\n├> !corona (info kasus covid19 terkini)\n├> !ipcheck [ip] (cek ip target)\n├> !ceknama [nama] (Arti nama lu)\n├> !igstalk [username] (stalk gebetanmu)\n├> !bmkg (info gempa bmkg terbaru)\n├> !quran (ayat acak alquran)\n├> !kbbi [kata] (lihat arti kata dalam kbbi)\n├> !surah [no surah] (lihat detail surah)\n├> !surah [no surah] ayat [parameter]\n├> parameter = ayat [1], ayat [2,3] ayat [2-5]\n├> !1cak (meme acak dari 1cak)\n├> !nuked (kode nuklir random)\n├> !gtts [kata] (Google Text To Speech ID)\n├> ?apakah [pertanyaan] note: anda tanya anda terima jawabannya\n├> !help (list command bot)\n╰──[ @ItzNgga WhatsApp Bot ]───`;
                msg.reply(hasil);
            } else if (msg.body === '!help') {
                if (chkadmin){
                    let hasil = `╭──────[ Admin Help List 1 ]──────\n├> !everyone (mention semua anggota group)\n├> !arsip (arsipkan chat agar privasi terjaga)\n├> !desc [text] (mengganti deksripsi group)\n├> !delete {reply chat} (delete chat bot)\n├> !status [text] (mengganti status bot)\n├> !resend {reply chat} (mengirim ulang foto)\n├> !quoteinfo {reply chat} (info chat tertentu)\n├> !mediainfo {reply chat} (info media tertentu)\n├> !join [link group] (join ke group)\n├> !leave (keluar dari group ini)\n├> !subject [text] (mengganti nama group)\n├> !help 2 (help selanjutnya)\n├────────────────\n├ untuk request admin, WA :\n├─> 081297980063 (bersyarat)\n├────────────────\n├ Status Admin : Aktif\n├────────────────\n╰──[ @ItzNgga WhatsApp Bot ]───`;
                    msg.reply(hasil);
                }else{
                    let hasil = `╭──────[ Public Help List ]──────\n├> !mute (sumpel mulut bot selama 20detik)\n├> !arsip (arsipkan chat agar privasi terjaga)\n├> !me (bot menyapa anda)\n├> !location (lokasi gooogle)\n├> !info (informasi bot)\n├> !groupinfo (info group ini)\n├> @bot (untuk tes keaktifan bot)\n├> @p (untuk tes keaktifan bot)\n├> !media (List Fungsi Media)\n├────────────────\n├ untuk request admin, WA :\n├─> 081297980063 (bersyarat)\n├────────────────\n├ Status Admin : NonAktif\n├────────────────\n╰──[ @ItzNgga WhatsApp Bot ]───`;
                    msg.reply(hasil);
                }
            } else if (msg.body === '!help 2'){
                if(chkadmin){
                    let hasil = `╭──────[ Admin Help List 2 ]──────\n├> !typing (bot menggetik)\n├> !recording (bot ngirim suara)\n├> !clear (bot tidak melakukan apa2)\n├> !mute (sumpel mulut bot selama 20detik)\n├> !me (bot menyapa anda)\n├> !location (lokasi gooogle)\n├> !info (informasi bot)\n├> !groupinfo (info group ini)\n├> @bot (untuk tes keaktifan bot)\n├> @p (untuk tes keaktifan bot)\n├> !media (List Fungsi Media)\n├────────────────\n├ untuk request admin, WA :\n├─> 081297980063 (bersyarat)\n├────────────────\n├ Status Admin : Aktif\n├────────────────\n╰──[ @ItzNgga WhatsApp Bot ]───`;
                    msg.reply(hasil);
                }else{
                    let hasil = `╭──────[ Public Help List ]──────\n├> !mute (sumpel mulut bot selama 20detik)\n├> !arsip (arsipkan chat agar privasi terjaga)\n├> !me (bot menyapa anda)\n├> !location (lokasi gooogle)\n├> !info (informasi bot)\n├> !groupinfo (info group ini)\n├> @bot (untuk tes keaktifan bot)\n├> @p (untuk tes keaktifan bot)\n├> !media (List Fungsi Media)\n├────────────────\n├ untuk request admin, WA :\n├─> 081297980063 (bersyarat)\n├────────────────\n├ Status Admin : NonAktif\n├────────────────\n╰──[ @ItzNgga WhatsApp Bot ]───`;
                    msg.reply(hasil);
                }
            } else if (msg.body === '!adminlist' && isSadmin) {
                let hasil = `╭──[ Admin List ]───`;
                admin.forEach(function (value, i) {
                    hasil += `\n├─> ${value}`;
                });
                hasil += `\n╰──[ @ItzNgga WhatsApp Bot ]───`;
                msg.reply(hasil);
            } else if (msg.body.startsWith('!cekresi ')) {
                const chat = await msg.getChat();
                let kurir = msg.body.split(' ')[2];
                let resi = msg.body.split(' ')[1];
                let courir = ['jne', 'pos', 'jnt', 'sicepat', 'tiki', 'anteraja', 'wahana', 'ninja', 'lion', 'lek'];
                let chkKurir = courir.includes(kurir.toLowerCase());
                if(chkKurir === true){
                    axios.get(`https://api.binderbyte.com/cekresi?awb=${resi}&api_key=e84bd4628941e71d9074c3c233dc76cbcbdb8cceb9ae6aebbc1e163599af006f&courier=${kurir}`).then((res) => {
                        if(res.data.result === true){
                            let bn = res.data.data;
                            let hasil = `╭──────[ Informasi Tracking ]──────\n├> Kurir   : ${bn.courier}\n├> Resi    : ${bn.waybill}\n├> Dikirim : ${bn.shipped}`;
                            if(bn.received !== "" || bn.received !== null || bn.received !== undefined || bn.received !== ''){
                                hasil += `\n├> Diterima Oleh : ${bn.received.name}\n├> Tanggal : ${bn.received.date}\n├> Status : ${bn.received.status}`;
                            }
                            hasil += `\n├────────────────\n├> Tracking : `;
                            let track = bn.tracking;
                            Object.keys(track).reverse().forEach(function(i) {
                                hasil += `\n├────────────────\n├> Tanggal   : ${track[i].date}\n├> Deskripsi : ${track[i].desc}\n├> Status    : ${track[i].status}\n├────────────────`;
                            });
                            hasil += "\n╰──[ @ItzNgga WhatsApp Bot ]───";
                            msg.reply(hasil);
                        }else{
                            msg.reply("Kode resi invalid / kadaluarsa");
                        }
                    }).catch(err => {
                        msg.reply("Server sedang dalam masalah, coba lagi nanti");
                    })
                }else{
                    msg.reply(`Kurir ${kurir} tidak ada atau penulisan salah!`);
                    chat.sendMessage("Contoh kurir : jne, pos, jnt, sicepat, tiki, anteraja, wahana, ninja, lion, lek");
                }
            } else if (msg.body === '!mute') {
                const chat = await msg.getChat();
                // mute the chat for 20 seconds
                const unmuteDate = new Date();
                unmuteDate.setSeconds(unmuteDate.getSeconds() + 20);
                await chat.mute(unmuteDate);
            } else if (msg.body === '!typing' && chkadmin) {
                const chat = await msg.getChat();
                // simulates typing in the chat
                chat.sendStateTyping();        
            } else if (msg.body === '!recording' && chkadmin) {
                const chat = await msg.getChat();
                // simulates recording audio in the chat
                chat.sendStateRecording();        
            } else if (msg.body === '!clear' && chkadmin) {
                const chat = await msg.getChat();
                // stops typing or recording in the chat
                chat.clearState();
            } else if (msg.body === '!simsimi' && isSimSimi === false){
                msg.reply("Mode SimSimi diaktifkan di chat ini");
                chats.sendMessage("Jangan lupa di matikan ya ^_^ pakai !simsimi stop");
                isSimSimi = true;
                simSimichat = `${yNumber}@c.us`
                setting.isSimSimi = isSimSimi;
                setting.simSimichat = simSimichat;
                let hasil = JSON.stringify(setting, null, 2);
                fs.writeFileSync("setting.json", hasil);
            } else if (msg.body === '!simsimi stop' && isSimSimi === true){
                msg.reply("Mode SImSimi dimatikan!");
                simSimichat = undefined;
                isSimSimi = false;
                setting.isSimSimi = isSimSimi;
                setting.simSimichat = simSimichat;
                let hasil = JSON.stringify(setting, null, 2);
                fs.writeFileSync("setting.json", hasil);
            } else {
                let sender = `${yNumber}@c.us`
                if (isSimSimi && simSimichat === sender) {
                    let dict = msg.body;
                    axios.get(`https://beta.moe.team/api/simsimi/?apikey=tn7TbrGp4vzx2yQnMjkxu9W0f65Dr7h1x59w2vE06kuksoiMcOdWJcr4ud7QJ1Oj&q=${dict}`).then((res) => {
                        console.log("SimSimi chat!");
                        client.sendMessage(simSimichat, res.data.result.answer);
                    }).catch((err) => {
                        msg.reply(err);
                    })
                }else{
                    client.sendSeen(msg.from);
                }
            }   
        }
    } catch (error) {
        client.sendMessage(`${Sadmin}@c.us`, `[ERROR LOG] ${error}`);
    }
    
});

client.on('message_create', (msg) => {
    // Fired on all message creations, including your own
    if (msg.fromMe) {
        // do stuff here
    }
});

client.on('message_revoke_everyone', async (after, before) => {
    // Fired whenever a message is deleted by anyone (including you)
    console.log(after); // message after it was deleted.
    if (before) {
        console.log(before); // message before it was deleted.
    }
});

client.on('message_revoke_me', async (msg) => {
    // Fired whenever a message is only deleted in your own view.
    console.log(msg.body); // message before it was deleted.
});

client.on('message_ack', (msg, ack) => {
    /*
        == ACK VALUES ==
        ACK_ERROR: -1
        ACK_PENDING: 0
        ACK_SERVER: 1
        ACK_DEVICE: 2
        ACK_READ: 3
        ACK_PLAYED: 4
    */

    if(ack == 3) {
        // The message was read
    }
});
client.on('group_update', (notification) => {
    // Group picture, subject or description has been updated.
    console.log('update', notification);
});

client.on('change_battery', (batteryInfo) => {
    // Battery percentage for attached device has changed
    const { battery, plugged } = batteryInfo;
    console.log(`Battery: ${battery}% - Charging? ${plugged}`);
});

client.on('disconnected', (reason) => {
    console.log('Client was logged out', reason);
});

