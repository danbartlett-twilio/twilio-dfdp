<script>  
  import { ref, computed, onBeforeMount } from 'vue'
  import { useRouter } from 'vue-router'
  import { useListStore } from '../stores/listStore'
  import { useAccountStore } from '../stores/accountStore'
  import { returnNewId } from '../composables/returnnewid.js'
  import { useCheckForLists } from '../composables/check-for-lists.js'
  import { timeStampToDate } from '../composables/timeStampToDate.js'

  export default {
    setup() {      

      const router = useRouter();

      const accountStore = useAccountStore();
      const listStore = useListStore();

      const newTicketId = returnNewId();
      const ticketSubject = ref("");
      const ticketMessage = ref("");

      const ticketFormFilled = computed(() => {
        return (
                ticketSubject.value !== "" && 
                ticketMessage.value !== ""
                ) ? true : false; 
      });

      const ticketProcessing = ref(false);
      const ticketSuccess = ref(false);
      const ticketObj = listStore.lists.find(o => o.uniqueName === 'TicketList');
      const ticketMessageObj = listStore.lists.find(o => o.uniqueName === 'TicketMessageList');
      
      const createTicket = async () => {
        ticketProcessing.value = true;
        try {            
            await saveTicketMessage()          
            console.log("saved messages to ticket...");
            await saveTicket();
            ticketProcessing.value = false;
            ticketSuccess.value = true;
        } catch(e) {
          console.log("Error in createTicket => ",e);
        }

      };

      const saveTicket = async () => {
        let t = {};
        t.TicketId = newTicketId;
        t.TicketStatus = "OPEN";
        t.Subject = ticketSubject.value;
        t.ContactId = accountStore.account.ContactId;
        t.Created = Date.now();
        let url = `${import.meta.env.VITE_DATA_URL}/twilio-table-sync/list-item-create?targetList=${ticketObj.sid}`;
        return await fetch(url, { method: "POST", headers: {'Content-type': 'application/json'}, body: JSON.stringify({"payload": t}) });
      };

      const saveTicketMessage = async () => {
        let m = {};
        m.TicketId = newTicketId;
        m.Author = accountStore.account.ContactId;
        m.Message = ticketMessage.value
        m.Created = Date.now();
        let url = `${import.meta.env.VITE_DATA_URL}/twilio-table-sync/list-item-create?targetList=${ticketMessageObj.sid}`;
        return await fetch(url, { method: "POST", headers: {'Content-type': 'application/json'}, body: JSON.stringify({"payload": m }) });
      };

      const tickets = ref([]);

      const getTickets = async () => {
        
        try {                
          let url = `${import.meta.env.VITE_DATA_URL}/twilio-table-sync/list-item-get-array?targetList=${ticketObj.sid}`;
          url += `&filterField=ContactId&filterFieldValue=${encodeURIComponent(accountStore.account.ContactId)}`;          
          
          const res = await fetch(url, { method: "GET", cache: "no-store", headers: {'Content-type': 'application/json'} });
          if (res.ok) {
            let r = await res.json();
            console.log("in getTickets and r => ", r);
            tickets.value = r.sort((a, b) => b.data['Created'] - a.data['Created']);;
          }
          
        } catch (e) { console.log("getTickets error => ", e); }      

      }

      onBeforeMount(async ()  => {
        // MAKE SURE THAT MAIN TABLE SID IS SET        
        await useCheckForLists();    
        if (!accountStore.account.ContactId) {
            console.log("User not logged in...");    
            router.replace( { name: 'home' })
        }            
        getTickets();        
      })

      return {
        tickets, timeStampToDate:timeStampToDate,
        ticketSubject, ticketMessage,
        accountStore, ticketFormFilled, createTicket,
        ticketProcessing, ticketSuccess,
        baseUrl:import.meta.env.VITE_DATA_URL
      }
    }
  }
</script>

<template>


  <div class="container-fluid pt-3">
    <div v-show="ticketSuccess" class="alert alert-success text-center fw-bold">      
      Success! Ticket Submitted.
      <router-link class="btn btn-sm btn-danger float-end" to="/support">
        <i class="bi-life-preserver"></i>
        Contact Support
      </router-link>
    </div>

    <div class="card mb-5">
      <div class="card-header text-white bg-info fs-4 fw-bold">
        <i class="bi-life-preserver"></i>
        Existing Support Tickets 
      </div>
      <div class="card-body p-2">
        <div class="table-responsive">
          <table class="table table-striped">
            <thead>
              <tr>
                <th>Ticket ID</th>
                <th>Subject</th>
                <th>Created</th>
                <th class="text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="t in tickets" v-bind:key="t.index">
                <td>{{t.data['TicketId']}}</td>
                <td>{{t.data['Subject']}}</td>
                <td>{{timeStampToDate(t.data['Created'])}}</td>
                <td class="text-center">
                  <router-link class="btn btn-primary" :to="{name: 'ticket', params: { ticketId: t.data['TicketId'] }}" title="Knowledge">
                    <i class="bi-life-preserver"></i>
                  </router-link>              
                </td>          
              </tr>
            </tbody>
          </table>        
        </div>
      </div>
    </div>


    <div v-show="!ticketSuccess" class="card" >
      <div class="card-header bg-warning  fs-4 fw-bold mb-3">
        <i class="bi-plus-circle"></i>
        New Support Ticket
      </div>
      <div class="card-body p-2">
        <div class="mb-3">
          <label for="exampleFormControlInput1" class="form-label fw-bold fs-4">Customer</label>
          <p class="form-control-text">
            {{accountStore.account['First Name']}} {{accountStore.account['Last Name']}}
          </p>
        </div>   
        <div class="mb-3">
          <label for="exampleFormControlInput1" class="form-label fw-bold fs-4">Subject</label>
          <input type="text" v-model="ticketSubject" class="form-control" id="exampleFormControlInput1">
        </div>            
        <div class="mb-3">
          <label for="exampleFormControlInput1" class="form-label fw-bold fs-4">Message</label>
          <textarea rows="5" class="form-control" v-model="ticketMessage" placeholder="Enter details..."></textarea>          
        </div>                            
        <div class="d-grid">
            <button v-show="!ticketProcessing" :disabled="!ticketFormFilled" @click="createTicket()" class="btn btn-primary btn-lg">                
                Submit New Ticket
            </button>
            <div v-show="ticketProcessing" class="spinner-border" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>              
        </div>  
      </div>           
    </div>    

  </div>
</template>

<style scoped>
</style>
