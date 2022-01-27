const treatmentListingPageUrls = require('../scrapers/treatmentListingPageUrlsScraper')
const MongoClient = require('mongodb').MongoClient
const Url = 'mongodb://localhost:27017/Scraper'

MongoClient.connect(Url, async(err, client) => {
    console.log('✅ Database Connected');
    const links = await treatmentListingPageUrls('https://www.vaidam.com/doctors/turkey')
    const db = client.db('vaidam-data');
    const coll = db.collection('doctorListingPages')
    coll.insertOne({
        links
    }).then(() => {
        console.log("Links added successfully in Database!!!!");
    })
    if (err)
        console.log('ERR in database connection: ', err);
})