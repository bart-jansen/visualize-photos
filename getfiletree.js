
var walk = require('walk');
var ExifImage = require('exif').ExifImage;
var Sharp = require('sharp');
const uuidV4 = require('uuid/v4');
var files = [];
var picsList = [];

const PIC_FORMATS =['png','jpg','jpeg']


function createTree(picPath,cb){


// Walker options
var walker = walk.walk(picPath, { followLinks: false });

walker.on('file', function (root, stat, next) {
  // Add this file to the list of files
  let name = root + '/' + stat.name
  files.push(name);
    var tmp = name.split('.')


    if (PIC_FORMATS.indexOf( tmp[tmp.length -1].toLowerCase()) > -1 ){
      try {
        new ExifImage({ image: name }, function (error, exifData) {
          if (error)
            console.log('Error: ' + error.message);
          else
            //console.log(exifData); // Do something with your data!
            picsList.push( {
              'path':name,
              'meta':exifData,
              'tumpId':uuidV4()
            })
            next();
        });
      } catch (error) {
        console.log('Error: ' + error.message);
        next();
      }
    }
  next();
});

walker.on('end', function () {
  console.log(picsList.length)
  resize()
});

function resize(){
  for(let i; i < picsList.length;i++) {
    var tmp = picsList[i].path
    tmp = tmp.split('.')

    var newFilePath = picPath+'/tumpsmall/'.replace('\'','') + picsList[i].tumpId +'.'+ tmp[tmp.length-1]
    Sharp(picsList[i].path)
    .resize(120,120)
    .max()
    .toFile(newFilePath)
    console.log(newFilePath)
  };
}
  cb(null,picsList)
}

module.exports = createTree
