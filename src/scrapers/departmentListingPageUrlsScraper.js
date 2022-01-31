const puppeteer = require("puppeteer");
async function departmentsUrls(url) {
  console.log("Started: departmentListingPageUrls");
  const browser = await puppeteer.launch({
    headless: false, //open browser
    args: ["--no-sandbox"],
  });
  try {
    const page = await browser.newPage();
    page.on("console", (message) =>
      console.log(`${message.type().toUpperCase()} ${message.text()}`)
    );
    await page.goto(url);
    async function fetchDepartmentLinks() {
      const output = await page.evaluate(async () => {
        const departments = (() => {
          const links = document.querySelectorAll("#Search-By-Department a");
          return Array.from(links).map((a) => {
            return {
              departmentListingUrl: a.href,
              department: a?.innerText?.replace(/([(1-9)])/g, ""),
            };
          });
        })();
        return departments; // array
      });
      return output; // array
    }
    const departmentsLinks = await fetchDepartmentLinks();
    console.log("Departments fetch successful!");
    console.log("Task Finished!!!! (departmentListingPageUrls)");
    return departmentsLinks;
  } catch (err) {
    console.log(err);
  } finally {
    await browser.close();
    // shell.exec("taskkill /F /IM chrome.exe"); // force kill chrome or chromium
  }
}
module.exports = departmentsUrls;
