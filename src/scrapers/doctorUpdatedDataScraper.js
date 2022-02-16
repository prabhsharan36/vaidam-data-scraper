const puppeteer = require("puppeteer");
const shell = require("shelljs");
const _ = require("lodash");
async function doctorDataScraper(
  doctorUrl = "https://www.vaidam.com/doctors/prof-dr-melih-kaptanoglu"
) {
  console.log("Started: doctorScraper => ", doctorUrl);

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox"],
  });

  try {
    const page = await browser.newPage();

    await page.goto(doctorUrl, {
      waitUntil: "networkidle2",
      timeout: 0,
    });
    page.on("console", (message) =>
      console.log(`${message.type().toUpperCase()} ${message.text()}`)
    );
    const DoctorData = await page.evaluate(() => {
      let start_year = document.querySelector("p.doc-exp")?.innerText;
      start_year = start_year.split(" ");
      // console.log(start_year[0], start_year[1]);
      start_year = isNaN(parseInt(start_year[0], 10))
        ? null
        : 2022 - parseInt(start_year[0], 10);
      let educations = document.querySelectorAll("div#education > ul > li");
      educations = [...educations]?.map((item) => item?.innerText);
      educations = educations?.map((string) => {
        let stringSplitted = string?.split(", ");
        let course = stringSplitted[0];
        let college = stringSplitted[2];
        let graduation_year = stringSplitted[1];
        // console.log(course, 1, college, 2, graduation_year);
        // stringSplitted.forEach((string) => {
        //   if (isNaN(parseInt(string, 10)) && course) {
        //     console.log('college', string);
        //     college = string;
        //   } else if (isNaN(parseInt(string, 10))) {
        //     console.log('course', string);
        //     course = string;
        //   } else graduation_year = parseInt(string, 10);
        // });
        if (course?.length > college?.length) {
          let temp = null;
          temp = college;
          college = course;
          course = temp;
        }
        // console.log(stringSplitted[0], stringSplitted[1], stringSplitted[2]);
        return {
          course,
          college,
          graduation_year,
        };
      });
      return {
        start_year,
        educations,
      };
    });
    const educationCourses = ["Post Graduation", "Graduation"];
    DoctorData.educations = DoctorData.educations
      .map((education) => {
        return {
          course: _.includes(educationCourses, _.trim(education.course))
            ? education.course
            : null,
          college: education.college || null,
          graduation_year: parseInt(education.graduation_year, 10) || null,
        };
      })
      .filter((edu) => {
        return edu !== undefined;
      });
    DoctorData.educations =
      DoctorData.educations?.length > 0 ? DoctorData.educations : [];
    DoctorData.start_year =
      typeof DoctorData.start_year === "number" ? DoctorData.start_year : null;
    console.log(DoctorData);
    // console.log(DoctorData);
    console.log("Finished: doctorUpdatedDataScraper");
    return DoctorData;
  } catch (err) {
    console.log(err);
  } finally {
    await browser.close();
    shell.exec("taskkill /F /IM chrome.exe"); // force kill chrome or chromium
  }
}
// doctorDataScraper();
module.exports = doctorDataScraper;
