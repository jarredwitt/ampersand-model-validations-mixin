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
If the property is an object then just use 'property.name' for the key of the validations object. Currently there are only 5 types of validations that are possible.

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

##### Validation Dependencies
A validation can depend on a model's property value as well. If the the dependency value is blank or doesn't match the value needed than the validation is skipped.
```
validations: {
    'email': {
        type: 'email',
        depends: {
            name: 'username',
            value: 'thehammer'
        }
    }
}
```
The above tells the validation to only run if the value of username === 'thehammer'. If the value attribute of the depends object is left off then the validation run only if the property is not empty. You can also depend on properties that are of type object. An example is below
```
validations: {
    'email': {
        type: 'email',
        depends: {
            name: 'group.name',
            value: 'thehammers'
        }
    }
}
```
The above will only validate if the model contains a property called group with the property name's value === 'thehammers'. If the value attribute of the depends is left off then the validation runs only if the property is not empty.

### How to Use
---
There are two new methods available on the model to validate.
```
var failures = model.ensureValidate();
```
.ensureValidate() returns an array of validation failure objects.
```
[{
  key: 'age',
  msg: 'Failed range validation'
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

### Some Thoughts
---
This is my first iteration of this mixin and it will be changing, hopefully to become more streamlined with the way that ampersand-model and state do things. I do not want it to clash with those modules so some naming will probably change in the future, which should be reflected in the changelog. If you have any thoughts, concerns, or issues please feel free to reach out to me via email or by filing an issue. If it's a bug or a feature, please file an issue.