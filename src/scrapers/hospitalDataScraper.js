const puppeteer = require("puppeteer");
async function hospitalDataScraper(
  hospitalUrl = "https://www.vaidam.com/hospitals/medical-park-group-istanbul"
) {
  try {
    console.log("Started: hospitalDataScraper => ", hospitalUrl);
    const browser = await puppeteer.launch({
      headless: false,
      args: ["--no-sandbox"],
    });
    const page = await browser.newPage();

    await page.goto(hospitalUrl, {
      waitUntil: "networkidle2",
      timeout: 0,
    });
    page.on("console", (message) =>
        console.log(`${message.type().toUpperCase()} ${message.text()}`)
    )
    let hospitalData = await page.evaluate(async () => {
      let metaData = document.querySelectorAll(".joint-list span");
      metaData = [...metaData].map((ele) => {
        return ele.innerHTML;
      });
      const establishedIn = parseInt(metaData[0], 10);
      const numberOfBeds = document
        .querySelector(".joint-list li:last-child")
        ?.innerText?.trim();

      const payment_Methods = [];
      payment_Methods[0] = document
        .querySelector("#section-facilities ul:last-child li:nth-child(5)")
        ?.innerText?.trim();
      payment_Methods[1] = document
        .querySelector("#section-facilities ul:last-child li:nth-child(6)")
        ?.innerText?.trim();

      let city_name = document
        .querySelector("span.secondary-heading-md")
        ?.innerText?.trim();
      if (city_name) {
        city_name = city_name?.split(",");
        city_name = city_name?.length > 0 ? city_name[0] : null;
      }
      city_name = city_name === "" ? null : city_name;
      let name = document
        .querySelector("h1.hospital-detail-main-heading")
        ?.innerText?.trim()
        ?.split(",");
        console.log(name, 11);
        /* remove city name if present otherwise return same name */
      name =
        name[1]?.trim() === city_name ? name[0]?.trim : name; 
      let address = document
        .querySelector("div#section-address")
        ?.innerText.split("\n")
        ?.splice(2)
        ?.filter((element) => {
          return element.length > 0;
        });
      address = address?.[0] ? address?.[0] : address;
      const doctorsPageLink = document.querySelector("a.btn-show-more")?.href;
      //    (() => {
      // const anchors = document.querySelectorAll(".card-hospital-listview a");  // site changes
      // const anchors = document.querySelectorAll("#section-topdoctors a");
      // return Array.from(anchors).map((a) => a.href);
      //   })();
      return {
        name,
        numberOfBeds,
        establishedIn,
        payment_Methods,
        city_name,
        // about,
        address,
        doctorsPageLink,
      };
    });
    console.log(hospitalData);

    await browser.close();
    console.log("Task Finished!!! (hospitalDataScraper.js)");
    return hospitalData;
  } catch (err) {
    console.log(err);
  }
}
hospitalDataScraper();
module.exports = hospitalDataScraper;
