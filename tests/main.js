#!/usr/bin/env node
/*jshint expr: true*/

var tape = require('tape');
var AmpersandModel = require('ampersand-model');
var AmpersandModelValidationMixin = require('../ampersand-model-validations-mixin');
var extend = require('amp-extend');
var isEmpty = require('amp-is-empty');
var random = require('amp-random');

var Model;

function reset(){
    var definition = {
        type: 'model',
        props: {
            'name': 'string',
            'age': 'number',
            'email': 'string'
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
    }, Error);

    t.end();
});

test('Test number range validation', function(t){
    var min = 18;
    var max = 25;

    var model = new Model({
        age: random(min, max)
    });

    extend(model, {
        validations: {
            'age':{
                range: [min, max]
            }
        }
    });

    t.deepEqual(model.ensureValid(), []);

    t.end();
});

test('Test number allow zero validation', function(t){
    var model = new Model({
       age: 0
    });

    extend(model, {
        validations: {
            'age':{
                allowBlank: false
            }
        }
    });

    t.equal(model.ensureValid().length, 1);

    t.end();
});

test('Test blank string validation', function(t){
    var model = new Model({
        name: ''
    });

    t.equal(isEmpty(model.name), true);

    extend(model, {
        validations: {
            'name':{
                allowBlank: false
            }
        }
    });

    t.equal(model.ensureValid().length, 1);
    t.end();
});

test('Test email string validation', function(t){
    var model = new Model({
        email: 'email@email.com'
    });

    //t.equal(includes(model.email, '@'), true);

    extend(model, {
        validations: {
            'email': {
                type: 'email'
            }
        }
    });

    t.equal(model.ensureValid().length, 0);

    t.end();
});