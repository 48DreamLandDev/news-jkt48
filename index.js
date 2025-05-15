const axios = require('axios')
const cheerio = require('cheerio')
const fs_promise = require('fs').promises

const getLatest = async () => {
    try {
        // request get API 
        const response = await axios.get(`https://takagi.sousou-no-frieren.workers.dev/news/list`) 
        const $ = cheerio.load(response.data)
        
        const title_web = $('title').text()
        if (title_web !== "JKT48 | Berita Terbaru") {
                console.log("Data not found")
                return
        }
        
        // get id last news
        const url_latestNews = `https://takagi.sousou-no-frieren.workers.dev${$('div.entry-news__list').eq(0).find('h3 a').attr('href')}`
        return url_latestNews
    
    } catch (error) {
        console.log("Error get latest data")
        return "Error get latest data"
    }
}

const getNews = async () => {
    try {
        const url_latestNews = await getLatest()
        const response = await axios.get(url_latestNews)
        const $ = cheerio.load(response.data)
        
        const news_detail = $('div.entry-news__detail')
        
        // final data news latest
        const data_LatestNews = {
            message: "JKT48 latest news data",
            status: 200,
            data: []
        }
        
        // get data and settings
        data_LatestNews.data.push({
            id: url_latestNews.split('/')[6].split('?')[0],
            title: news_detail.find("h3").text().trim(),
            date: news_detail.find('div.metadata2.mb-2').text().trim(),
            description: news_detail.find('div').map((i, el) => $(el).text().trim()).get().slice(2).join('\n'),
            image: news_detail.find("img").map((i, el) => {return $(el).attr("src")}).get()
        })
        
        const filepath = "news.json"
        try {
            await fs_promise.writeFile(filepath, JSON.stringify(data_LatestNews, null, 2))
            console.log('News data successfully written to news.json')
        } catch (error) {
            console.log('Error writing news data to news.json')
        }
    
    } catch (error) {
        console.log("Error get detail data")
        return "Error get detail data"
    }
}

async function main(){
    await getNews()
}

main()