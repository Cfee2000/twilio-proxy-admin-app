# Twilio Proxy Admin App

This is a Twilio Proxy Administrative Application that facilitates the ability to **manage Participants and display Participant Interactions as part of a Proxy Session, as well as link to call recordings tied to a Proxy Interaction** (*Note -- though not supported natively by Proxy, call recording funtionality is embedded in this app by way of the recording api - (see [CallRecordingSetup](https://github.com/Cfee2000/twilio-proxy-admin-app#call-recording-setup)) - Currently, the Twilio Console does not have a way to manage participants through the UI. **This app is meant to augment the Twilio Console Proxy UI, not replace it.** The app also provides very simple constructs for managing Services, Sessions, and Phone Numbers as well, but not to the depth that is provided in the Twilio Console UI.

This app uses Handlebars https://handlebarsjs.com/ as the UI Templating Engine

### Prerequisites

A Twilio Account with access to the Twilio Console (functionality in the app will assume you are logged in and can link to the console)

### Installing

Step 1: Clone or download this repository to a location of your preference on your local machine
Step 2: Use the .env.template file as a reference to create a .env file. 
Step 3: Copy the AccountSID and AuthToken from your Twilio Account (can be found on main dashboard of Twilio Console) and add them to the .env file where specified
Step 4: Use npm to install the required dependencies...

```
npm install twilio
```
```
npm install axios
```
```
npm install body-parser
```
```
npm install body-parser
```
```
npm install express-handlebars
```

Optionally, you can install packages like nodemon if you want changes to be published instantly

## Call Recording Setup

Embedded in this app is also an HTTP GET route "recordCall" for handling recording of Proxy voice calls. Call recording is not yet natively supported in the Twilio Proxy API, so the functionality.

The call recording requires that you add a Callback URL to the Twilio Proxy Service via the Twilio Console here: https://www.twilio.com/console/proxy/services/.

Step 1: Click on your Proxy Service link
Step 2: Add your webhook in the "Callback URL" optional field. *Note that you need to have an accessible public HTTP/S endpoint running. I suggest you use ngrok at least for development purposes * [ngrok](https://ngrok.com/)

```
Example URL: http://XXXXXX.ngrok.io/recordCall (if you are running ngrok)
```

## Debugging

Create a configuration for the launcher. It should point to the proxyMgrApp.js file and debug in Node
```
    "configurations": [
        {
            "type": "node",
            "request": "launch",
            "name": "Launch Program",
            "program": "${workspaceFolder}/proxyMgrApp.js"
        }
    ]
```

### Running the App

Use startup scripts in your package.json, or simply type the following in a VSCode terminal window that is at the root of your project...

```
node index proxyMgrApp.js
```

### Navigating the App

The links and buttons in the app will self-direct you to where you want to go

## Authors

* **Chris Feehan** - [Twilio]

See also the list of [contributors](https://github.com/your/project/contributors) who participated in this project.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details



