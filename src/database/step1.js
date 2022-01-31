/* Saving Hospitals Listing Urls */

const treatmentListingPageUrls = require("../scrapers/treatmentListingPageUrlsScraper");
const MongoClient = require("mongodb").MongoClient;
const Url = "mongodb://localhost:27017/Scraper";
const shell = require("shelljs");

MongoClient.connect(Url, async (err, client) => {
  console.log("✅ Database Connected");
  const db = client.db("vaidam-data");
  const links = await treatmentListingPageUrls(
    "https://www.vaidam.com/hospitals/turkey"
  );
  const collection = db.collection("hospitalListingUrls");
  collection
    .insertOne({
      links,
    })
    .then(() => {
      console.log("Links added successfully in Database!!!!");
    });
  if (err) console.log("ERR in database connection: ", err);
  shell.exec("taskkill /F /IM chrome.exe"); // force kill chrome or chromium

  console.log("Finished: Step2");
});
