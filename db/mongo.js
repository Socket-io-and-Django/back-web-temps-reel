const mongoose = require('mongoose');
// const MongoClient = require('mongodb').MongoClient;
const dbConfig = require("../config/db.config");

const clientOptions = {
    // useUnifiedTopology: true,
    useNewUrlParser: true
    // dbName            : process.env.DB_NAME

};
mongoose.connect("mongodb://mongodb:27017/webTempsReal");
const db = mongoose.connection;

module.exports = db;

//
// exports.initClientDbConnection = async () => {
//     try {
//         await mongoose.connect("mongodb://root:webTempsReal@mongodb:27017/webTempsReal", clientOptions)
//         console.log('Connected');
//     } catch (error) {
//         console.log(error);
//         throw error;
//     }
// }

// var url = "mongodb://localhost:27017/mydb";
//
// MongoClient.connect(dbConfig.url, function(err, db) {
//     if (err) throw err;
//     console.log("Database created!");
//     db.close();
// });