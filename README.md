# twilio-dfdp (Deployable Flex Demo Platform)

## A set of resources and patterns that deploy to YOUR OWN FLEX INSTANCE that allow creation more complex and custom Flex demos and POCs

We all agree that Flex is a programmable contact center, but how do we illustrate this point to people new to Flex? I have had success selling Flex using custom demos to help prospects understand how Flex is different and how that can make a big difference to their organization. All SEs should be able to spin up their own custom Flex demos.

This repo contains a flex plugin, serverless apps, studio flows, and patterns that will allow you to deploy a custom Flex demo to your own Flex instance. Additionally, for more experienced developers, it is straight forward to extend the agent facing and customer facing single-page-applications to create any workflows / experiences / interfaces that you need.

Here is an overview of everything including in this repo:

IMAGE

The "customizable code base" at the bottom is what you will deploy from this repo. You will use a Twilio Flex Instance, Twilio Functions, Twilio Sync, and Twilio Servics. Customers/Prospects will be able to interact with this platform via a single page application and their devices. Finally, a single page application for agents will be embedded into Flex for the agent's "single pane of glass".

1. Create a new Flex Account
    1. Copy the phone number created, or used, for this Flex Account
    2. Go to Flex => Manage => Messaging and copy the Webchat Flow SID (starts with FO)
    3. End the trial for the newly created Flex Account so SMS and Voice work properly.
        1.  Copy this URL into a browser => https://www.twilio.com/console/flex/fair-usage-policy and agree to the Fair Use Policy.
        2.  Copy the Account SID and end the trial in Monkey.
2. Create a new Sync Service called "TwilioTable", and copy the SID for the new Sync Service
3. Download or clone this repo
4. run `npm install` from the main directory to add all of the necessary node dependencies. 
4. In the main directory, copy the file "sample.env" and rename the copy to ".env"
5. Update the TWILIO_SYNC_SERVICE_SID, TWILIO_PHONE_NUMBER, and the FLEX_FLOW_SID variables in the .env file using the variables copied in the steps above
6. Deploy the Twilio serverless service
    1. Run `twilio login` or `twilio profiles:list` and `twilio profiles:use` to be sure that you are deploying to the same account as your Flex account from step 1.
    2. Run `twilio serverless:deploy`
    3. Go to the console and navigate to Functions => Service => twilio-dfdp
    4. Find the asset /clients/twilio-table/index.html, click on the COPY URL link and save the URL -- this is the link to access your newly deployed TwilioTable instance (used to store all data for the applications).
    5. Find the asset /clients/customer-participation/index.html, click on the COPY URL link and save the URL -- this is the link to access the customer facing single page application. You will give this URL to customers when you want them to interact with your Flex instance.
7. Paste the URL copied in the last step into a web browser.
    1. Create the main table
    2. For each JSON file (8 of them) listed in the twilio-tables-json directoty, click on LISTS => NEW LIST in TwilioTable, select ADD FROM JSON, copy the json from the file, paste the json, check and then save to add the list to your TwilioTable instance.
8. For the 3 json files listed in the studio-json directory, create a new Studio Flow from the Console by selecting new flow, use the name of each JSON file as the name of the flow, and then use the import from JSON option, to create the new flow. You should now have 3 Studio Flows starting with "DFDP-" for Voice, Messaging, and Chat.
    1. Now we need to connect the new flows to the 3 channels. Go to PHONE NUMBERS => ACTIVE NUMBERS and then select your phone and update the Voice Handler to the new voice flow you just created: DFDP-Voice
    2.  Since new Flex accounts are starting to use Conversations, we need to create a legacy address to handle Chat. Go to FLEX => MANAGE => MESSAGING and then click CREATE NEW ADDRESS. Address type is "WebChat", use "DFDP-Chat" as the Friendly Name and set the DFDP-Chat Studio Flow for the Flex Integration.
    3.  Similarly, for inbound SMS, go to FLEX => MANAGE => MESSAGING and then click CREATE NEW ADDRESS. Address type is "SMS", use "DFDP-Messaging" as the Friendly Name and set the "DFDP-Messaging" Studio Flow for the Flex Integration.
9. Navigate to /dfdp-route/src and open the file DfdpRouterPlugin.js, and on line 45, edit the domain `https://<YOUR-TWILIO-DEMAIN>` to match the domain for your Twilio Serverless Service. You can use the TwilioTable url you copied above. Your updated variable should look something like this `https://abcd-1234-dev.twil.io`.
10. From the Flex Plugin directort, /dfdp-route/, run `npm install` to install of the node dependencies.
11. From the Flex Plugin directort, /dfdp-route/, run `twilio flex:plugins:start` to fire up a local version of Flex. You should already be logged into the Console of your Flex Account from step 1! This should start up Flex with the agent module waiting for a new task. Copy and paste into a web browser the url for the customer participation app from step 6.5, and start interacting! The support options will get you routed to the Flex Agent logged in on the other browser tab!
12. OPTIONAL! You can run Flex from your local machine just fine, but you can also deploy the plugin to your Flex Instance. To do this, skip to the DEPLOY YOUR FLEX PLUGIN part of this quickstart => https://www.twilio.com/docs/flex/quickstart/getting-started-plugin and follow the last instructions.


## Video Tutorials

### [Introduction to DFDP -- What is it and what can it do?](https://youtu.be/Ln-PZgzh2us)

### [Step-by-step DFDP Installtion](https://youtu.be/r-KxNoAKBJI)


## Local Development

If you want to extend any of the client single page applications, you can make changes in client-src/APPNAME/ folders. Edit the file "/client-src/APPNAME/.env.development" with the domain to your Twilio Serverless Service to be able to make http calls from your local machine. You can edit and deploy the Twilio Functions as needed. Run `npm run dev` to run locally, and then `npm run build` to push changes to the /assets folder which you can then deploy using `twilio serverless:deploy`
