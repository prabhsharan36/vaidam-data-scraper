/* update Doctor's Data */

const doctorUpdatedDataScraper = require("../scrapers/doctorUpdatedDataScraper");
const MongoClient = require("mongodb").MongoClient;
const Url = "mongodb://localhost:27017/Scraper";

MongoClient.connect(Url, async (err, client) => {
  try {
    console.log("✅ Database Connected");
    const db = client.db("vaidam-data");
    let data = [];
    const doctoDataColl = db.collection("doctorData");
    let cursor = doctoDataColl.find({});
    await cursor.forEach((doc) => {
      data.push({ ...doc });
    });
    for (let index = 0; index < data.length; index++) {
      const doctorUrl = data[index]?.url;
      if (data[index]?.start_year === undefined) {
        const updateScrapedData = await doctorUpdatedDataScraper(doctorUrl);
        await doctoDataColl
          .updateOne(
            { url: doctorUrl },
            {
              $set: {
                start_year: updateScrapedData?.start_year,
                educations: updateScrapedData?.educations,
              },
            }
          )
          .then(() => {
            console.log("Doctor Updated successfully!!!!");
          });
      }
    }
    if (err) console.log("ERR in database connection: ", err);
    console.log("Finished: Step4");
  } catch (err) {
    console.log(err);
  }
});
