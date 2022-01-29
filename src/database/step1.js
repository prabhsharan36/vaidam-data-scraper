/* Creating Collection for Doctors and Hospitals */

const MongoClient = require("mongodb").MongoClient;
const Url = "mongodb://localhost:27017/Scraper";

MongoClient.connect(Url, async (err, client) => {
  console.log("✅ Database Connected");
  const db = client.db("vaidam-data");
  db.createCollection("doctorPageUrls", {
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: ["url"],
        properties: {
          url: {
            bsonType: "string",
          },
        },
      },
    },
  });
  db.createCollection("hospitalPageUrls", {
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: ["url"],
        properties: {
          url: {
            bsonType: "string",
          },
          departments: {
            bsonType: "string",
          },
          treatment: {
            bsonType: "string",
          },
        },
      },
    },
  });

  if (err) console.log("ERR in database connection: ", err);
});
