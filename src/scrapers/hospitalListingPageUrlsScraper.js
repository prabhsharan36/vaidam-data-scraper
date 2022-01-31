const shell = require("shelljs");
const puppeteer = require("puppeteer");

async function fetchurls(
  listingPageUrl = "https://www.vaidam.com/hospitals/cardiology-and-cardiac-surgery/av-canal-repair/turkey"
) {
  console.log("Started: listingPageUrlsScraper");
  const browser = await puppeteer.launch({
    headless: false,
    args: ["--no-sandbox"],
  });
  try {
    const page = await browser.newPage();
    // page.on("console", (message) =>
    //   console.log(`${message.type().toUpperCase()} ${message.text()}`)
    // );
    console.log("Scraping urls from => ", listingPageUrl);
    let urls = [];
    let pageNumber = 1;
    // let data = await page.evaluate(async () => {
    //   let department = document.querySelector(
    //     "ul#Search-By-Department"
    //   ).innerText;
    //   department = department.replace(/([(1-9)])/g, "");
    //   let treatment = document.querySelector(
    //     "ul#Search-By-Treatment"
    //   ).innerText;
    //   treatment = treatment.replace(/([(1-9)])/g, "");
    //   return { department, treatment };
    // });
    while (true) {
      console.log("Going on Page => ", pageNumber);
      await page.goto(`${listingPageUrl}?page=${pageNumber}`, {
        waitUntil: "networkidle2",
        timeout: 0,
      });
      let result = await page.evaluate(async () => {
        const anchors = document.querySelectorAll(".primary-heading-md a"); //hospital
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
