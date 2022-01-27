const puppeteer = require("puppeteer");
async function doctorDataScraper (doctorUrl) {
  console.log("Started: doctorScraper", doctorUrl);

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox"],
  });

  const page = await browser.newPage();

  await page.goto(doctorUrl);
  page.on("console", (message) =>
    console.log(`${message.type().toUpperCase()} ${message.text()}`)
  );
  const DoctorData = await page.evaluate(() => {
    const doctorName = document.querySelector("h1.doc-name")?.innerText;
    let city = document.querySelector("p.doc-location")?.innerText;
    if (city) {
      city = city.split(",");
      city = city.length > 0 ? city[0] : null;
    }
    let hospitalUrl = document.querySelector("#specialization h4 > a");
    hospitalUrl = hospitalLink?.href;
    //TODO
    const services = document.querySelector("#specialization p")?.innerText;
	const specialization = document.querySelector(".doc-specialization h4")?.innerText;
    let education = document.querySelectorAll("div#education > ul > li");
    education = [...education].map((item) => item?.innerText);
    education = education.map((string) => {
      let stringSplitted = string.split(", ");
      return {
        // "course": stringSplitted[0],
        college: stringSplitted[2],
        graduation_year: parseInt(stringSplitted[1], 10),
      };
    });
    let experiences = document.querySelectorAll("div#section-workexperience > div.text-body > h4");
    experiences = [...experiences].map((item) => {
		let splittedText = item?.innerText?.split(', ')
		const role = splittedText[0];
		const organisation = splittedText[1];
		return {
			role,
			organisation
		};
	});
    // let paperPublished = document.querySelectorAll(
    //   "div#paper-published > ul > li"
    // );
    // paperPublished = [...paperPublished].map((item) => item?.innerText);
    return {
      doctorName,
      city,
      hospitalUrl,
	  doctorUrl,
      services,
	  specialization,
      education,
      experiences,
    //   paperPublished,
    };
  });
  console.log(DoctorData);
  await browser.close();
  console.log("Finished(doctorDataScraper)");
  return DoctorData;
};
module.exports = doctorDataScraper
