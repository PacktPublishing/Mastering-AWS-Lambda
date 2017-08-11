/*
    Code will check if it's getting a successful response from the given URL.
    If yes, then it will send a "gauge" custom metric of value 1 to DataDog.
    If no, then it will send a "gauge" custom metric of value 0 to Datadog.
    Log line to be printed for custom metrcis is:
    MONITORING|unix_epoch_timestamp|metric_value|metric_type|my.metric.name|#tag1:value,tag2
*/
'use strict';
const request = require('request');
let target = "<YOUR_URL>";
let metric_value, tags;

exports.handler = (event, context, callback) => {
    // TODO implement

    let unix_epoch_timeshtamp = Math.floor(new Date() / 1000);  // Parameters required for DataDog custom Metrics
    let metric_type = "gauge";  // Only gauge or count are supported as of now.
    let my_metric_name = "websiteCheckMetric";  // custom name given by us.

    request(target, function (error, response, body) {

        // successful response
        if(!error && response.statusCode === 200) {
            metric_value = 1;
            tags = ['websiteCheck:'+metric_value,'websiteCheck'];
            console.log("MONITORING|" +unix_epoch_timeshtamp+ "|" +metric_value+ "|"+ metric_type +"|"+ my_metric_name+ "|"+ tags.join());
            callback(null, "UP!");
        }

        // errorneous response
        else{
            console.log("Error: ",error);
            if(response){
                console.log(response.statusCode);
            }
            metric_value = 0;
            tags = ['websiteCheck:'+metric_value,'websiteCheck'];
            console.log("MONITORING|" +unix_epoch_timeshtamp+ "|" +metric_value+ "|"+ metric_type +"|"+ my_metric_name+ "|"+ tags.join());
            callback(null, "DOWN!");
        }
    });
};

