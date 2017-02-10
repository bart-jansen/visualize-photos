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



// cognitive fns
/**
 * Use MS Cognitive Services to obtain caption for specified @param imgUrl
 */
function getVisionCaption(context, imgUrl, mediaID) {

    request.post({
        url: oxfordApi,
        json: true,
        body: {"url" : imgUrl },
        headers: {
            'Ocp-Apim-Subscription-Key': process.env.VISION_KEY,
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
            console.log('error', response.body);
        }
    });
}








// config.APICalls.forEach(function (colName) {
    app.get('/' + colName, function (req, res) {

        docDBRef.readDocuments('dbs/' + config.docDBConfig.dbName + '/colls/' + config.docDBConfig.colName).toArray(function (error, allItems) {
            res.json(allItems);
        });
    });

    app.get('/' + colName + '/:itemId', function (req, res) {
        var querySpec = {
            query: 'SELECT * FROM c WHERE c.oid= @oid',
            parameters: [
                {
                    name: '@oid',
                    value: req.params.itemId
                }
            ]
        };

        docDBRef.queryDocuments('dbs/' + config.docDBConfig.dbName + '/colls/' + colName, querySpec).toArray(function (err, results) {
            res.json(results);
        });
    });


    app.post('/' + colName, function (req, response) {
        if (req.body) {
            console.log('posting to db');
            docDBRef.createDocument('dbs/' + config.docDBConfig.dbName + '/colls/' + colName, req.body, function (docErr, docRes) {
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
