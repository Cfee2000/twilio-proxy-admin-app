# LEGAL DISCLAIMER

Notice: This information is not legal advice, and Twilio recommends that you consult with your legal counsel to make sure that you are complying with all applicable laws in connection with calls you transmit and receive using Twilio. Ultimately, you are responsible for ensuring that your use of Twilio complies with all applicable laws and regulations. Please also refer to our [**Terms of Service**](https://www.twilio.com/legal/tos>) and [**Acceptable Use Policy**](https://www.twilio.com/legal/aup) for more information. 

Please see here: [**Legal Considerations**](https://support.twilio.com/hc/en-us/articles/360011522553-Legal-Considerations-with-Recording-Voice-and-Video-Communications) for more on recording voice communications with Twilio, and [**Voice Recording Encryption**](https://www.twilio.com/blog/voice-recording-encryption-generally-available) for more on encrypting voice recordings.


# Twilio Proxy Admin App

This is a Twilio Proxy Administrative Application that facilitates the ability to **manage Participants and display Participant Interactions as part of a Proxy Session, as well as link to call recordings tied to a Proxy Interaction** *(Note -- though not supported natively by Proxy, call recording funtionality is embedded in this app by way of the recording api - (see [CallRecordingSetup](#call-recording-setup))* - Currently, the Twilio Console does not have a way to manage Proxy Participants through the UI. **This app intends to fill that gap in as basic and intuitive a way as possible.** The app also provides very simple constructs for managing Services, Sessions, and Phone Numbers as well, but not to the depth that is provided in the Twilio Console UI.

This app uses Node Express as the backend and uses Handlebars https://handlebarsjs.com/ for the UI

## Prerequisites

1. A Twilio Account with access to the Twilio Console (functionality in the app will assume you are logged in and can link to the console)
2. An accessable web server running Node.js (can be your local machine for development)
3. A publically accessible HTTP/S endpoint (may opt to use [Ngrok](https://ngrok.com/) to facilitate for local development)

## Installing

```Step 1:``` Clone or download this repository to a location of your preference on your local machine.<br> 
```Step 2:``` Use the .env.template file as a reference to create a .env file.<br>
```Step 3:``` Copy the AccountSID and AuthToken from your Twilio Account (can be found on main dashboard of Twilio Console) and add them to the .env file where specified.<br> 
```Step 4:``` In a terminal window, use ```npm init``` to initialize, then do the following to install the required dependencies...<br> 

```
npm install -S axios, express, twilio, express-handlebars, dotenv
```

Optionally, you can install packages like nodemon if you want changes to be published instantly

## Call Recording Setup

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

## Creating Services, Sessions, and Participants

The app will facilitate the ability for you to create Services, Sessions, and Participants via modal windows on their respective pages.

#### PII
Note that when creating a new Participant, the "Friendly Name" you provide in the modal window should not include a participants real name. See https://www.twilio.com/docs/proxy/api/participant#create-a-participant-resource and https://www.twilio.com/docs/glossary/what-is-personally-identifiable-information-pii#pii-fields. 

## Authors

* **Chris Feehan** - [Twilio]

See also the list of [contributors](https://github.com/your/project/contributors) who participated in this project.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details



