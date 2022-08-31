import { defineStore } from 'pinia'

export const useEnvStore = defineStore('envVars', {
  state: () => ({ envVars: {twilioAccountSid:null,twilioFlexFlowId:null,twilioPhoneNumber:null,twilioSyncServiceSid:null} }),
  getters: {},
  actions: {
    async getEnvironmentVariables() {  
      try {
          let url = `${import.meta.env.VITE_DATA_URL}/twilio-table-sync/system/return-all-variables`;            
          const res = await fetch(url, { method: "GET", headers: {'Content-type': 'application/json'} });
          console.log("res => ", res);
          if (res.ok) {
            let r = await res.json();
            console.log("in getEnvironmentVariables and r => ", r);            
            r.forEach(v => {
              console.log("v.key => ", v.key);            
              if (v.key === "TWILIO_SYNC_SERVICE_SID") {
                this.envVars.twilioSyncServiceSid = v.value;
                this.envVars.twilioAccountSid = v.accountSid;
              } else if (v.key === "TWILIO_PHONE_NUMBER") {
                this.envVars.twilioPhoneNumber = v.value;
              } else if (v.key === "FLEX_FLOW_SID") {
                this.envVars.twilioFlexFlowId = v.value;
              }
            })
          }
      } catch (e) {
        console.log("Error in getEnvironmentVariables => ", e)
      }
    
    }    
  }
})
