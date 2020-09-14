const fetch = require('node-fetch')
const moment = require('moment')
const axios = require("axios")

const ytmp3 = async (url) => {
    const response = await fetch('http://scrap.terhambar.com/yt?link='+url);
    if (!response.ok) throw new Error(`unexpected response ${response.statusText}`);
    const json = await response.json()
    if (json.status) return json.linkAudioOnly
}

const wallpaperanime = async () => {
    // const url = 'https://nekos.life/api/v2/img/wallpaper';
    // const response = await fetch(url);
    const response = await fetch('https://nekos.life/api/v2/img/wallpaper');
    if (!response.ok) throw new Error(`unexpected response`);
    const json = await response.json()
    return json.url
}

const anime = async (judulanime) => {
    const response =  await fetch('https://api.jikan.moe/v3/search/anime?q='+judulanime+'&limit=1')
    if (!response.ok) throw new Error(`unexpected response`);
    const json = await response.json.results()
    // return json
    return `Judul: ${json.results.title}`
}

const quotes = async () => {
    const response = await fetch('https://api.terhambar.com/qts/')
    if (!response.ok) throw new Error(`unexpected response ${response.statusText}`);
    const json = await response.json()
    if (json.status) return `${json.quotes}`
}

const corona = async () => {
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
        return `╭──[ Kasus Covid19 di Dunia]───\n├ Positif : ${intl(hasil.confirmed.value)} Kasus\n├ Sembuh : ${intl(hasil.recovered.value)} Kasus\n├ Meninggal : ${intl(hasil.deaths.value)} Kasus\n├──[ Kasus Covid19 di Indonesia]───\n├ Positif : ${intl(id.confirmed.value)} Kasus \n├ Sembuh : ${intl(id.recovered.value)} Kasus \n├ Meninggal : ${intl(id.deaths.value)} Kasus\n├ Update Terakhir : ${date}\n├ Tetap Jaga Kesehatan dan #STAYATHOME\n╰──[ xYz WhatsApp Bot ]───`;
    }).catch((err) => {
        console.log(err)
    })
}
exports.anime = anime;
exports.corona = corona;
exports.quotes = quotes;
exports.wallpaperanime = wallpaperanime;
exports.ytmp3 = ytmp3;