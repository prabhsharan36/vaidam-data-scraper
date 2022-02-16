/* Fetch Doctors Specializations */

const MongoClient = require("mongodb").MongoClient;
const Url = "mongodb://localhost:27017/Scraper";
MongoClient.connect(Url, async (err, client) => {
  try {
    console.log("✅ Database Connected");
    const db = client.db("vaidam-data");
    const HospitalPageUrlColl = db.collection("hospitalPageUrls");
    let departments = [];
    let cursor = HospitalPageUrlColl.find({});
    while (await cursor.hasNext()) {
      let hospitalData = await cursor.next();
      const hospitalDepartments = hospitalData?.departments;
      if (hospitalDepartments?.length > 0)
        departments.push(...hospitalDepartments); // first add all departments and then remove duplicated items
    }
    departments = departments.filter(function (department, pos) {
      return departments.indexOf(department) == pos;
    });
    if (err) console.log("ERR in database connection: ", err);
    console.log("Finished: fetchHospitalDepartments");
  } catch (err) {
    console.log(err);
  }
});
