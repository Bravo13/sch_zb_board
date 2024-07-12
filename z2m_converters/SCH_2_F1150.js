const {forcePowerSource} = require('zigbee-herdsman-converters/lib/modernExtend');
const fz = require('zigbee-herdsman-converters/converters/fromZigbee');
const tz = require('zigbee-herdsman-converters/converters/toZigbee');
const e = require('zigbee-herdsman-converters/lib/exposes');
const {batteryVoltageToPercentage} = require('zigbee-herdsman-converters/lib/utils');

const battery_voltage = {
    cluster: 'genAnalogInput',
    type: ['attributeReport', 'readResponse'],
    convert: (model, msg, publish, options, meta) => {
        let payload = {};
        payload.voltage = msg.data['presentValue'] * 1000;
        payload.battery = batteryVoltageToPercentage(payload.voltage, '3V_2100');
        return payload;
    }
}

const definition = {
    zigbeeModel: ['SCH_2_F1150'],
    model: 'SCH_2_F1150',
    vendor: 'Bravo13',
    description: 'Board for SCHNEIDER Sedna F1150 wall switch (SDD11x102, where x is from 1 to 5, I think)',
    fromZigbee:[fz.ptvo_multistate_action, fz.linkquality_from_basic, battery_voltage],
    toZigbee:[],

    extend: [forcePowerSource({powerSource: 'Battery'})],

    exposes: function(device, options){
        let myE = [];

        myE.push(e.presets.action(['single', 'double', 'triple', 'hold', 'release']));
        myE.push(e.presets.linkquality());

        myE.push(
            e.presets.battery_voltage()
        );
        return myE;
    },

    endpoint: (device) => {
        return {l1: 1, button_1: 2, button_2: 3};
    },
    meta: {"multiEndpoint":true},
};

module.exports = definition;