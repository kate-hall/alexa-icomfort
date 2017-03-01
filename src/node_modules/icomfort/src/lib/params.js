'use strict';

module.exports = {
    CANCEL_AWAY_FLAG: {
        type: Number,
        label: 'Cancel Away Flag',
        required: true,
        enum: {
            UNKNOWN1: -1,
        }
    },
    GATEWAY_SERIAL_NUMBER: {
        type: String,
        label: 'Gateway (Thermostat) Serial Number',
        required: true
    },
    LANGUAGE_NBR: {
        type: String,
        label: '???Language Flag',
        required: true,
        enum: {
            ENGLISH: 0
        }
    },
    NAME: {
        type: String,
        label: '???Name',
        required: true,
        enum: {
            ALL: 'all'
        }
    },
    TEMPERATURE_UNIT: {
        type: Number,
        label: 'Temperature Unit',
        required: true,
        enum: {
            FAHRENHEIT: 0,
            CELSIUS: 1
        }
    },
    USER_ID: {
        type: String,
        label: 'Username',
        required: true
    },
};