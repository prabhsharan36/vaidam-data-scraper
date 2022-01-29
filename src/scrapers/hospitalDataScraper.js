const puppeteer = require("puppeteer");
async function hospitalDataScraper(
  hospitalUrl = "https://www.vaidam.com/hospitals/hisar-hospital-intercontinental-istanbul"
) {
  console.log("Started: hospitalDataScraper => ", hospitalUrl);
  const browser = await puppeteer.launch({
    headless: false,
    args: ["--no-sandbox"],
  });
  try {
    const page = await browser.newPage();

    await page.goto(hospitalUrl, {
      waitUntil: "networkidle2",
      timeout: 0,
    });
    page.on("console", (message) =>
      console.log(`${message.type().toUpperCase()} ${message.text()}`)
    );
    let hospitalData = await page.evaluate(async () => {
      let metaData = document.querySelectorAll(".joint-list span");
      metaData = [...metaData].map((ele) => {
        return ele.innerHTML;
      });
      const establishedIn = parseInt(metaData[0], 10);
      let numberOfBeds = document
        .querySelector(".joint-list li:last-child")
        ?.innerText?.trim()
        .split(" ");
      numberOfBeds = numberOfBeds?.[0];

      const paymentMethods = [];
      paymentMethods[0] = document
        .querySelector("#section-facilities ul:last-child li:nth-child(5)")
        ?.innerText?.trim();
      paymentMethods[1] = document
        .querySelector("#section-facilities ul:last-child li:nth-child(6)")
        ?.innerText?.trim();

      let cityName = document
        .querySelector("span.secondary-heading-md")
        ?.innerText?.trim();
      if (cityName) {
        cityName = cityName?.split(",");
        cityName = cityName?.length > 0 ? cityName[0] : null;
      }
      cityName = cityName === "" ? null : cityName;
      let name = document
        .querySelector("h1.hospital-detail-main-heading")
        ?.innerText?.trim();

      const nameArr = name?.split(",");
      /* remove city name if present otherwise return same name */
      name = nameArr[1]?.trim() === cityName ? nameArr[0]?.trim() : name;
      let address = document
        .querySelector("div#section-address")
        ?.innerText.split("\n")
        ?.splice(2)
        ?.filter((element) => {
          return element.length > 0;
        });
      address = address?.[0] || address;
      const doctorsPageLink = document.querySelector("a.btn-show-more")?.href;
      return {
        name,
        numberOfBeds,
        establishedIn,
        paymentMethods,
        cityName,
        address,
        doctorsPageLink,
        doctors: [],
        clinicspotsId: null
      };
    });
    console.log("Task Finished!!! (hospitalDataScraper.js)");
    return hospitalData;
  } catch (err) {
    console.log(err);
  } finally {
    await browser.close();
  }
}
module.exports = hospitalDataScraper;
