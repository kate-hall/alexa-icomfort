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
    TEMPERATURE: {
        type: Number,
        label: 'Temperature',
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
    ZONE_ID: {
        type: String,
        label: 'Zone',
        required: true
    },
    FAN_MODE: {
        type: String,
        label: 'Fan Mode',
        required: true
    },
    PROGRAM_SCHEDULE_MODE: {
        type: String,
        label: 'Program Schedule Mode',
        required: true
    },
    PROGRAM_SCHEDULE_ID: {
        type: String,
        label: 'Program Schedule',
        required: true
    },
    OPERATION_MODE: {
        type: String,
        label: 'Operation Mode',
        required: true
    },
};