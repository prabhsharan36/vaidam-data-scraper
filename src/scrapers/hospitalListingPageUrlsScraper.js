const puppeteer = require("puppeteer");

async function fetchurls(
  hosListingPageUrl = "https://www.vaidam.com/hospital/cardiology-and-cardiac-surgery/ppi-permanent-pacemaker-implant-double-chamber/turkey"
) {
  console.log("Started: hospitalListingPageUrlsScraper");
  const browser = await puppeteer.launch({
    headless: false,
    args: ["--no-sandbox"],
  });
  const page = await browser.newPage();
  // page.on("console", (message) =>
  //   console.log(`${message.type().toUpperCase()} ${message.text()}`)
  // );
  let urls = [];
  let pageNumber = 1;
  await page.goto(`${hosListingPageUrl}?page=${pageNumber}`, {
    waitUntil: "networkidle2",
    timeout: 0,
  });
  let data = await page.evaluate(async () => { 
    let department = document.querySelector("ul#Search-By-Department").innerText;
    department = department.replace(/([(1-9)])/g, '');         //regex
    let treatment = document.querySelector("ul#Search-By-Treatment").innerText;
    treatment = treatment.replace(/([(1-9)])/g, '');
    return {department, treatment};
  })
  while (true) {
    await page.goto(`${hosListingPageUrl}?page=${pageNumber}`, {
      waitUntil: "networkidle2",
      timeout: 0,
    });
    let result = await page.evaluate(async () => {
      //const anchors = document.querySelectorAll(".primary-heading-sm a"); // doctor
      const anchors = document.querySelectorAll(".primary-heading-md a"); //hospital
      return Array.from(anchors).map((a) => a.href);
    });
    
    if (result && result.length > 0) {
      urls = [...urls, ...result];
      pageNumber += 1;
    } else break;
  }
  // console.log('Result(listingPageUrlsScraper): ', result);
  // console.log('URL(listingPageUrlsScraper): ', urls);
  await browser.close();
  console.log("Task Finished!!! (hospitalListingPageUrlsScraper.js)");
  return { urls, ...data };
}
module.exports = fetchurls;
