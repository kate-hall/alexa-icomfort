# icomfort-js
A client for the Lennox iComfort services implemented in JavaScript.

Currently this module works natively in Node.js. Using a tool such as [browserify](http://browserify.org/) it could be used in modern web browsers.

## API

All methods of the iComfortClient return promises as they communicate asynchronously with the Lennox iComfort servers via HTTP.

Before calling any of the below methods, the client must be instantiated with valid credentials.

```javascript
const icomfort = iComfortClient({username: 'valid username', password: 'supersecret'});
// or
const icomfort = new iComfortClient({username: 'valid username', password: 'supersecret'});
```

* [getBuildingsInfo](#getbuildingsinfoparams)
* [getGatewayInfo](#getgatewayinfoparams)
* [getGatewaysAlerts](#getgatewaysalertsparams)
* [getSystemsInfo](#getsystemsinfoparams)
* [getThermostatInfoList](#getthermostatinfolistparams)
* [getThermostatLookupInfo](#getthermostatlookupinfoparams)
* [getThermostatScheduleInfo](#getthermostatscheduleinfoparams)
* [validateUser](#validateuserdata)
* [setThermostatInfo](#setthermostatinfodata)

### getBuildingsInfo(params)

Retrieves information about the buildings associated with your my iComfort account.

`params` - *Object*:

* `UserId` - A valid iComfort username.

#### Example Response

```json
{
  "Buildings": [
    {
      "Addr1": "123 Main",
      "Addr2": "Apt Z",
      "Age_of_Building": 99,
      "BuildingAlert": true,
      "BuildingID": 999999,
      "BuildingReminder": true,
      "BuildingSize": 9,
      "BuildingStyle": 9,
      "Building_Name": "My house",
      "City": "Anytown",
      "Country": "US",
      "DealerAlerts_DlrWants": false,
      "DealerAlerts_OwnerAllow": false,
      "DealerID": 999999,
      "DealerReminder_DlrWants": false,
      "DealerReminder_OwnerAllow": false,
      "DealerTStatView": false,
      "DefaultBuilding": true,
      "Latitude": 32.981704,
      "Longitude": -96.760218,
      "NotificationEmail": "",
      "Number_of_Bedrooms": 9,
      "Number_of_Floors": 9,
      "Number_of_Occupants": 9,
      "St_Prov": "ZZ",
      "UserID": null,
      "UtilityCompany": "Nationwide Gas Co",
      "ZIP_PC": "99999"
    }
  ],
  "ReturnStatus": "SUCCESS"
}
```


### getGatewayInfo(params)
Retrieves information about a gateway (thermostat) associated with your account.

`params` - *Object*:

* `GatewaySN` - The serial number of a gateway associated with your account. It can be discovered using the `getSystemsInfo` method.
* `TempUnit` - A integer which indicates which temperature units to use to represent values from the gateway. The value __0__ Corresponds to F (farenheit) and __1__ to C (celsius).

#### Example Response

```json
{
  "Cool_Set_Point_High_Limit": 99,
  "Cool_Set_Point_Low_Limit": 60,
  "Daylight_Savings_Time": 1,
  "Heat_Cool_Dead_Band": 3,
  "Heat_Set_Point_High_Limit": 90,
  "Heat_Set_Point_Low_Limit": 40,
  "Pref_Language_Nbr": 0,
  "Pref_Temp_Unit": "0",
  "ReturnStatus": "SUCCESS",
  "SystemID": "999998"
}
```


### getGatewaysAlerts(params)
Retrieves a list of alerts associated with a gateway.

`params` - *Object*:

* `gatewaysn` - The serial number of a gateway associated with your account. It can be discovered using the `getSystemsInfo` method.

#### Example Response

```json
{
  "Alerts": [],
  "ReturnStatus": "SUCCESS"
}
```


### getSystemsInfo(params)
Retrieves information about systems associated with your account.

`params` - *Object*:

* `UserId` - A valid iComfort username.

#### Example Response

```json
{
  "ReturnStatus": "SUCCESS",
  "Systems": [
    {
      "BuildingID": 999999,
      "Firmware_Ver": "02.13.0240",
      "Gateway_SN": "WS99C99999",
      "RegistrationCompleteFlag": false,
      "Status": "GOOD",
      "SystemID": 999998,
      "System_Name": "My main thermostat"
    }
  ]
}
```


### getThermostatInfoList(params)
Lists information for thermostats for an account.

`params` - *Object*:

* `Cancel_Away` - 'Cancel away flag'? Unknown use. Set value to __-1__.
* `GatewaySN` - The serial number of a gateway associated with your account. It can be discovered using the `getSystemsInfo` method.
* `TempUnit` - A integer which indicates which temperature units to use to represent values from the gateway. The value __0__ Corresponds to F (farenheit) and __1__ to C (celsius).

#### Example Response

```json
{
  "ReturnStatus": "SUCCESS",
  "tStatInfo": [
    {
      "Away_Mode": 0,
      "Central_Zoned_Away": 2,
      "ConnectionStatus": "GOOD",
      "Cool_Set_Point": 85,
      "DateTime_Mark": "/Date(1487093681823+0000)/",
      "Fan_Mode": 0,
      "GMT_To_Local": -25200,
      "GatewaySN": "WS99C99999",
      "Golden_Table_Updated": true,
      "Heat_Set_Point": 73,
      "Indoor_Humidity": 31,
      "Indoor_Temp": 73,
      "Operation_Mode": 3,
      "Pref_Temp_Units": "0",
      "Program_Schedule_Mode": "1",
      "Program_Schedule_Selection": 1,
      "System_Status": 0,
      "Zone_Enabled": 1,
      "Zone_Name": "Zone 1",
      "Zone_Number": 0,
      "Zones_Installed": 1
    }
  ]
}
```


### getThermostatLookupInfo(params)
Retrieves list of different parameters possible for a gateway (thermostat).

`params` - *Object*:

* `gatewaysn` - The serial number of a gateway associated with your account. It can be discovered using the `getSystemsInfo` method.
* `name` - 'Name'? Unknown use. Set value to '__all__'.

#### Example Response

```json
{
  "ReturnStatus": "SUCCESS",
  "tStatlookupInfo": [
    {
      "Lang_Nbr": 0,
      "ReturnStatus": "SUCCESS",
      "description": "cool only",
      "name": "Operation_mode",
      "sort_order": 0,
      "value": 2
    },
    {
      "Lang_Nbr": 0,
      "ReturnStatus": "SUCCESS",
      "description": "on",
      "name": "Fan_mode",
      "sort_order": 0,
      "value": 1
    },
    {
      "Lang_Nbr": 0,
      "ReturnStatus": "SUCCESS",
      "description": "Keep Standard Time",
      "name": "Daylight_savings",
      "sort_order": 1,
      "value": 0
    },
    {
      "Lang_Nbr": 0,
      "ReturnStatus": "SUCCESS",
      "description": "auto",
      "name": "Fan_mode",
      "sort_order": 1,
      "value": 0
    },
    {
      "Lang_Nbr": 0,
      "ReturnStatus": "SUCCESS",
      "description": "Contact Me",
      "name": "MessageType",
      "sort_order": 1,
      "value": 0
    },
    {
      "Lang_Nbr": 0,
      "ReturnStatus": "SUCCESS",
      "description": "heat only",
      "name": "Operation_mode",
      "sort_order": 1,
      "value": 1
    },
    {
      "Lang_Nbr": 0,
      "ReturnStatus": "SUCCESS",
      "description": "idle",
      "name": "System_status",
      "sort_order": 1,
      "value": 0
    },
    {
      "Lang_Nbr": 0,
      "ReturnStatus": "SUCCESS",
      "description": "",
      "name": "Fahrenheit",
      "sort_order": 1,
      "value": 0
    },
    {
      "Lang_Nbr": 0,
      "ReturnStatus": "SUCCESS",
      "description": "",
      "name": "Celcius",
      "sort_order": 2,
      "value": 1
    },
    {
      "Lang_Nbr": 0,
      "ReturnStatus": "SUCCESS",
      "description": "heating",
      "name": "System_status",
      "sort_order": 2,
      "value": 1
    },
    {
      "Lang_Nbr": 0,
      "ReturnStatus": "SUCCESS",
      "description": "heat or cool",
      "name": "Operation_mode",
      "sort_order": 2,
      "value": 3
    },
    {
      "Lang_Nbr": 0,
      "ReturnStatus": "SUCCESS",
      "description": "Need Service",
      "name": "MessageType",
      "sort_order": 2,
      "value": 1
    },
    {
      "Lang_Nbr": 0,
      "ReturnStatus": "SUCCESS",
      "description": "Observe Daylight Savings Time",
      "name": "Daylight_savings",
      "sort_order": 2,
      "value": 1
    },
    {
      "Lang_Nbr": 0,
      "ReturnStatus": "SUCCESS",
      "description": "circulate",
      "name": "Fan_mode",
      "sort_order": 3,
      "value": 2
    },
    {
      "Lang_Nbr": 0,
      "ReturnStatus": "SUCCESS",
      "description": "Need Information on Products",
      "name": "MessageType",
      "sort_order": 3,
      "value": 2
    },
    {
      "Lang_Nbr": 0,
      "ReturnStatus": "SUCCESS",
      "description": "off",
      "name": "Operation_mode",
      "sort_order": 3,
      "value": 0
    },
    {
      "Lang_Nbr": 0,
      "ReturnStatus": "SUCCESS",
      "description": "cooling",
      "name": "System_status",
      "sort_order": 3,
      "value": 2
    },
    {
      "Lang_Nbr": 0,
      "ReturnStatus": "SUCCESS",
      "description": "waiting",
      "name": "System_status",
      "sort_order": 4,
      "value": 3
    },
    {
      "Lang_Nbr": 0,
      "ReturnStatus": "SUCCESS",
      "description": "Unit Not Working",
      "name": "MessageType",
      "sort_order": 4,
      "value": 3
    },
    {
      "Lang_Nbr": 0,
      "ReturnStatus": "SUCCESS",
      "description": "Other",
      "name": "MessageType",
      "sort_order": 5,
      "value": 4
    },
    {
      "Lang_Nbr": 0,
      "ReturnStatus": "SUCCESS",
      "description": "emergency heat",
      "name": "System_status",
      "sort_order": 5,
      "value": 4
    }
  ]
}
```


### getThermostatScheduleInfo(params)
Retrieves a list of schedules for a given thermostat.

`params` - *Object*:

* `gatewaysn` - The serial number of a gateway associated with your account. It can be discovered using the `getSystemsInfo` method.

#### Example Response

```json
{
  "ReturnStatus": "SUCCESS",
  "tStatScheduleInfo": [
    {
      "Schedule_Name": "summer",
      "Schedule_Number": 0
    },
    {
      "Schedule_Name": "winter",
      "Schedule_Number": 1
    },
    {
      "Schedule_Name": "spring fall",
      "Schedule_Number": 2
    },
    {
      "Schedule_Name": "save energy",
      "Schedule_Number": 3
    },
    {
      "Schedule_Name": "custom",
      "Schedule_Number": 4
    }
  ]
}
```


### validateUser(data)
Validates a user account information.

`data` - *Object*:

* `UserName` - A valid iComfort username.

#### Example Response

```json
{
  "msg_code": "SUCCESS",
  "msg_desc": "Success"
}
```


### setThermostatInfo(data)
Updates operating parameters for a thermostat. Can be used to set temperatures.

This method requires various properties in its data payload. The best way to use this method is to first get the current thermostat info using the `getThermostatInfoList` method. Then modify properties as needed and use the updated status object as the payload for this method.

`data` - *Object*:

* `Cool_Set_Point` - Maximum temperature before thermostat activates cooling.
* `Heat_Set_Point` - Minimum temperature before thermostat activates heating.
* `Pref_Temp_Units` - A integer which indicates which temperature units to use to represent values from the gateway. The value __0__ Corresponds to F (farenheit) and __1__ to C (celsius).

#### Example

```javascript
const icomfort = new iComfortClient({username: 'valid username', password: 'supersecret'});

const myGatewaySN = 'WS99C99999';

icomfort.getThermostatInfoList({Cancel_Away: -1, GatewaySN: myGatewaySN})
    .then(res => {
        const currentSettings = res.tStatInfo.find(tStat => tStat.GatewaySN === myGatewaySN);

        const newOptions = {
            Cool_Set_Point: currentSettings.Cool_Set_Point+2,
            Heat_Set_Point: currentSettings.Heat_Set_Point+2
        };

        const newSettings = Object.assign({}, currentSettings, newOptions);

        return icomfort.setThermostatInfo(newSettings);
    });
```

#### Example Response

If the update is successful, the number __0__ is returned.

```json
0
```


## Testing
Some very basic tests are implemented using the [Mocha](https://mochajs.org/) testing framework. An npm script has also been defined to fire off the tests. Before running the tests, you will need to define your iComfort username and password in your environment. In Unix/Linux/BSD/mac OS, you can do the following:

```bash
export ICOMFORT_USERNAME='your icomfort username'
export ICOMFORT_PASSWORD='your icomfort password'
```

On Windows, the command is similar:

```bash
set ICOMFORT_USERNAME='your icomfort username'
set ICOMFORT_PASSWORD='your icomfort password'
```

After setting your username and password, to run the test command do the following:

```bash
npm test
```

If your username and password are correct, all of the tests will pass. If not, all of the tests will fail.

## Thanks
Thanks to [Ian Macdonald](https://github.com/bruman) for his [Ruby iComfort](https://github.com/bruman/ruby-icomfort) repo which helped get me started in the right direction.

Also thanks to [Kate Hall](https://github.com/kate-hall) for being the first to make use of this code. Her project encouraged me to make this code more modular. Check out her integration of this project's code with Amazon's Alexa at [alexa-icomfort](https://github.com/kate-hall/alexa-icomfort).
