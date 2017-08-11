'use strict';

const bunyan = require('bunyan');
const Bunyan2Loggly = require('bunyan-loggly');

const AWS = require('aws-sdk');

const kms = new AWS.KMS({ apiVersion: '2014-11-01' });

const decryptParams = {
    CiphertextBlob: new Buffer(process.env.kmsEncryptedCustomerToken, 'base64'),
};
let customerToken;
let log;

exports.handler = (event, context, callback) => {
    kms.decrypt(decryptParams, (error, data) => {
        if (error) {
            console.log(error);
            return callback(error);
        } 
        else {
            customerToken = data.Plaintext.toString('ascii');
            log = bunyan.createLogger({
                name: 'mylogglylog',
                streams: [
                {
                  type: 'raw',
                  stream: new Bunyan2Loggly({
                    token: customerToken,
                    subdomain: process.env.logglySubDomain,
                    json: true
                  })
                }
                ]
            });
            log.info("My first log in loggly!!!");
            return callback(null, "all events sent to loggly!");
        }
    });
    
    	
};

