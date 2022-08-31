<script>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'  
import { useContactStore } from '../stores/contactStore'
import { useListStore } from '../stores/listStore'
import { RouterLink } from 'vue-router'

export default {
  setup() {
    
    const contactStore = useContactStore();
    const listStore = useListStore();
      
    const router = useRouter();
    const route = useRoute();

    const cObj = listStore.lists.find(o => o.uniqueName === 'ContactsList');
    
    const contacts = ref([]);

    const getContacts = async () => {
      
      try {                
        let url = `${import.meta.env.VITE_DATA_URL}/twilio-table-sync/list-item-get-array?targetList=${cObj.sid}`;
        const res = await fetch(url, { method: "GET", cache: "no-store", headers: {'Content-type': 'application/json'} });
        if (res.ok) {
          let r = await res.json();
          console.log("in getContacts and r => ", r);
          contacts.value = r.sort((a, b) => a['First Name'] - b['Last Name']);;
        }
        
      } catch (e) { console.log("getContacts error => ", e); }      

    }

    onMounted(() => {
        getContacts();
    });

    function selectUser(c) {
      contactStore.$reset();
      contactStore.currentContact.contact = c;
      contactStore.currentContact.anonymous = false;
      router.replace( {name: 'contact' })
    }

    return {
      selectUser, contacts
    }
  }

}


</script>


<template>
  <div class="container-fluid">
    <div class="card mb-3">

      <div class="card-header text-white bg-secondary fs-4 fw-bold">
        <i class="bi-people"></i>
        Contacts
      </div>
      <div class="card-body p-2">
    <div class="table-responsive">
      <table class="table table-striped">
        <thead>
          <tr>
            <th>Name</th>
            <th>Phone</th>
            <th>Email</th>
            <th class="text-center">Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="c in contacts" v-bind:key="c.index">
            <td>{{c.data['First Name']}} {{c.data['Last Name']}}</td>
            <td>{{c.data['Phone Number']}}</td>
            <td>{{c.data['Email']}}</td>
            <td class="text-center"><button @click="selectUser(c)" class="btn btn-primary"><i class="bi-person"></i></button></td>          
          </tr>
        </tbody>
      </table>        
      </div>
      </div>
    </div>
  </div>
</template>