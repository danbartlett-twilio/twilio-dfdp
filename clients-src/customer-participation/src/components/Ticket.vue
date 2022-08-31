<script>
import { ref, onBeforeMount, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'  
import { useAccountStore } from '../stores/accountStore'
import { useListStore } from '../stores/listStore'
import { RouterLink } from 'vue-router'
import { timeStampToDate } from '../composables/timeStampToDate.js'
import { useCheckForLists } from '../composables/check-for-lists.js'

export default {
  setup() {
    
    const accountStore = useAccountStore();
    const listStore = useListStore();
      
    const router = useRouter();
    const route = useRoute();

    const tObj = listStore.lists.find(o => o.uniqueName === 'TicketList');
    const tmObj = listStore.lists.find(o => o.uniqueName === 'TicketMessageList');

    let ticketId = (route.params.ticketId) ? route.params.ticketId : 'Not Found';

    const ticket = ref({});

    const getTicket = async () => {
      
      try {                
        let url = `${import.meta.env.VITE_DATA_URL}/twilio-table-sync/list-item-get-array?targetList=${tObj.sid}`;        
        url += `&filterField=TicketId&filterFieldValue=${ticketId}`;
        
        const res = await fetch(url, { method: "GET", cache: "no-store", headers: {'Content-type': 'application/json'} });
        if (res.ok) {
          let r = await res.json();
          console.log("in getTicket and r => ", r);
          ticket.value = r[0].data;          
        }
        
      } catch (e) { console.log("getTicket error => ", e); }      

    }


    const ticketMessages = ref([]);

    const getTicketMessages = async () => {
      
      try {                
        let url = `${import.meta.env.VITE_DATA_URL}/twilio-table-sync/list-item-get-array?targetList=${tmObj.sid}`;        
        url += `&filterField=TicketId&filterFieldValue=${ticketId}`;
        
        const res = await fetch(url, { method: "GET", cache: "no-store", headers: {'Content-type': 'application/json'} });
        if (res.ok) {
          let r = await res.json();
          console.log("in getTicketMessages and r => ", r);
          ticketMessages.value = r.sort((a, b) => a.data['Created'] - b.data['Created']);;
        }
        
      } catch (e) { console.log("getTicketMessages error => ", e); }      

    }

    const ticketProcessing = ref(false);

    const addNewMessage = async () => {
      ticketProcessing.value = true;
      let m = {};
      m.TicketId = ticketId;
      m.Author = accountStore.account.ContactId;
      m.Message = newMessage.value
      m.Created = Date.now();
      let url = `${import.meta.env.VITE_DATA_URL}/twilio-table-sync/list-item-create?targetList=${tmObj.sid}`;
      await fetch(url, { method: "POST", headers: {'Content-type': 'application/json'}, body: JSON.stringify({"payload": m }) });
      getTicketMessages();
      newMessage.value = "";
      ticketProcessing.value = false;

    };

      onBeforeMount(async ()  => {
        // MAKE SURE THAT MAIN TABLE SID IS SET        
        await useCheckForLists();    
        if (!accountStore.account.ContactId) {
            console.log("User not logged in...");    
            router.replace( { name: 'home' })
        }                    
      })

    onMounted(() => {
        getTicket();
        getTicketMessages();
    });


    const newMessage = ref("");

    return {
      ticketId, ticket,
      ticketMessages, ticketProcessing,
      timeStampToDate:timeStampToDate,      
      newMessage, addNewMessage,
      accountStore, getTicketMessages
    }
  }

}


</script>


<template>
  <div class="container-fluid">
    
    <nav aria-label="breadcrumb" class="mt-3 mb-3">
      <ol class="breadcrumb">
        <li class="breadcrumb-item"><router-link to="/home">Home</router-link></li>
        <li class="breadcrumb-item"><router-link to="/tickets">Support</router-link></li>
        <li class="breadcrumb-item active" aria-current="page">Support Ticket: {{ticketId}}</li>
      </ol>
    </nav>

    <div class="card mb-3 mt-3">
      <div class="card-header text-white bg-primary fs-4 fw-bold">
        <i class="bi-life-preserver"></i>
        Support Ticket: {{ticketId}} --
        
      </div>
      <div class="card-body p-2">
        <p class="text-end">
          <button class="btn btn-secondary btn-sm" @click="getTicketMessages()">
            <i class="bi-arrow-clockwise"></i>
            Refresh
          </button>
        </p>

              <div v-for="tm in ticketMessages" v-bind:key="tm.index" class="mt-3">
                <div v-if="tm.data.Author!=='Agent'">
                  <p class="fs-4 p-2 ms-3 mt-2 mb-0 rounded-3 bg-info" style="background-color: #f5f6f7;">
<pre>
{{tm.data.Message}}
</pre>
                  </p>
                  <p class="small ms-3 mb-3 rounded-3 text-muted text-end">
                    {{accountStore.account['First Name'] }} {{ accountStore.account['Last Name'] }} --
                    {{timeStampToDate(tm.data['Created'])}}
                  </p>  
                </div>
                <div v-if="tm.data.Author ==='Agent'">
                  <p class="fs-4 p-2 me-3 mt-2 mb-0 rounded-3 bg-warning" >
<pre>
{{tm.data.Message}}
</pre>
                  </p>
                  <p class="small me-3 mb-3 rounded-3 text-muted">
                    Agent -- 
                    {{timeStampToDate(tm.data['Created'])}}
                  </p>
                </div>
              </div>

          <div class="mb-3">
            <label for="exampleFormControlInput1" class="form-label fw-bold fs-4">Reply to Support Ticket</label>
            <textarea rows="5" class="form-control" v-model="newMessage" placeholder="Enter reply..."></textarea>          
          </div>                            
          <div class="d-grid">
              <button v-show="!ticketProcessing" :disabled="newMessage==''" @click="addNewMessage()" class="btn btn-primary btn-lg">                
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