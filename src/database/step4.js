/* Scraping Doctor's Data */

const doctorDataScraper = require("../scrapers/doctorDataScraper");
const MongoClient = require("mongodb").MongoClient;
const Url = "mongodb://localhost:27017/Scraper";

MongoClient.connect(Url, async (err, client) => {
  console.log("✅ Database Connected");
  const db = client.db("vaidam-data");
  const DoctorUrlColl = db.collection("doctorPageUrls");
  let data = [];
  let cursor = DoctorUrlColl.find({});
  await cursor.forEach((doc) => {
    data.push({ ...doc });
  });
  const doctoDataColl = db.collection("doctorData");
  for (let index = 0; index < data.length; index++) {
    const doctorUrl = data[index]?.url;
    const scrapedData = await doctorDataScraper(doctorUrl);
    const doctor = await doctoDataColl.findOne({ url: doctorUrl });
    if (doctor) console.log("Doctor Already present");
    else {
      await doctoDataColl
        .insertOne({
          ...scrapedData,
          url: doctorUrl,
        })
        .then(() => {
          console.log("New Doctor added successfully in Database!!!!");
        });
    }
  }
  if (err) console.log("ERR in database connection: ", err);
  console.log("Finished: Step3");
});
