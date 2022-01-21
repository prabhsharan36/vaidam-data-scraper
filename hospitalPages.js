const puppeteer = require("puppeteer");

async function hospitalScraper(url) {
    console.log("Hospital Page scraping STARTED: ", url);
    const browser = await puppeteer.launch({
        headless: false,
        args: ["--no-sandbox"],
    });
    const page = await browser.newPage();
    await page.goto(url, {
        waitUntil: "networkidle2",
        timeout: 0,
    });
    // Fetch Console messaged on browser
    page.on("console", (message) =>
        console.log(`${message.type().toUpperCase()} ${message.text()}`)
    );
    let result = await page.evaluate(async() => {
        const name = document.querySelector(
            "h1.hospital-detail-main-heading"
        ).innerText;
        let metaData = document.querySelectorAll(".joint-list span");
        metaData = [...metaData].map((ele) => {
            return ele.innerHTML;
        });
        const establishedIn = parseInt(metaData[0], 10);
        const location = document.querySelector('.joint-list li').innerText;
        const numberOfBeds = document.querySelector('.joint-list li:last-child').innerText;

        // TODO (Should be array or should add 'line break' \n after every line)
        // const about = document
        //     .querySelector("div.about-hospital ")
        //     .innerText.split("\n")
        //     .splice(1);
        const address = document
            .querySelector("div#section-address")
            .innerText.split("\n")
            .splice(2)
            .filter((element) => {
                return element.length > 0;
            });
        const doctors = () => {
            const anchors = document.querySelectorAll("#section-topdoctors a");
            return Array.from(anchors).map((a) => a.href);
        };
        return {
            name,
            establishedIn,
            location,
            numberOfBeds,
            // about,
            address,
            doctorsUrl: doctors(),
        };
    });
    // console.log(result);
    await browser.close();
    console.log("Finished");
    return result
}
module.exports = { hospitalScraper };