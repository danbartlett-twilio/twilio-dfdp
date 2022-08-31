<script>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'  
import { useListStore } from '../stores/listStore'
import { RouterLink } from 'vue-router'
import { timeStampToDate } from '../composables/timeStampToDate.js'
import Datepicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css'
import { returnNewId } from '../composables/returnnewid.js'
import { useContactStore } from '../stores/contactStore'
import { returnCountryCodes } from '../composables/country-codes.js'

export default {
  components: { Datepicker },
  setup() {

    const listStore = useListStore();
    const contactStore = useContactStore();
      
    const newLeadId = returnNewId()

    const countryCodes = returnCountryCodes();

    const router = useRouter();
    const route = useRoute();

    const lObj = listStore.lists.find(o => o.uniqueName === 'LeadList');
    
    const leads = ref([]);

    const getLeads = async () => {
      
      try {                
        let url = `${import.meta.env.VITE_DATA_URL}/twilio-table-sync/list-item-get-array?targetList=${lObj.sid}`;        

        const res = await fetch(url, { method: "GET", cache: "no-store", headers: {'Content-type': 'application/json'} });
        if (res.ok) {
          let r = await res.json();
          console.log("in getLeads and r => ", r);
          leads.value = r.sort((a, b) => b.data['Created'] - a.data['Created']);;
        }
        
      } catch (e) { console.log("getLeads error => ", e); }      

    }

    const savingLead = ref(false); 
    const leadSaved = ref(false);

    const saveLead = async () => {
        savingLead.value = true;
        let a = await callSaveLead();
        savingLead.value = false;
        leadSaved.value = true;
        
        router.replace( { name: 'lead', params:{leadId:newLeadId} })
    }      

    const callSaveLead = async () => {

      console.log("in callSaveLead...")     
      lead.Phone = e164Number.value;
      let url = `${import.meta.env.VITE_DATA_URL}/twilio-table-sync/list-item-create?targetList=${lObj.sid}`;
      const newLead = await fetch(url, { method: "POST", headers: {'Content-type': 'application/json'}, body: JSON.stringify({"payload": lead}) });
      if (newLead.ok) {
        return await newLead.json();        
      } else {
        return false
      }

    }

    onMounted(() => {
        getLeads();
    });

    const leadFormFilled = computed(() => {
      return (
              lead['First Name'] != "" && 
              lead['Last Name'] != "" && 
              lead['Phone'] != ""
              ) ? true : false; 
    });

    const e164Number = computed(() => lead['Country Code']+lead['Phone']);      

    const lead = reactive({
      'Lead ID': newLeadId,
      'First Name':"",'Last Name':"",'Country Code':'','Phone':"",'Email':"",
      'Address':"",'City':"",'State':"",'Postal':"",
      'Lead Source':"",'Age':"",'Sex':"",
      'Agent':"",'CRM ID': Math.floor(Math.random() * 1000000000),
      'Created':Date.now()
    });
    const birthdate = ref(new Date());
    const appointment = ref(new Date());
    const showLeadList = ref(false);

    const hasIvrVariables = computed(() => {
      return Object.keys(contactStore.currentContact.passedParams.variables).length > 0 ? true : false
    })                                

    return {
     birthdate, appointment, 
     showLeadList, leads, lead, saveLead, 
     savingLead, leadFormFilled, timeStampToDate:timeStampToDate,
     contactStore, hasIvrVariables, countryCodes, e164Number
    }
  }

}


</script>


