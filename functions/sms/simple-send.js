/*

  simple-send.js

  Sends a simple SMS message

*/

// ADD Helper file to consistently format response header
const rsp = require(Runtime.getFunctions()['twilio-table-sync/system/format-response-headers'].path);

exports.handler = async function(context, event, callback) {    

    const client = context.getTwilioClient();

    // Pull the response object from helper library
    const response =  await rsp.formatResponseHeader()      

    // EXPECTING JSON PAYLOAD...
    console.log("payload => ", event.payload);
    
    client.messages
        .create({
          from: context.TWILIO_PHONE_NUMBER,
          to: event.payload.MESSAGE_TO,
          body: event.payload.MESSAGE_BODY,
        })
        .then((msg) => {
            response.appendHeader('Content-Type', 'application/json');
            response.setBody(event);              
            callback(null,response);            
        })
        .catch((err) => {
            response.appendHeader('Content-Type', 'application/json');
            response.setBody({ success: false, error: err.message });              
            callback(null,response);               
        });

};