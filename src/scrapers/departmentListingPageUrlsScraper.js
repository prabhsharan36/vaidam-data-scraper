const puppeteer = require("puppeteer");
async function departmentsUrls(url) {
    console.log("Started: departmentListingPageUrls");
    const browser = await puppeteer.launch({
        headless: false, //open browser
        args: ["--no-sandbox"],
    });
    const page = await browser.newPage();
    await page.goto(url);
    async function fetchDepartmentLinks() {
        const output = await page.evaluate(async() => {
            const departments = (() => {
                const links = document.querySelectorAll("#Search-By-Department a");
                return Array.from(links).map((a) => a.href);
            })();
            return departments // array
        })
        return output // array
    }
    const departmentsLinks = await fetchDepartmentLinks()
    console.log("Departments fetch successful!");
    console.log('Task Finished!!!! (departmentListingPageUrls)');
    await browser.close();
    return departmentsLinks
}

module.exports = departmentsUrls