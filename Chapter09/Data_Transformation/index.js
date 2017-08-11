'use strict';

console.log('Loading function');

const aws = require('aws-sdk');

const async = require('async');

const s3 = new aws.S3({ apiVersion: '2006-03-01' });

const csv = require("csvtojson");

const jsonfile = require('jsonfile');

const fs = require('fs');

const docClient = new aws.DynamoDB.DocumentClient();
 

exports.handler = (event, context, callback) => {
    async.auto({
      download: function(callback) {
          console.log('Received event:', JSON.stringify(event, null, 2));
          const bucket = event.Records[0].s3.bucket.name;
          let key = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, ' '));
          const downloadParams = {
              Bucket: bucket,
              Key: key
          };

          // removing the csv/ from the actual key-name
          key = key.replace('csv/', '');
          // files can be downloaded in the /tmp directory in lambda
          let csvFile = "/tmp/"+key;
          let file = fs.createWriteStream(csvFile);
          s3.getObject(downloadParams).createReadStream().on('error', function(err){
              console.log("Error while downloading the file from S3: ",err);
              callback(err);
          }).pipe(file);

          file.on('finish', function() {
            file.close();  // close() is async, call cb after close completes.
            console.log("Download complete! "+csvFile);
            callback(null, {'csvFile':csvFile, 'bucketName':bucket, 'key':key});
          });

          file.on('error', function(err){
            console.log("Error while downloading the Id3 file from S3: ",err);
            callback(err);
          });
      },
      csvtojson: ['download', function(results, callback){
          console.log("Inside csvtojson function");
          let csvFile = results.download.csvFile;
          csv()
            .fromFile(csvFile)
            .on("end_parsed",function(jsonArrayObj){ //when parse finished, result will be emitted here.
               console.log(jsonArrayObj);

               // Final file will have a .json extention
               let keyJson = results.download.key.replace(/.csv/i, ".json"); 
               console.log("Final file: "+keyJson);

               // we are writing the final json file in the /tmp directory itself in lambda 
               let jsonFile = "/tmp/"+keyJson;
               jsonfile.writeFile(jsonFile, jsonArrayObj, function (err) { 
                if(err){
                  console.error(err);
                  callback(err);
                }
               });
               callback(null, {'keyJson':keyJson, 'jsonFile':jsonFile});
            });
      }],
      sendToDynamo: ['download', 'csvtojson', function(results, callback) {
          console.log("Inside sendToDynamo function");
          console.log("Importing data into DynamoDB. Please wait.");
          fs.readFile(results.csvtojson.jsonFile, function (err, data) {
            if (err){
              console.log(err);
              return callback(err);
            }
            let obj = JSON.parse(data);
            async.forEachOf(obj, function (obj, key, cb) {
              let params = {
                  TableName: process.env.TABLE_NAME,
                  Item: {
                      "ID":  obj.ID,
                      "Name": obj.Name,
                      "Age":  obj.Age
                  }
              };
              docClient.put(params, function(err, data) {
                 if (err) {
                     console.error("Unable to add ", data.Name, ". Error JSON:", JSON.stringify(err, null, 2));
                     cb(err);
                 } else {
                     console.log("PutItem succeeded");
                     cb(null, "PutItem succeeded");
                 }
              });
            }, function (err) {
                if (err){
                  console.log(err);
                  callback(err);
                }
                else{
                  callback(null, "Done!!");
                }
            }); 
          });
      }]
    }, 
    function(err, results) {
      if(err){
        console.log("Finished with error!");
      }
      else{
        console.log(results);
      }  
    });
};

