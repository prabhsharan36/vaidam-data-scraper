/* Fetch Doctors Having Errors while saving to CLinicspots */

const MongoClient = require("mongodb").MongoClient;
const Url = "mongodb://localhost:27017/Scraper";
MongoClient.connect(Url, async (err, client) => {
  try {
    console.log("✅ Database Connected");
    const db = client.db("vaidam-data");
    const DoctorErrors = db.collection("DoctorError");
    const DoctorDataColl = db.collection("doctorData");
    let data = [];
    let cursor = DoctorErrors.find({});
    const doctor = await DoctorErrors.aggregate([
      {
        $lookup: {
          from: "doctorData",
          localField: "doctorId",
          foreignField: "_id",
          as: "doctorData",
        },
      },
    ]).toArray();
    data.push(...doctor);
    console.log(...data);
    if (err) console.log("ERR in database connection: ", err);
    console.log("Finished: getErrorDoctors");
  } catch (err) {
    console.log(err);
  }
});
