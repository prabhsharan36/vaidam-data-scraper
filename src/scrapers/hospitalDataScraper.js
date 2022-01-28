const puppeteer = require("puppeteer");

async function hospitalDataScraper(hospitalUrl) {
    try {
        console.log("Started: hospitalDataScraper", hospitalUrl);
        const browser = await puppeteer.launch({
            headless: false,
            args: ["--no-sandbox"],
        });
        const page = await browser.newPage();

        await page.goto(hospitalUrl, {
            waitUntil: "networkidle2",
            timeout: 0,
        });
        // page.on("console", (message) =>
        //     console.log(`${message.type().toUpperCase()} ${message.text()}`)
        //;
        let hospitalData = await page.evaluate(async () => {
            const name = document.querySelector("h1.hospital-detail-main-heading")?.innerText.replace((/,.*/, ''));


            let metaData = document.querySelectorAll(".joint-list span");
            metaData = [...metaData].map((ele) => {
                return ele.innerHTML;
            });
            const establishedIn = parseInt(metaData[0], 10);
            const numberOfBeds = document.querySelector(".joint-list li:last-child")?.innerText;
            //const numberOfBeds = parseInt(metaData[1], 10);
            // TODO (Should be array or should add 'line break' \n after every line)
            // const about = document
            //     .querySelector("div.about-hospital ")
            //     .innerText.split("\n")
            //     .splice(1);
            let city_name = document.querySelector("span.secondary-heading-md")?.innerText;
            if (city_name) {
                city_name = city_name?.split(",");
                city_name = city_name?.length > 0 ? city_name[0] : null;
            }
            city_name = city_name === "" ? null : city_name;
            const address = document
                .querySelector("div#section-address")
                ?.innerText.split("\n")
                ?.splice(2)
                ?.filter((element) => {
                    return element.length > 0;
                });
            const doctors_links = (() => {
                // const anchors = document.querySelectorAll(".card-hospital-listview a");  // site changes
                const anchors = document.querySelectorAll("#section-topdoctors a");
                return Array.from(anchors).map((a) => a.href);
            })()
            return {
                name,
                numberOfBeds,
                establishedIn,
                city_name,
                about,
                address,
                doctors_links,
            };
        });
        console.log(hospitalData);


        await browser.close();
        console.log("Task Finished!!! (hospitalDataScraper.js)")
        return hospitalData;
    } catch (err) {
        console.log(err);
    }
}

module.exports = hospitalDataScraper
