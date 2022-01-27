const MongoClient = require("mongodb").MongoClient;
const Url = "mongodb://localhost:27017/Scraper";

const listingPageUrlsScraper = require("./listingPageUrlsScraper");
const doctorDataScraper = require("./doctorDataScraper");
MongoClient.connect(Url, async (err, client) => {
  console.log("✅ Database Connected");
  if (err) console.log("ERR in database connection: ", err);
  // const links = await treatmentListingPageUrls()
  const db = client.db("vaidam-data");
  const collection = db.collection("listingPageDoctors");
  let linksArr = [];
  let cursor = collection.find({});
  await cursor.forEach((doc) => {
    linksArr.push(...doc.links);
  });
  for (let index = 0; index < linksArr.length; index++) {
    const listingPageUrl = linksArr[index];
    // console.log('listingPageUrl: ', listingPageUrl);
    let urls = await listingPageUrlsScraper(listingPageUrl);
    // console.log('urls(index): ', urls);
    for (let index = 0; index < urls.length; index++) {
      const url = urls[index];
      const scrapedData = await doctorDataScraper(url);
      console.log(index, scrapedData);
      const collection = db.collection("doctorData");
	  const ak = await collection.insertOne(scrapedData);
	  if(ak) console.log('ScrapedData Saved Successfully', ak);
    }
  }
});
