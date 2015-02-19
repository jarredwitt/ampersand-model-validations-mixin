# ampersand-model-validations-mixin
A mixin for adding advanced validations to ampersand-model properties.

This mixin was born out of the need to have more advanced validations performed before an ampersand-model was saved. Wanting to find a DRY way to perform the task I thought of this mixin. This is
still very experimental and will change drastically in the future, hopefully for the better.

I have not put this on npm yet.

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
    //validation def
  }
}
```
Currently there are only 5 types of validations that are possible.

##### Range
```
validations: {
  'age': {
    range: [min,max]//array or number if you only want a min
  }
}
```
The range validation will determine if the value is between a min and a max. If range is just a number instead of an array, then range will be used as a min for the value. A range validation is only possible for model properties that are of type number. Validations are done using <= and >=.

##### Blank
```
validations: {
  'name': {
    allowBlank: false//defaults to true
  }
}
```
The blank validation will determine if a value is blank. It uses the amp-is-empty module so it will work for objects, arrays, strings, and numbers.

##### Email
```
validations: {
  'email': {
    type: 'email'
  }
}
```
The email validation as you may guess, validates an email to make sure that it contains an '@' and a '.' in the value. It is only available for string property types.

##### Values Array
```
validation: {
    'name': {
        values: ['value', 'value2']//values array
    }
}
```
The values validation determines if the value is present in a values array. It works for strings and numbers.

##### Custom Validation
```
validations: {
  'name': {
    type: function(v){
      return v.length < 12;
    },
    msg: 'Some message here'
  }
}
```
Finally, you can have a custom validation. When type is set to a function it is passed the value and expects to get a boolean back. True if valid, false if not. The function is called using the context of the model so access to other properties is possible, but hasn't been tested yet. When using a custom function you can include a msg property to use when the validation fails.

### How to Use
---
Once all validations are set up you just need to call .ensureValid() on the model, preferably before you save. I do have a plan to create a fork of the models save function with something like .ensureValidAndSave() but that isn't in just yet/hasn't been thought out really. The .ensureValid() runs through all validations and returns an array of validation failure objects:
```
[{
  key: 'age',
  msg: 'Failed range validation'
}]
```
The validation failure object includes the key and a message. Hopefully this is helpful so that you don't have to rewrite error messages to display to users.

### Some Thoughts
---
This is my first iteration of this mixin and it will be changing, hopefully to become more streamlined with the way that ampersand-model and state do things. I do not want it to clash with those modules so some naming will probably change in the future, which should be reflected in the changelog. If you have any thoughts, concerns, or issues please feel free to reach out to me via email or by filing an issue. If it's a bug or a feature, please file an issue.