/* Save Doctors to Clinicspots */

const axios = require("axios");
const MongoClient = require("mongodb").MongoClient;
const Url = "mongodb://localhost:27017/Scraper";
const apiUrl = "http://localhost:8080/api/add-doctor";
MongoClient.connect(Url, async (err, client) => {
  try {
    console.log("✅ Database Connected");
    const db = client.db("vaidam-data");
    const DoctorDataColl = db.collection("doctorData");
    let data = [];
    let cursor = DoctorDataColl.find({});
    while (await cursor.hasNext()) {
      let doctorData = await cursor.next();
      console.log(doctorData);
      await axios
        .post(apiUrl, doctorData)
        .then((response) => {
          console.log(response);
        })
        .catch((err) => {
          console.log("ERROR => ", err.response.data.message);
        });
    }
    if (err) console.log("ERR in database connection: ", err);
    console.log("Finished: Step5");
  } catch (err) {
    console.log(err);
  }
});
