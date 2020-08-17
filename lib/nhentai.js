const axios = require('axios').default;

module.exports = async () => {
    try {
        const response = await fetch('https://nhentai.net/api/gallery/'+code);
        // if (!response.ok) throw new Error(`unexpected response ${response.console.error}`)
        // const json = await response.data[0]
        const { title, pages, favorite } = await response.data[0];
        let nhnetainfo = `*Title: ${title}\n`
        nhnetainfo += `Pages: ${pages}\n`
        nhnetainfo += `Favorite: ${favorite}`
        return nhentainfo
    } catch (error) {
        return error;
    }
};