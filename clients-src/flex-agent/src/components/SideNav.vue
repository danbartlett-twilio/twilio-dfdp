 <script >
import { reactive, onBeforeMount, watch } from 'vue';
import { RouterLink } from 'vue-router'
import { useAppSettingsStore } from '../stores/appSettingsStore'
import { useContactStore } from '../stores/contactStore'

export default {
  setup() {
    const appSettingsStore = useAppSettingsStore();    
    const contactStore = useContactStore();    

    return {
      apss: appSettingsStore,
      contactStore
    }
  }

}


</script>

<template>
      <div class="d-flex flex-column mt-1">

        <div class="text-center px-2 mb-2">
          <router-link class="" to="/" title="Home">
            <button class="btn btn-sm btn-info"><i class="bi-house "></i></button>
          </router-link>
        </div>
        <div class="text-center px-2 mb-2">  
          <router-link v-show="!contactStore.currentContact.anonymous" class="btn btn-sm btn-info" to="/contact" title="Contact">
            <i class="bi-person "></i>
          </router-link>
          <button v-show="contactStore.currentContact.anonymous" disabled class="btn btn-sm btn-info"><i class="bi-person "></i></button>
        </div>  
        <div class="text-center px-2 mb-2">        
          <router-link v-show="!contactStore.currentContact.anonymous" class="btn btn-sm btn-info" to="/cart" title="Cart">
            <i class="bi-cart "></i>
          </router-link>
          <button v-show="contactStore.currentContact.anonymous" disabled class="btn btn-sm btn-info"><i class="bi-cart "></i></button>
        </div>        
        <div class="text-center px-2 mb-2">        
          <router-link class="text-light" to="/tickets" title="Support Tickets">
            <button class="btn btn-sm btn-info"><i class="bi-life-preserver "></i></button>
          </router-link>
        </div> 
        <div class="text-center px-2 mb-2" v-show="apss.settings?.showPages?.contacts">  
          <router-link class="text-light" to="/contacts" title="Contacts">
            <button class="btn btn-sm btn-info"><i class="bi-people "></i></button>
          </router-link>
        </div>         

        <div class="text-center px-2 mb-2">        
          <router-link class="text-light" to="/leads" title="Leads">
            <button class="btn btn-sm btn-info"><i class="bi-cash-stack"></i></button>
          </router-link>
        </div> 

        <div class="text-center px-2 mb-2">        
          <router-link class="text-light" to="/knowledge" title="Knowledge">
            <button class="btn btn-sm btn-info"><i class="bi-lightbulb"></i></button>
          </router-link>
        </div> 
        <div class="text-center px-2 mb-2">        
          <router-link class="" to="/deliveries" title="Deliveries">
            <button class="btn btn-sm btn-info"><i class="bi-truck "></i></button>
          </router-link>
        </div>
        <div class="text-center px-2 mb-2">        
          <router-link class="text-light" to="/appointments" title="Appointments">
            <button class="btn btn-sm btn-info"><i class="bi-calendar-date "></i></button>
          </router-link>
        </div> 
        <!--div class="text-center px-2 mb-2">        
          <router-link class="" to="/game" title="Game">
            <button class="btn btn-sm btn-info"><i class="bi-controller "></i></button>
          </router-link>
        </div-->
        <div class="text-center px-2 mb-2">        
          <router-link class="text-light" to="/settings" title="Settings">
            <button class="btn btn-sm btn-info"><i class="bi-gear "></i></button>
          </router-link>
        </div>   
        <img class="img-responsive" src="/logo-twilio-mark-red.png" />                              
    </div>       

</template>