const MongoClient = require("mongodb").MongoClient;
const Url = "mongodb://localhost:27017/Scraper";

const listingPageUrlsScraper = require("../scrapers/listingPageUrlsScraper");
const doctorDataScraper = require("../scrapers/doctorDataScraper");
MongoClient.connect(Url, async (err, client) => {
  console.log("✅ Database Connected");
  if (err) console.log("ERR in database connection: ", err);
  const db = client.db("vaidam-data");
  const collection = db.collection("listingPageDoctors");
  let linksArr = [];
  let cursor = collection.find({});
  await cursor.forEach((doc) => {
    linksArr.push(...doc.links);
  });
  for (let index = 0; index < linksArr.length; index++) {
    const listingPageUrl = linksArr[index];
    let urlsData = await listingPageUrlsScraper(listingPageUrl);
    for (let index = 0; index < urlsData.urls.length; index++) {
      const doctorUrl = urlsData.urls[index];
      const department = urlsData.department;
      const treatment = urlsData.treatment;
      const scrapedData = await doctorDataScraper(doctorUrl);
      const collection = db.collection("doctorData");
      const isSaved = await collection.insertOne({
        ...scrapedData,
        doctorUrl,
        department,
        treatment,
      });
      if (isSaved) console.log("Doctor Data Saved Successfully: ", index);
    }
  }
});
