# LEGAL DISCLAIMER

Notice: This app and the information contained herein is not legal advice, and Twilio recommends that you consult with your legal counsel to make sure that you are complying with all applicable laws in connection with communications you transmit and receive using Twilio. Ultimately, you are responsible for ensuring that your use of Twilio complies with all applicable laws and regulations. Please also refer to our [**Terms of Service**](https://www.twilio.com/legal/tos>) and [**Acceptable Use Policy**](https://www.twilio.com/legal/aup) for more information.

Please see here: [**Legal Considerations**](https://support.twilio.com/hc/en-us/articles/360011522553-Legal-Considerations-with-Recording-Voice-and-Video-Communications) for more on recording voice communications with Twilio, and [**Voice Recording Encryption**](https://www.twilio.com/blog/voice-recording-encryption-generally-available) for more on encrypting voice recordings.


# Twilio Proxy Admin App

This is a Twilio Proxy administrative application that facilitates the ability to **manage Participants and display Participant Interactions as part of a Proxy Session, as well as link to call recordings tied to a Proxy Interaction** *(Note -- though not supported natively by Proxy, call recording funtionality is embedded in this app by way of the Recording API.* Currently, the Twilio Console does not have a way to manage Proxy Participants through the UI. **This app intends to fill that gap in as basic and intuitive a way as possible.** The app also provides simple constructs for managing Services, Sessions, and Phone Numbers as well, each intended to provide a greater contexual focus around Participant Management.

This app uses [Node Express](https://expressjs.com/) as the web app framework, [Bootstrap](https://getbootstrap.com/) for the UI and [Handlebars](https://handlebarsjs.com/) for the UI Templating Engine. It also utilizes JS CDN's for [Popper](https://popper.js.org/) - which I believe is wrapped by Bootstrap as a dependency for modal windows - a custom Jquery library called [InputMask](https://github.com/RobinHerbots/Inputmask) for phone number masking, and Twilio Client 1.7 w/ Opus Codec for leveraging outbound click-to-call functionality.


## Prerequisites

1. A Twilio Account with access to the Twilio Console (functionality in the app will assume you are logged in and can link to the console)
2. An accessable web server running Node.js (can be your local machine for development)
3. A publically accessible HTTP/S endpoint (may opt to use [Ngrok](https://ngrok.com/) to facilitate for local development, and if so **I suggest you run the app over the HTTPS tunnel to keep the connection secure**)

## Installing

```Step 1:``` Clone or download this repository to a location of your preference on your local machine.<br> 
```Step 2:``` Use the .env.template file as a reference to create a .env file.<br>
```Step 3:``` Copy the AccountSID and AuthToken from your Twilio Account (can be found on main dashboard of Twilio Console) and add them to the .env file where specified.<br> 
```Step 4:``` In a terminal window, use ```npm init``` to initialize, then do the following to install the required dependencies...<br> 

```
npm install -S axios, express, twilio, express-handlebars, dotenv
```

Optionally, you can install packages like nodemon if you want changes to be published instantly

## Click to Call Setup (optional)

Please follow the steps below to enable (*Note you will need to uncomment the PROXY_TWIML_APP_SID value in your .env file*): <br> 
```Step 1:``` Create a [TwiML App](https://www.twilio.com/console/voice/twiml/apps) and set the Voice "Request URL" to your publically accessible endpoint with route "proxyDemoOutboundDial" ```(ie. https://XXXXXX.ngrok.io/proxyDemoOutboundDial```.<br> 
```Step 2:``` Copy the Application SID from the TwiML App and assign it to variable PROXY_TWIML_APP_SID in your .env file.<br>
```Step 3:``` Create an [API Key](https://www.twilio.com/console/runtime/api-keys) and copy the Key SID and Key Secret and assign to variables API_KEY and API_SECRET respectively in your .env file. *Note: Start with the Key Secret first as you only get one chance to view the secret*<br>
```Step 4:``` Copy the Application SID from the TwiML App and assigned it to variable PROXY_TWIML_APP_SID in your .env file.<br>
**IMPORTANT! - If you have not already done so, you will have to setup a [Verified Caller ID](https://www.twilio.com/console/phone-numbers/verified) if you wish to dial from a non-Twilio number. You can dial from a Twilio number as well, just make sure you click the appropriate "Dial" button in the app (ie. You must use the "Dial" button for the participant you wish to dial from). If you do not dial from a Twilio number or a Verified Caller ID, the call will not be placed.**

## Inbound Call Setup (optional)
```Prerequisites:```Click to Call Setup (see above)<br>
Please follow the steps below to enable: <br> 
```Step 1:``` Create a [TwiML Bin](https://www.twilio.com/console/runtime/twiml-bins) with the following configuration.<br>
``` 
  <?xml version="1.0" encoding="UTF-8"?>
    <Response>
      <Dial>
        <Client>ProxyClientDemo</Client>
      </Dial>
    </Response>
```
```Step 2:``` Go to your [Phone Numbers](https://www.twilio.com/console/phone-numbers/incoming) page and configure a Twilio Number to point to the TwiML Bin you created in Step #1 *(Note - you will select the TwiML Bin under Voice Calls on the "A Call Comes in" drop down)* You will need to use this Twilio phone number when creating one of your proxy participants so that calls can be placed and received via this number.<br>

**IMPORTANT! - In order to handle inbound calling properly, you need to open the "Initiate Dial" modal window by clicking the "Dial" button on the Participants page in the app. A button labeled "Answer Call?" will be displayed in yellow/orange if an inbound call is coming from the PSTN (eg. cell phone) to your Twilio number configured in Step #2 above.**

## Chat Setup (optional)

Please follow the steps below to enable (*Note you will need to uncomment the CHAT_SERVICE_SID value in your .env file*): <br> 
```Step 1:``` Create a [Programmable Chat Service](https://www.twilio.com/console/chat/dashboard) with default settings<br> 
```Step 2:``` Copy the Chat Service SID and assign it to variable CHAT_SERVICE_SID in your .env file.<br>
```Step 3:``` Copy the Chat Service SID and paste into [Your Proxy Service](https://www.twilio.com/console/proxy) under the Optional configuration ```CHAT INSTANCE SID``` field.<br>
```Step 4:``` Use the [API Explorer Chat Create](https://www.twilio.com/console/runtime/api-explorer/chat/chat-channels/create) to create a Chat Channel for your Chat Service. The Chat Service SID is required. Copy the Chat Channel SID from the output of the create operation.<br>
```Step 5:``` Back in the app, create a Proxy Session and a Proxy Participant within that session that is a 'Chat' participant. On creating the 'Chat' participant, you MUST use the value of the Chat Channel SID from Step 4 as the "Chat Channel SID".<br>
```Step 6:``` Use the [API Explorer Chat Update](https://www.twilio.com/console/runtime/api-explorer/chat/chat-channels/update) this time to MODIFY the Chat Channel for your Chat Service. **It is essential that you add the following to the Attributes optional field to ensure the Chat communications can be sent to SMS ```{"serviceNumber":[Whatever you want],"twilioNumber":[Proxy # for your Chat Channel Participant],"from":[Actual Phone Number that will recieve the SMS],"forwarding": true, "proxySession": [The proxy session associated with your Chat Channel Participant]} ```**<br>
Here's an example: {"serviceNumber":"chrisID","twilioNumber":"+16514124482","from":"+1234567890","forwarding": true, "proxySession": "KC803e6663d35ff3ddd7c0c3e622c634b3"}<br>
```Step 7:```Drill into your [Programmable Chat Service](https://www.twilio.com/console/chat/dashboard) you setup in Step #1 and navigate to the "Webhooks" configuration. There is a "Post-Event Webhooks" section where you need to add the following as the Callback URL: https://webhooks.twilio.com/v1/Accounts/[ACSid]/Proxy/[KSSid]/Webhooks/ChatEvent/ProxyIdentifier/[PNSid]. Make sure the configuration is for HTTP POST, not GET. Note that the "PNSid" **just needs to be in the *format* of a PNSid, it doesn't have to be a specific PNSid**. The ACSid and KSSid, however, need to from your Account and Proxy Service respectively. You must check "OnMessageSent", "OnChannelUpdated", and "OnChannelDestroyed" for Callback Events.


## Call Recording Setup (optional)

Embedded in this app is also an HTTP GET route "recordCall" for handling recording of Proxy voice calls. Call recording is not yet natively supported in the Twilio Proxy API, so the functionality here uses the Twilio Recording API in conjunction with Proxy.

The call recording requires that you add a Callback URL to the Twilio Proxy Service via the Twilio Console here: https://www.twilio.com/console/proxy/services/.

```Step 1:``` Click on your Proxy Service link<br>
```Step 2:``` Add your callback url in the "Callback URL" field. If you are using Ngrok, you can specify 8080 as the default port and optionally add a subdomain to persist the Ngrok session:  ```ngrok http -subdomain=XXX 8080```. This should start ngrok and provide a URL similar ```https://XXXXXX.ngrok.io```, to which you append the "recordCall" route to use as your Callback URL ```(ie. https://XXXXXX.ngrok.io/recordCall```<br>

The Callback URL will webhook to your server and route to the "recordCall" endpoint, where it calls the "processRecordCall" async function. The implementation uses axios to POST to the recording API *(see [here](https://www.twilio.com/docs/voice/api/recording#create-a-recording-resource) for more info)*.

## Running the App

Use startup scripts in your package.json, or simply type the following in a terminal window that is at the root of your project...

```
node proxyMgrApp.js
```

## Navigating the App

The links and buttons in the app will self-direct you to where you want to go

## Services Page

Currently, the app lets you create a Service in minimal fashion, whereby you supply a Service Name, Geo Match Behavior, and Number Selection Behavior, and it creates a Service with all other defaults applied. 

All Services are currently shown in a list. Clicking on a Service will take you to the Session page for that Service.

## Sessions Page

Currently, the app lets you create a Session in minimal fashion, whereby you supply a Session Name, Channel Mode, and Time to Live, and it creates a Session with all other defaults applied.

Each session had a border color of either green (for open sessions) or yellow/orange (for closed sessions). You can toggle open/closed for each session with the "Close" button. *Note: re-opening a closed session sets the session status to "in-progress", not "open"*.

Sessions can be deleted with the "Delete" button.

Clicking on a Session will take you to the Participants page for that Session.

### Phone Numbers

The Sessions page also has the list of Phone Numbers that have been assigned to the Proxy Service contianing these Sessions. Each Phone Number has a border color of either green (not in use) or yellow/orange (in use). 

If the Phone Number is in use or reserved, it will be textually notated in each row of the list. There is a toggle button for each row as well to reserve/unreserve a given number.

If the Phone Number is in use, a "View Assigned" button will show that allows you to view each participant that is assigned to that number (by Participant SID). Hovering over the Participant SID will show the Friendly Name of the Participant (as the title), the Participant Phone # of the Participant, and the Session that Participant is assigned the number.

Clicking the "Add Phone Numbers" button will contextually take you to the Twilio Console Proxy Numbers page where you can assign/provision numbers to your number pool.


## Participants Page

The Participants page shows each participant currently assigned to the given Session. The Friendly Name of the Participant is shown and links to that Participant's Interactions. The Participant SID, Participant #, and Proxy # are shown as part of the visual context for the given Participant.

Particpants can be deleted with the "Delete" button.

There is also a "Create Participant" button that allows you to create a Participant. You must specify a Friendly Name and Participant Phone # to create a Participant. Optionally, you can specify a Proxy # to assign directly to the Participant (rather than letting the Proxy Service choose from your pool of numbers).

If you've implemented Chat, then you can use the "Create Chat Participant" if you're looking to start a chat between two participants.

If 2 Participants exist at any time for a particular Session, the UI will enable a "Dial" button that can be used for click-to-call from one participant to the other. The dialing participant will always be the participant you clicked the "Dial" button for, and the receiving participant will always be the adjacent participant. Pressing "Place Call" from the modal window will place the call. This will toggle the "Hangup Call" button to force terminate the call from the browser if desired. 

Inbound calling is also possible if you've completed the setup for it. To get an inbound call started, you can click the "Dial" button, and then from the PSTN (eg. cell phone of one participant) you can place an inbound call to the other participant (as long as you've followed the steps above on inbound call setup). At this point, you can initiate the call from the PSTN (eg. cell phone of participant), after which in the browser the "Place Call" button will toggle to an "Answer Call?" button that will allow you to take the call from the browser.

There is also a "Send SMS" button that will show up for each participant, and will allow you to send SMS from one participant outbound to the other participant on their cell phone.

For 2-way messaging, you can use a chat participant and a regular participant, and then send messages back and forth Chat->SMS and SMS->Chat.

Also, note that interactions don't have to take place within the UI. Text messages and phone calls can be sent between 2 particiapnts that are part of the proxy session. Those interactions will immediately be logged and visible in the Interactions page within the app. If the interaction was a voice call and you have call recording setup, then links to the recording will show up in the interactions page.


## Interactions Page

Each Interaction for the given Participant is shown on the Interactions page, with tabular data for each interaction. Note the "Has Recording" column will show a "YES" or "NO" for whether a recording was taken as part of the interaction. If so, then "YES" will show and will link contextually to the Recording in the Twilio Console to play back, download, delete, etc.

## PII
Note that when creating a new Participant, the "Friendly Name" you provide in the modal window should not include a participants real name. See https://www.twilio.com/docs/proxy/api/participant#create-a-participant-resource and https://www.twilio.com/docs/glossary/what-is-personally-identifiable-information-pii#pii-fields. 

## Data Storage
This app relies on local and session storage. You are resposible for your own data and your customers data. Please refer to our [**Terms of Service**](https://www.twilio.com/legal/tos>) and [**Acceptable Use Policy**](https://www.twilio.com/legal/aup) for more information.  

## Authors

* **Chris Feehan** - [Twilio]

See also the list of [contributors](https://github.com/your/project/contributors) who participated in this project.


## Musings
This app intends to consume and interact with the Twilio API's without bias, meaning there isn't any logic meant to manipulate the results of any API calls. The app will follow the rules of the API's as they were meant to be used. The app does not intend to project or posit any business logic; it is purely meant to provide an understanding of the capabilities of our API's (primarily Proxy) and create a visual overlay representing the results of consuming and interacting with those API's. As an example, if you try to do something proxy won't let you do (eg. add a unique participant to 2 open sessions with the same proxy identifier) then the app will respond by essentially relaying the information returned by the the API to the user, which in this case would be an error message telling the user why this is not possible.
## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details



