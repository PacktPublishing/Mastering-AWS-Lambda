const LambdaTester = require( 'lambda-tester' );
var expect = require('chai').expect;
const myHandler = require( '../code/calculator' ).handler;

describe( 'myHandler', function() {

	context('Positive Test Case', function(){
		it( 'test success', function() {

			return LambdaTester( myHandler )
				.event( { num1: 3,
					num2: 2,
					operand: "+" } )
				.expectResult(function( result ) {
	                expect( result ).to.equal( 5 );
	            });
		});
	});
	
	context('Negative Test Case - Invalid Numbers', function(){
		it( 'test failure', function() {

			return LambdaTester( myHandler )
				.event( { num1: 'num1',
					num2: 2,
					operand: "+" } )
				.expectError(function( err ) {
	                expect( err.message ).to.equal( 'Invalid Numbers!' );
	            });
		});
	});

	context('Negative Test Case - Zero Divisor', function(){
		it( 'test failure', function() {

			return LambdaTester( myHandler )
				.event( { num1: 2,
					num2: 0,
					operand: "/" } )
				.expectError(function( err ) {
	                expect( err.message ).to.equal( 'The divisor cannot be 0' );
	            });
		});
	});

	context('Negative Test Case - Invalid Operand', function(){
		it( 'test failure', function() {

			return LambdaTester( myHandler )
				.event( { num1: 2,
					num2: 0,
					operand: "=" } )
				.expectError(function( err ) {
	                expect( err.message ).to.equal( 'Invalid Operand' );
	            });
		});
	});
});
