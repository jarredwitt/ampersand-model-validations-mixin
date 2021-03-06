#v0.0.1
 - Initial commit.
 - Added range, blank, and email validators.
 - Created test cases.

#v0.0.2
 - Created custom validator.
 - Updated test cases.
 - Updated readme.

#v0.1.0
 - Created values array validator.
 - Updated test cases.
 - Updated readme.
 - Started trying to follow semver.

#v0.2.0
 - Created new method .ensureValidAndSave() which validates the model and then calls the model's save method if validations passed.
 - Added the ability to place a dependency on another property being not empty or it's value. Property can even be an object property.
 - Updated test cases.

#v0.3.0
 - Added ability to validate object properties.
 - Updated test cases.
 - Updated readme.

#v0.3.1
 - Fixed readme typo.

#v0.3.2
 - Fixed issue where validation was half way running even when a dependency was empty.

#v0.4.0
 - Added ability to use the altName property to provide an alternate name for failure messages.

#v0.5.0
 - Added ability to use the msg property to provide custom messages
 - Updated tests
 - Updated readme
 
#v1.0.0
 - refactored API to be easier to use
 - Added in ability to use array of validations for single property
 - Added in ability to include custom message for all validations
 - Updated tests
 - Updated readme
