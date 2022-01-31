const puppeteer = require("puppeteer");
const fetchDepartmentLinks = require("./departmentListingPageUrlsScraper");
async function treatmentListingPageUrls(baseCountryListingUrl) {
  console.log("Started: treatmentListingPageUrls");
  const browser = await puppeteer.launch({
    headless: false,
    args: ["--no-sandbox"],
  });
  try {
    const page = await browser.newPage();
    // page.on("console", (message) =>
    //   console.log(`${message.type().toUpperCase()} ${message.text()}`)
    // );
    const result = await fetchDepartmentLinks(baseCountryListingUrl).then(
      async (departmentObj) => {
        let allTreatmentsListingUrls = [];
        for (let index = 0; index < departmentObj.length; index++) {
          const departmentLink = departmentObj[index]?.departmentListingUrl;
          const department = departmentObj[index]?.department;
          console.log("Fetching => ", departmentLink);
          await page.goto(departmentLink);
          let output = await page.evaluate(async (department) => {
            const treatments = (() => {
              const links = document.querySelectorAll("#Search-By-Treatment a");
              return Array.from(links).map((a) => {
                return {
                  treatmentListingUrl: a.href,
                  department,
                  treatment: a.innerText?.replace(/([(1-9)])/g, ""),
                };
              });
            })();
            return treatments;
          }, department);
          allTreatmentsListingUrls.push(...output);
        }
        console.log("Treatments URLS fetch successful!");
        return allTreatmentsListingUrls;
      }
    );
    console.log("Task Finished!!!(treatmentListingPageUrls.js)");
    return result;
  } catch (err) {
    console.log(err);
  } finally {
    await browser.close();
  }
}
module.exports = treatmentListingPageUrls;
