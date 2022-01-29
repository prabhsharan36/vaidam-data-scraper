/* Saving Hospitals Urls */

const listingPageUrlsScraper = require("../scrapers/hospitalListingPageUrlsScraper");
const MongoClient = require("mongodb").MongoClient;
const Url = "mongodb://localhost:27017/Scraper";

MongoClient.connect(Url, async (err, client) => {
  console.log("✅ Database Connected");
  const db = client.db("vaidam-data");
  const hospitalListingUrlColl = db.collection("hospitalListingUrls");
  let urlsArr = [];
  let cursor = hospitalListingUrlColl.find({});
  await cursor.forEach((doc) => {
    urlsArr.push(...doc.links);
  });
  for (let index = 0; index < urlsArr.length; index++) {
    const obj = urlsArr[index];
    const departments = [obj.department];
    const treatments = [obj.treatment];
    const treatmentListingUrl = obj.treatmentListingUrl;
    const hospitalUrls = await listingPageUrlsScraper(treatmentListingUrl);
    const collection = db.collection("hospitalPageUrls");
    for (let index = 0; index < hospitalUrls.length; index++) {
      const url = hospitalUrls[index];
      collection
        .insertOne({
          url,
          departments,
          treatments,
        })
        .then(() => {
          console.log("New Hospital added successfully in Database!!!!");
        });
    }
  }
  if (err) console.log("ERR in database connection: ", err);
  console.log("Finished: Step3");
});
