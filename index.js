var express = require('express')
var app = express();
var path = require("path");

var bodyParser = require('body-parser');
var request = require('request');

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

var config = require('./config');
var importToDocDB = require('./import-to-docdb');
var documentClient = require("documentdb").DocumentClient;

var docDBRef = new documentClient(config.docDBConfig.endpoint, { "masterKey": config.docDBConfig.primaryKey });

// if(process.env.NODE_DEV) {
    require('dotenv').config();
// }


// cognitive fns
/**
 * Use MS Cognitive Services to obtain caption for specified @param imgUrl
 */
function getCognitiveData(apiType, imgUrl, mediaID) {
    var endpoint, authKey;
    // todo: un-switch
    switch (apiType) {
        case 'vision':
            endpoint = process.env.VISION_ENDPOINT;
            authKey = process.env.VISION_KEY;
            break;

        case 'describe':
            endpoint = process.env.VISIONDESCRIBE_ENDPOINT
            authKey = process.env.VISION_KEY;
            break;

        // case 'face':
        //     endpoint = process.env.FACE_ENDPOINT;
        //     authKey = process.env.FACE_KEY;
        //     break;
        // case 'emotion':
        //     endpoint = process.env.EMOTION_ENDPOINT;
        //     authKey = process.env.EMOTION_KEY;
        //     break;
    }

    request.post({
        url: endpoint,
        json: true,
        body: {"url" : imgUrl },
        headers: {
            'Ocp-Apim-Subscription-Key': authKey,
            'Content-Type' : 'application/json'
        }
    }, function (error, response, body) {
        if (!error) { // if successful req  && response.statusCode == 200
            if(response.body) {
                // console.log(response.body);
                // var caption = response.body.description.captions[0].text;
                // console.log('got caption', caption);

                // postToInstagram(console, mediaID, caption)

                importToDocDB.importToDocDB(response.body)
            }
            else {
                console.log('unable to get caption');
            }
        }
        else {
            console.log('error', error);
        }
    });
}






//testing
getCognitiveData('describe', 'http://www.marketplaceleaders.org/wp-content/uploads/2013/09/893708_10151839045509966_1967887512_o.jpg', null)





// config.APICalls.forEach(function (colName) {
    app.get('/' + config.docDBConfig.colName, function (req, res) {

        docDBRef.readDocuments('dbs/' + config.docDBConfig.dbName + '/colls/' + config.docDBConfig.colName).toArray(function (error, allItems) {
            res.json(allItems);
        });
    });

    app.get('/' + config.docDBConfig.colName + '/:itemId', function (req, res) {
        var querySpec = {
            query: 'SELECT * FROM c WHERE c.oid= @oid',
            parameters: [
                {
                    name: '@oid',
                    value: req.params.itemId
                }
            ]
        };

        docDBRef.queryDocuments('dbs/' + config.docDBConfig.dbName + '/colls/' + config.docDBConfig.colName, querySpec).toArray(function (err, results) {
            res.json(results);
        });
    });


    app.post('/' + config.docDBConfig.colName, function (req, response) {
        if (req.body) {
            console.log('posting to db');
            docDBRef.createDocument('dbs/' + config.docDBConfig.dbName + '/colls/' + config.docDBConfig.colName, req.body, function (docErr, docRes) {
                response.json(req.body);
            });
        }
        else {
            response.send(req, res, 'error');
        }
    });
// });


app.use('/', express.static(path.join(__dirname, 'webview')))
// app.use('/transactions', blockchain)

app.set('port', process.env.PORT || 3000);

app.listen(app.get('port'), function () {
    console.log('Example app listening on port ' + app.get('port'));
});
