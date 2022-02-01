/* Fetch Doctors Specializations */

const MongoClient = require("mongodb").MongoClient;
const Url = "mongodb://localhost:27017/Scraper";
MongoClient.connect(Url, async (err, client) => {
  try {
    console.log("✅ Database Connected");
    const db = client.db("vaidam-data");
    const DoctorDataColl = db.collection("doctorData");
    let specializations = [];
    let cursor = DoctorDataColl.find({});
    while (await cursor.hasNext()) {
      let doctorData = await cursor.next();
      const docSpecializations = doctorData?.specializations;
      if (docSpecializations?.length > 0)
        specializations.push(...docSpecializations); // first add all specializations and then remove duplicated items
    }
    specializations = specializations.filter(function (specialization, pos) {
      return specializations.indexOf(specialization) == pos;
    });
    console.log(specializations, specializations.length);
    if (err) console.log("ERR in database connection: ", err);
    console.log("Finished: fetchDoctorSpecializations");
  } catch (err) {
    console.log(err);
  }
});
