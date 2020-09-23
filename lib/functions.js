const fetch = require('node-fetch')
const moment = require('moment')
const axios = require("axios")
const translatte = require("translatte")
const striptags = require('striptags');

function curlyRemover(chat) {
    if (chat !== undefined) {
        let sr = /{(.*?)}/g;
        let ket = chat.toString().replace(sr, '');
        return ket;
    }
    return chat;
}
const ytmp3 = async (url) => {
    const response = await fetch('http://scrap.terhambar.com/yt?link='+url);
    if (!response.ok) throw new Error(`unexpected response ${response.statusText}`);
    const json = await response.json()
    if (json.status) return json.linkAudioOnly
}

const wallpaperanime = async () => {
    const response = await fetch('https://nekos.life/api/v2/img/wallpaper');
    if (!response.ok) throw new Error(`unexpected response`);
    const json = await response.json()
    return json.url
}
const anime = (judulanime) => new Promise(async (resolve, reject) => {
    const response =  await fetch('https://api.jikan.moe/v3/search/anime?q='+judulanime+'&limit=1')
    if (!response.ok) return reject('Anime tidak di temukan!');
    const json = await response.json()
    const {title,synopsis,episodes,url,rated,score} = json.results[0]
    return resolve(`_*Anime ditemukan!*_
~> Title : ${title}
~> Episodes : ${episodes}
~> Rating : ${rated}
~> Score : ${score}
~> Synopsis : ⮧⮧⮧
${synopsis}
~> URL : ${url}

_*Processing Sukses #XyZ BOT*_`)
})
const quotes = async () => {
    const response = await fetch('https://api.terhambar.com/qts/')
    if (!response.ok) throw new Error(`unexpected response ${response.statusText}`);
    const json = await response.json()
    if (json.status) return `${json.quotes}`
}
const nhentai = async (nuclear) => new Promise(async (resolve, reject) => {
    const NanaAPI = require("nana-api");
    const nana = new NanaAPI();
    nana.g(nuclear).then((g) => {
        const {id, num_pages, tags, title} = g
        const tag = (tags) => {
            let theTag = "";
            for(let tag of tags){
                theTag += tag.name+','
            }
            return theTag
        }
        return resolve(`_*Doujin information*_
~> _Title_ : ${title.pretty}
~> _Pages_ : ${num_pages}
~> _Tags_ : ⮧⮧⮧
${tag(tags)}
~> _Link_ : https://nhentai.net/g/${id}

_*Processing Sukses #XyZ BOT*_`)
    }).catch(err => {
        return reject(err)
    });
})
const corona = async () => new Promise(async (resolve, reject) => {
    axios.all([
        axios.get('https://covid19.mathdro.id/api'),
        axios.get('https://covid19.mathdro.id/api/countries/id')
    ]).then((res) => {
        var hasil = res[0].data;
        var id = res[1].data;
        function intl(str) {
            var nf = Intl.NumberFormat();
            return nf.format(str);
        }
        var date = new Date(id.lastUpdate);
        date = moment(date).fromNow();
        translatte(date, {to: 'id'}).then(res => {
            date = res.text
            return resolve(`_*Kasus COVID19 di Dunia*_
~> Positif : ${intl(hasil.confirmed.value)} kasus
~> Sembuh : ${intl(hasil.recovered.value)} kasus
~> Meninggal : ${intl(hasil.deaths.value)} kasus

_*Kasus COVID19 di Indonesia*_
~> Positif : ${intl(id.confirmed.value)} kasus
~> Sembuh : ${intl(id.recovered.value)} kasus
~> Meninggal : ${intl(id.deaths.value)} kasus

_*Tips kesehatan*_
- Mencuci tangan dengan benar
- Menggunakan masker
- Menjaga daya tahan tubuh
- Menerapkan physical distancing

_*#XyZ BOT Information*_
Update terakhir ${date}`)
        })
    }).catch((err) => {
        return reject(err)
    })
})
const brainly = async (question) => new Promise(async (resolve, reject) => {
    // Premium Only
})
const simsimichat = async (chat) => {
    // Premium Only
}
const wait = async (media) => new Promise(async (resolve, reject) => {
    const attachmentData = `data:image/jpeg;base64,${media.toString('base64')}`
    const response = await fetch("https://trace.moe/api/search",{method: "POST",body: JSON.stringify({ image: attachmentData }),headers: { "Content-Type": "application/json" }});
    if (!response.ok) reject(`Gambar tidak ditemukan!`);
    const result = await response.json()
    let ecch = () => result.docs[0].is_adult ? "Iya" : "Tidak"
    resolve(teks = `_*Whats Anime Is That*_
~> Ecchi : _${ecch()}_
~> Judul Jepang : _${result.docs[0].title}_
~> Ejaan Judul : _${result.docs[0].title_romaji}_
~> Ejaan Inggris : _${result.docs[0].title_english}_
~> Episode : _${result.docs[0].episode}_
~> Season  : _${result.docs[0].season}_

_*Processing Sukses #XyZ BOT*_`);
})
const surat = async (surah, ayat) => new Promise(async (resolve,reject) => {
    if (!isNaN(surah) && surah <= 114) {
        if (ayat !== undefined) {
            axios.get(`https://api.banghasan.com/quran/format/json/surat/${surah}/ayat/${ayat}`).then((res) => {
                if (!(res.data.ayat.error)) {
                    let hasil = `_*Surah ${res.data.surat.nama} ayat ${ayat}*_\n-------------------------------------------------------------------\n`;
                    let indexs = res.data.ayat.data.ar;
                    let a = res.data.ayat.data.idt;
                    let b = res.data.ayat.data.id;
                    Object.keys(indexs).forEach(function (i) {
                        hasil += `*[ ${indexs[i].ayat} ]*  ${indexs[i].teks}\n`;
                        hasil += `\n${striptags(a[i].teks)}\n`;
                        hasil += `\n_*Artinya*_ : ${curlyRemover(b[i].teks)}\n`;
                    })
                    resolve(hasil+'-------------------------------------------------------------------\n_*Processing Sukses #XyZ BOT*_')
                } else {
                    reject(`Error, ayat ${ayat} dari surah ${surah} tidak valid!`)
                }
            })
        } else {
            axios.get(`https://api.banghasan.com/quran/format/json/surat/${surah}`).then((res) => {
                const sr = /<(.*?)>/gi;
                const hs = res.data.hasil[0];
                const ket = `${hs.keterangan}`.replace(sr, '');
                resolve(`_*Surah ${hs.nama}*_
~> Nomor : ${hs.nomor}
~> Asma : ${hs.asma}
~> Tipe : ${hs.type}
~> Urut : ${hs.urut}
~> Ruku : ${hs.rukuk}
~> Arti : ${hs.arti}
~> Jumlah Ayat : ${hs.ayat}
-------------------------------------------------------------------
${ket}\n-------------------------------------------------------------------\n_*Processing Sukses #XyZ BOT*_`)
            })
        }
    } else {
        reject(`Error, nomor surah ${surah} tidak valid\n*${prefix}list surah* ~> menampilkan list surah`)
    }
})
exports.anime = anime;
exports.surat = surat;
exports.corona = corona;
exports.quotes = quotes;
exports.wallpaperanime = wallpaperanime;
exports.ytmp3 = ytmp3;
exports.wait = wait;
exports.brainly = brainly;
exports.simsimichat = simsimichat;
exports.nhentai = nhentai;