const puppeteer = require("puppeteer");
const hospitalDataScraper = require("./hospitalDataScraper.js");

async function fetchHospitalUrls(listingPageUrl) {
    console.log("Started: hospitalsUrlsScraper");
    const browser = await puppeteer.launch({
        headless: false,
        args: ["--no-sandbox"],
    });
    const page = await browser.newPage();
    let hospitalUrls = [];
    let result = []
    let pageNumber = 1;
    while (true) {
        await page.goto(
            `${listingPageUrl}?page=${pageNumber}`, {
                waitUntil: "networkidle2",
                timeout: 0,
            }
        );
        let result = await page.evaluate(async() => {
            const anchors = document.querySelectorAll(".primary-heading-md a");
            return Array.from(anchors).map((a) => a.href);
        });
        if (result && result.length > 0) {
            hospitalUrls = [...hospitalUrls, ...result];
            pageNumber += 1;
        } else break;
    }
    hospitalUrls = hospitalUrls.slice(0, 1)
    for (let index = 0; index < hospitalUrls.length; index++) {
        const url = hospitalUrls[index];
        const data = await hospitalDataScraper(url)
        result.push(data)
    }
    console.log('Result: ', result);
    // console.log("HospitalURLs", hospitalUrls);
    // console.log("Total hospitalUrls: ", hospitalUrls.length);
    await browser.close();
    console.log("Task Finished!!! (hospitalUrlsScraper.js)");
}

module.exports = fetchHospitalUrls