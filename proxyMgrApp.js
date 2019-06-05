const express = require('express');
const axios = require('axios');
const exphbs = require('express-handlebars');
const VoiceResponse = require('twilio').twiml.VoiceResponse;
const AccessToken = require('twilio').jwt.AccessToken;
const VoiceGrant = AccessToken.VoiceGrant;

require('dotenv').config();
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const proxyAPIKey = process.env.API_KEY;
const proxyAPISecret = process.env.API_SECRET;

const outgoingApplicationSid = process.env.PROXY_TWIML_APP_SID;

const client = require('twilio')(accountSid, authToken);

const app = express();
const PORT = process.env.PORT || 5000;

//Handlebars middleware
app.engine('handlebars', exphbs({
    defaultLayout: 'main',
    partialsDir: 'views/partials',
    layoutsDir: 'views/layouts'
}));
app.set('view engine', 'handlebars');

const hbs = require('handlebars'); //??

//Handlebar helpers
hbs.registerHelper('ifCond', function (v1, operator, v2, options) {

    switch (operator) {
        case '==':
            return (v1 == v2) ? options.fn(this) : options.inverse(this);
        case '===':
            return (v1 === v2) ? options.fn(this) : options.inverse(this);
        case '!=':
            return (v1 != v2) ? options.fn(this) : options.inverse(this);
        case '!==':
            return (v1 !== v2) ? options.fn(this) : options.inverse(this);
        case '<':
            return (v1 < v2) ? options.fn(this) : options.inverse(this);
        case '<=':
            return (v1 <= v2) ? options.fn(this) : options.inverse(this);
        case '>':
            return (v1 > v2) ? options.fn(this) : options.inverse(this);
        case '>=':
            return (v1 >= v2) ? options.fn(this) : options.inverse(this);
        case '&&':
            return (v1 && v2) ? options.fn(this) : options.inverse(this);
        case '||':
            return (v1 || v2) ? options.fn(this) : options.inverse(this);
        default:
            return options.inverse(this);
    }
});

// Body Parser Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get('/', (req, res) => {
    res.render('index');
});

app.post('/proxyDemoOutboundDial', (req, res) => {
    let twiml = new VoiceResponse();
    const dial = twiml.dial({
        callerId: req.body.From
    });
    dial.number(req.body.To);

    res.type('text/xml');
    res.send(twiml.toString());
});


app.post('/proxyAccessToken', (req, res) => {
    try{
        const identity = 'user';

        const voiceGrant = new VoiceGrant({
            outgoingApplicationSid: outgoingApplicationSid
        });
        const token = new AccessToken(accountSid, proxyAPIKey, proxyAPISecret);
        token.addGrant(voiceGrant);
        token.identity = identity;

        let JWT = token.toJwt();
        // Serialize the token to a JWT string
        console.log(JWT);
        res.send(JWT);

    }catch(err){
        if(err.status)
        {
            res.status(err.status).send(err.message);
        }
        else{
            res.status("400").send(err.message);
        }
    }
});

app.use(express.static(__dirname)); //loads all files from current directory

app.get('/services', (req, res) => {
    getServices(res);
});

app.get('/sessions', (req, res) => {
    getSessions(req.query, res);
});

app.get('/participants', (req, res) => {
    getParticipants(req.query, res);
});

app.get('/interactions', (req, res) => {
    getInteractions(req.query, res);
});

app.post('/createService', (req, res) => {
    createService(req, res);
});

async function createService(req, res){
    try{
        let result = await client.proxy.services
            .create({
                uniqueName: req.query.uniqueName,
                geoMatchLevel: req.query.geoMatchLevel,
                numberSelectionBehavior: req.query.numberSelectionBehavior
            });
        res.send(result.sid);
    }catch(err){
        console.log(err);
        res.status(err.status).send(err.message);
    }
}

app.post('/serviceDelete', (req, res) => {
    client.proxy.services(req.query.serviceSid)
    .remove((err, items) => {
        if(err){
            console.log(err);
            res.status(err.status).send(err.message);
        }else{
            res.send(items);
        }
    });       
});

app.post('/createSession', (req, res) => {
    createSession(req, res);
});

