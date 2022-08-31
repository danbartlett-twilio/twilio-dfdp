<script>

import { ref, reactive, computed, onBeforeMount } from 'vue'
import { useRouter } from 'vue-router'
import { useContactStore } from '../stores/contactStore'
import { useListStore } from '../stores/listStore'
import { returnCountryCodes } from '../composables/country-codes.js'
import { returnNewId } from '../composables/returnnewid.js'

export default {
  setup() {

    const router = useRouter();

    const contactStore = useContactStore();
    const listStore = useListStore();  

    const countryCodes = returnCountryCodes();

    const newUserId = returnNewId();

    const account = reactive({'First Name':"",'Last Name':"",'Country Code':"+1",'Phone Number':"",'Email':""});
    const e164Number = computed(() => account['Country Code']+account['Phone Number']);      
    const accountFormFilled = computed(() => {
      return (
              account['First Name'] != "" && 
              account['Last Name'] != "" && 
              account['Phone Number'] != ""
              ) ? true : false; 
    });

    const contactObj = listStore.lists.find(o => o.uniqueName === 'ContactsList');
      
     
    const creatingAccount = ref(false); 
    const accountCreated = ref(false);

    const createAccount = async () => {        
        creatingAccount.value = true;

        let accountExists = await checkExistingAccount();
        
        if (!accountExists) {
        
          let a = await callCreateAccount();
          contactStore.currentContact.anonymous = false;
          contactStore.currentContact.contact = a;
          creatingAccount.value = false;
          accountCreated.value = true;
          router.replace( { name: 'contact' })

        } else {
          router.replace( { name: 'contact' })
        }               
        
    }      

    const checkExistingAccount = async () => {  
      let filterField = 'Phone Number';
      let url = `${import.meta.env.VITE_DATA_URL}/twilio-table-sync/list-item-get-array?targetList=${contactObj.sid}&filterField=${encodeURIComponent(filterField)}&filterFieldValue=${encodeURIComponent(e164Number.value)}`;
      const res = await fetch(url, { method: "GET", cache: "no-store", headers: {'Content-type': 'application/json'} })
      //console.log("getContact res => ", res);
      if (res.ok) {
        let r = await res.json();
        //console.log("contactStore.getContact r => ", r);
        if (r.length>0) {            
          contactStore.currentContact.anonymous = false;
          contactStore.currentContact.contact = r[0];
          return true;
        } else {
          return false
        }       
      }
    }

    const callCreateAccount = async () => {

      console.log("in createAccount...")     

      let a = {
        "ContactId":newUserId,
        "First Name":account['First Name'],
        "Last Name":account['Last Name'],
        "Phone Number":e164Number.value,
        "Email":account['Email'],
        "Address":"375 Beale St, Suite 300",
        "City":"San Francisco",
        "State":"CA",
        "Postal":94105,
        "Account Number": Math.floor(Math.random() * 1000000000),
        "isAdmin":false,
        "avatar":`/clients/flex-agent/images/avatars/${Math.floor(Math.random()*10)}.png`,
        "LastChannelSid":contactStore.currentContact.passedParams.channelSid
      };

      let url = `${import.meta.env.VITE_DATA_URL}/twilio-table-sync/list-item-create?targetList=${contactObj.sid}`;
      const newContact = await fetch(url, { method: "POST", headers: {'Content-type': 'application/json'}, body: JSON.stringify({"payload": a}) });
      if (newContact.ok) {
        return await newContact.json();        
      } else {
        return false
      }


    }

    onBeforeMount(async () => {        
    })

    const hasIvrVariables = computed(() => {
      return Object.keys(contactStore.currentContact.passedParams.variables).length > 0 ? true : false
    })            


    return {
      account, e164Number, accountFormFilled, countryCodes,
      createAccount, creatingAccount, accountCreated, contactStore,
      hasIvrVariables

    }
  }

}

</script>

<template>
  <div class="container-fluid">
    <div class="card mb-3">
      <div class="card-header text-white bg-secondary fs-4 fw-bold">
        <i class="bi-person-plus"></i>
        Add New Contact
      </div>
      <div class="card-body p-2">
        
        <div class="" v-show="!accountCreated">
          <div class="mb-3">
            <label for="exampleFormControlInput1" class="form-label">First Name</label>
            <input type="text" v-model="account['First Name']" class="form-control" id="exampleFormControlInput1" placeholder="">
          </div>
          <div class="mb-3">
            <label for="exampleFormControlInput1" class="form-label">Last Name</label>
            <input type="text" v-model="account['Last Name']" class="form-control" id="exampleFormControlInput1" placeholder="">
          </div>              
          <div class="">
            <label for="exampleFormControlInput1" class="form-label">Phone Number</label>                
          </div>  
          <div class="input-group mb-3">                
            <select class="form-select" v-model="account['Country Code']">              
              <option v-for="c in countryCodes" :key="c.code" :value="c.code" :selected="c.code==account['Country Code']">{{ c.country }}</option>
            </select>
            <input type="number" v-model="account['Phone Number']" class="form-control" id="exampleFormControlInput1" placeholder="5555551212" />
          </div>   
          <div class="mb-3">
            <label for="exampleFormControlInput1" class="form-label">E+164 Phone Number</label>
            <input type="text" disabled v-model="e164Number" class="form-control" id="exampleFormControlInput1" placeholder="Doe">
          </div>                           

          <div class="mb-3">
            <label for="exampleFormControlInput1" class="form-label">Email</label>
            <input type="text"  v-model="account['Email']" class="form-control" id="exampleFormControlInput1" placeholder="user@domain.com" >
          </div>  
            <div class="d-grid">
              <button @click="createAccount()" v-show="!creatingAccount" :disabled="!accountFormFilled" class="btn btn-primary btn-lg">Create Account</button>
              <div v-show="creatingAccount" class="spinner-border" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>              
            </div> 
        </div> 



        <div class="alert alert-success" v-show="accountCreated">
          <p class="lead">
            <b>Success! Account Created!</b>
          </p>
          <p class="lead">
            Use an option in the left menu to continue.
          </p>          
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
</template>