/* Saving Hospitals Urls */

const hospitalListingPageUrlsScraper = require("../scrapers/hospitalListingPageUrlsScraper");
const MongoClient = require("mongodb").MongoClient;
const Url = "mongodb://localhost:27017/Scraper";

MongoClient.connect(Url, async (err, client) => {
  console.log("✅ Database Connected");
  const db = client.db("vaidam-data");
  const hospitalListingUrlColl = db.collection("hospitalListingUrls");
  let urlsArr = [];
  let cursor = hospitalListingUrlColl.find({});
  await cursor.forEach((doc) => {
    urlsArr.push(...doc.links);
  });
  for (let index = 0; index < urlsArr.length; index++) {
    const obj = urlsArr[index];
    const department = obj.department;
    const treatment = obj.treatment;
    const treatmentListingUrl = obj.treatmentListingUrl;
    const hospitalUrls = await hospitalListingPageUrlsScraper(
      treatmentListingUrl
    );
    const collection = db.collection("hospitalPageUrls");
    for (let index = 0; index < hospitalUrls.length; index++) {
      const url = hospitalUrls[index];
      const hospital = await collection.findOne({ url });
      if (hospital) {
        let isDepartmentAlreadyPresent = false;
        for (let index = 0; index < hospital.meta.length; index++) {
          const obj = hospital.meta[index];
          if (obj.department === department) {
            isDepartmentAlreadyPresent = true;
            obj.treatments.push(treatment);
          }
        }
        if (!isDepartmentAlreadyPresent) {
          // when it was not present so we add new Department and it's treament
          hospital.meta.push({
            department,
            treatments: [treatment],
          });
        }
        // const newDepartments = [...hospital.departments, ...departments];
        // const newTreatments = [...hospital.treatments, ...treatments];
        const isUpdated = await collection.updateOne(
          { url },
          { $set: { meta: hospital.meta } }
        );
        if (isUpdated) console.log("Hospital Updated Successfully");
      } else {
        collection
          .insertOne({
            url,
            meta: [
              {
                department,
                treatments: [treatment],
              },
            ],
          })
          .then(() => {
            console.log("New Hospital added successfully in Database!!!!");
          });
      }
    }
  }
  if (err) console.log("ERR in database connection: ", err);
  console.log("Finished: Step3");
});
