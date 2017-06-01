# Secretary

Grand prize winner of [SBHacks 2](http://www.sbhacks.com/)!

## Overview

Secretary is an SMS-based personal assistant with natural language processing and Internet-of-Things integration.  More documentation coming soon(TM)

## Technologies Used

The core server runs on Node.js.  We use Twilio to communicate with users, Microsoft BotBuilder and LUIS for language understanding, and Cylon for Internet-of-Things integration.  Currently Cylon only supports Nest and Bluetooth(which isn't even functional yet).

## Personal Use Instructions

You're only going to need to modify the config.json file that is located under /public. All the fields will need to be filled out with your own personal values. Honestly, I shouldn't have committed my API key and stuff but whatever, you will replace those. You're going to need a new [Twilio account] (https://www.twilio.com/try-twilio) and fill in all the appropriate fields. A trial account can get one phone number for free, make sure you pick one that has SMS and MMS enabled. If you want to add new commands for whatever reason, you can use the template that commands.json uses. You should be able to understand how the json is structured by the file's examples alone, but basically there are keyphrases called "text", terminal code to run called "code", and then response messages that will be texted in success and failure. If you need to take arguments from the user, those are not supported currently in the json and you will have to manually add it into index.js. GLHF :)
