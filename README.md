# ampersand-model-validations-mixin
A mixin for adding advanced validations to ampersand-model properties.

This mixin was born out of the need to have more advanced validations performed before an ampersand-model was saved. Wanting to find a DRY way to perform the task I thought of this mixin.


### SetUp
---
You need to add the mixin to an ampersand-model.
```
var AmpersandModel = require('ampersand-model');
var AmpersandModelValidationsMixin = require('ampersand-model-validations-mixin');

module.exports = AmpersandModel.extend(AmpersandModelValidationsMixin, {
    //model code here.
});
```
Once added the mixin allows you to add a validations object to the model.
```
var AmpersandModel = require('ampersand-model');
var AmpersandModelValidationsMixin = require('ampersand-model-validations-mixin');

module.exports = AmpersandModel.extend(AmpersandModelValidationsMixin, {
    props: {
      'name': 'string',
      'age': 'number',
      'email': 'string'
    },
    validations: {
      ...
    }
});
```
The setup of a validation is similar to that of an ampersand-state property:
```
validations: {
  'prop name': {
    type: 'blank, email, or function',
    msg: 'optional message for validation failure'
  }
}
```

##### Blank
```
validations: {
  'name': {
    type: 'blank',
    msg: 'Property cannot be blank'
  }
}
```
The blank validation will determine if a value is blank. It uses the amp-is-empty module so it will work for objects, arrays, strings, and numbers.

##### Email
```
validations: {
  'email': {
    type: 'email',
    msg: 'Email must be valid'
  }
}
```
The email validation as you may guess, validates an email to make sure that it contains a valid email.

##### Function
```
validations: {
  'name': {
    type: function(v){
      return v.length < 12;
    },
    msg: 'Length was less than 12'
  }
}
```
When type is set to a function it is passed the value and expects to get a boolean back. True if valid, false if not. The function is called using the context of the model so access to other properties is possible, but hasn't been tested yet.

##### Validation Dependencies
A validation can depend on a model's property value as well. If the the dependency value is blank or doesn't match the value needed than the validation is skipped.
```
validations: {
    'email': {
        type: 'email',
        depends: {
            name: 'username',
            value: 'foo'
        }
    }
}
```
The above tells the validation to only run if the value of username === 'foo'. If the value attribute of the depends object is left off then the validation will run only if the property is not empty. You can also depend on properties that are of type object. An example is below
```
validations: {
    'email': {
        type: 'email',
        depends: {
            name: 'group.name',
            value: 'foo'
        }
    }
}
```
The above will only validate if the model contains a property called group with the property name's value === 'foo'. If the value attribute of the depends is left off then the validation will run only if the property is not empty.

##### Alternate Names
You can use the altName property to display an alternate name in the failure messages. This comes in handy if you are looping through the validation errors and displaying a message to the user about the failure.
```
validations: {
    'email': {
        type: 'email',
        altName: 'Email Address'
    }
}
```
The above returns 'Email Address' for the key in the failures array. This relieves you of some of the need to write key transforms to display messages to users.

### How to Use
---
There are two new methods available on the model to validate.
```
var failures = model.ensureValid();
```
.ensureValid() returns an array of validation failure objects.
```
[{
  key: 'age',
  msg: 'Failed blank validation'
}]
```
The validation failure object includes the key and a message. Hopefully this is helpful so that you don't have to rewrite error messages to display to users.

The second method is .ensureValidAndSave(). This method accepts the same arguments as the model.save() but can also have a validationError callback added.
```
model.ensureValidAndSave({}, {
    validationError: function(errors){
    },
    success: ...,
    error: ...
}
```
This method will validate the model and if all validations pass it will call the model's save method for you. If the validations fail it will pass the failure array to the validationError callback. If no callback is present, model.save() is still not called if validations fail.
