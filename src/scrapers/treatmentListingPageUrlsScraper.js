const puppeteer = require("puppeteer");
const fetchDepartmentLinks = require("./departmentListingPageUrlsScraper")
async function treatmentListingPageUrls(baseCountryListingUrl = 'https://www.vaidam.com/doctors/turkey') {
    console.log("Started: treatmentListingPageUrls");
    const browser = await puppeteer.launch({
        headless: false,
        args: ["--no-sandbox"],
    });
    const page = await browser.newPage();
    const result = await fetchDepartmentLinks(baseCountryListingUrl).then(async(departments) => {
        let allTreatmentsListingUrls = []
        for (let index = 0; index < departments.length; index++) {
            const departmentLink = departments[index];
            await page.goto(departmentLink);
            let output = await page.evaluate(async() => {
                const treatments = (() => {
                    const ills = document.querySelectorAll("#Search-By-Treatment a");
                    return Array.from(ills).map((a) => a.href);
                })();
                return treatments
            })
            allTreatmentsListingUrls.push(...output)
        }
        console.log("Treatments URLS fetch successful!");
        return allTreatmentsListingUrls
    })
    await browser.close();
    console.log("Task Finished!!!(treatmentListingPageUrls.js)");
    return result
}
module.exports = treatmentListingPageUrls