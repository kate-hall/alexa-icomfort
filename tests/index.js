var iComfort = require("../src/iComfort");
var iComfortSerial = ""; // YOUR APPLIANCE SERIAL HERE! Run Test 1 alone and assign resulting Gateway_SN value

var changeTemperatureTestVars = {
    Away_Mode: 0,
    Central_Zoned_Away: 2,
    ConnectionStatus: 'GOOD',
    Cool_Set_Point: 72,
    DateTime_Mark: '/Date(1483815385897+0000)/',
    Fan_Mode: 0,
    GMT_To_Local: -28800,
    GatewaySN: iComfortSerial,
    Golden_Table_Updated: true,
    Heat_Set_Point: 70,
    Indoor_Humidity: 31,
    Indoor_Temp: 70,
    Operation_Mode: 3,
    Pref_Temp_Units: '0',
    Program_Schedule_Mode: '1',
    Program_Schedule_Selection: 4,
    System_Status: 0,
    Zone_Enabled: 1,
    Zone_Name: 'Zone 1',
    Zone_Number: 0,
    Zones_Installed: 1
};

/* auth defined globally in icomfort */
var getSystemsInfoParams = {UserId: auth.username};
var getInfoParams = {GatewaySN: iComfortSerial, TempUnit: 0};

/* Test 1 = Retrieves appliance ID for later lookups and system name for Alexa device naming */
iComfort.getSystemsInfo(getSystemsInfoParams, auth)
    .then(console.log)
    .catch(console.error);

/* Test 2 = Contains current temperature parameters to overwrite when changing temperature */
iComfort.getThermostatInfoList(getInfoParams, auth)
    .then(console.log)
    .catch(console.error);

/* Test 3 = Returns data on min and max temperatures of your unit, not used in Alexa Skill */
iComfort.getGatewayInfo(getInfoParams, auth)
    .then(console.log)
    .catch(console.error);

/* Test 4 = Careful! This test will change your actual temperature, uncomment to run */
// iComfort.setThermostatInfo(getInfoParams, changeTemperatureTestVars, auth)
//     .then(console.log)
//     .catch(console.error);
