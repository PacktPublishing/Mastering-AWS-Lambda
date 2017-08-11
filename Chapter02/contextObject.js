/*
Where to find the working example -
CAS MUMBAI ACC - North Virginia
context_example lambda function

The Context Object

The context object is primarily used to get some context about your lambda function.
Often people get confused between using context.succeed() or context.fail() or context.done()
these three methods were used for the previous node version on lambda - v0.10.42
Since Lambda has moved to the newer version v4.3 - callback() is supported and is recommended for usage.


Coming back to context object- 
COntext obj can be used to get info about your lambda func like what is the lambda func's name,
which log grp is being used, how much time is remaining etc.

Here is a simple eg to demonstrate the same -*/

// *************************************	 CODE 	 ************************************************

exports.handler = (event, context, callback) => {
    // TODO implement
    console.log("Hello, Starting Lambda Function");
    console.log("We are going to learn about context object and its usage");
    
    console.log('value1 =', event.key1);
    console.log('value2 =', event.key2);
    console.log('value3 =', event.key3);
    console.log('remaining time =', context.getRemainingTimeInMillis());
    console.log('functionName =', context.functionName);
    console.log('AWSrequestID =', context.awsRequestId);
    console.log('logGroupName =', context.logGroupName);
    console.log('logStreamName =', context.logStreamName);
    
    switch (event.contextCallbackOption) {
    case "no":
        setTimeout(function(){
            console.log("I am back from my timeout of one minute!!");
        },60000);   // one minute break
        break;
    case "yes":
        console.log("If the context.callbackWaitsForEmptyEventLoop is set to false then callback won't wait for the setTimeout");
        setTimeout(function(){
            console.log("I am back from my timeout of one minute!!");
        },60000);   // one minute break
        context.callbackWaitsForEmptyEventLoop = false;
        break;
    default:
        console.log("The Default code block");
       
    }
    
    callback(null, 'Hello from Lambda');	// sent to the caller, since its a RequestResponse invocation, it will be printed in
    										// the Execution Logs below on the screen (Not CloudWatch logs)
};