async function createSession(req, res){
    if(req.query.ttl)
    {
        try{
            let result = await client.proxy.services(req.query.serviceSid)
                .sessions
                .create({
                    uniqueName: req.query.uniqueName,
                    mode: req.query.mode,
                    ttl: req.query.ttl
                });
            res.send(result.sid);
        }catch(err){
            console.log(err);
            res.status(err.status).send(err.message);
        }        
    }else{
        try{
            let result = await client.proxy.services(req.query.serviceSid)
                .sessions
                .create({
                    uniqueName: req.query.uniqueName,
                    mode: req.query.mode
                });
            res.send(result.sid);
        }catch(err){
            console.log(err);
            res.status(err.status).send(err.message);
        }
    }

}

app.post('/sessionDelete', (req, res) => {
    client.proxy.services(req.query.serviceSid)
    .sessions(req.query.sessionSid)
    .remove((err, items) => {
        if(err){
            console.log(err);
            res.status(err.status).send(err.message);
        }else{
            res.send(items);
        }
    });       
});

app.post('/sessionUpdate', (req, res) => {
    if(req.query.updateStatus == 'closed'){
        client.proxy.services(req.query.serviceSid)
        .sessions(req.query.sessionSid)
        .update({status: "in-progress"}, (err, items) => {
            if(err){
                console.log(err);
                res.status(err.status).send(err.message);
            }else{
                res.send(items);
            }
        });
    }
    else{
        client.proxy.services(req.query.serviceSid)
        .sessions(req.query.sessionSid)
        .update({status: "closed"}, (err, items) => {
            if(err){
                console.log(err);
                res.status(err.status).send(err.message);
            }else{
                res.send(items);
            }
        });
    }
})

app.post('/createParticipant', (req, res) => {
    createParticipant(req, res);     
});

async function createParticipant(req, res){
    if(req.query.proxyIdentifier)
    {
        try{
            let result = await client.proxy.services(req.query.serviceSid)
                .sessions(req.query.sessionSid)
                .participants
                .create({friendlyName: req.query.friendlyName, identifier: "+" + req.query.identifier, proxyIdentifier: "+" + req.query.proxyIdentifier});
            res.send(result.sid);
        }catch(err){
            console.log(err);
            res.status(err.status).send(err.message);
        }
    }else{
        try{
            let result = await client.proxy.services(req.query.serviceSid)
                .sessions(req.query.sessionSid)
                .participants
                .create({friendlyName: req.query.friendlyName, identifier: "+" + req.query.identifier});
            res.send(result.sid);
        }catch(err){
            console.log(err);
            res.status(err.status).send(err.message);
        }
    }

}

app.post('/participantDelete', (req, res) => {
    client.proxy.services(req.query.serviceSid)
    .sessions(req.query.sessionSid)
    .participants(req.query.participantSid)
    .remove((err, items) => {
        if(err){
            console.log(err);
            res.status(err.status).send(err.message);
        }else{
            res.send(items);
        }
    });           
});

app.post('/reservePhone', (req, res) => {
    reservePhone(req, res);
})

async function reservePhone(req, res) {
    let reserve = (req.query.isReserved == 'false');
    try{
        let result = await client.proxy.services(req.query.serviceSid)
                .phoneNumbers(req.query.phoneSid)
                .update({isReserved: reserve}, (err, items) => {
                    if(err){
                        console.log(err);
                        res.status(err.status).send(err.message);
                    }else{
                        res.send(items);
                    }
                });
    }catch(err){
        console.log(err);
        res.status(err.status).send(err.message);
    }
}

async function getServices(res) {
    let servicesList = await client.proxy.services.list();
    res.render('services', {
        services: servicesList
    });
}

async function getSessions(query, res) {
    let phoneAndParticipantList = [
        { 
            SNSid: "",
            PNSid: "", //PN Sid will be the same as Participant Proxy Identifier SID
            ProxyPNNumber: "", //PN number will be same as Proxy Participant Number
            InUse: 0,
            IsReserved: false,
            ParticipantVals: [
                {
                    ParticipantSid: "",
                    ParticipantRealNumber: "",
                    ParticipantFriendlyName: "",
                }
            ]
        }
    ];
    phoneAndParticipantList.pop();
    let phoneNumbersList = await client.proxy.services.get(query.sid).phoneNumbers.list();

    for(const [index, nums] of phoneNumbersList.entries())
    {
        phoneAndParticipantList.push(
            {
                SessionName: "",
                PNSid: nums.sid,
                ProxyPNNumber: nums.phoneNumber,
                InUse: nums.inUse,
                IsReserved: nums.isReserved,
                ParticipantVals: [
                    {
                        ParticipantFriendlyName: "",
                        ParticipantRealNumber: "",
                        ParticipantSid: ""
                    }
                ]
            }
        );

    }

    let sessionsList = await client.proxy.services.get(query.sid).sessions.list();

    for(const [index, session] of sessionsList.entries())
    {
        let participantsList = await client.proxy.services(query.sid).sessions(session.sid).participants.list();
        for(const [index, participant] of participantsList.entries())
        {
            for(const [index, phoneNums] of phoneAndParticipantList.entries())
            {
                phoneAndParticipantList[index].SessionName = session.uniqueName;
                if(phoneNums.PNSid == participant.proxyIdentifierSid)
                {
                    phoneAndParticipantList[index].ParticipantVals.push(
                        {
                            ParticipantFriendlyName: participant.friendlyName,
                            ParticipantRealNumber: participant.identifier,
                            ParticipantSid: participant.sid
                        }
                    )
                }
            }
            
        }
    }

    res.render('sessions', {
        phoneAndParticipant: phoneAndParticipantList,
        sessions: sessionsList,
        serviceSid: query.sid
    });
}

