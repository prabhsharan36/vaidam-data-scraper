const puppeteer = require("puppeteer");
const { gett, sett } = require("./treatmentLinks")
    (async () => {
        console.log("Started: department.js");
        const browser = await puppeteer.launch({
            headless: false,  //open browser
            args: ["--no-sandbox"],
        });
        const page = await browser.newPage();
        await page.goto("https://www.vaidam.com/hospitals/turkey");
        async function fetchDepartmentLinks() {
            const output = await page.evaluate(async () => {
                const departments = (() => {
                    const links = document.querySelectorAll("#Search-By-Department a");
                    return Array.from(links).map((a) => a.href);
                })();
                return departments // array
            })
            return output // array
        }
        console.log(await fetchDepartmentLinks());
        console.log("Departments fetch successful!");
        const result = await fetchDepartmentLinks().then(async (departments) => {
            let allTreatmentsListingUrls = []
            for (let index = 0; index < departments.length; index++) {
                const departmentLink = departments[index];
                await page.goto(departmentLink);
                let output = await page.evaluate(async () => {
                    const treatments = (() => {
                        const ills = document.querySelectorAll("#Search-By-Treatment a");
                        return Array.from(ills).map((a) => a.href);
                    })();
                    return treatments
                })
                allTreatmentsListingUrls.push(...output)
            }
            return allTreatmentsListingUrls
            console.log("Treatments URLS fetch successful!");
        })
        set(result)
        console.log(get())
        console.log('Task Finished!!!!');
        await browser.close();
    })();