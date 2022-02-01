/* Scraping Hospital's Data and adding Doctor's url in DB */

const hospitalDataScraper = require("../scrapers/hospitalDataScraper");
const doctorListingPageUrlsScraper = require("../scrapers/doctorListingPageUrlsScraper");
const MongoClient = require("mongodb").MongoClient;
const Url = "mongodb://localhost:27017/Scraper";

MongoClient.connect(Url, async (err, client) => {
  try {
    console.log("✅ Database Connected");
    const db = client.db("vaidam-data");
    const hospitalPageUrlColl = db.collection("hospitalPageUrls");
    let data = [];
    let cursor = hospitalPageUrlColl.find({});
    await cursor.forEach((doc) => {
      data.push({ ...doc });
    });
    for (let index = 0; index < data.length; index++) {
      const hospitalUrl = data[index]?.url;
      const collection = db.collection("hospitalData");
      const hospital = await collection.findOne({ url: hospitalUrl });
      if (hospital) console.log("Hospital Already Present!");
      else {
        let scrapedData = await hospitalDataScraper(hospitalUrl);
        const doctorUrls = await doctorListingPageUrlsScraper(
          scrapedData?.doctorsPageLink
        );
        const docCollection = db.collection("doctorPageUrls");
        for (let index = 0; index < doctorUrls.length; index++) {
          const url = doctorUrls[index];
          const doctorUrl = await docCollection.findOne({ url });
          if (doctorUrl) console.log("Doctor Url already present.");
          else {
            docCollection
              .insertOne({
                url,
              })
              .then(() => {
                console.log(
                  "New Doctor Url added successfully in Database!!!!"
                );
              });
          }
        }
        scrapedData.doctors = doctorUrls;
        scrapedData.url = hospitalUrl;
        await collection.insertOne(scrapedData).then(() => {
          console.log("New Hospital added successfully in Database!!!!");
        });
      }
    }
    if (err) console.log("ERR in database connection: ", err);
    console.log("Finished: Step3");
  } catch (err) {
    console.log(err);
  }
});
