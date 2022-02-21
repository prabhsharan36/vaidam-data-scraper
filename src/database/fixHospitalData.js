/* fix Hospital's Data (Doctors urls get save even if they don't have doctors) */

const MongoClient = require("mongodb").MongoClient;
const Url = "mongodb://localhost:27017/Scraper";

MongoClient.connect(Url, async (err, client) => {
  try {
    console.log("✅ Database Connected");
    const db = client.db("vaidam-data");
    let data = [];
    const hospitalDataColl = db.collection("hospitalData");
    let cursor = hospitalDataColl.find({});
    await cursor.forEach((doc) => {
      data.push({ ...doc });
    });
    for (let index = 0; index < data.length; index++) {
      const hospitalUrl = data[index]?.url;
      if (!data[index].doctorsPageLink) {
        await hospitalDataColl
          .updateOne(
            { url: hospitalUrl },
            {
              $set: {
                doctors: [],
              },
            }
          )
          .then(() => {
            console.log("Hospital Updated successfully!!!!");
          });
      }
    }
    if (err) console.log("ERR in database connection: ", err);
    console.log("Finished: fixHospitalData.js");
  } catch (err) {
    console.log(err);
  }
});
