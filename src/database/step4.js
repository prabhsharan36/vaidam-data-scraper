const MongoClient = require("mongodb").MongoClient;
const Url = "mongodb://localhost:27017/Scraper";
const hospitalListingPageUrlsScraper = require("../scrapers/hospitalListingPageUrlsScraper");
const hospitalDataScraper = require("../scrapers/hospitalDataScraper");

MongoClient.connect(Url, async (err, client) => {
    console.log("✅ Database Connected");
    if (err) console.log("ERR in database connection: ", err);
    const db = client.db("vaidam-data");
    const collection = db.collection("hospitalListingPages");
    let linksArr = [];
    let cursor = collection.find({});
    await cursor.forEach((hospital) => {
      linksArr.push(...hospital.links);
    });

    for (let index = 0; index < linksArr.length; index++) {
        const hosListingPageUrl = linksArr[index];
        let urlsData = await hospitalListingPageUrlsScraper(hosListingPageUrl);
        for (let index = 0; index < urlsData.urls.length; index++) {
            const hospitalUrl = urlsData.urls[index];
           // const departments = [urlsData.department];
           // const treatments = [urlsData.treatment];
           const scrapedData = await hospitalDataScraper(hospitalUrl);
           const collection = db.collection("hospitalData");
           const isSaved = await collection.insertOne({
             ...scrapedData,
             hospitalUrl,
            // departments,
           //  treatments,
           });
           if (isSaved) console.log("Hospital Data Saved Successfully: ", index);
        }
    }
})
