# Alexa Smart Home Skill for Lennox iComfort

Demo of functionality: https://goo.gl/photos/apb1FE4CzEB3zSSa6

---

Lennox iComfort does not support the type of authentication necessary for Smart Home Skill linking (as far as I know), so I am currently hardcoding my login information (see here: [iComfort.js](https://github.com/kate-hall/alexa-icomfort/blob/master/src/iComfort.js#L1).)

I am using the Smart Home Skill API with this repo. For more details on setting up the Alexa portion, see here: https://developer.amazon.com/alexa/smart-home

I only have my own iComfort model to work with and develop against, so other systems may need tweaking (especially those with multiple appliances or zones, since I only have one to control my entire home's temperature). Currently, this Smart Home Skill checks to see if you are moving from a higher temperature to a lower one (or vice versa) before deciding appropriate Cool-To and Heat-To temperatures to set.

Smart Home Alexa Skills are very limited, temperature-wise, in what you can request. Three intents are supported:

```
"Alexa, set [appliance/room name] to [76] degrees"
"Alexa, increase my [appliance/room name] temperature by [2] degrees"
"Alexa, decrease my [appliance/room name] temperature by [2] degrees"
```

These temperature targets are achieved by narrowing the Cool-To and Heat-To settings to a miminum of three degrees apart from each other. This three-degree window setting depends on whether you are heating or cooling to the desired temperature.

## Notes
Temperature changes will fail if the Cool-To and Heat-To temperatures aren't at least 3 degrees apart.
My thermostat's maximum temperature is 90 Farenheit, minimum temperature is 40 Farenheit.

## To Do
- Look into authentication - use mobile site login: https://m.myicomfort.com/
- Future release: name appliance(s) by zone

## Alexa Companion App

<img width="375" alt="alexa-companion-app" src="https://cloud.githubusercontent.com/assets/8494775/22136065/f50d990c-de86-11e6-8d21-2cc657c065f7.png">

## Thanks
- Thanks to [Daniel McQuiston](https://github.com/danielmcq) for his [Node iComfort](https://github.com/danielmcq/node-icomfort) repository, which I use to access the Lennox iComfort system.
- Thanks to [Krishnaraj Varma](https://github.com/krvarma/) for his [Alexa Smart Home Skill for Particle Devices](https://github.com/krvarma/particle-alexa-smart-home-skill) repository, which I used as the foundation of the Smart Home portion of the skill.
