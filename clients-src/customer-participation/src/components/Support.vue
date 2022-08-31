<script>  
import { ref, onBeforeMount, onMounted } from 'vue'
import { useRouter, useRoute, RouterLink } from 'vue-router'
import { useListStore } from '../stores/listStore'
import { useAccountStore } from '../stores/accountStore'  
import { useEnvStore } from '../stores/envStore'  
import { useCheckEnvVars } from '../composables/check-env-vars.js'
import VueQrcode from 'vue-qrcode'

export default {
    components: {
      VueQrcode,
    },    
    setup() {      

      const route = useRoute();

      const listStore = useListStore();  
      const accountStore = useAccountStore(); 
      const envStore = useEnvStore();   
      
      let instructions = (route.params?.instructions) ? route.params.instructions : "none";

      //---------- CHAT SET UP

      let twilioRed = '#F22F46';
      let twilioRedDarker = '#DE2137';
      let textColor = '#FFFFFF';      

    const TwilioChatAppConfig = {
        accountSid: envStore.envVars.twilioAccountSid,
        flexFlowSid: envStore.envVars.twilioFlexFlowId,
        context: {
              friendlyName: "Customer",
              isWebchatDemo: false
        },
        startEngagementOnInit: false,
          colorTheme: {
              overrides: {
                  EntryPoint: {
                      Container: {
                          background: twilioRed,
                          color: textColor,
                          "&:hover": {
                              backgroundColor: twilioRedDarker
                          }
                      }
                  }
              }
          },
          fileAttachment: {
              enabled: true
          }

    }
    if (accountStore.account.ContactId) {
        // Logged in account
        TwilioChatAppConfig.preEngagementConfig = {
            description: "Please provide some information",
            fields: [
                {
                    label: "Your customer ID:",
                    type: "InputItem",
                    attributes: {
                        name: "customerID",
                        required: true,
                        readOnly: true,
                        value: accountStore.account.ContactId
          
                    }
                }, 
                {
                    label: "How can we help you today?",
                    type: "SelectItem",
                    attributes: {
                        name: "customerIntent",
                        required: true,
                        readOnly: false
          
                    },
                    options: [
                        {
                            value: "Order",
                            label: "Order",
                            selected: false
                        },
                        {
                            value: "Support",
                            label: "Support",
                            selected: false
                        },
                        {
                            value: "Sales",
                            label: "Sales",
                            selected: false
                        },                        
                        {
                            value: "Something Else",
                            label: "Something Else",
                            selected: false
                        }
                    ]
                }
            ],
            submitLabel: "Ok Let's Go!"
        }                    
    } else {
        // Not logged in...
        TwilioChatAppConfig.preEngagementConfig = {
            description: "Please provide some information",
            fields: [
                {
                    label: "Your customer ID:",
                    type: "InputItem",
                    attributes: {
                        name: "customerID",
                        required: true,
                        readOnly: true,
                        value: "Anonymous"
          
                    }
                }, 
                {
                    label: "How can we help you today?",
                    type: "SelectItem",
                    attributes: {
                        name: "customerIntent",
                        required: true,
                        readOnly: false
          
                    },
                    options: [
                        {
                            value: "Order",
                            label: "Order",
                            selected: false
                        },
                        {
                            value: "Support",
                            label: "Support",
                            selected: false
                        },
                        {
                            value: "Sales",
                            label: "Sales",
                            selected: false
                        },                        
                        {
                            value: "Something Else",
                            label: "Something Else",
                            selected: false
                        }
                    ]
                }
            ],
            submitLabel: "Ok Let's Go!"            
        }   
    }
    
    const chatInitiated = ref(false);

    function initWebChat() {
        chatInitiated.value = true;
        Twilio.FlexWebChat.createWebChat(TwilioChatAppConfig)
        .then((webChat) => {
            Twilio.FlexWebChat.MainHeader.defaultProps.showTitle = false;
            webChat.init();        
            setTimeout(() => {
                if (!webChat.manager.store.getState().flex.session.isEntryPointExpanded) {
                Twilio.FlexWebChat.Actions.invokeAction("ToggleChatVisibility");
                }
            },
            webChat.manager.store.getState().flex.session.channelSid ? 5000 : 100
            );
        });
    }

    onBeforeMount(async () => {
        // MAKE SURE THAT MAIN TABLE SID IS SET
        useCheckEnvVars();         
        if (listStore.lists.length === 0) {
            await listStore.getAllSyncLists();
            console.log("lists => ", listStore.lists);
        }
    })
      
    onMounted(() => {
        //initWebChat();
    })

      return {
        twilnum:envStore.envVars.twilioPhoneNumber, instructions,
        qr:{type:'image/png',margin:0, quality:0.95,width:250, color:{ dark: '#000000ff', light: '#ffffffff' }},
        initWebChat, accountStore, chatInitiated
      }
    }
}
</script>

<template>
  <div class="container-fluid pt-3">

    <div class="alert alert-success" v-show="accountStore.account.ContactId">
        You are logged in as {{accountStore.account['First Name']}} {{accountStore.account['Last Name']}}.
    </div>
    <div class="alert alert-warning" v-show="!accountStore.account.ContactId">
        You are not logged in.
        <router-link class="btn btn-sm btn-secondary float-end" to="/login">
            <i class="bi-box-arrow-in-right"></i>
            Login
        </router-link>
    </div>

    <div v-show="instructions==='lead'" class="card text-dark bg-info mb-3">
        <div class="card-header">
            <i class="bi-cash-stack"></i>
            Lead Workflow
        </div>
        <div class="card-body">
            <h5 class="card-title">So you are interested in finding out more...</h5>
            <p class="card-text">
                Use one of the channels below to reach out to our sales team. 
                Select the "lead" option for any channel you choose. 
            </p>
        </div>
    </div>

    <div class="container px-4 py-5" id="hanging-icons">
        <h2 class="pb-2 border-bottom">Contact Support on the Channel of your choice!</h2>
        <div class="row g-4 py-5 row-cols-1 row-cols-lg-3">
          <div class="col d-flex align-items-start">
            <div>
              <h2 class="mb-4"><i class="bi-telephone-fill"  style="font-size: 2rem;"></i> Call</h2>  
              <h4 class="mb-4 text-center">{{twilnum}}</h4>  
              
              <vue-qrcode :value="'tel:'+twilnum" :margin="qr.margin" :color="qr.color" :type="qr.type" :quality="qr.quality" :width="qr.width"/>                            
            </div>
          </div>
          <div class="col d-flex align-items-start">
            <div>
              <h2 class="mb-4"><i class="bi-chat-right-fill"  style="font-size: 2rem;"></i> SMS</h2>                          
              <h4 class="mb-4 text-center">{{twilnum}}</h4>  
              <vue-qrcode :value="'sms:'+twilnum+'&body=Support'" :margin="qr.margin" :color="qr.color" :type="qr.type" :quality="qr.quality" :width="qr.width"/>                            
            </div>
          </div>  
          <div class="col d-flex align-items-start">
            <div>
              <h2 class="mb-5"><i class="bi-chat-fill"  style="font-size: 2rem;"></i> Chat</h2>
              
              <button v-show="!chatInitiated" @click="initWebChat()" class="btn btn-primary"><i class="bi-chat-fill"></i> Initiate Chat</button>
              <div id="customer-view-banner"></div>
            </div>
          </div>                    
        </div>
      </div>

  </div>
</template>

<style scoped>
</style>
