const puppeteer = require("puppeteer");
const { hospitalScraper } = require("./hospitalPages.js");

(async() => {
    console.log("Listing urls scraping STARTED: ");
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
            `https://www.vaidam.com/hospitals/turkey?page=${pageNumber}`, {
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
        const ran = await hospitalScraper(url)
        result.push(ran)
    }
    console.log('RESULT', result);
    // console.log("HospitalURLs", hospitalUrls);
    // console.log("Total hospitalUrls: ", hospitalUrls.length);
    await browser.close();
    console.log("Finished");
})();