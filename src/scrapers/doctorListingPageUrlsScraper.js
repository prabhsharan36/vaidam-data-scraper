const puppeteer = require("puppeteer");
const shell = require("shelljs");

async function fetchurls(
  listingPageUrl = "https://www.vaidam.com/doctors/country/TR/hospital/11402"
) {
  console.log("Started: listingPageUrlsScraper => ", listingPageUrl);
  const browser = await puppeteer.launch({
    headless: false,
    args: ["--no-sandbox"],
  });
  try {
    const page = await browser.newPage();
    // page.on("console", (message) =>
    //   console.log(`${message.type().toUpperCase()} ${message.text()}`)
    // );
    let urls = [];
    let pageNumber = 1;
    await page.goto(listingPageUrl, {
      waitUntil: "networkidle2",
      timeout: 0,
    });
    const redirectedUrl = page?._target?.url(); // Vaidam redirect the link to another link
    while (true) {
      await page.goto(`${redirectedUrl}?page=${pageNumber}`, {
        waitUntil: "networkidle2",
        timeout: 0,
      });
      console.log("Going on page => ", pageNumber);
      let result = await page.evaluate(async () => {
        const anchors = document.querySelectorAll(".primary-heading-sm a"); // doctor
        return Array.from(anchors).map((a) => a.href);
      });

      if (result && result.length > 0) {
        urls = [...urls, ...result];
        pageNumber += 1;
      } else break;
    }
    console.log("Task Finished!!! (listingPageUrlsScraper.js)");
    return urls;
  } catch (err) {
    console.log(err);
  } finally {
    await browser.close();
    shell.exec("taskkill /F /IM chrome.exe"); // force kill chrome or chromium
  }
}
module.exports = fetchurls;
