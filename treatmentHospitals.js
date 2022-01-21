const puppeteer = require("puppeteer");
async function hospitalsByTreatment(url) {
  console.log("Started: hospitalList", url);

  const browser = await puppeteer.launch({
    headless: false,
    args: ["--no-sandbox"],
  });

  const page = await browser.newPage();
  let hospitalUrls = [];
  let pageNumber = 1;
  //let treatmentLink = 1;
  //await page.goto("https://www.vaidam.com/hospitals/cardiology-and-cardiac-surgery/heart-implants/turkey");


  while (true) {
    await page.goto(url, {
      waitUntil: "networkidle2",
      timeout: 0,
    });
    //   `https://www.vaidam.com/hospitals/cardiology-and-cardiac-surgery/treatment=${[treatments]}/turkey?page=${pageNumber}`);
    let output = await page.evaluate(async () => {
      const link = document.querySelectorAll(".primary-heading-md a");
      return Array.from(link).map((a) => a.href);
    });

    if (output && output.length > 0) {
      hospitalUrls = [...hospitalUrls, ...output];
      pageNumber += 1;
    } else break;
  }

  console.log("hospitalURLs", hospitalUrls);
  console.log("totalNumberOfHospital", hospitalUrls.length);

  await browser.close();
  console.log("Finished");
};

module.exports = { hospitalsByTreatment };