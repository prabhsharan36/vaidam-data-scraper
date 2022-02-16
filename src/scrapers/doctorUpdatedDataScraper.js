const puppeteer = require("puppeteer");
const shell = require("shelljs");
const _ = require("lodash");
async function doctorDataScraper(
  doctorUrl = "https://www.vaidam.com/doctors/dr-muharrem-coskun"
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
      start_year = start_year?.split(" ");
      // console.log(start_year[0], start_year[1]);
      start_year = isNaN(parseInt(start_year?.[0], 10))
        ? null
        : 2022 - parseInt(start_year[0], 10);
      let educations = document.querySelectorAll("div#education > ul > li");
      educations = [...educations]?.map((item) => item?.innerText);
      educations = educations?.map((string) => {
        let stringSplitted = string?.split(",");
        let course = null;
        let college = null;
        let graduation_year = null;
        // console.log(course, 1, college, 2, graduation_year);
        // console.log(stringSplitted[0], 0, stringSplitted[1], 1, stringSplitted[2], 2);
        stringSplitted.forEach((string) => {
          if (isNaN(parseInt(string, 10)) && !college && !graduation_year) {
            // till graduation year is not set because after year they dispaly country
            // console.log("course", string);
            course = string;
          } else if (isNaN(parseInt(string, 10)) && course && !college) {
            // first will be course
            // console.log("college", string);
            college = string; // second will be college
          } else if (!graduation_year) {
            graduation_year = parseInt(string, 10); // third will be year
          } else if (isNaN(parseInt(string, 10)) && !college) {
            // first will be course
            // console.log("college", string);
            college = string; // second will be college
          }
        });
        // if (course?.length > college?.length) {
        //   let temp = null;
        //   temp = college;
        //   college = course;
        //   course = temp;
        // }
        // console.log(course, college, graduation_year, 1111111);
        return {
          course,
          college,
          graduation_year,
        };
      });
      // console.log("educations", docEducations[0].course);
      return {
        start_year,
        educations,
      };
    });
    const educationCourses = [
      "Post Graduation",
      "Graduation",
      "Fellowship",
      "Diploma",
      "MBBS",
      "MS",
      "MD",
    ];
    DoctorData.educations = DoctorData.educations
      .map((education) => {
        // console.log(_.includes(educationCourses, _.trim(education.course)), education.course, "education.course");
        // console.log(_.trim(education.course));
        return {
          course: _.includes(educationCourses, _.trim(education.course))
            ? _.trim(education.course)
            : null,
          college:
            education.college && education.college !== " "
              ? _.trim(_.startCase(_.toLower(education.college)))
              : _.includes(educationCourses, _.trim(education.course)) &&
                education.course &&
                _.trim(education.course) !== " "
              ? _.trim(_.startCase(_.toLower(education.course)))
              : null,
          graduation_year: parseInt(education.graduation_year, 10) || null,
        };
      })
      .filter((edu) => {
        return (
          // edu !== undefined ||
          (edu?.course && edu?.college) ||
          (edu?.college && edu?.graduation_year) ||
          (edu?.course && edu?.graduation_year) ||
          edu?.course ||
          edu?.college
        );
      });
    // console.log("edu=>", DoctorData.educations);
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
