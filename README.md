# alexa-icomfort
An Alexa Skill for the Amazon Echo, client for the Lennox iComfort services implemented in node.js

This Skill does not yet properly authenticate! I am hardcoding my login information to make this work. This Skill is still very much a work-in-progress.

I only have my own iComfort model to work with and develop against, so other systems may need tweaking (especially those with multiple appliances or zones, since I only have one to control my entire home's temperature). Currently, this Smart Home Skill checks to see if you are moving from a higher temperature to a lower one (or vice versa) before deciding an appropriate Cool-To and Heat-To temperatures to set.

Smart Home Alexa Skills are very limited, temperature-wise, in what you can request. Three intents are supported:

```
"Alexa, set [appliance/room name] to [76] degrees"
"Alexa, increase my [appliance/room name] by [2] degrees"
"Alexa, decrease my [appliance/room name] by [2] degrees"
```

These temperature targets are achieved by narrowing the Cool-To and Heat-To settings to a miminum of three degrees apart from each other. This three-degree window setting depends on whether you are heating or cooling to the desired temperature.

## Thanks
Thanks to [Daniel McQuiston](https://github.com/danielmcq) for his [Node iComfort](https://github.com/danielmcq/node-icomfort) repo, which I use to access the Lennox iComfort system.
Thanks to [krvarma](https://github.com/krvarma/) for their [Alexa Smart Home Skill for Particle Devices](https://github.com/krvarma/particle-alexa-smart-home-skill) repo which I used as the foundation of the Smart Home portion of the skill.

## To Use
Login credentials to https://m.myicomfort.com/ currently hardcoded, and can be found in changeTemp.js.

## Notes
Temperature changes will fail if the Cool-To and Heat-To temperatures aren't at least 3 degrees apart.
Maximum temperature is 90, minimum temperature is 40.

## To Do
- Something is slightly off when increasing or decreasing by degrees, it's often off by 1 degree, appears to be an issue with Celcius/Farenheit conversion.
- Look into authentication - use mobile site login: https://m.myicomfort.com/
- Future release: name appliance(s) by zone
- Create Skill icon
