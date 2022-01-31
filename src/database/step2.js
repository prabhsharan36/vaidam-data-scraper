/* Saving Hospitals Urls */

const hospitalListingPageUrlsScraper = require("../scrapers/hospitalListingPageUrlsScraper");
const MongoClient = require("mongodb").MongoClient;
const Url = "mongodb://localhost:27017/Scraper";

MongoClient.connect(Url, async (err, client) => {
  try {
    console.log("✅ Database Connected");
    const db = client.db("vaidam-data");
    const hospitalListingUrlColl = db.collection("hospitalListingUrls");
    db.createCollection("scrapedHospitalListingUrls");
    const scrapedHospitalListingUrlColl = db.collection(
      "scrapedHospitalListingUrls"
    );
    let urlsArr = [];
    let cursor = hospitalListingUrlColl.find({});
    await cursor.forEach((doc) => {
      urlsArr.push(...doc.links);
    });
    for (let index = 0; index < urlsArr.length; index++) {
      const obj = urlsArr[index];
      const department = obj.department;
      // const treatment = obj.treatment;
      const treatmentListingUrl = obj.treatmentListingUrl;

      const alreadyScraped = await scrapedHospitalListingUrlColl.findOne({
        url: treatmentListingUrl,
      });
      if (!alreadyScraped) {
        const hospitalUrls = await hospitalListingPageUrlsScraper(
          treatmentListingUrl
        );
        console.log(hospitalUrls);
        const collection = db.collection("hospitalPageUrls");
        for (let index = 0; index < hospitalUrls.length; index++) {
          const url = hospitalUrls[index];
          const hospital = await collection.findOne({ url });
          if (hospital) {
            let isUpdated = false;
            // let isDepartmentAlreadyPresent = false;
            if (hospital.departments.indexOf(department) < 0) {
              hospital.departments.push(department);
              isUpdated = true;
            }
            // for (let index = 0; index < hospital.length; index++) {
            //   const obj = hospital.meta[index];
            //   if (obj.department === department) {
            //     isDepartmentAlreadyPresent = true;
            //     if (obj.treatments.indexOf(treatment) >= 0)
            //       // only add if not present
            //       obj.treatments.push(treatment);
            //   }
            // }
            // if (!isDepartmentAlreadyPresent) {
            //   // when it was not present so we add new Department and it's treament
            //   hospital.meta.push({
            //     department,
            //     treatments: [treatment],
            //   });
            // }
            // const newDepartments = [...hospital.departments, ...departments];
            // const newTreatments = [...hospital.treatments, ...treatments];
            if (isUpdated) {
              const result = await collection.updateOne(
                { url },
                { $set: { departments: hospital.departments } }
              );
              if (result) console.log("Hospital Updated Successfully");
            }
          } else {
            collection
              .insertOne({
                url,
                departments: [department],
              })
              .then(() => {
                console.log("New Hospital added successfully in Database!!!!");
              });
          }
        }
        scrapedHospitalListingUrlColl.insertOne({ url: treatmentListingUrl });
      } else {
        console.log("Already Scraped => ", treatmentListingUrl);
      }
    }
    if (err) console.log("ERR in database connection: ", err);
    console.log("Finished: Step3");
  } catch (err) {
    console.log(err);
  }
});
