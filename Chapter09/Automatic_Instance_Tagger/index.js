'use strict';

console.log('Loading function');

const aws = require('aws-sdk');

const async = require('async');

const ec2 = new aws.EC2({apiVersion: '2016-11-15'});
let id =[];
let user, region, detail, eventname, arn, principal, userType, describeParams, i, j, k;

function createTag(tagCB){
  async.forEachOf(id, function (resourceID, key, cb) {
    var tagParams = {
      Resources: [
         resourceID
      ], 
      Tags: [
        {
          Key: "Owner", 
          Value: user
        },
        {
          Key: "PrincipalId", 
          Value: principal
        }
      ]
    };
    ec2.createTags(tagParams, function(tagErr, tagData) {
      if (tagErr){
        console.log("Couldn't tag the resource "+tagParams.Resources+" due to: "+tagErr); // an error occurred
        cb(tagErr);
      } 
      else{
        console.log("Tagged successfully");           // successful response
        cb(null, "tagged!");
      }     
    });
  }, function (err) {
      if (err){
        console.log(err);
        tagCB(err);
      }
      else{
        console.log("Done tagging!");
        tagCB(null, "Done!!");
      }
  });
}

function runInstances(runCB){
  let items = detail.responseElements.instancesSet.items;
  async.series({
    one: function(oneCB) {
      async.forEachOf(items, function (item, key, cb) {
        id.push(item.instanceId);
        cb(null, "added");
      }, function (err) {
          if (err){
            console.log(err);
            oneCB(err);
          }
          else{
            console.log("id array: "+id);
            oneCB(null, "Done!!");
          }
      });
    },
    two: function(twoCB){
      describeParams = {
        InstanceIds: [ 
        ]
      };
      async.forEachOf(id, function (instanceID, key, cb) {
        describeParams.InstanceIds.push(instanceID);
        cb(null, "added");
      }, function (err) {
          if (err){
            console.log(err);
            twoCB(err);
          }
          else{
            console.log("describeParams: ", describeParams);
            twoCB(null, "Done!!");
          }
      });
    },
    three: function(threeCB){
      ec2.describeInstances(describeParams, function(err, data) {
        if (err){
          console.log(err, err.stack); // an error occurred
          threeCB(err);
        } 
        else{
          console.log("data: ",JSON.stringify(data));           // successful response
          let reservations = data.Reservations;

          async.forEachOf(reservations, function (reservation, key, resrvCB) {
            console.log("******** inside reservations foreachof async loop! *************");
            let instances = reservation.Instances[0];
            console.log("Instances: ",instances);
            // get all volume ids
            let blockdevicemappings = instances.BlockDeviceMappings;
            console.log("blockdevicemappings: ",blockdevicemappings);
            // get all ENI ids
            let networkinterfaces = instances.NetworkInterfaces;
            console.log("networkinterfaces: ",networkinterfaces);

            async.each(blockdevicemappings, function (blockdevicemapping, blockCB) {
              console.log("************** inside blockdevicemappings asyn each loop! ***********");
              id.push(blockdevicemapping.Ebs.VolumeId);
              console.log("id array from blockdevicemapping: "+id);
              blockCB(null, "added");
            }, function (err) {
                if (err){
                  console.log(err);
                  resrvCB(err);
                }
                else{
                  //console.log("describeParams: ", describeParams);
                  async.each(networkinterfaces, function (networkinterface, netCB) {
                    console.log("******** inside networkinterfaces each async loop! *******");
                    id.push(networkinterface.NetworkInterfaceId);
                    console.log("id array from networkinterface: "+id);
                    netCB(null, "added");
                  }, function (err) {
                      if (err){
                        console.log(err);
                        resrvCB(err);
                      }
                      else{
                        //console.log("describeParams: ", describeParams);
                        resrvCB(null, "Done!!");
                      }
                  });
                  //resrvCB(null, "Done!!");
                }
            });
          }, function (err) {
              if (err){
                console.log(err);
                threeCB(err);
              }
              else{
                //console.log("describeParams: ", describeParams);
                threeCB(null, "Done!!");
              }
          });
        }     
      });
    }
  }, function(runErr, results) {
      // results is now equal to: {one: 1, two: 2}
      if(runErr){
        console.log(runErr);
        runCB(runErr);
      }
      else{
        console.log("id array from final runInstances: "+id);
        runCB(null, "got all ids");
      }
  });
}

exports.handler = (event, context, callback) => {
  id =[];
  console.log(JSON.stringify(event));
  try{
    region = event.region;
    detail = event.detail;
    eventname = detail.eventName;
    arn = detail.userIdentity.arn;
    principal = detail.userIdentity.principalId;
    userType = detail.userIdentity.type;

    if(userType === 'IAMUser'){
      user = detail.userIdentity.userName;
    }
    else{
      user = principal.split(':')[1];
    }

    console.log("principalId: "+principal);
    console.log("region: "+region);
    console.log("eventname: "+eventname);
    console.log("detail: ", JSON.stringify(detail));

    if(!(detail.hasOwnProperty('responseElements'))){
      console.log("No responseElements found!!");
      if(detail.hasOwnProperty('errorCode')){
        console.log("errorCode: ",detail.errorCode);
      }
      if(detail.hasOwnProperty('errorMessage')){
        console.log("errorMessage: ",detail.errorMessage);
      }
      return callback("No responseElementsfound!!");
    }
  }
  catch(e){
    console.log("An error occurred: ",e);
    return callback(e);
  }

  switch(eventname){
    case "CreateVolume":
      id.push(detail.responseElements.volumeId);
      console.log("id array: "+id);
      createTag(function(err, result){
        if(err){
          callback(err);
        }
        else{
          callback(null, "Done tagging!!");
        }
      });
      break;

    case "RunInstances":
      runInstances(function(err, result){
        if(err){
          callback(err);
        }else{
          createTag(function(createTagErr, createTagResult){
            if(createTagErr){
              callback(err);
            }
            else{
              callback(null, "Done tagging!!");
            }
          });
        }
      });
      break;

    case "CreateImage":
      id.push(detail.responseElements.imageId);
      console.log("id array: "+id);
      createTag(function(err, result){
        if(err){
          callback(err);
        }
        else{
          callback(null, "Done tagging!!");
        }
      });
      break;

    case "CreateSnapshot":
      id.push(detail.responseElements.snapshotId);
      console.log("id array: "+id);
      createTag(function(err, result){
        if(err){
          callback(err);
        }
        else{
          callback(null, "Done tagging!!");
        }
      });
      break;

    default:
      console.log("None of the options matched!!!");
      callback(null, "None of the options matched!!!");
  }
};

