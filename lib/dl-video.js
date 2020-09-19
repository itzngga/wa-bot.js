const { getBase64, fetchJson } = require("./fetcher");
const TikTokScraper = require('tiktok-scraper');
function apikey () {
    const ran = Math.floor(Math.random() * 3);
    switch (ran) {
        case 0:
            return `Get your apikey at keepsaveit.com`
            break;
        case 1:
            return `Get your apikey at keepsaveit.com`
            break
        case 2:
            return `Get your apikey at keepsaveit.com`
            break
        default:
            break;
    }
}



const tiktok = (url) => new Promise(async (resolve, reject) => {
    await TikTokScraper.getVideoMeta(url, { noWaterMark: true, hdVideo: true })
        .then(async (result) => {
            if (result.videoUrlNoWaterMark !== '') {
                result.url = result.videoUrlNoWaterMark
                result.urlbase64 = await getBase64(result.videoUrlNoWaterMark)
                result.NoWaterMark = true
                resolve(result)
            } else {
                // result.url = result.videoUrl
                result.urlbase64 = await getBase64(result.videoUrl)
                result.NoWaterMark = false
                resolve(result)
            }
        }).catch((err) => {
            reject(err)
        });
})

const instagram = (url) => new Promise(async (resolve, reject) => {
    const keepsaveit = 'http://keepsaveit.com/api/'
    await fetchJson(keepsaveit + '?api_key=' + apikey() + '&url=' + url, {
            method: 'GET'
        })
        .then((result) => {
            const key = result.code
            switch (key) {
                case 200:
                    return resolve(result)
                    break;
                case 212:
                    return reject('Access block for you, You have reached maximum 5 limit per minute hits, please stop extra hits.')
                    break;
                case 101:
                    return reject('API Key error : Your access key is wrong')
                    break;
                case 102:
                    return reject('Your Account is not activated.')
                    break;
                case 103:
                    return reject('Your account is suspend for some resons.')
                    break;
                case 104:
                    return reject('API Key error : You have not set your api_key in parameters.')
                    break;
                case 111:
                    return reject('Full access is not allow with DEMO API key.')
                    break;
                case 112:
                    return reject('Sorry, Something wrong, or an invalid link. Please try again or check your url.')
                    break;
                case 113:
                    return reject('Sorry this website is not supported.')
                    break;
                case 404:
                    return reject('The link you followed may be broken, or the page may have been removed.')
                    break;
                case 405:
                    return reject('You can\'t download media in private profile. Looks like the video you want to download is private and it is not accessible from our server.')
                    break;
            }
        }).catch((err) => {
            console.error(err)
            reject(err)
        });
})

const twitter = (url) => new Promise(async (resolve, reject) => {
    const keepsaveit = 'http://keepsaveit.com/api/'
    await fetchJson(keepsaveit + '?api_key=' + apikey() + '&url=' + url, {
            method: 'GET'
        })
        .then((result) => {
            const key = result.code
            switch (key) {
                case 200:
                    return resolve(result)
                    break;
                case 212:
                    return reject('Access block for you, You have reached maximum 5 limit per minute hits, please stop extra hits.')
                    break;
                case 101:
                    return reject('API Key error : Your access key is wrong')
                    break;
                case 102:
                    return reject('Your Account is not activated.')
                    break;
                case 103:
                    return reject('Your account is suspend for some resons.')
                    break;
                case 104:
                    return reject('API Key error : You have not set your api_key in parameters.')
                    break;
                case 111:
                    return reject('Full access is not allow with DEMO API key.')
                    break;
                case 112:
                    return reject('Sorry, Something wrong, or an invalid link. Please try again or check your url.')
                    break;
                case 113:
                    return reject('Sorry this website is not supported.')
                    break;
                case 404:
                    return reject('The link you followed may be broken, or the page may have been removed.')
                    break;
                case 405:
                    return reject('You can\'t download media in private profile. Looks like the video you want to download is private and it is not accessible from our server.')
                    break;
            }
        }).catch((err) => {
            console.error(err)
            reject(err)
        });
    })


