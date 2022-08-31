# twilio-dfdp (Deployable Flex Demo Platform)

## A set of resources and patterns that deploy to YOUR OWN FLEX INSTANCE that allow creation more complex and custom Flex demos and POCs

We all agree that Flex is a programmable contact center, but how do we illustrate this point to people new to Flex? I have had success selling Flex using custom demos to help prospects understand how Flex is different and how that can make a big difference to their organization. All SEs should be able to spin up their own custom Flex demos.

This repo contains a flex plugin, serverless apps, studio flows, and patterns that will allow you to deploy a custom Flex demo to your own Flex instance. Additionally, for more experienced developers, it is straight forward to extend the agent facing and customer facing single-page-applications to create any workflows / experiences / interfaces that you need.

Here is an overview of everything including in this repo:

IMAGE

The "customizable code base" at the bottom is what you will deploy from this repo. You will use a Twilio Flex Instance, Twilio Functions, Twilio Sync, and Twilio Servics. Customers/Prospects will be able to interact with this platform via a single page application and their devices. Finally, a single page application for agents will be embedded into Flex for the agent's "single pane of glass".

1. Create a new Flex Account or use and existing Flex Account
    1. Copy the phone number created, or used, for this Flex Account
    2. Go to Flex => Manage => Messaging and copy the Webchat Flow SID (starts with FO)
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
8. For each of the json files listed in the studio-json directory, copy and paste the flow json from the file into the corresponding Flows in your Twilio Flex Account (Voice, Messaging, Chat).
9. Navigate to /dfdp-route/src and open the file DfdpRouterPlugin.js, and on line 45, edit the domain `https://<YOUR-TWILIO-DEMAIN>` to match the domain for your Twilio Serverless Service. You can use the TwilioTable url you copied above. Your updated variable should look something like this `https://abcd-1234-dev.twil.io`.
10. From the Flex Plugin directort, /dfdp-route/, run `npm install` to install of the node dependencies.
11. From the Flex Plugin directort, /dfdp-route/, run `twilio flex:plugins:start` to fire up a local version of Flex. You should already be logged into the Console of your Flex Account from step 1! This should start up Flex with the agent module waiting for a new task. Copy and paste into a web browser the url for the customer participation app from step 6.5, and start interacting! The support options will get you routed to the Flex Agent logged in on the other browser tab!
12. OPTIONAL! You can run Flex from your local machine just fine, but you can also deploy the plugin to your Flex Instance. To do this, skip to the DEPLOY YOUR FLEX PLUGIN part of this quickstart => https://www.twilio.com/docs/flex/quickstart/getting-started-plugin and follow the last instructions.


## Video Tutorials

### [TwilioTable Installation and Configuration](https://youtu.be/f8qunHlClZ4)

### [Using TwilioTable with Studio](https://www.youtube.com/watch?v=f-ZY194B2f4)


## Single Page Application

The source code for the single page application is writting in Vuejs 3 and it is in this repo. You are welcome to develop locally to customize or extend TwilioTable. Run `npm run dev` from the twilio-table/client-src/twilio-table/ directory to figure up a local dev server.

Run `npm run build` to build a new version of the SPA. The files get placed in the /assets directory and will get deployed when running `twilio serverless:deploy` from the root directory.



## Local Development

If you want to extend the TwilioTable client source code, you can make changes in twilio-table/client-src/twilio-table/. Edit the file "twilio-table/client-src/twilio-table/.env.development" with the domain to your Twilio Serverless Service to be able to make http calls from your local machine. You can edit and deploy the Twilio Functions as needed.
