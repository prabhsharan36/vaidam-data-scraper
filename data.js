const puppeteer = require("puppeteer");
(async () => {
  console.log("Started: page.js");

  const browser = await puppeteer.launch({
    headless: false,
    args: ["--no-sandbox"],
  });

  const page = await browser.newPage();
  while (true) {
    await page.goto(`https://www.vaidam.com/hospitals/emsey-hospital-pendik`, {
      waitUntil: "networkidle2",
    });
    page.on("console", (message) =>
      console.log(`${message.type().toUpperCase()} ${message.text()}`)
    );
    let result = await page.evaluate(async () => {
      const name = document.querySelector(
        "h1.hospital-detail-main-heading"
      ).innerText;
      const metaData = document.querySelectorAll("span.joint-list")?.innerText;
      //   console.log(document.querySelectorAll("span.joint-list")?.innerText);
      //   const city = metaData[1];
      const establishedIn = metaData[0];
      const numberOfBeds = metaData[1];
      // TODO (Should be array or should add 'line break' \n after every line)
      const about = document
        .querySelector("div.about-hospital ")
        ?.innerText.split("\n")
        .splice(1);
      const address = document
        .querySelector("div#section-address")
        ?.innerText.split("\n")
        .splice(2)
        .filter((element) => {
          return element.length > 0;
        });
      const doctors = () => {
        const anchors = document.querySelectorAll(".card-hospital-listview a");
        return Array.from(anchors).map((a) => a.href);
      };
      return {
        name,
        // city,
        numberOfBeds,
        establishedIn,
        about,
        address,
        doctorsUrl: doctors(),
      };
    });
    console.log(result);
    break;
  }
  await browser.close();
  console.log("Finished");
})();
