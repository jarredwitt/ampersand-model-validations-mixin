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
			'child': 'object'
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

    t.equal(model.ensureValid().length, 0, 'Ensure non-blank values pass');

    model.name = '';
    model.age = 0;

    t.equal(model.ensureValid().length, 2, 'Ensure blank values do not pass');
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

    t.equal(model.ensureValid().length, 0, 'Ensure valid emails pass');

    model.email = 'emailemail.com';

    t.equal(model.ensureValid().length, 1, 'Ensure invalid emails do not pass');
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

    t.equal(model.ensureValid().length, 0, 'Ensure non-blank values pass');

    model.email = 'emailemail.com';

    t.equal(model.ensureValid().length, 1, 'Ensure invalid emails do not pass');

    model.email = '';

    t.equal(model.ensureValid().length, 2, 'Ensure that blank email does not pass');
    t.end();
});

test('Test custom function for type', function(t){
    var model = new Model({
        name: 'foo'
    });

    var msg = 'Ensure value does not equal bar';

    extend(model, {
        validations: {
            'name': {
                type: function(v){
                    return v === 'bar';
                },
                msg: msg
            }
        }
    });

    t.equal(model.ensureValid().length, 1, msg);
    t.end();
});

test('Test dependency on other property being not empty', function(t){
	var model = new Model({
		name: '',
		email: 'emailemail.com'
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
	t.equal(fails.length, 0, 'Ensure validation was never called for blank dependency');

    model.name = 'Foo';

    var fails2 = model.ensureValid();
    t.equal(fails2.length, 1, 'Ensure validation was called when dependency is not blank');

	t.end();
});

test('Test dependency on other properties value', function(t){
	var model = new Model({
		name: 'foo',
		email: 'emailemail.com'
	});

	extend(model, {
		validations: {
			email: {
				type:'email',
				depends: {
					name: 'name',
					value: 'bar'
				},
                msg: 'Email must be valid'
			}
		}
	});

	var fails = model.ensureValid();
	t.equal(fails.length, 0, 'Ensure validation was never called when dependency value does not match');

    model.name = 'bar';

    var fails2 = model.ensureValid();
    t.equal(fails2.length, 1, 'Ensure validation was called when dependency value does match');

	t.end();
});

test('Test dependency on other property when property is object', function(t){
	var model = new Model({
		name: 'foo',
		email: 'emailemail.com',
		child: {
			name: 'bar'
		}
	});

	extend(model, {
		validations: {
			email: {
				type:'email',
				depends: {
					name: 'child.name',
					value: 'foo'
				}
			}
		}
	});

	var fails = model.ensureValid();
	t.equal(fails.length, 0, 'Ensure validation was not called when dependency object value does not match');

    model.child.name = 'foo';

    var fails2 = model.ensureValid();
    t.equal(fails2.length, 1, 'Ensure validation was called when dependency object valude does match');

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
		child: {
			email: 'email@email.com'
		}
	});

	extend(model, {
		validations: {
			'child.email': {
				type: 'email'
			}
		}
	});

	var fails = model.ensureValid();
	t.equal(fails.length, 0, 'Ensure valid values pass');

    model.child.email = 'notemail';

    var fails2 = model.ensureValid();
    t.equal(fails2.length, 1, 'Ensure non valid values do not pass');

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
    t.equal(fails[0].key, 'Email Address', 'Ensure alternate name was used in validation failures.');

    t.end();
});