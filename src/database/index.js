// const treatmentListingPageUrls = require('../scrapers/treatmentListingPageUrls')
const MongoClient = require('mongodb').MongoClient
const Url = 'mongodb://localhost:27017/Scraper'

MongoClient.connect(Url, async(err, client) => {
    console.log('✅ Database Connected');
    // const links = await treatmentListingPageUrls()
    const db = client.db('vaidam-data');
    // const coll = db.collection('listingPageLinks')
    // coll.insertOne({
    //     links
    // }).then(() => {
    //     console.log("Links added successfully in Database!!!!");
    // })
    if (err)
        console.log('ERR in database connection: ', err);
})