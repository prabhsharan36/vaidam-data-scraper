const puppeteer = require("puppeteer");
const shell = require("shelljs");
async function doctorDataScraper(doctorUrl) {
  try {
    console.log("Started: doctorScraper => ", doctorUrl);

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
      let doctor_name = document.querySelector("h1.doc-name")?.innerText;
      let doctorNameArr = doctor_name?.split(" ");
      let index = doctorNameArr?.indexOf("Dr.");
      if (index === -1) index = doctorNameArr?.indexOf("Dr");
      if (index === -1) index = doctorNameArr?.indexOf("Prof.");
      if (index === -1) index = doctorNameArr?.indexOf("Prof"); // vaidam sometimes miss "."
      doctorNameArr = doctorNameArr?.slice(index + 1);
      let first_name = doctorNameArr?.[0];
      if (first_name) first_name = first_name.replace("Dr.", "");
      let middle_name =
        doctorNameArr?.[1] && doctorNameArr?.[2] ? doctorNameArr?.[1] : null;
      let last_name = middle_name ? doctorNameArr?.[2] : doctorNameArr?.[1];
      let city_name = document.querySelector("p.doc-location")?.innerText;
      if (city_name) {
        city_name = city_name?.split(",");
        city_name = city_name?.length > 0 ? city_name[0] : null;
      }
      city_name = city_name === "" ? null : city_name;
      // // let hospitalUrl = document.querySelector("#specialization h4 > a");
      // // hospitalUrl =
      // //   hospitalUrl?.href === "https://www.vaidam.com/"
      // //     ? null
      // //     : hospitalUrl?.href;
      // const services = [document.querySelector("#specialization p")?.innerText];
      const specializations = [];
      const specialization = document.querySelector(
        ".doc-specialization h4"
      )?.innerText;
      if (specialization.length > 0) specializations.push(specialization);
      let educations = document.querySelectorAll("div#education > ul > li");
      educations = [...educations]?.map((item) => item?.innerText);
      educations = educations?.map((string) => {
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
        doctor_name,
        first_name,
        middle_name,
        last_name,
        city_name,
        educations,
        experiences,
        specializations,
        clinicspotsId: null,
        // hospitalUrl,
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
