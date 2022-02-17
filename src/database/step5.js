/* Save Doctors to Clinicspots */

const axios = require("axios");
const MongoClient = require("mongodb").MongoClient;
const Url = "mongodb://localhost:27017/Scraper";
const apiUrl = "http://localhost:8080/api/add-doctor";
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
    const DoctorDataColl = db.collection("doctorData");
    const HospitalDataColl = db.collection("hospitalData");
    db.createCollection("doctorError").catch(() => {}); // by catch we are removing error of "collection already exists" from console
    const DoctorErrorColl = db.collection("doctorError");
    let cursor = DoctorDataColl.find({});
    while (await cursor.hasNext()) {
      let doctorData = await cursor.next();
      if (!doctorData?.clinicspotsId) {
        if (doctorData?.first_name) {
          if (doctorData?.city_name) {
            // if (doctorData.city_name !== "Balcova" && doctorData.city_name !== "Cankaya")
            mapSpecialization(doctorData);
          } else if (doctorData?.hospitalUrl) {
            const hospitalData = await HospitalDataColl.findOne({
              url: doctorData.hospitalUrl,
            });
            const cityName = hospitalData?.city_name;
            if (cityName) {
              doctorData.city_name = cityName;
              mapSpecialization(doctorData);
            } else {
              await DoctorDataColl.updateOne(
                { url: doctorData.url },
                { $set: { clinicspotsId: "This doctor cannot be saved!" } }
              );
              await DoctorErrorColl.insertOne({
                doctorId: doctorData._id,
                errorMessage:
                  "This Doctor's City and hospital's city not present",
              });
            }
          } else {
            await DoctorDataColl.updateOne(
              { url: doctorData.url },
              { $set: { clinicspotsId: "This doctor cannot be saved!" } }
            );
            await DoctorErrorColl.insertOne({
              doctorId: doctorData._id,
              errorMessage:
                "This Doctor's CITY_NAME and HOSPITAL URL not present",
            });
          }
        } else {
          await DoctorDataColl.updateOne(
            { url: doctorData.url },
            { $set: { clinicspotsId: "This doctor cannot be saved!" } }
          );
          await DoctorErrorColl.insertOne({
            doctorId: doctorData._id,
            errorMessage: "This Doctor's FIRST_NAME not present.",
          });
        }
      }
    }
    if (err) console.log("ERR in database connection: ", err);
    // console.log("Finished: Step5");
  } catch (err) {
    console.log(err);
    process.exit(0);
  }
});

async function mapSpecialization(doctorData) {
  const SpecializationMappingColl = db.collection("specializationMappings");
  /*
   * services are also specialization it was just we were not clear at time of scraping
   * that it was service or specializations.
   */
  const services = doctorData?.services?.map(async (service) => {
    const mappedService = await SpecializationMappingColl.findOne({
      VaidamSpecialization: service,
    });
    if (mappedService) {
      return mappedService?.Specialization1;
    }
    return;
  });
  let specializations = doctorData?.specializations?.map(
    async (specialization) => {
      const mappedSpecialization = await SpecializationMappingColl.findOne({
        VaidamSpecialization: specialization,
      });
      if (mappedSpecialization) {
        return mappedSpecialization?.Specialization1;
      }
      return;
    }
  );
  specializations = [...specializations, ...services];
  Promise.all(specializations).then(async (specializationArr) => {
    let specializations = specializationArr.filter((specialization) => {
      return specialization !== undefined;
    });
    specializations = specializations || []; // null check
    // removing any duplicity
    specializations = specializations.filter(function (specialization, pos) {
      return specializations.indexOf(specialization) == pos;
    });
    doctorData.specializations = specializations;
    delete doctorData.services;
    await requestLimiter.schedule(() => {
      sendRequest(doctorData);
    });
  });
}
async function sendRequest(payload) {
  const DoctorErrorColl = db.collection("doctorError");
  const DoctorDataColl = db.collection("doctorData");
  await axios
    .post(apiUrl, payload)
    .then(async (response) => {
      // console.log(response);
      const doctorId = response?.data.id;
      if (typeof doctorId === "number") {
        await DoctorDataColl.updateOne(
          { url: payload.url },
          { $set: { clinicspotsId: doctorId } }
        );
        console.log(
          "SUCCESS => Doctor Saved Successfully in CLINICSPOTS",
          "ID => ",
          doctorId
        );
      } else throw new Error("Id was not number");
    })
    .catch(async (err) => {
      await DoctorErrorColl.insertOne({
        doctorId: payload._id,
        errorMessage: err?.response?.data?.message,
      });
      console.log("ERROR => ", err, err?.response?.data?.message);
      // console.log(payload);
      // process.exit(0);
    });
}
