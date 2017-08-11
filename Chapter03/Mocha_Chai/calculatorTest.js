var expect = require('chai').expect;
var myLambda = require('../lib/calculator');
var retError, retValue ;

describe('myLambda',function(){

	context('Positive Test Case', function(){
		before('Calling myLambda function', function(done){
			var event = {
				num1: 3,
				num2: 2,
				operand: "+"
			};
			var context= {
				functionName: "calculator"
			};


		  myLambda.handler(event, context, function (err, value) {
		    retError = err ;
		    retValue = value ;
		    done();
		  });
		});

		it('Check that error is not returned from myLambda',function(){
		  expect(retError).to.be.a('null');
		});

		it('Check value returned from myLambda',function(){
		  expect(retValue).to.equal(5);
		});
	});

	context('Negative Test Case - Invalid Numbers', function(){
		before('Calling myLambda function', function(done){
		  var event = {
				num1: "num",
				num2: 2,
				operand: "div"
			};
			var context= {
				functionName: "calculator"
			};

		  myLambda.handler(event, context, function (err, value) {
		    retError = err ;
		    retValue = value ;
		    done();
		  });
		});

		it('Check that error is returned from myLambda',function(){
		  //var retErrorString = retError.toString();
		  expect(retError).to.equal("Invalid Numbers!");
		});

		it('Check value returned from myLambda is undefined',function(){
		  expect(retValue).to.be.an('undefined');
		});
	});

	context('Negative Test Case - Zero Divisor', function(){
		before('Calling myLambda function', function(done){
		  var event = {
				num1: 2,
				num2: 0,
				operand: "div"
			};
			var context= {
				functionName: "calculator"
			};

		  myLambda.handler(event, context, function (err, value) {
		    retError = err ;
		    retValue = value ;
		    done();
		  });
		});

		it('Check that error is returned from myLambda',function(){
		  //var retErrorString = retError.toString();
		  expect(retError).to.equal("The divisor cannot be 0");
		});

		it('Check value returned from myLambda is undefined',function(){
		  expect(retValue).to.be.an('undefined');
		});
	});

	context('Negative Test Case - Invalid Operand', function(){
		before('Calling myLambda function', function(done){
		  var event = {
				num1: 2,
				num2: 0,
				operand: "="
			};
			var context= {
				functionName: "calculator"
			};

		  myLambda.handler(event, context, function (err, value) {
		    retError = err ;
		    retValue = value ;
		    done();
		  });
		});

		it('Check that error is returned from myLambda',function(){
		  //var retErrorString = retError.toString();
		  expect(retError).to.equal("Invalid Operand");
		});

		it('Check value returned from myLambda is undefined',function(){
		  expect(retValue).to.be.an('undefined');
		});
	});

});
