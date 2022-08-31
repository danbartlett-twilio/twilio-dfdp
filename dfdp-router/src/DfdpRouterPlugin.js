import React from 'react';
import { VERSION } from '@twilio/flex-ui';
import { FlexPlugin } from '@twilio/flex-plugin';

import CustomTaskListContainer from './components/CustomTaskList/CustomTaskList.Container';
import reducers, { namespace } from './states';

const PLUGIN_NAME = 'DfdpRouterPlugin';

export default class DfdpRouterPlugin extends FlexPlugin {
  constructor() {
    super(PLUGIN_NAME);
  }

  /**
   * This code is run when your plugin is being started
   * Use this to modify any UI components or attach to the actions framework
   *
   * @param flex { typeof import('@twilio/flex-ui') }
   * @param manager { import('@twilio/flex-ui').Manager }
   */
  async init(flex, manager) {
    this.registerReducers(manager);

    flex.CRMContainer.defaultProps.uriCallback = (task) => {
      console.log("task => ", task);
      
      /**
       * This Flex Plugin takes tasks coming from Studio (SEND TO FLEX Widget) 
       * and formats in them in a way that the flex-agent app can route them
       * correctly.
       * 
       * The key param from Studio is the targetPage param which can specify
       * which page an agent sees when pulling up this task. Since targetPage
       * can be easily set in Studio, it makes it easier to customize what the
       * agent ends up seeing based on user choices.
       * 
       * the name param passed from Studio is a phone number for SMS and Voice,
       * and is something different in Chat. "Anonymous" is passed from the
       * customer-participation app if a contact id (logged in user) has not
       * been set.
       * 
       */

      const twilioServiceDomain = "https://<YOUR-TWILIO-DEMAIN>"; // <--- SET TO YOUR TWILIO RUNTIME SERVICE DOMAIN (something like esds-3990-dev.twil.io)
      //const twilioServiceDomain = "http://localhost:5050";  Uncomment for local development for flex-agent
      const flex_agent_client_path = twilioServiceDomain + "/clients/flex-agent/index.html#/" // Path to Agent SPA hosted in Assets
      const flex_agent_client_path_entry = flex_agent_client_path + "entry/"; // Routing page in SPA (routes bassed on attributes)

      // twilio_runtime_domain + flex_agent_client_path + TASK ATTRIBUTES
      // '/entry/:name/:channelType/:channelSid/:targetPage?/:passedParams?'
      // :name => phone number or passed customer ID
      // :channelType => web / sms / call
      // :channelSid => id of interaction
      // :targetPage => passed from Studio Flow
      // :passedParams => delimited string of key/value pairs ( key:value|key2:value2|key3:value3), assembeled in Studio SendToFlex Widget    

      return task 

        ? `${flex_agent_client_path_entry}${task.attributes.name}/${task.attributes.channelType}/${task.attributes.channelSid}/${task.attributes.targetPage}/${task.attributes?.flowVariables}`
        : `${flex_agent_client_path}`

      }

    const options = { sortOrder: -1 };
    flex.AgentDesktopView.Panel1.Content.add(<CustomTaskListContainer key="DfdpRouterPlugin-component" />, options);
  }

  /**
   * Registers the plugin reducers
   *
   * @param manager { Flex.Manager }
   */
  registerReducers(manager) {
    if (!manager.store.addReducer) {
      // eslint-disable-next-line
      console.error(`You need FlexUI > 1.9.0 to use built-in redux; you are currently on ${VERSION}`);
      return;
    }

    manager.store.addReducer(namespace, reducers);
  }
}
