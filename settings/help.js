const fs = require('fs');
const surah1 = fs.readFileSync('./settings/surah1.txt', {encoding: 'utf-8'});
const surah2 = fs.readFileSync('./settings/surah2.txt', {encoding: 'utf-8'});
let setting = JSON.parse(fs.readFileSync('./settings/setting.json'));
const pre = setting.prefix

function help() {
    let hasil = `*xYz BOT Help*
-------------------------------------------------------------------
Syarat dan Ketentuan Pemakaian BOT\n
*${pre}mnt*
-------------------------------------------------------------------
[WARNING]
-------------------------------------------------------------------
*GUNAKAN BOT INI DENGAN BIJAK, JIKA ANDA TIDAK MAU PATUH JANGAN PAKAI BOT INI!. BATAS COMMAND MEDIA BOT ADALAH 50 PERHARI DAN DI RESET SETIAP HARINYA, BOT JUGA TIDAK AKAN MEMBALAS JIKA PERINTAH TIDAK SPESIFIK/SAMA*
-------------------------------------------------------------------
~> *${pre}sticker* :
kirim gambar dengan caption atau balas gambar yang sudah dikirim.\n
~> *${pre}tiktok [url]* :
mengunduh video tiktok dengan url\n
~> *${pre}tw [url]* : 
mengunduh media twitter dengan url\n
~> *${pre}fb [url]* : 
mengunduh media facebook dengan url\n
~> *${pre}ig [url]* : 
mengunduh media instagram dengan url\n
~> *${pre}yt [url]* : 
mengunduh video youtube dengan url\n
~> *${pre}ytmp3 [url]* : 
convert video ke audio youtube dengan url\n
~> *${pre}likee [url]* : 
mengunduh media sosmed likee dengan url\n
~> *${pre}waifu* : 
kirim contoh gambar ecchi waifu kalian\n
~> *${pre}kucing* : 
kirim gambar random kucing\n
~> *${pre}pokemon* : 
kirim contoh gambar pokemon kalian\n
~> *${pre}wallpaper* : 
kirim gambar random wallpaper\n
~> *${pre}wanime* : 
kirim gambar random wallpaper anime\n
~> *${pre}quote* : 
random quote bahasa indonesia\n
~> *${pre}nhder* [kode nuklir] : 
download komik nhentai dalam bentuk zip\n
`
    return hasil;
}
exports.help = help();
function license(){
    return `Syarat dan Ketentuan xYz BOT\n
1. Apapun yang anda perintah ke bot ini, KAMI TIDAK BERTANGGUNG JAWAB
2. Segala syarat2 legalitas di serahkan ke Developer BOT
3. Kami tidak menyimpan data anda di server kami
4. Jika anda menemukan Bug/Error, harap report dengan ${pre}bug report
5. Bot ini adalah Open Source, jadi developer tidak mengambil keuntungan dari pengguna

Terimakasih :D`;
}
exports.license = license();