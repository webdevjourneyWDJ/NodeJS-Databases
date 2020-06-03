// request is a module that makes http calls easier
const request = require('request');
const MongoClient = require('mongodb').MongoClient;

const dsn = "mongodb://localhost:37017";

// Generic function that fetches the closing bitcoin dates of the last month from a public API
function fetchFromAPI(callback) {
    request.get('https://api.coindesk.com/v1/bpi/historical/close.json', (err, raw, body) => {
        return callback(err, JSON.parse(body));
    });
}

function insertMongodb(collection, data){
    const promisedInserts = [];

    Object.keys(data).forEach((key) => {
        promisedInserts.push(
            collection.insertOne({date: key, value: data[key]})
        );
    });

    return Promise.all(promisedInserts);
}

MongoClient.connect(dsn, (err, client) => {
    const db = client.db('maxcoin');
    if(err) throw err;
    console.log("*********** Connected to MongoDB ***********");
    fetchFromAPI((err, data) => {
        if (err) throw err;
        const collection = db.collection('value');

        insertMongodb(collection, data.bpi).then((result) => {
            console.log(`Suxxessfully added ${result.length} docs into database`);

            const options = {'sort': [['value', 'desc']]};

            collection.findOne({}, options, (err, doc) => {
                console.log(`The highest vaule is ${doc.value} and it was reached on ${doc.date}`);
                client.close();  
            })
        }).catch((err) => {
            console.log(err);
            process.exit();
        });
    });  
});