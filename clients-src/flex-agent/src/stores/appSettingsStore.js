import { defineStore } from 'pinia'

export const useAppSettingsStore = defineStore('company', {
  state: () => ({ settings: null }),
  getters: {},
  actions: {    
    async getAppSettings() {    
      try {
        let url = `${import.meta.env.VITE_DATA_URL}/twilio-table-sync/document-get-by-unique-name?uniqueName=AppSettings`;          
        const res = await fetch(url, { method: "GET", cache: "no-store", headers: {'Content-type': 'application/json'} })
        //console.log("res => ", res);
        if (res.ok) {
          let r = await res.json();
          //console.log("r => ", r);
          this.settings = r.data;
        } 
      } catch (e) { console.log("getAppSettings error => ", e); }
    
    }
  }
})
