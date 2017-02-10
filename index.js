var express = require('express')
var app = express();
var path = require("path");

var bodyParser = require('body-parser');
var request = require('request');

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

var config = require('./config');
var documentClient = require("documentdb").DocumentClient;

var docDBRef = new documentClient(config.docDBConfig.endpoint, { "masterKey": config.docDBConfig.primaryKey });

if(process.env.NODE_DEV) {
    require('dotenv').config();
}

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
            key = process.env.VISION_KEY;
            break;
    }

    console.log(endpoint)

    request.post({
        url: endpoint,
        json: true,
        body: {"uri" : imgUrl },
        headers: {
            'Ocp-Apim-Subscription-Key': authKey,
            'Content-Type' : 'application/json'
        }
    }, function (error, response, body) {
        if (!error && response.statusCode == 200) { // if successful req
            if(response.body && response.body.description && response.body.description.captions) {
                var caption = response.body.description.captions[0].text;
                console.log('got caption', caption);

                // postToInstagram(console, mediaID, caption)
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
getCognitiveData('vision', 'http://www.marketplaceleaders.org/wp-content/uploads/2013/09/893708_10151839045509966_1967887512_o.jpg', null)

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
