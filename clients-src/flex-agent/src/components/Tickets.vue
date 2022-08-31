<script>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'  
import { useContactStore } from '../stores/contactStore'
import { useListStore } from '../stores/listStore'
import { RouterLink } from 'vue-router'
import { timeStampToDate } from '../composables/timeStampToDate.js'

export default {
  setup() {
    
    const contactStore = useContactStore();
    const listStore = useListStore();
      
    const router = useRouter();
    const route = useRoute();

    const cObj = listStore.lists.find(o => o.uniqueName === 'TicketList');
    
    const tickets = ref([]);

    const getTickets = async () => {
      
      try {                
        let url = `${import.meta.env.VITE_DATA_URL}/twilio-table-sync/list-item-get-array?targetList=${cObj.sid}`;
        if(!contactStore.currentContact.anonymous) {
          url += `&filterField=ContactId&filterFieldValue=${encodeURIComponent(contactStore.currentContact.contact.data.ContactId)}`;
        }
        
        const res = await fetch(url, { method: "GET", cache: "no-store", headers: {'Content-type': 'application/json'} });
        if (res.ok) {
          let r = await res.json();
          console.log("in getTickets and r => ", r);
          tickets.value = r.sort((a, b) => b.data['Created'] - a.data['Created']);;
        }
        
      } catch (e) { console.log("getTickets error => ", e); }      

    }

    onMounted(() => {
        getTickets();
    });

    return {
      tickets,contactStore,
      timeStampToDate:timeStampToDate,
    }
  }

}


</script>


<template>
  <div class="container-fluid">
    <div class="card mb-3">
      <div class="card-header text-white bg-secondary fs-4 fw-bold">
        <i class="bi-life-preserver"></i>
        Support Tickets 
          <span v-if="!contactStore.currentContact.anonymous">
            for 
            {{contactStore?.currentContact.contact.data['First Name']}}
            {{contactStore?.currentContact.contact.data['Last Name']}}
          </span>
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
                  <router-link v-show="!contactStore.currentContact.anonymous" class="btn btn-primary" :to="{name: 'ticket', params: { ticketId: t.data['TicketId'] }}" title="Knowledge">
                    <i class="bi-life-preserver"></i>
                  </router-link>        
                  <button v-show="contactStore.currentContact.anonymous" disabled class="btn btn-info"><i class="bi-life-preserver "></i></button>
                </td>          
              </tr>
            </tbody>
          </table>        
        </div>
      </div>
    </div>
  </div>
</template>