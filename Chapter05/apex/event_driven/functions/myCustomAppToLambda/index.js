'use strict';

const weather = require('openweather-apis');
const AWS = require('aws-sdk');
const sns = new AWS.SNS({apiVersion: '2010-03-31'});
const kmsEncryptedAPIKey = process.env.kmsEncryptedAPIKey;
const snsTopicARN = process.env.snsTopicARN;
let language = process.env.language;
let units = process.env.units;
let apiKey;

function processEvent(event, callback) {
    let city = event.city;
    weather.setAPPID(apiKey);
	weather.setLang(language);
	weather.setUnits(units);
	weather.setCity(city);

	weather.getSmartJSON(function(err, smart){
		if(err){
			console.log("An error occurred: ", err);
			callback(err);
		}
		else{
			if(Number(smart.temp) > 25){
				console.log("Temperature is greater than 25 degree celsius!!");
				let snsParams = {
					Message: "Its Hot outside!! Avoid wearing too many layers! WEATHER UPDATE: "+ JSON.stringify(smart),
					Subject: 'WEATHER UPDATE',
					TopicArn: snsTopicARN
				};
				sns.publish(snsParams, function(snsErr, data) {
					if (snsErr){
						console.log("An error occurred while sending SNS Alert: "+snsErr, snsErr.stack); // an error occurred
						callback(snsErr);
					} 
					else{
						console.log("SNS Alert sent successfully: ", snsParams.Message);           // successful response
						callback(null, "Done");
					}     
				});
			}
			else{
				console.log("WEATHER UPDATE: ", smart);
				callback(null, "Done");
			}
		}
});
}

exports.handler = function(event, context, callback) {
    //var weatherEvent = JSON.parse(event);
    console.log('Received custom event:', event);

    if (apiKey) {
        // Container reuse, simply process the event with the key in memory
        processEvent(event, callback);
    } else if (kmsEncryptedAPIKey && kmsEncryptedAPIKey !== '<kmsEncryptedAPIKey>') {
        const encryptedBuf = new Buffer(kmsEncryptedAPIKey, 'base64');
        const cipherText = { CiphertextBlob: encryptedBuf };

        const kms = new AWS.KMS();
        kms.decrypt(cipherText, (err, data) => {
            if (err) {
                console.log('Decrypt error:', err);
                return callback(err);
            }
            apiKey = data.Plaintext.toString('ascii');
            processEvent(event, callback);
        });
    } else {
        callback('API Key has not been set.');
    }
};
