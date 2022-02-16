/* Save Hospitals to Clinicspots */

const axios = require("axios");
const MongoClient = require("mongodb").MongoClient;
const Url = "mongodb://localhost:27017/Scraper";
const apiUrl = "http://localhost:8080/api/add-facility";
const Bottleneck = require("bottleneck");
const requestLimiter = new Bottleneck({
  maxConcurrent: 60,
  minTime: 1001,
});
let db = null;
MongoClient.connect(Url, async (err, client) => {
  try {
    console.log("✅ Database Connected");
    db = client.db("vaidam-data");
    const HospitalDataColl = db.collection("hospitalData");
    const CategoryMappingColl = db.collection("categoryMappings");
    const HospitalPageUrls = db.collection("hospitalPageUrls");
    db.createCollection("hospitalError").catch(() => {}); // by catch we are removing error of "collection already exists" from console
    const HospitalErrorColl = db.collection("hospitalError");
    let cursor = HospitalDataColl.find({});
    while (await cursor.hasNext()) {
      let hospitalData = await cursor.next();
      if (!hospitalData?.clinicspotsId) {
        if (hospitalData?.name) {
          if (hospitalData?.city_name) {
            const result = await HospitalPageUrls.findOne({
              url: hospitalData.url,
            });
            const departments = result.departments;
            let categories = departments?.map(async (department) => {
              if (department === "COSMETIC AND PLASTIC SURGERY0")
                department = "COSMETIC AND PLASTIC SURGERY";
              const mappedDepartment = await CategoryMappingColl.findOne({
                VaidamDepartment: department,
              });
              if (mappedDepartment) {
                return mappedDepartment?.Category1;
              }
              return;
            });
            Promise.all(categories).then(async (categoryArr) => {
              let categories = categoryArr.filter((category) => {
                return category !== undefined && category !== "";
              });
              categories = categories || []; // null check
              // removing any duplicity
              categories = categories.filter(function (category, pos) {
                return categories.indexOf(category) == pos;
              });
              hospitalData.categories = categories;
              await mapDoctors(hospitalData);
            });
          } else {
            await HospitalDataColl.updateOne(
              { url: hospitalData.url },
              { $set: { clinicspotsId: "This hospital cannot be saved!" } }
            );
            await HospitalErrorColl.insertOne({
              hospitalId: hospitalData._id,
              errorMessage: "This Hospital's CITY_NAME not present",
            });
          }
        } else {
          await HospitalDataColl.updateOne(
            { url: hospitalData.url },
            { $set: { clinicspotsId: "This hospital cannot be saved!" } }
          );
          await HospitalErrorColl.insertOne({
            hospitalId: hospitalData._id,
            errorMessage: "This Hospital's NAME not present.",
          });
        }
      }
    }
    if (err) console.log("ERR in database connection: ", err);
  } catch (err) {
    console.log(err);
    process.exit(0);
  }
});
async function mapDoctors(hospitalData) {
  const DoctorDataColl = db.collection("doctorData");
  let doctors = hospitalData.doctors.map(async (doctorUrl) => {
    let result = await DoctorDataColl.findOne({
      url: doctorUrl,
    });
    if (result?.clinicspotsId) {
      return result?.clinicspotsId;
    }
    return;
  });
  Promise.all(doctors).then(async (doctorsArr) => {
    let doctors = doctorsArr.filter((doctorId) => {
      return (
        doctorId !== undefined &&
        doctorId !== null &&
        doctorId !== "This doctor cannot be saved!" &&
        typeof doctorId === "number"
      );
    });
    doctors = doctors || []; // null check
    // removing any duplicity
    doctors = doctors.filter(function (doctor, pos) {
      return doctors.indexOf(doctor) == pos;
    });
    const mappedAmenities = {
      "Free Wifi": "Internet/Wifi",
      "Laundry": "Laundry Room",
      "Religious facilities": "Prayer Room",
      "Café": "Cafeteria",
      "Parking available": "Parking",
      "ATM": "Bank/ATM",
      "Foreign currency exchange": "Money Exchange Service",
      Pharmacy: "24X7 Pharmacy",
    };
    delete hospitalData.clinicspotsId;
    if (isNaN(parseInt(hospitalData.beds, 10))) {
      delete hospitalData.beds;
    }
    hospitalData.facilities = hospitalData.facilities
      .map((amenity) => {
        if (mappedAmenities[amenity]) {
          return { name: mappedAmenities[amenity] };
        }
      })
      .filter((amenity) => {
        if(amenity)
          return typeof amenity.name === "string";
      });
    hospitalData.amenities = hospitalData.facilities;
    delete hospitalData.facilities;
    hospitalData.doctors = doctors;
    hospitalData.type = "Hospital";
    hospitalData.country_id = 223; // Turkey ID
    hospitalData.payment_methods = hospitalData?.payment_methods.map(
      (payment_method) => {
        return { method: payment_method };
      }
    );
    await requestLimiter.schedule(() => {
      sendRequest(hospitalData);
    });
  });
}

async function sendRequest(payload) {
  const HospitalErrorColl = db.collection("hospitalError");
  const HospitalDataColl = db.collection("hospitalData");
  await axios
    .post(apiUrl, payload)
    .then(async (response) => {
      const hospitalId = response.data.id;
      if (typeof hospitalId === "number") {
        await HospitalDataColl.updateOne(
          { url: payload.url },
          { $set: { clinicspotsId: hospitalId } }
        );
        console.log(
          "SUCCESS => Hospital Saved Successfully in CLINICSPOTS",
          "ID => ",
          hospitalId
        );
      } else throw new Error("Id was not number");
    })
    .catch(async (err) => {
      await HospitalErrorColl.insertOne({
        hospitalId: payload._id,
        errorMessage: err?.response?.data?.message,
      });
      console.log("ERROR => ", err, err?.response?.data?.message);
      // process.exit(0);
    });
}
