// if(process.env.NODE_DEV) {
    require('dotenv').config();
// }

var getfiletree = require('./getfiletree'); // vincents beautiful file tree getterrr

var config = require('./config');


function importToDocDB(photoInfo) {
    var documentClient = require("documentdb").DocumentClient;
    var docDBRef = new documentClient(config.docDBConfig.endpoint, { "masterKey": config.docDBConfig.primaryKey });

    photoInfo = {test: true};

    // console.log('dbs/' + config.docDBConfig.dbName + '/colls/' + config.docDBConfig.colName);
    console.log(photoInfo, 'test')
    console.log('url', 'dbs/' + config.docDBConfig.dbName + '/colls/' + config.docDBConfig.colName);
    docDBRef.createDocument('dbs/' + config.docDBConfig.dbName + '/colls/' + config.docDBConfig.colName, photoInfo, function (docErr, docRes) {
        // response.json(req.body);
        console.log('error', docErr);
    });
}


module.exports = {
    importToDocDB: importToDocDB
}

importToDocDB({test: true});




