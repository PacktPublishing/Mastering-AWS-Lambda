'use strict';

console.log('Loading function');

const aws = require('aws-sdk');

const async = require('async');

const ec2 = new aws.EC2({apiVersion: '2016-11-15'});

let instanceIDs =[];
let volumeIDs = [];


function createImage(instanceID, createImageCB){
  let date = new Date().toISOString().replace(/:/g, '-').replace(/\..+/, '');
  //console.log("AMI name: "+instanceID+'-'+date);
  let createImageParams = {
    InstanceId: instanceID, /* required */
    Name: 'AMI-'+instanceID+'-'+date /* required */
  };
  ec2.createImage(createImageParams, function(createImageErr, createImageData) {
    if (createImageErr){
      console.log(createImageErr, createImageErr.stack); // an error occurred
      createImageCB(createImageErr);
    } 
    else{
      console.log("createImageData: ",createImageData);           // successful response
      createImageCB(null, "AMI created!!");
    }     
  });
}

function createSnapShot(volumeID, createSnapShotCB){
  let createSnapShotParams = {
    VolumeId: volumeID, /* required */
    Description: 'Snapshot of volume: '+volumeID
  };
  ec2.createSnapshot(createSnapShotParams, function(createSnapShotErr, createSnapShotData) {
    if (createSnapShotErr){
      console.log(createSnapShotErr, createSnapShotErr.stack); // an error occurred
      createSnapShotCB(createSnapShotErr);
    } 
    else{
      console.log("createSnapShotData: ", createSnapShotData);           // successful response
      createSnapShotCB(null , "SnapShot created!!");
    }     
  });
}

exports.handler = (event, context, callback) => {
  instanceIDs = [];
  volumeIDs =[];

  let describeTagParams = {
    Filters: [
      {
        Name: "key", 
        Values: [
          "backup"
        ]
      }
    ]
  };
  let describeVolParams = {
    Filters: [
      {
        Name: "attachment.instance-id", 
        Values: []
      }
    ]
  };

  ec2.describeTags(describeTagParams, function(describeTagsErr, describeTagsData) {
    if (describeTagsErr){
      console.log(describeTagsErr, describeTagsErr.stack); // an error occurred
      callback(describeTagsErr);
    } 
    else{
      console.log("describe tags data: ",JSON.stringify(describeTagsData));           // successful response
      for(let i in describeTagsData.Tags){
        instanceIDs.push(describeTagsData.Tags[i].ResourceId);
        describeVolParams.Filters[0].Values.push(describeTagsData.Tags[i].ResourceId);
      }
      console.log("final instanceIDs array: "+instanceIDs);
      console.log("final describeVolParams: ",describeVolParams);

      ec2.describeVolumes(describeVolParams, function(describeVolErr, describeVolData) {
        if (describeVolErr){
          console.log(describeVolErr, describeVolErr.stack); // an error occurred
          callback(describeVolErr);
        } 
        else{
          console.log("describeVolData:",describeVolData);           // successful response
          for(let j in describeVolData.Volumes){
            volumeIDs.push(describeVolData.Volumes[j].VolumeId);
          }
          console.log("final volumeIDs array: "+volumeIDs);

          async.parallel({
            one: function(oneCB) {
                async.forEachOf(instanceIDs, function (instanceID, key, imageCB) {
                  createImage(instanceID, function(createImageErr, createImageResult){
                    if(createImageErr){
                      imageCB(createImageErr);
                    }
                    else{
                      imageCB(null, createImageResult);
                    }
                  });
                }, function (imageErr) {
                    if (imageErr){
                      return oneCB(imageErr);
                    } 
                    oneCB(null, "Done with creating AMIs!");
                });
            },
            two: function(twoCB) {
                async.forEachOf(volumeIDs, function (volumeID, key, volumeCB) {
                  //console.log("volumeID in volumeIDs: "+volumeID);
                  createSnapShot(volumeID, function(createSnapShotErr, createSnapShotResult){
                    if(createSnapShotErr){
                      volumeCB(createSnapShotErr);
                    }
                    else{
                      volumeCB(null, createSnapShotResult);
                    }
                  });
                }, function (volumeErr) {
                    if (volumeErr){
                      return twoCB(volumeErr);
                    } 
                    twoCB(null, "Done with creating Snapshots!");
                });
            }
          }, function(finalErr, finalResults) {
              if(finalErr){
                callback(finalErr);
              }
              callback(null, "Done!!");
          });
        }
      });
    }
  });
};


