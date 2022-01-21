const puppeteer = require("puppeteer");
const { hospitalsByTreatment } = require("./treatmentHospitals.js");

(async () => {
  console.log("Started: treatments.js");
  const browser = await puppeteer.launch({
    headless: false,
    args: ["--no-sandbox"],
  });
  const page = await browser.newPage();
  await page.goto("https://www.vaidam.com/hospitals/cardiology-and-cardiac-surgery/turkey");
  let output = await page.evaluate(async () => {
    const treatments = (() => {
      const ills = document.querySelectorAll("#Search-By-Treatment a");
      return Array.from(ills).map((a) => a.href);
    })();
    return treatments
  })
  console.log(output);
  await browser.close();
  console.log("Finished");
})();