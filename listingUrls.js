const puppeteer = require("puppeteer");
// const log = (...args) => console.log(...args);
(async () => {
  console.log("Started");

  const browser = await puppeteer.launch({
    headless: false,
    args: ["--no-sandbox"],
  });

  //   const context = browser.defaultBrowserContext();
  // await context.overridePermissions('https://www.swiggy.com', ['geolocation']);

  const page = await browser.newPage();

  // await page.setGeolocation({ latitude: 21.1523063, longitude: 79.086033 });

  // const cookiesString = await fs.readFile('./cookies.json');
  // const cookies = JSON.parse(cookiesString);
  // console.log(cookies)
  // await page.setCookie(...cookies);

  // await page.emulate(iPhone);
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

  console.log("Total hospitalUrls: ", hospitalUrls.length);

  //   await browser.close();
  console.log("Finished");
})();
