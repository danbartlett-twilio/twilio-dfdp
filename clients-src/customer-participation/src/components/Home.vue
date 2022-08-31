<script>  
  import { onBeforeMount } from 'vue'
  import { RouterLink } from 'vue-router'
  import { useListStore } from '../stores/listStore' 
  import { useEnvStore } from '../stores/envStore'  
import { useAccountStore } from '../stores/accountStore' 

  export default {
    setup() {      

      const listStore = useListStore();  
      const envStore = useEnvStore();  
      const accountStore = useAccountStore();  

      function logout() {      
        accountStore.$reset();
      }

      onBeforeMount(async () => {
        if (listStore.lists.length === 0) {
            await listStore.getAllSyncLists();
            await envStore.getEnvironmentVariables();
            console.log("lists => ", listStore.lists);
        }
      })

      return { accountStore, logout }
    }
  }
</script>

<template>
  <div class="container-fluid pt-3">

    <div class="alert alert-success" v-show="accountStore.account.ContactId">
        You are logged in as {{accountStore.account['First Name']}} {{accountStore.account['Last Name']}}.
        <button @click="logout()" class="btn btn-sm btn-warning float-end">
            <i class="bi-box-arrow-in-left"></i>
            Logout
        </button>        
    </div>
    <div class="alert alert-warning" v-show="!accountStore.account.ContactId">
        You are not logged in.
        <router-link class="btn btn-sm btn-secondary float-end" to="/login">
            <i class="bi-box-arrow-in-right"></i>
            Login / Sign Up
        </router-link>
    </div>    

    <div class="container px-4 py-5" id="hanging-icons">
        <h2 class="pb-2 border-bottom">Flex Demo Platform Customer Participation Options</h2>
        <div class="row g-4 py-5 row-cols-1 row-cols-lg-3">
          <div class="col d-flex align-items-start">
            <div class="icon-square text-dark flex-shrink-0 me-3">
              <i class="bi-cart"  style="font-size: 2rem;"></i>              
            </div>
            <div>
              <h2>Shopping Cart</h2>
              <p>Make a purchase and then receive support.</p>
              <router-link v-show="!accountStore.account.ContactId" class="btn btn-warning" to="/login">
                  <i class="bi-box-arrow-in-right"></i>
                  Login / Sign Up
              </router-link>
              <router-link v-show="accountStore.account.ContactId" class="btn btn-primary" to="/cart">Go</router-link>
            </div>
          </div>

          <div class="col d-flex align-items-start">
            <div class="icon-square text-dark flex-shrink-0 me-3">
              <i class="bi-ticket"  style="font-size: 2rem;"></i>              
            </div>
            <div>
              <h2>Support Tickets</h2>
              <p>Open a support ticket to get help.</p>
              <router-link v-show="!accountStore.account.ContactId" class="btn btn-warning" to="/login">
                  <i class="bi-box-arrow-in-right"></i>
                  Login / Sign Up
              </router-link>
              <router-link v-show="accountStore.account.ContactId" class="btn btn-primary" to="/tickets">Go</router-link>
            </div>
          </div>

          <div class="col d-flex align-items-start">
            <div class="icon-square text-dark flex-shrink-0 me-3">
              <i class="bi-cash-stack"  style="font-size: 2rem;"></i>              
            </div>
            <div>
              <h2>Lead Workflow</h2>
              <p>Reach out via the channel of you .</p>
              <router-link class="btn btn-primary" :to="{name: 'support', params: { instructions: 'lead' }}">Go</router-link>
            </div>
          </div>

          <div class="col d-flex align-items-start">
            <div class="icon-square text-dark flex-shrink-0 me-3">
              <i class="bi-life-preserver"  style="font-size: 2rem;"></i>              
            </div>
            <div>
              <h2>Contact Support</h2>
              <p>Connect with support agent via the channel of your choice.</p>
              <router-link class="btn btn-primary" to="/support">Go</router-link>
            </div>
          </div>

        </div>
      </div>


  </div>
</template>

<style scoped>
</style>
