// request is a module that makes http calls easier
const request = require('request');
const redis = require('redis');
const MongoClient = require('mongodb').MongoClient;
const mysql = require('mysql2');

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
    console.time('mongodb');
    console.log("*********** Connected to MongoDB ***********");
    fetchFromAPI((err, data) => {
        if (err) throw err;
        const collection = db.collection('value');

        insertMongodb(collection, data.bpi).then((result) => {
            console.log(`Suxxessfully added ${result.length} docs into database`);

            const options = {'sort': [['value', 'desc']]};

            collection.findOne({}, options, (err, doc) => {
                console.log(`The highest vaule is ${doc.value} and it was reached on ${doc.date}`);
                console.timeEnd('mongodb');
                client.close();  
            })
        }).catch((err) => {
            console.log(err);
            process.exit();
        });
    });  
});


function insertRedis (client, data, cb) {
    const values = ['values'];

    Object.keys(data).forEach((key) => {
        values.push(data[key]);
        values.push(key);
    });

    client.zadd(values, cb);
}


const redisClient = redis.createClient(7379);
redisClient.on('connect', () => {
    console.time('redis');
    console.log('Successfully connected to redis');
    
    fetchFromAPI((err, data) => {
        if(err) throw err;

        insertRedis(redisClient, data.bpi, (err, results) => {
            if(err) throw err;
            console.log(`Successfully inserted ${results} key/value pairs into redis`);

            redisClient.zrange('values', -1, -1, 'withscores', (err, result) => {
                if(err) throw err;

                console.log(`Redis: max value is ${result[1]} and it was reached on ${result[0]}`);
                console.timeEnd('redis');
                redisClient.end();
                
            })
        })
    })
});

function insertMySQL(connection, data, cb){
    const values = [];
    const sql = 'INSERT INTO coinvalues (valuedate, coinvalue) VALUES ?';

    Object.keys(data).forEach((key) => {
        values.push([key, data[key]]);
    });

    connection.query(sql, [values], cb);
}


const connection = mysql.connect({
    host: 'localhost',
    port: 4306,
    user: "root",
    password: "password",
    database: "maxcoin"
});

connection.connect((err) => {
    if(err) throw err;
    console.time('mysql');
    console.log("Successfully connected to mysql");

    fetchFromAPI((err, data) => {
        if(err) throw err;

        insertMySQL(connection, data.bpi, (err, results, fields) => {
            if(err) throw err;

            console.log(`Successfully inserted ${results.affectedRows} docs into MySQL`);
            connection.query("SELECT * FROM coinvalues ORDER BY coinvalue DESC LIMIT 0,1", (err, results, fields) =>{
                if(err) throw err;
                console.log("results", results);
                console.log(`MySQL: max value is ${results[0].coinvalue} and it was reached on ${results[0].valuedate}`);
                console.timeEnd('mysql');
                connection.end();
            })
        })
        
    });
})