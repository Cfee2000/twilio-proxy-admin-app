# LEGAL DISCLAIMER

Notice: This app and the information contained herein is not legal advice, and Twilio recommends that you consult with your legal counsel to make sure that you are complying with all applicable laws in connection with calls you transmit and receive using Twilio. Ultimately, you are responsible for ensuring that your use of Twilio complies with all applicable laws and regulations. Please also refer to our [**Terms of Service**](https://www.twilio.com/legal/tos>) and [**Acceptable Use Policy**](https://www.twilio.com/legal/aup) for more information. 

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

Click to call setup is now OPTIONAL. Please follow the steps below to enable (*Note you will need to uncomment the PROXY_TWIML_APP_SID value in your .env file*): <br> 
```Step 1:``` Create a [TwiML App](https://www.twilio.com/console/voice/twiml/apps) and set the Voice "Request URL" to your publically accessible endpoint with route "proxyDemoOutboundDial" ```(ie. http://XXXXXX.ngrok.io/proxyDemoOutboundDial```.<br> 
```Step 2:``` Copy the Application SID from the TwiML App and assign it to variable PROXY_TWIML_APP_SID in your .env file.<br>
```Step 3:``` Create an [API Key](https://www.twilio.com/console/runtime/api-keys) and copy the Key SID and Key Secret and assign to variables API_KEY and API_SECRET respectively in your .env file. *Note: Start with the Key Secret first as you only get one chance to view the secret*<br>
```Step 4:``` Copy the Application SID from the TwiML App and assigned it to variable PROXY_TWIML_APP_SID in your .env file.<br>
**IMPORTANT! - If you have not already done so, you will have to setup a [Verified Caller ID](https://www.twilio.com/console/phone-numbers/verified) if you wish to dial from a non-Twilio number**

## Chat Setup (optional)

Please follow the steps below to enable (*Note you will need to uncomment the CHAT_SERVICE_SID value in your .env file*): <br> 
```Step 1:``` Create a [Programmable Chat Service](https://www.twilio.com/console/chat/dashboard) with default settings<br> 
```Step 2:``` Copy the Chat Service SID and assign it to variable CHAT_SERVICE_SID in your .env file.<br>
```Step 3:``` Copy the Chat Service SID and paste into [Your Proxy Service](https://www.twilio.com/console/proxy) under the Optional configuration ```CHAT INSTANCE SID``` field.
```Step 4:``` Use the [API Explorer Chat Create](https://www.twilio.com/console/runtime/api-explorer/chat/chat-channels/create) to create a Chat Channel for your Chat Service. The Chat Service SID is required. Copy the Chat Channel SID from the output of the create operation.<br>
```Step 5:``` Back in the app, create a Proxy Session and a Proxy Participant within that session that is a 'Chat' participant. On creating the 'Chat' participant, you MUST use the value of the Chat Channel SID from Step 4 as the "Chat Channel SID" on creating the chat participant.<br>
```Step 6:``` Use the [API Explorer Chat Update](https://www.twilio.com/console/runtime/api-explorer/chat/chat-channels/update) this time to MODIFY the Chat Channel for your Chat Service. **It is essential that you add the following to the Attributes optional field to ensure the Chat communications can be sent to SMS ```{"serviceNumber":[Whatever you want],"twilioNumber":[Proxy # for your Chat Channel Participant],"from":[Actual Phone Number that will recieve the SMS],"forwarding": true, "proxySession": [The proxy session associated with your Chat Channel Participant]} ```**<br>


## Call Recording Setup (optional)

Embedded in this app is also an HTTP GET route "recordCall" for handling recording of Proxy voice calls. Call recording is not yet natively supported in the Twilio Proxy API, so the functionality here uses the Twilio Recording API in conjunction with Proxy.

The call recording requires that you add a Callback URL to the Twilio Proxy Service via the Twilio Console here: https://www.twilio.com/console/proxy/services/.

```Step 1:``` Click on your Proxy Service link<br>
```Step 2:``` Add your callback url in the "Callback URL" field. If you are using Ngrok, you can specify 8080 as the default port and optionally add a subdomain to persist the Ngrok session:  ```ngrok http -subdomain=XXX.YYY 8080```. This should start ngrok and provide a URL similar ```http://XXXXXX.ngrok.io```, to which you append the "recordCall" route to use as your Callback URL ```(ie. http://XXXXXX.ngrok.io/recordCall```<br>

The Callback URL will webhook to your server and route to the "recordCall" endpoint, where it calls the "processRecordCall" async function. The implementation uses axios to POST to the recording API *(see [here](https://www.twilio.com/docs/voice/api/recording#create-a-recording-resource) for more info)*.

## Running the App

Use startup scripts in your package.json, or simply type the following in a terminal window that is at the root of your project...

```
node proxyMgrApp.js
```

## Navigating the App

The links and buttons in the app will self-direct you to where you want to go

## Services Page

Currently, the app lets you create a Service in minimal fashion, whereby you supply a Service Name and it creates a Service with all defaults applied. 

All Services are currently shown in a list. Clicking on a Service will take you to the Session page for that Service.

## Sessions Page

Currently, the app lets you create a Session in minimal fashion, whereby you supply a Session Name and it creates a Session with all defaults applied. I'm planning an update to allow Time To Live and Mode to be optional parameters to specify when creating a Session.

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

There is also a "Quick Create" button that allows you to create a Participant. You must specify a Friendly Name and Participant Phone # to create a Participant. Optionally, you can specify a Proxy # to assign directly to the Participant (rather than letting the Proxy Service choose from your pool of numbers).

If 2 Participants exist at any time for a particular Session, the UI will enable a "Dial" button that can be used for click-to-call from one participant to the other. The dialing participant will always be the participant you clicked the "Dial" button for, and the receiving participant will always be the adjacent participant. A JWT Access Token is generated for each time you click the "Dial" button. If the token generation was successful, a modal window will confirm you want to click-to-call. Pressing "Place Call" from the modal window will place the call. This will toggle the "Hangup Call" button to force terminate the call from the browser if desired.


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


## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details



