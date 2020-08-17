const fetch = require('node-fetch')
const { getBase64 } = require("./fetcher");
const request = require('request')
const axios = require("axios")

// const ytmp3 = async (url) => {
//     const response = await fetch('http://scrap.terhambar.com/yt?link='+url);
//     if (!response.ok) throw new Error(`unexpected response ${response.statusText}`);
//     const json = await response.json()
//     if (json.status) return json
// }

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

const covid = async () => {
    const response = await fetch('https://api.terhambar.com/negara/Indonesia');
    if (!response.ok) throw new Error(`unexpected response`);
    const json = await response.json()
    // return json
    return `*${$json.negara}*\n\nTotal: ${json.total}\nSembuh: ${json.sembuh}\nMeninggal: ${json.meninggal}\nDirawat: ${json.penanganan}\n\n*Tanggal: ${json.terakhir}*`
}

const anime = async (judulanime) => {
    // const response =  await fetch('https://api.jikan.moe/v3/search/anime?q='+judulanime+'&limit=1')
    // if (!response.ok) throw new Error(`unexpected response`);
    // const json = await response.json.results()
    // // return json
    // return `Judul: ${json.results.title}`
    // return `*${json.negara}*\n\nPositif: ${json.positif}\nSembuh: ${json.sembuh}\nMeninggal: ${json.meninggal}\nDirawat: ${json.dirawat}`
}

// const nhentainfo = async (code) => {
//     const response = await fetch('https://nhentai.net/api/gallery/'+code);
//     // if (!response.ok) throw new Error(`unexpected response ${response.console.error}`)
//     // const json = await response.data[0]
//     const { title, pages, favorite } = await response.data[0];
//     let nhnetainfo = `*Title: ${title}\n`
//     nhnetainfo += `Pages: ${pages}\n`
//     nhnetainfo += `Favorite: ${favorite}`
//     return nhentainfo
// }
const nhentainfo = async (code) => {

}

const quotes = async () => {
    const response = await fetch('https://api.terhambar.com/qts/')
    if (!response.ok) throw new Error(`unexpected response ${response.statusText}`);
    const json = await response.json()
    if (json.status) return `${json.quotes}`
}

    const corona = async () => {
    // const response = await fetch('https://coronavirus-19-api.herokuapp.com/countries/'+country);
    const response =  await fetch('https://api.terhambar.com/negara/Indonesia')
    if (!response.ok) throw new Error(`unexpected response`);
    const json = await response.json()
    return `*Country: ${json.negara}*\n\nTotal: ${json.total}\nSembuh: ${json.sembuh}\nMeninggal: ${json.meninggal}\nDirawat: ${json.penanganan}\n\n*Tanggal: ${json.terakhir}*`
}

exports.anime = anime;
exports.corona = corona;
exports.quotes = quotes;
exports.wallpaperanime = wallpaperanime;
exports.ytmp3 = ytmp3;