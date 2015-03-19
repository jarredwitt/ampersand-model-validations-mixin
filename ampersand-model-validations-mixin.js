var bind = require('amp-bind');
var each = require('amp-each');
var has = require('amp-has');
var includes = require('amp-includes');
var indexOf = require('amp-index-of');
var isArray = require('amp-is-array');
var isEmpty = require('amp-is-empty');
var isFunction = require('amp-is-function');
var isString = require('amp-is-string');

module.exports = {
    _validationFails: undefined,
    ensureValid: function(){
        this._validationFails = [];

        each(this.validations, bind(function(def, key){
            //check to see if we have an empty def object
			if(isEmpty(def)){
				throw 'No definition was passed in. Remove validation if it\'s not required';
			}

            if(isArray(def) === true){
                each(def, bind(function(d){
                    d.key = key;
                    _processValidation.call(this, d);
                }, this))
            }
            else{
                def.key = key;
                _processValidation.call(this, def);
            }

		}, this));

		return this._validationFails;
    },

	ensureValidAndSave: function(key, val, options) {
        var attrs;

        // Handle both `"key", value` and `{key: value}` -style arguments.
        if (key === null || typeof key === 'object') {
            attrs = key;
            options = val;
        } else {
            (attrs = {})[key] = val;
        }

        var validationError = options.validationError || function () {};

        this.ensureValid();
        if (this._validationFails.length > 0) {
            validationError.call(this, this._validationFails);
        }
        else {
            this.save.call(this, key, val, options);
        }
    }
};

function _processValidation(def){
    //check for dependecy object and if it contains a value.
    if(has(def, 'depends')){
        var dependAttr;
        if(includes(def.depends.name, '.')){
            var dependsValueArray = def.depends.name.split('.');
            dependAttr = this.attributes[dependsValueArray[0]][dependsValueArray[1]];
            if(isEmpty(dependAttr)){
                return;
            }
        }
        else{
            dependAttr = this.attributes[def.depends.name];
        }

        if(has(def.depends, 'value')){
            if(dependAttr !== def.depends.value){
                return;
            }
        }
        else{
            if(isEmpty(dependAttr) === true){
                return;
            }
        }
    }

    //get the value for the key.
    if(includes(def.key, '.')){
        var valueArray = def.key.split('.');
        def.attrValue = this.attributes[valueArray[0]][valueArray[1]];
    }
    else{
        def.attrValue = this.attributes[def.key];
    }

    def.attrType = typeof def.attrValue;

    //run the validation
    var validationType = typeof def.type === 'string'? def.type : typeof def.type;
    switch(validationType){
        case 'blank':{
            def.result = _validateIsNotBlank.call(this, def);
            break;
        }
        case 'email':{
            def.result = _validateIsEmail.call(this, def);
            break;
        }
        case 'function':{
            def.result = def.type.call(this, def.attrValue);
            break;
        }
    }

    //process the validation
    if(def.result === false || def.result === -1){
        this._validationFails.push({
            key: def.altName || def.key,
            msg: def.msg || 'Did not pass validation'
        });
    }
}

//Validates blank values using amp-is-empty.
function _validateIsNotBlank(def){
    return !isEmpty(def.attrValue);
}

//Validates email types using regex.
function _validateIsEmail(def){
    var emailRegEx = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/i;

    return emailRegEx.test(def.attrValue);
}