<template>
  <div class="container-fluid">
    <div class="card mb-3">
      <div class="card-header text-white bg-secondary fs-4 fw-bold">
        <i class="bi-cash-stack"></i>
        All Leads
        <button v-show="!showLeadList" @click="showLeadList=true" class="btn btn-sm btn-info float-end">            
          <i class="bi-arrow-left-square"></i>          
        </button>
        <button v-show="showLeadList" @click="showLeadList=false" class="btn btn-sm btn-info float-end">            
          <i class="bi-arrow-down-square"></i>          
        </button>        
      </div>
      <div v-show="showLeadList" class="card-body p-2">    
        <table class="table table-striped">
          <thead>
            <tr>
              <th>Name</th>
              <th>Created</th>
              <th>Lead Source</th>              
              <th class="text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="l in leads" v-bind:key="l.index">
              <td>{{l?.data['First Name']}} {{l.data['Last Name']}}</td>              
              <td>{{timeStampToDate(l?.data['Created'])}}</td>
              <td>{{l.data['Lead Source']}}</td>
              <td class="text-center">
                <router-link class="btn btn-primary" :to="{name: 'lead', params: { leadId: l.data['Lead ID'] }}" title="Knowledge">
                  <i class="bi-cash"></i>
                </router-link>                        
              </td>          
            </tr>
          </tbody>
        </table>        
      </div>
    </div>

    <div class="row">
      <div class="col-8">
        <div class="card mb-3">
          <div class="card-header bg-warning fs-4 fw-bold">
            <i class="bi-cash-coin"></i>
            Add New Lead
          </div>
          <div class="card-body p-2">    

            <div class="row g-3 mb-0">
                <div class="col-4">
                  <label class="ps-1" for="inputFirst">First Name</label>
                </div>
                <div class="col-4">
                  <label class="ps-1" for="inputPhone">Last Name</label>
                </div>
                <div class="col-4">
                  <label class="ps-1" for="inputPhone">Email</label>
                </div>                
            </div>  
            <div class="row g-3 mb-3">
                <div class="col-4">
                  <input type="name" v-model="lead['First Name']" class="form-control form-control-sm" id="inputFirst" placeholder="">
                </div>
                <div class="col-4">
                  <input type="name" v-model="lead['Last Name']" class="form-control form-control-sm" id="inputLast" placeholder="">
                </div>
                <div class="col-4">
                  <input type="name" v-model="lead['Email']" class="form-control form-control-sm" id="inputEmail" placeholder="">
                </div>                
            </div>   
            <div class="row g-3 mb-0">
                <div class="col-4">
                  <label class="ps-1" for="inputFirst">Country</label>
                </div>
                <div class="col-4">
                  <label class="ps-1" for="inputPhone">Phone</label>
                </div>
                <div class="col-4">
                  <label class="ps-1" for="inputPhone">E.164 Phone</label>
                </div>                
            </div>  
            <div class="row g-3 mb-3">
                <div class="col-4">
                  <select class="form-control form-control-sm" v-model="lead['Country Code']">              
                    <option v-for="c in countryCodes" :key="c.code" :value="c.code" :selected="c.code==lead['Country Code']">{{ c.country }}</option>
                  </select>
                </div>
                <div class="col-4">
                  <input type="number" v-model="lead['Phone']" class="form-control form-control-sm" id="exampleFormControlInput1" placeholder="5555551212" />
                </div>
                <div class="col-4">
                  <input type="name" v-model="e164Number" class="form-control form-control-sm" id="inputEmail" disabled placeholder="">
                </div>                
            </div>              
            <div class="row g-3 mb-0">
                <div class="col-12">
                  <label class="ps-1" for="inputFirst">Opt In/Out</label>
                </div>
            </div> 
            <div class="row g-3 mb-3">
                <div class="col-12">
                  <div class="form-check form-check-inline">
                      <input type="checkbox" class="form-check-input" name="hobbies" id="checkMusic" checked>
                      <label class="form-check-label" for="checkMusic">Lead Opt In</label>
                  </div>
                  <div class="form-check form-check-inline ms-3">
                      <input type="checkbox" class="form-check-input" name="hobbies" id="checkTravel" checked>
                      <label class="form-check-label" for="checkTravel">SMS Opt In</label>
                  </div>
                  <div class="form-check form-check-inline ms-3">
                      <input type="checkbox" class="form-check-input" name="hobbies" id="checkReading" checked>
                      <label class="form-check-label" for="checkReading">Mail Opt In</label>
                  </div>          
                </div>                     
            </div>  
            <div class="row g-3 mb-0">
                <div class="col-4">
                  <label class="ps-2" for="inputFirst">Address</label>
                </div>
                <div class="col-4">
                  <label class="ps-2" for="inputPhone">City</label>
                </div>
                <div class="col-4">
                  <label class="ps-2" for="inputPhone">State</label>
                </div>        
            </div>  
            <div class="row g-3 mb-3">
                <div class="col-4">
                  <input type="name" v-model="lead['Address']" class="form-control" id="inputFirst" placeholder="">
                </div>
                <div class="col-4">            
                  <input type="name" v-model="lead['City']" class="form-control" id="inputLast" placeholder="">
                </div>
                <div class="col-4">
                  <input type="name" v-model="lead['State']" class="form-control" id="inputLast" placeholder="">
                </div>        
            </div>       
            <div class="row g-3 mb-0">
                <div class="col-4">            
                  <label class="ps-2" for="inputFirst">Postal</label>
                </div>
                <div class="col-4">                    
                  <label class="ps-2" for="inputPhone">Country</label>          
                </div>     
                <div class="col-4">                    
                  <label class="ps-2" for="inputPhone">Lead Source</label>          
                </div>             
            </div>   
            <div class="row g-3 mb-3">
                <div class="col-4">            
                  <input type="name" v-model="lead['Postal']" class="form-control form-control-sm" id="postal" placeholder="">
                </div>
                <div class="col-4">                    
                  <input type="name" v-model="lead['Country']" class="form-control form-control-sm" id="country" placeholder="">
                </div>     
                <div class="col-4">                    
                  <select v-model="lead['Lead Source']" class="form-control form-control-sm">
                    <option>Advertisement</option>
                    <option>Web</option>
                    <option>Commercial</option>
                    <option>Billboard</option>
                    <option>Radio</option>
                  </select>    
                </div>             
            </div>   
            <div class="row g-3 mb-0">
                <div class="col-4">                            
                      <label for="birtdate">Birthdate</label> 
                </div>
                <div class="col-4">                            
                      <label for="age">Age / Sex</label> 
                </div>        
                <div class="col-4">                            
                      <label for="crmId">CRM ID</label> 
                </div>        
            </div>     
            <div class="row g-3 mb-3">
                <div class="col-4">              
                      <Datepicker v-model="birthdate" :enableTimePicker="false"></Datepicker>     
                </div>
                <div class="col-4">
                  <div class="input-group mb-3">            
                    <input  v-model="lead['Age']" type="number" class="form-control form-control-sm" placeholder="Age" aria-label="Username">
                    <select v-model="lead['Sex']" class="form-control form-control-sm">
                      <option></option>
                      <option>Female</option>
                      <option>Male</option>
                    </select>            
                  </div>            

                </div>
                <div class="col-4">            
                  <input type="name" v-model="lead['CRM ID']" disabled class="form-control form-control-sm" id="inputLast" placeholder="">
                </div>        
            </div> 
            <div class="mt-4 d-grid">                            
              <button @click="saveLead()" v-show="!savingLead" :disabled="!leadFormFilled" class="btn btn-warning btn-block">Save Lead</button>                
              <div v-show="savingLead" class="spinner-border" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>                 

            </div>                    
          </div>
        </div>
        <div class="card mb-3" v-show="hasIvrVariables" >

            <div class="card-header bg-info  fs-6 fw-bold">Variables from IVR</div>
            <div class="card-body p-2">
                <table class="table table-striped">
                    <tbody>
                        <tr v-for="(value, name, index) in contactStore?.currentContact.passedParams.variables" :key="index" v-show="name !== undefined">
                            <td>{{name}}</td>
                            <td>{{value}}</td>
                        </tr>
                    </tbody>
                </table>

            </div>
        </div>        
      </div>
      <div class="col-4">
        <div class="card mb-3">
          <div class="card-header text-white bg-primary fs-4 fw-bold">
            <i class="bi-calendar"></i>
            Schedule Appointment
          </div>
          <div class="card-body p-2 mt-4">   
            <Datepicker v-model="appointment" :enableTimePicker="true"></Datepicker>  
            <div class="mt-4">
              <label class="ps-1" for="inputPhone">Select Agent</label>
              <select class="form-control form-control-sm">
                <option>Any</option>
                <option>Carrie Mathison</option>
                <option>Ethan Hunt</option>
                <option>James Bond</option>
                <option>Jason Boure</option>                
              </select>                
            </div>       
            <div class="mt-4 d-grid">              
              <button class="btn btn-primary btn-block">Schedule</button>                
            </div>                         
          </div>
        </div>
      </div>      
    </div>

  </div>
</template>