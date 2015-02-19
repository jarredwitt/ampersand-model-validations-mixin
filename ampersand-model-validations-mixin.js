var bind = require('amp-bind');
var each = require('amp-each');
var has = require('amp-has');
var includes = require('amp-includes');
var isArray = require('amp-is-array');
var isEmpty = require('amp-is-empty');
var isFunction = require('amp-is-function');
var isString = require('amp-is-string');

module.exports = {
    _validationFails: undefined,
    ensureValid: function(){
        this._validationFails = [];

        var validations = this.validations;
        var attributes = this.attributes;

        each(validations, bind(function(value, key){
            var attrValue = attributes[key];
            var attrType = typeof attrValue;

            var def = validations[key];

            if(isEmpty(def)){
                throw 'No definition was passed in. Remove validation if it\'s not required';
            }

            this._validateGeneral(key, attrValue, def);

            switch(attrType) {
                case 'number':
                    this._validateNumberType(key, attrValue, def);
                    break;
            }
        }, this));

        return this._validationFails;
    },

    _validateGeneral: function(key, value, def){
        var result;
        if(has(def, 'allowBlank') && def.allowBlank === false){
            result = !isEmpty(value);
            this._processValidation(key, result, 'Empty value or zero is not allowed.');
        }
        if(has(def, 'type')){
            if(isString(def.type)){
				result = this._validateType(key, value, def.type);
				this._processValidation(key, result, 'Failed validation for type ' + def.type);
			}
			if(isFunction(def.type)) {
				result = def.type.call(this, value);
				this._processValidation(key, result, def.msg);
			}
        }
    },

    _validateType: function(key, value, type){
        switch(type){
            case 'email': {
                return includes(value, '@') && includes(value, '.');
            }
        }
    },

    _validateNumberType: function(key, value, def){
        var result;
        if(has(def, 'range')){
            result = this._validateNumberRange(def.range, value);
            this._processValidation(key, result, 'Value failed range validation');
        }
    },

    _validateNumberRange: function(range, value){
        var min, max;

        if(range && isArray(range)){
            min = range[0];
            max = range[1];
        }
        else{
            min = range;
        }

        if(max){
            return (value <= max && value >= min);
        }
        else{
            return value >= min;
        }
    },

    _processValidation: function(key, value, msg){
        if(value === false){
            this._validationFails.push({
                key: key,
                msg: msg || 'Did not pass validation'
            });
        }
        else{
            return true;
        }
    }
};