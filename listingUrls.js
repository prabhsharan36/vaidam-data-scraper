const puppeteer = require("puppeteer");
(async () => {
  console.log("Started");
  const browser = await puppeteer.launch({
    headless: false,
    args: ["--no-sandbox"],
  });
  const page = await browser.newPage();
  let hospitalUrls = [];
  let pageNumber = 1;
  while (true) {
    await page.goto(
      `https://www.vaidam.com/hospitals/turkey?page=${pageNumber}`,
      {
        waitUntil: "networkidle2",
      }
    );

    let result = await page.evaluate(async () => {
      const anchors = document.querySelectorAll(".primary-heading-md a");
      return Array.from(anchors).map((a) => a.href);
    });
    if (result && result.length > 0) {
      hospitalUrls = [...hospitalUrls, ...result];
      pageNumber += 1;
    } else break;
  }
  console.log("HospitalURLs", hospitalUrls);
  console.log("Total hospitalUrls: ", hospitalUrls.length);
  //   await browser.close();
  console.log("Finished");
})();
