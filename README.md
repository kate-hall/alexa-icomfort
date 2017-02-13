# Alexa Smart Home Skill for Lennox iComfort

Demo of functionality: https://goo.gl/photos/apb1FE4CzEB3zSSa6

---

Lennox iComfort does not support the type of authentication necessary for Smart Home Skill linking (as far as I know), so I am currently hardcoding login information (see here: [iComfort.js](https://github.com/kate-hall/alexa-icomfort/blob/master/src/iComfort.js#L1).)

Smart Home Alexa Skills are very limited, temperature-wise, in what you can request. These intents are supported:

```
"Alexa, set [device name] to [76] degrees"
"Alexa, increase my [device name] temperature by [2] degrees"
"Alexa, decrease my [device name] temperature by [2] degrees"
"Alexa, turn [device name] up"
"Alexa, turn [devince name] down"
```

## Alexa Companion App

<img width="375" alt="alexa-companion-app" src="https://cloud.githubusercontent.com/assets/8494775/22136065/f50d990c-de86-11e6-8d21-2cc657c065f7.png">

## Set-Up Instructions

Want to get this up and running on your own Alexa? **Visit the [Wiki](https://github.com/kate-hall/alexa-icomfort/wiki) for instructions!**

I only have my own iComfort model to work with and develop against, so other systems may need tweaking (especially those with multiple appliances or zones, since I only have one to control my entire home's temperature). If you encounter any issues or have a suggestion, please open [an issue on this repository](https://github.com/kate-hall/alexa-icomfort/issues).

## Thanks
- Thanks to [Daniel McQuiston](https://github.com/danielmcq) for his [iComfort](https://github.com/deHugo/icomfort-js) repository, which I use to access the Lennox iComfort system.
- Thanks to [Krishnaraj Varma](https://github.com/krvarma/) for his [Alexa Smart Home Skill for Particle Devices](https://github.com/krvarma/particle-alexa-smart-home-skill) repository, which I used as the foundation of the Smart Home portion of the skill.
- Thanks to the Reddit community for the suggestions and for helping me test this skill functionality!
