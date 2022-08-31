import { defineStore } from 'pinia'
import { useListStore } from '../stores/listStore'

export const useContactStore = defineStore('contact', {
  state: () => ({ 
    currentContact: {
      anonymous: true,
      contact: {},      
      passedParams: {
        channelName: null,
        channelType: null, 
        channelSid: null,
        targetPage: null,
        variables: {}
      }
    }
  }),
  getters: {},
  actions: {
    async getContact(params) {
      console.log("in getContact and params are => ", params);
      
      // #1 Set passed in params
      this.currentContact.passedParams.channelName = params.name;
      this.currentContact.passedParams.channelType = params.channelType;
      this.currentContact.passedParams.channelSid = params.channelSid;
      this.currentContact.passedParams.targetPage = params.targetPage;
      this.parsePassedParams(params.passedParams)

      // #2 See if contact exists in Contacts List
      // Search by Phone Number, User ID      
      console.log('calling getContact');
      const listStore = useListStore()     
      const cObj = await listStore.lists.find(o => o.uniqueName === 'ContactsList'); 
      console.log('cObj => ', cObj);
      try {
        let filterField = 'Phone Number';
        if (params.channelType === 'web' && params.name != 'Anonymous') {
          filterField = 'ContactId';
        }
        this.currentContact.anonymous = true;
        let url = `${import.meta.env.VITE_DATA_URL}/twilio-table-sync/list-item-get-array?targetList=${cObj.sid}&filterField=${encodeURIComponent(filterField)}&filterFieldValue=${encodeURIComponent(params.name)}`;
        const res = await fetch(url, { method: "GET", cache: "no-store", headers: {'Content-type': 'application/json'} })
        //console.log("getContact res => ", res);
        if (res.ok) {
          let r = await res.json();
          //console.log("contactStore.getContact r => ", r);
          if (r.length>0) {
            this.currentContact.anonymous = false;
            this.currentContact.contact = r[0];
          } else {
            if (params.channelType === 'web') {
              filterField = 'LastChannelSid';                
              let chatCheckUrl = `${import.meta.env.VITE_DATA_URL}/twilio-table-sync/list-item-get-array?targetList=${cObj.sid}&filterField=${encodeURIComponent(filterField)}&filterFieldValue=${encodeURIComponent(params.channelSid)}`;
              const cres = await fetch(chatCheckUrl, { method: "GET", cache: "no-store", headers: {'Content-type': 'application/json'} })
              if (cres.ok) {
                let r = await cres.json();
                //console.log("contactStore.getContact r => ", r);
                if (r.length>0) {
                  this.currentContact.anonymous = false;
                  this.currentContact.contact = r[0];
                }
              }      
            }                           
          }            
        } 
      } catch (e) { console.log("getAllSyncLists error => ", e); }      

    
    },
    parsePassedParams(p) {
      console.log("passedParams => ", p)
      let params = p.split("|");
      params.forEach(i => {
        console.log("passedParam => ", i)
        let kv = i.split("::", 2)
        this.currentContact.passedParams.variables[kv[0]] = kv[1]
      })
    }
  },
})
