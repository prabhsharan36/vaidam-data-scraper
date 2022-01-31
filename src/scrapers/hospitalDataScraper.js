const puppeteer = require("puppeteer");
const shell = require("shelljs");
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
      const established_in = parseInt(metaData[0], 10);
      let beds = document
        .querySelector(".joint-list li:last-child")
        ?.innerText?.trim()
        .split(" ");
      beds = beds?.[0];

      let facilities = document.querySelectorAll("div.text-body > ul > li");
      facilities = [...facilities].map((item) => {
        return item?.innerText;
      });
      let payment_methods = facilities;
      // Payment methods in Clinicspots
      const paymentMethodsArr = [
        "Credit Card",
        "Debit Card",
        "Cash",
        "Online Payment",
        "Cheque",
        "Insurance",
        "Card",
      ];
      payment_methods = payment_methods.filter((item) =>
        paymentMethodsArr.includes(item)
      );
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
        ?.innerText?.trim();

      const nameArr = name?.split(",");
      /* remove city name if present otherwise return same name */
      name = nameArr[1]?.trim() === city_name ? nameArr[0]?.trim() : name;
      let address_line = document
        .querySelector("div#section-address")
        ?.innerText.split("\n")
        ?.splice(2)
        ?.filter((element) => {
          return element.length > 0;
        });
      address_line = address_line?.[0] || address_line;
      const doctorsPageLink = document.querySelector("a.btn-show-more")?.href;
      return {
        name,
        beds,
        established_in,
        payment_methods,
        facilities,
        city_name,
        address_line,
        doctorsPageLink,
        doctors: [],
        clinicspotsId: null,
      };
    });
    console.log("Task Finished!!! (hospitalDataScraper.js)");
    console.log(hospitalData);
    return hospitalData;
  } catch (err) {
    console.log(err);
  } finally {
    await browser.close();
    shell.exec("taskkill /F /IM chrome.exe"); // force kill chrome or chromium
  }
}
module.exports = hospitalDataScraper;
