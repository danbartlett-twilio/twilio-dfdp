<script>  
  import { ref, reactive, computed, onBeforeMount, onMounted } from 'vue'
  import { RouterLink } from 'vue-router'
  import { useListStore } from '../stores/listStore'
  import { useAccountStore } from '../stores/accountStore'  
  import { returnCountryCodes } from '../composables/country-codes.js'
  import { returnNewId } from '../composables/returnnewid.js'      
  
  export default {
    setup() {      
      const newUserId = returnNewId();
      const listStore = useListStore();  
      const accountStore = useAccountStore();  
      const account = reactive({'First Name':"",'Last Name':"",'Country Code':"+1",'Phone Number':"",'Email':""});
      const countryCodes = returnCountryCodes();
      const e164Number = computed(() => account['Country Code']+account['Phone Number']);      
      const accountFormFilled = computed(() => {
        return (
                account['First Name'] != "" && 
                account['Last Name'] != "" && 
                account['Phone Number'] != "" && 
                account['Email'] != ""
                ) ? true : false; 
      });

      const contactObj = listStore.lists.find(o => o.uniqueName === 'ContactsList');
      
      const loginAccountFound = ref(false);
      const loginAccountNotFound = ref(false);
      
      const loginAttempt = async () => {
        // SEE IF AN ACCOUNT IS PRESENT
        let url = `${import.meta.env.VITE_DATA_URL}/twilio-table-sync/list-item-get-array`;          
        url += `?targetList=${contactObj.sid}&filterField=Phone%20Number&filterFieldValue=${encodeURIComponent(e164Number.value)}`
        const res = await fetch(url, { method: "GET", cache: "no-store", headers: {'Content-type': 'application/json'} })        
        if (res.ok) {
          let r = await res.json();
          //console.log("getAllSyncLists r => ", r);
          if (r.length>0) {
            // Account for Phone Number Exists
            console.log("Account exists...");
            accountStore.account = r[0].data;
            accountStore.listIndex = r[0].index;
            loginAccountFound.value = true;
          } else {
            loginAccountNotFound.value = true;
          }
        } 
      }
      
      const checkAccount = async () => {
        // SEE IF AN ACCOUNT IS PRESENT
        let url = `${import.meta.env.VITE_DATA_URL}/twilio-table-sync/list-item-get-array`;          
        url += `?targetList=${contactObj.sid}&filterField=Phone%20Number&filterFieldValue=${encodeURIComponent(e164Number.value)}`
        const res = await fetch(url, { method: "GET", cache: "no-store", headers: {'Content-type': 'application/json'} })
        //console.log("res => ", res);
        if (res.ok) {
          let r = await res.json();
          //console.log("getAllSyncLists r => ", r);
          if (r.length>0) {
            // Account for Phone Number Exists
            console.log("Account exists...");
            accountStore.account = r[0].data;
            accountStore.listIndex = r[0].index;
          } else {
            // Create Account
            console.log("Account does not exist...");
            let a = await createAccount();
            accountStore.account = a.data;
            accountStore.listIndex = a.index;
            loginAccountFound.value = true;
          }
        } 
      }

      const createAccount = async () => {

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
          "avatar":`/clients/flex-agent/images/avatars/${Math.floor(Math.random()*10)}.png`
        };

        let url = `${import.meta.env.VITE_DATA_URL}/twilio-table-sync/list-item-create?targetList=${contactObj.sid}`;
        const na = await fetch(url, { method: "POST", headers: {'Content-type': 'application/json'}, body: JSON.stringify({"payload": a}) });
        if (na.ok) {
          return await na.json();        
        } else {
          return false
        }

      }


      onBeforeMount(async () => {
        if (listStore.lists.length === 0) {
            await listStore.getAllSyncLists();
            console.log("lists => ", listStore.lists);
        }
      })
      
      return {
        accountStore, countryCodes, account, e164Number, loginAttempt, 
        loginAccountFound, loginAccountNotFound, accountFormFilled, checkAccount
      }
    }
  }
</script>

<template>
  <div class="container-fluid pt-3">

    <div class="alert alert-success text-center fw-bold" v-show="accountStore.account.ContactId">
        You are logged in as {{accountStore.account['First Name']}} {{accountStore.account['Last Name']}}.
          <router-link class="btn btn-sm btn-primary" to="/">
            <i class="bi-house"></i>
            Home
        </router-link>
    </div>

    <div class="alert alert-danger  text-center fw-bold" v-show="loginAccountNotFound">
      We could not find that account. Please try again. 
      <button class="btn btn-sm btn-secondary" @click="loginAccountNotFound=false">Close</button>
    </div>


    <div v-show="!loginAccountFound">
      <div class="d-flex justify-content-center mt-3">
        <div>
        <ul class="nav nav-pills mb-3" id="myTab" role="tablist">
          <li class="nav-item" role="presentation">
            <button class="nav-link active" id="create-tab" data-bs-toggle="tab" data-bs-target="#create" type="button" role="tab" aria-controls="create" aria-selected="true">Create Account</button>
          </li>
          <li class="nav-item" role="presentation">
            <button class="nav-link" id="login-tab" data-bs-toggle="tab" data-bs-target="#login" type="button" role="tab" aria-controls="login" aria-selected="false">Login</button>
          </li>
        </ul>
        <div class="tab-content">
          <div class="tab-pane active" id="create" role="tabpanel" aria-labelledby="create-tab">        
            <div class="card p-5" style="width: 36rem;">
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
                  <button @click="checkAccount()" :disabled="!accountFormFilled" class="btn btn-primary btn-lg">Create Account</button>
                </div> 
            </div>   
          </div>
          <div class="tab-pane" id="login" role="tabpanel" aria-labelledby="login-tab">
            <div class="card p-5" style="width: 36rem;">
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
              <input type="text" disabled v-model="e164Number" class="form-control" id="exampleFormControlInput1">
              </div>                
              <div class="d-grid">
                  <button @click="loginAttempt()" :disabled="e164Number.length<8" class="btn btn-primary btn-lg">
                      <i class="bi-box-arrow-in-right"></i>
                      Login
                  </button>
              </div>             
            </div>

          </div>
        </div>
        </div>
      </div> 
    </div>




  </div>
</template>

<style scoped>
</style>