const facebook = (url) => new Promise(async (resolve, reject) => {
    const keepsaveit = 'http://keepsaveit.com/api/'
    await fetchJson(keepsaveit + '?api_key=' + apikey() + '&url=' + url, {
            method: 'GET'
        })
        .then((result) => {
            const key = result.code
            switch (key) {
                case 200:
                    return resolve(result)
                    break;
                case 212:
                    return reject('Access block for you, You have reached maximum 5 limit per minute hits, please stop extra hits.')
                    break;
                case 101:
                    return reject('API Key error : Your access key is wrong')
                    break;
                case 102:
                    return reject('Your Account is not activated.')
                    break;
                case 103:
                    return reject('Your account is suspend for some resons.')
                    break;
                case 104:
                    return reject('API Key error : You have not set your api_key in parameters.')
                    break;
                case 111:
                    return reject('Full access is not allow with DEMO API key.')
                    break;
                case 112:
                    return reject('Sorry, Something wrong, or an invalid link. Please try again or check your url.')
                    break;
                case 113:
                    return reject('Sorry this website is not supported.')
                    break;
                case 404:
                    return reject('The link you followed may be broken, or the page may have been removed.')
                    break;
                case 405:
                    return reject('You can\'t download media in private profile. Looks like the video you want to download is private and it is not accessible from our server.')
                    break;
            }
        }).catch((err) => {
            console.error(err)
            reject(err)
        });
    })

const youtube = (url) => new Promise(async (resolve, reject) => {
    const keepsaveit = 'http://keepsaveit.com/api/'
    await fetchJson(keepsaveit + '?api_key=' + apikey() + '&url=' + url, {
        method: 'GET'
    })
    .then((result) => {
        const key = result.code
        switch (key) {
            case 200:
                return resolve(result)
                break;
            case 212:
                return reject('Access block for you, You have reached maximum 5 limit per minute hits, please stop extra hits.')
                break;
            case 101:
                return reject('API Key error : Your access key is wrong')
                break;
            case 102:
                return reject('Your Account is not activated.')
                break;
            case 103:
                return reject('Your account is suspend for some resons.')
                break;
            case 104:
                return reject('API Key error : You have not set your api_key in parameters.')
                break;
            case 111:
                return reject('Full access is not allow with DEMO API key.')
                break;
            case 112:
                return reject('Sorry, Something wrong, or an invalid link. Please try again or check your url.')
                break;
            case 113:
                return reject('Sorry this website is not supported.')
                break;
            case 404:
                return reject('The link you followed may be broken, or the page may have been removed.')
                break;
            case 405:
                return reject('You can\'t download media in private profile. Looks like the video you want to download is private and it is not accessible from our server.')
                break;
        }
    }).catch((err) => {
        console.error(err)
        reject(err)
    });
})

const likee = (url) => new Promise(async (resolve, reject) => {
    const keepsaveit = 'http://keepsaveit.com/api/'
    await fetchJson(keepsaveit + '?api_key=' + apikey() + '&url=' + url, {
        method: 'GET'
    })
    .then((result) => {
        const key = result.code
        switch (key) {
            case 200:
                return resolve(result)
                break;
            case 212:
                return reject('Access block for you, You have reached maximum 5 limit per minute hits, please stop extra hits.')
                break;
            case 101:
                return reject('API Key error : Your access key is wrong')
                break;
            case 102:
                return reject('Your Account is not activated.')
                break;
            case 103:
                return reject('Your account is suspend for some resons.')
                break;
            case 104:
                return reject('API Key error : You have not set your api_key in parameters.')
                break;
            case 111:
                return reject('Full access is not allow with DEMO API key.')
                break;
            case 112:
                return reject('Sorry, Something wrong, or an invalid link. Please try again or check your url.')
                break;
            case 113:
                return reject('Sorry this website is not supported.')
                break;
            case 404:
                return reject('The link you followed may be broken, or the page may have been removed.')
                break;
            case 405:
                return reject('You can\'t download media in private profile. Looks like the video you want to download is private and it is not accessible from our server.')
                break;
        }
    }).catch((err) => {
        console.error(err)
        reject(err)
    });
})


module.exports = { tiktok, instagram, facebook, youtube, likee, twitter}