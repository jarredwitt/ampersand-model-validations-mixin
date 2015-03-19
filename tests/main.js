#!/usr/bin/env node
/*jshint expr: true*/

var tape = require('tape');
var AmpersandModel = require('ampersand-model');
var AmpersandModelValidationMixin = require('../ampersand-model-validations-mixin');
var extend = require('amp-extend');

var Model;

function reset(){
    var definition = {
        type: 'model',
        props: {
            'name': 'string',
            'age': 'number',
            'email': 'string',
			'parents': 'object'
        }
    };

    Model = AmpersandModel.extend(AmpersandModelValidationMixin, definition);
}

// wrap test so we always run reset first
var test = function () {
    reset();
    tape.apply(tape, arguments);
};
test.only = function () {
    reset();
    tape.only.apply(tape, arguments);
};

test('Make sure error is thrown if validation with no definition is used', function(t){
    var model = new Model({
        age: 18
    });

    extend(model, {
        validations: {
            'age': {

			}
        }
    });

    t.throws(function(){
        model.ensureValid();
    }, Error, 'Throws error on empty validation definition');
    t.end();
});

test('Test blank validation for string or zero for number', function(t){
    var model = new Model({
        name: 'Steve',
        age: 50
    });

    extend(model, {
        validations: {
            name: {
                type: 'blank',
                msg: 'Name cannot be empty'
            },
            age: {
                type: 'blank',
                msg: 'Age cannot be empty or zero'
            }
        }
    });

    t.equal(model.ensureValid().length, 0, 'Make sure non-blank values pass');

    model.name = '';
    model.age = 0;

    t.equal(model.ensureValid().length, 2, 'Blank values are not allowed');
    t.end();
});

test('Test email string validation', function(t){
    var model = new Model({
        email: 'email@email.com'
    });

    extend(model, {
        validations: {
            email: {
                type: 'email',
                msg: 'Email must be a valid email'
            }
        }
    });

    t.equal(model.ensureValid().length, 0, 'Make sure valid emails pass');

    model.email = 'emailemail.com';

    t.equal(model.ensureValid().length, 1, 'Invalid email does not pass');
    t.end();
});

test('Test array of validations for property', function(t){
    var model = new Model({
        email: 'email@email.com'
    });

    extend(model, {
        validations: {
            email: [{
                type: 'blank',
                msg: 'Email cannot be blank'
            },{
                type: 'email',
                msg: 'Email must be a valid email'
            }]
        }
    });

    t.equal(model.ensureValid().length, 0, 'Make sure valid values pass');

    model.email = 'emailemail.com';

    t.equal(model.ensureValid().length, 1, 'Invalid email was not allowed');

    model.email = '';

    t.equal(model.ensureValid().length, 2, 'Blank value and invalid email not allowed');
    t.end();
});

test('Test custom function for type', function(t){
    var model = new Model({
        name: 'foo'
    });

    extend(model, {
        validations: {
            'name': {
                type: function(v){
                    return v === 'bar';
                },
                msg: 'Value does not equal bar'
            }
        }
    });

    t.equal(model.ensureValid().length, 1, 'Value does not equal bar');
    t.end();
});

test('Test dependency on other property being not empty', function(t){
	var model = new Model({
		name: '',
		email: 'email@email.com'
	});

	extend(model, {
		validations: {
			email: {
				type:'email',
				depends: {
					name: 'name'
				}
			}
		}
	});

	var fails = model.ensureValid();
	t.equal(fails.length, 0, 'Validation was never called since dependency was empty');

	t.end();
});

test('Test dependency on other properties value', function(t){
	var model = new Model({
		name: 'jim',
		email: 'emailemail.com'
	});

	extend(model, {
		validations: {
			email: {
				type:'email',
				depends: {
					name: 'name',
					value: 'jim'
				}
			}
		}
	});

	var fails = model.ensureValid();
	t.equal(fails[0].key, 'email', fails[0].msg);

	t.end();
});

test('Test dependency on other property when property is object', function(t){
	var model = new Model({
		name: 'jim',
		email: 'emailemail.com',
		parents: {
			dad: 'pete',
			mom: 'stacy'
		}
	});

	extend(model, {
		validations: {
			email: {
				type:'email',
				depends: {
					name: 'parents.dad',
					value: 'pete'
				}
			}
		}
	});

	var fails = model.ensureValid();
	t.equal(fails[0].key, 'email', fails[0].msg);

	t.end();
});

/*test('Test ensureValidAndSave method', function(t){
	var model = new Model({
		name: 'jim'
	});

	extend(model, {
		validations: {
			'name': {
				values: ['bill', 'jack', 'steve']
			}
		}
	});

	model.ensureValidAndSave({},{
		validationError: function(errors){
			t.test('validationError function was called', function(){
				t.equal(errors[0].key, 'name', errors[0].msg);
				t.end();
			});
		}
	});
});*/

test('Test validation on property of type object', function(t){
	var model = new Model({
		parents: {
			email: 'emailemail.com'
		}
	});

	extend(model, {
		validations: {
			'parents.email': {
				type: 'email'
			}
		}
	});

	var fails = model.ensureValid();
	t.equal(fails[0].key, 'parents.email', fails[0].msg);

	t.end();
});

test('Test ability to use an alternate name for the validation messages', function(t){
    var model = new Model({
        name: '',
        email: 'emailemail.com'
    });

    extend(model, {
        validations: {
            email: {
                type: 'email',
                altName: 'Email Address'
            }
        }
    });

    var fails = model.ensureValid();
    t.equal(fails[0].key, 'Email Address', 'Alternate was used in validation failures.');

    t.end();
});