async function getParticipants(query, res) {
    let participantsList = await client.proxy.services(query.serviceSid).sessions(query.sessionSid).participants.list();
    res.render('participants', {
        participants: participantsList,
        sessionSid: query.sessionSid,
        serviceSid: query.serviceSid
    }); 
}

/**
 * Find the interactions associated with a specific participant and any recordings associated with those interactions
 */
async function getInteractions(query, res) {

    //Create an array that will hold all interactions and the data we care about for displaying to the end user in the UI.
    //NOTE: May want to update to a class in the future to optimize??
    let interactionContext = [{
        CallSid: "",
        CallStatus: "",
        StatusDate: new Date(),
        CallerSid: "",
        CallerName:  "",
        RecipientSid:  "",
        RecipientName: "",
        Voice: false,
        Content: "",
        RecSid: ""
    }];
    interactionContext.pop(); //Remove the initial values (probably a better way to enforce types during initialization without needed to do this?)

    //Retrive a list of all interactions associated with the contextual proxy service 
    let interactionList = await client.proxy.services(query.serviceSid)
        .sessions(query.sessionSid)
        .interactions
        .list();
    
    for(const [index, interaction] of interactionList.entries())
    {
        //For each interaction, initialize each variable in the interactionContext array. We will populate and push to the array
        let callSid = "";
        let callStatus = "";
        let statusDate = new Date();
        let callerSid = "";
        let callerName = "";
        let recipientSid = "";
        let recipientName= "";
        let voice = false;
        let content = "";
        let recSid = [];   
        
        if(interaction.outboundParticipantSid == query.participantSid)
        {
            //This participant acted as the reciever of this interaction (ie. call or sms)
            recipientSid = interaction.outboundParticipantSid;
            recipientName = query.participantName;
            callerSid = interaction.inboundParticipantSid;

            //Determine who the initalizing participant was for this interaction 
            let participant = await client.proxy.services(query.serviceSid)
                .sessions(query.sessionSid)
                .participants(interaction.inboundParticipantSid)
                .fetch();
            callerName = participant.friendlyName;
        }
        else if(interaction.inboundParticipantSid == query.participantSid)
        {
            //This participant acted as the initializer of this interaction (ie. call or sms)
            callerSid = interaction.inboundParticipantSid;
            callerName = query.participantName;
            recipientSid = interaction.outboundParticipantSid;

            //Determine who the receiving participant was for this interaction 
            let participant = await client.proxy.services(query.serviceSid)
                .sessions(query.sessionSid)
                .participants(interaction.outboundParticipantSid)
                .fetch();
            recipientName = participant.friendlyName;
        }
        else{
            //This interaction was not associated to this participant, so we don't care to process it and will skip ahead to the next interaction
            break;
        }

        if(interaction.type == "Voice")
        {
            voice = true;
            //NOTE: Right now we only care about capturing the callSid for purposes of retrieving recordings. In the future, we may want to capture the messaging sid for SMS and do something specific with it
            callSid = interaction.inboundResourceSid; 

            //Get the list of recordings for this call
            let listRecordings = await client.recordings.list({callSid: interaction.inboundResourceSid});

            for(const [index, recording] of listRecordings.entries())
            {
                //Push each recording associated with this call into the recSid array (part of our interactionContext). We later handle this in interactions.handlebars, but only link to the first element in the array. In the future, we may want additional functionality to handle all recordings tied to a specific call
                recSid.push(recording.sid);
            }
        }

        let data = JSON.parse(interaction.data);
        if(data.duration != null)
        {
            //For voice calls, the duration will be in seconds
            content = data.duration + " seconds";
        }
        else if(data.body != null)
        {
            //For SMS, the body will hold the message contents. We may have to be careful here and update our UI to only display partial message body so that the display doesn't get distorted when trying to display lengthy messages
            content = data.body;
        }

        //The status we care about is the outbound status because it tells us what the result of the interaction was
        //NOTE: In the future, should update the variable name to represent a more generic status (since SMS status is used here too)  
        callStatus = interaction.outboundResourceStatus;
        let options = { year: '2-digit', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric'};
        statusDate = interaction.dateUpdated.toLocaleTimeString("en-US", options); //In the future, may want to add sorting of interaction records by date

        //With all values accounted for, we can push the context of this interaction to the array
        interactionContext.push({
            CallSid: callSid,
            CallStatus: callStatus,
            StatusDate: statusDate,
            CallerSid: callerSid,
            CallerName: callerName,
            RecipientSid: recipientSid,
            RecipientName: recipientName,
            Voice: voice,
            Content: content,
            RecSid: recSid
        });
    }

    res.render('interactions', {
        interactions: interactionContext,
        selectedParticipant: query.participantName,
        sessionSid: query.sessionSid,
        serviceSid: query.serviceSid
    }); 
}

app.post('/recordCall', (req, res) => {
    processRecordCall(req);
});

async function processRecordCall(req){
    let callSID = req.body.inboundResourceSid;

    console.log(req.body.inboundResourceSid);
    console.log(req.body.inboundResourceStatus);
    console.log(req.body.outboundResourceStatus);

    //The only Proxy callback we care about is the one that provides us context for the initiated outbound dial. We will ignore all other callbacks (including those with context for SMS). Alternatively and depending on the use case, we could use the Proxy "Intercept" callback, but this has additional requirements for handling error status.
    if(req.body.outboundResourceStatus == "initiated")
    {
        //Get all recordings for a given call.
        let recordings = await client.recordings.list({callSid: callSID});

        console.log(recordings.length);
        
        //We only want to start recording if there are no existing recordings for this callSid. *This may be overkill as I haven't hit this edge case. Consider it preventitive for now*
        if(recordings.length == 0)
        {
            let recordingSet = false;
            let callStatus = "";

            //Self-invoking function to facilitate iterative attempts to start a recording on the given call. See example here: https://stackoverflow.com/a/3583740
            (function tryRecord (i) {          
                setTimeout(async function () {
                    if(!recordingSet && i > 0)
                    {
                        console.log(`I is ${i}`);

                        //Fetch the call to see if still exists (this allows us to prevent unnecessary attempts to record)
                        //Prod code probably needs callback or async added to ensure downstream execution is as expected
                        let call = await client.calls(callSID).fetch();
                        callStatus = call.status;
                        
                        //Only attempt to create the recording if the call has not yet completed
                        if(callStatus != "completed")
                        {
                            //Try to create the recording
                            try{
                                let result = await axios.post(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Calls/${callSID}/Recordings.json`, {}, 
                                {    
                                    auth: {
                                        username: accountSid,
                                        password: authToken
                                    }
                                });
                                //This code assumes an HTTP 201 *Created* status and thus sucessful creation of recording. Production code may need to explicitly ensure HTTP 201 (eg. handle any other possible status')
                                console.log(`statusCode: ${result.status}`);
                                recordingSet = true; //This isn't entirely necessary (eg. could just set i=1 to force stop iteration), but I'm making an assumption that most use cases will prefer having this for reporting purposes           
                            } catch(err){
                                //TODO(?) - There may be specific errors that should be explicitly handeled in a production scenario (eg. 21220)
                            }    
                        }
                        else //The call is completed, so there's no need to loop anymore
                        {
                            console.log("Force stop iteration");
                            i = 1; //Set i = 1 to force stop the iteration
                        }
                    }               
                if (--i || !recordingSet) tryRecord(i);      //  decrement i and call myLoop again if i > 0 or if recording is not set
                }, 1000) //NOTE: 1 second time delay before retry (this can be whatever works best --responsibly-- for the customer)
            })(15); //NOTE: 15 attempts to record by default (unless forced to stop or recording already started. This can be whatever works best --responsibly-- for the customer)
        }
        else
        {
            console.log("recording exists already");
        }           
    }
    else
    {
        console.log(`We ignored callback with outgoing status '${req.body.outboundResourceStatus}'`);
    }
}

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));