const puppeteer = require("puppeteer");
(async() => {
    console.log("Started: doctorScraper");

    const browser = await puppeteer.launch({
        headless: true,
        args: ["--no-sandbox"],
    });

    const page = await browser.newPage();

    await page.goto("https://www.vaidam.com/doctors/prof-dr-serdar-bedi-omay");

    const collect = await page.evaluate(() => {

        const doctorName = document.querySelector("h1.primary-heading-sm").innerText;
        let speciality = document.querySelector("h4.primary-heading-md").innerText;
        let briefAboutDoctor = document.querySelector(".secondary-heading-md").innerText.split("\n");


        // page.click("a#ReadMoreDocDetail");
        const aboutDoctor = document.querySelector(".rtejustify").innerText;
        //     let Allquotes = []
        //     quotes.forEach((tag) => {
        //         const quoteData = tag.querySelectorAll(".rtejustify");
        //         const quote = quoteData[0];
        //         const quote2 = quoteData[1];

        //         Allquotes.push({quote: quote.innerText, quote2: quote2.innerText})            //innerText or innerHtml
        //     })



        // let hospital = document.querySelector(".primary-heading-sm a[href]");

        let specialization = document.querySelector("div#section-spec").innerText.split("\n").splice(2)
            .filter((element) => {
                return element.length > 0;
            });

        let education = document.querySelector("div#section-education").innerText.split("\n");

        let location = document.querySelector(".col-xs-12.nopad p").innerText;

        //console.log("<br>");

        const similarDoctors = () => {
            const links = document.querySelectorAll(".block-tmp-1 h3 a");
            return Array.from(links).map((a) => a.href);
        };

        const blogsOfInterest = () => {
            const links = document.querySelectorAll("div#block-views-doctor-views-block-1 li a");
            return Array.from(links).map((a) => a.href);
        };


        return {
            doctorName,
            speciality,
            briefAboutDoctor,
            aboutDoctor,
            // hospital,
            specialization,
            education,
            location,
            // publications
            similarDoctors: similarDoctors(),
            blogsOfInterest: blogsOfInterest()
        }
    });

    console.log(collect);

    await browser.close();
    console.log("Finished");
})();







//const publications = document.querySelector(".col-xs-12 nopad").innerText
//  let publications = document.querySelectorAll(".col-xs-12 nopad");

//  publications = [...publications].map((ele) => {
//    return ele.innerHTML;
//  });
//  const opArray =[];



//     const info = document.querySelectorAll(".rtejustify");
//     let about = []
//     info.forEach((tag) => {
//         const data = tag.querySelectorAll("span");
//         const quote = quoteData[0];
//         const name = quoteData[1];

//         about.push(quote: quote.innerText)            //innerText or innerHtml
//     })
//     return Allquotes;
//    })