const puppeteer = require("puppeteer");
async function doctorDataScraper(doctorUrl) {
  try {
    console.log("Started: doctorScraper", doctorUrl);

    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox"],
    });

    const page = await browser.newPage();

    await page.goto(doctorUrl, {
      waitUntil: "networkidle2",
      timeout: 0,
    });
    // page.on("console", (message) =>
    //   console.log(`${message.type().toUpperCase()} ${message.text()}`)
    // );
    const DoctorData = await page.evaluate(() => {
      let doctorName = document.querySelector("h1.doc-name")?.innerText;
      let doctorNameArr = doctorName?.split(" ");
      let index = doctorNameArr?.indexOf("Dr.");
      if (index === -1) index = doctorNameArr?.indexOf("Dr");
      if (index === -1) index = doctorNameArr?.indexOf("Prof.");
      if (index === -1) index = doctorNameArr?.indexOf("Prof"); // vaidam sometimes miss "."
      doctorNameArr = doctorNameArr?.slice(index + 1);
      let firstName = doctorNameArr?.[0];
      let middleName =
        doctorNameArr?.[1] && doctorNameArr?.[2] ? doctorNameArr?.[1] : null;
      let lastName = middleName ? doctorNameArr?.[2] : doctorNameArr?.[1];
      let city = document.querySelector("p.doc-location")?.innerText;
      if (city) {
        city = city?.split(",");
        city = city?.length > 0 ? city[0] : null;
      }
      city = city === "" ? null : city;
      let hospitalUrl = document.querySelector("#specialization h4 > a");
      hospitalUrl =
        hospitalUrl?.href === "https://www.vaidam.com/"
          ? null
          : hospitalUrl?.href;
      const services = [document.querySelector("#specialization p")?.innerText];
      const specializations = [
        document.querySelector(".doc-specialization h4")?.innerText,
      ];
      let education = document.querySelectorAll("div#education > ul > li");
      education = [...education]?.map((item) => item?.innerText);
      education = education?.map((string) => {
        let stringSplitted = string?.split(", ");
        return {
          // "course": stringSplitted[0],
          college: stringSplitted[2] || null,
          graduation_year: parseInt(stringSplitted[1], 10),
        };
      });
      let experiences = document.querySelectorAll(
        "div#section-workexperience > div.text-body > h4"
      );
      experiences = [...experiences]?.map((item) => {
        let splittedText = item?.innerText?.split(", ");
        const role =
          splittedText[0] && splittedText[0] !== " " ? splittedText[0] : null;
        const organisation =
          splittedText[1] && splittedText[1] !== " " ? splittedText[1] : null;
        return {
          role,
          organisation,
        };
      });
      return {
        doctorName,
        firstName,
        middleName,
        lastName,
        city,
        education,
        experiences,
        services,
        specializations,
        hospitalUrl,
      };
    });
    // console.log(DoctorData);
    await browser.close();
    console.log("Finished(doctorDataScraper)");
    return DoctorData;
  } catch (err) {
    console.log(err);
  }
}
module.exports = doctorDataScraper;
