const puppeteer = require("puppeteer");

async function hospitalDataScraper(hospitalUrl) {
  console.log("Started: hospitalDataScraper => ", hospitalUrl);
  const browser = await puppeteer.launch({
    headless: false,
    args: ["--no-sandbox"],
  });
  try {
    const page = await browser.newPage();
    page.on("console", (message) =>
      console.log(`${message.type().toUpperCase()} ${message.text()}`)
    );
    while (true) {
      await page.goto(hospitalUrl, {
        waitUntil: "networkidle2",
        timeout: 0,
      });
      let result = await page.evaluate(async () => {
        const name = document.querySelector(
          "h1.hospital-detail-main-heading"
        ).innerText;
        let metaData = document.querySelectorAll(".joint-list span");
        metaData = [...metaData].map((ele) => {
          return ele.innerHTML;
        });
        const establishedIn = parseInt(metaData[0], 10);
        const numberOfBeds = parseInt(metaData[1], 10);
        const address = document
          .querySelector("div#section-address")
          .innerText.split("\n")
          .splice(2)
          .filter((element) => {
            return element.length > 0;
          });
        const doctorsPageLink = (() => {
          const anchors = document.querySelectorAll(
            ".card-hospital-listview a"
          );
          return Array.from(anchors).map((a) => a.href);
        })();
        return {
          name,
          numberOfBeds,
          establishedIn,
          about,
          address,
          doctors,
        };
      });
      console.log(result);
      break;
    }
    console.log("Task Finished!!! (hospitalDataScraper.js)");
  } catch (err) {
    console.log(err);
  } finally {
    await browser.close();
  }
}

module.exports = hospitalDataScraper;
