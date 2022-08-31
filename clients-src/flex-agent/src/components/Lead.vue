<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'  
import { useContactStore } from '../stores/contactStore'
import { useListStore } from '../stores/listStore'
import { RouterLink } from 'vue-router'
import { timeStampToDate } from '../composables/timeStampToDate.js'
import Datepicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css'


export default {
  components: { Datepicker },
  setup() {
    
    const contactStore = useContactStore();
    const listStore = useListStore();
      
    const router = useRouter();
    const route = useRoute();

    const lObj = listStore.lists.find(o => o.uniqueName === 'LeadList');
    

    let leadId = (route.params.leadId) ? route.params.leadId : 'Not Found';

    const lead = ref({});

    const getLead = async () => {
      
      try {                
        let url = `${import.meta.env.VITE_DATA_URL}/twilio-table-sync/list-item-get-array?targetList=${lObj.sid}`;        
        url += `&filterField=Lead%20ID&filterFieldValue=${leadId}`;
        
        const res = await fetch(url, { method: "GET", cache: "no-store", headers: {'Content-type': 'application/json'} });
        if (res.ok) {
          let r = await res.json();
          console.log("in getLead and r => ", r);
          lead.value = r[0].data;          
        }
        
      } catch (e) { console.log("getLead error => ", e); }      

    }



    onMounted(() => {
        getLead();        
    });

    const birthdate = ref(new Date());
    const appointment = ref(new Date());

    const hasIvrVariables = computed(() => {
      return Object.keys(contactStore.currentContact.passedParams.variables).length > 0 ? true : false
    })   

    return {
      leadId, lead, birthdate, appointment,      
      timeStampToDate:timeStampToDate,
      hasIvrVariables, contactStore
    }
  }

}


</script>


<template>
  <div class="container-fluid">    
    
    <div class="card mb-3">
      <div class="card-header bg-light fw-bold">
        <i class="bi-lightning-fill"></i>
        Lead Actions
      </div>
      <div class="card-body p-2 text-center">
        <button class="btn btn-danger p-2">Close Lead</button>
        <button class="btn btn-warning p-2 ms-5">Not Reached</button>
        <button class="btn btn-info p-2 ms-5">Schedule Appointment</button>
        <button class="btn btn-success p-2 ms-5">Convert</button>
      </div>      
    </div>
    
    <div class="row">
      <div class="col-8">      

        <div class="card mb-3">
          <div class="card-header text-white bg-success fs-4 fw-bold">
            <i class="bi-cash"></i>
            Lead: {{leadId}} --
            {{lead['First Name'] }} {{ lead['Last Name'] }}
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
                      <label class="ps-1" for="inputPhone">Phone Number</label>
                    </div>                
                </div>  
                <div class="row g-3 mb-3">
                    <div class="col-4">
                      <input readonly type="name" v-model="lead['First Name']" class="form-control form-control-sm" id="inputFirst" placeholder="">
                    </div>
                    <div class="col-4">
                      <input readonly type="name" v-model="lead['Last Name']" class="form-control form-control-sm" id="inputLast" placeholder="">
                    </div>
                    <div class="col-4">
                      <input readonly type="name" v-model="lead['Phone']" class="form-control form-control-sm" id="inputPhone" placeholder="">
                    </div>                
                </div>    
                <div class="row g-3 mb-0">
                    <div class="col-8">
                      <label class="ps-1" for="inputFirst">Opt In/Out</label>
                    </div>
                    <div class="col-4">
                      <label class="ps-1" for="inputPhone">Email Address</label>
                    </div>                
                </div> 
                <div class="row g-3 mb-3">
                    <div class="col-8">
                      <div class="form-check form-check-inline">
                          <input readonly type="checkbox" class="form-check-input" name="hobbies" id="checkMusic" checked>
                          <label class="form-check-label" for="checkMusic">Lead Opt In</label>
                      </div>
                      <div class="form-check form-check-inline ms-3">
                          <input readonly type="checkbox" class="form-check-input" name="hobbies" id="checkTravel" checked>
                          <label class="form-check-label" for="checkTravel">SMS Opt In</label>
                      </div>
                      <div class="form-check form-check-inline ms-3">
                          <input readonly type="checkbox" class="form-check-input" name="hobbies" id="checkReading" checked>
                          <label class="form-check-label" for="checkReading">Mail Opt In</label>
                      </div>          
                    </div>                
                    <div class="col-4">
                      <input readonly type="name" v-model="lead['Email']" class="form-control form-control-sm" id="inputEmail" placeholder="">
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
                      <input readonly type="name" v-model="lead['Address']" class="form-control" id="inputFirst" placeholder="">
                    </div>
                    <div class="col-4">            
                      <input readonly type="name" v-model="lead['City']" class="form-control" id="inputLast" placeholder="">
                    </div>
                    <div class="col-4">
                      <input readonly type="name" v-model="lead['State']" class="form-control" id="inputLast" placeholder="">
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
                      <input readonly type="name" v-model="lead['Postal']" class="form-control form-control-sm" id="postal" placeholder="">
                    </div>
                    <div class="col-4">                    
                      <input readonly type="name" v-model="lead['Country']" class="form-control form-control-sm" id="country" placeholder="">
                    </div>     
                    <div class="col-4">                    
                      <select readonly v-model="lead['Lead Source']" class="form-control form-control-sm">
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
                        <input type="number" class="form-control form-control-sm" readonly placeholder="Age" aria-label="Username">
                        <select readonly v-model="lead['Sex']" class="form-control form-control-sm">
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
        </div><!-- COL -->
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
    </div><!-- ROW -->
  </div>
</template>
<style scoped>
.row-height{
  height: 100vh;
}
.scroll-column{  
  height: 100%;
  overflow-y: scroll;
}
</style>