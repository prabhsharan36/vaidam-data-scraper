/* Fetch Doctors Having Errors while saving to CLinicspots */

const MongoClient = require("mongodb").MongoClient;
const Url = "mongodb://localhost:27017/Scraper";
MongoClient.connect(Url, async (err, client) => {
  try {
    console.log("✅ Database Connected");
    const db = client.db("vaidam-data");
    const DoctorErrors = db.collection("doctorError");
    let data = [];
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
    for (let index = 0; index < data.length; index++) {
      const item = data[index];
      console.log(
        item?.doctorData
        /*?.[0].specializations,
        // "Request Specializations => ",
         item?.requestData?.specializations */
      );
    }
    if (err) console.log("ERR in database connection: ", err);
    console.log("Finished: getErrorDoctors");
  } catch (err) {
    console.log(err);
  }
});
