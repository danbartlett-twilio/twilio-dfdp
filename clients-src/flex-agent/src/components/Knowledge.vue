<script>
  import { ref, reactive, computed, watch, onMounted } from 'vue'
  import { useRoute } from 'vue-router'
  import { useAppSettingsStore } from '../stores/appSettingsStore'
  import { useContactStore } from '../stores/contactStore'
  import { useListStore } from '../stores/listStore'
  
  
  export default {
    setup() {
        const contactStore = useContactStore()      
        const appSettingsStore = useAppSettingsStore();
        const listStore = useListStore();
        const route = useRoute();
        const knowledge = ref([]);
    
        const kObj = listStore.lists.find(o => o.uniqueName === 'KnowledgeList'); 

        console.log ("import.meta.env.MODE => ", import.meta.env.MODE)
        console.log ("import.meta.env.VITE_FOO2 => ", import.meta.env.VITE_FOO2)
        const envvar = import.meta.env.VITE_FOO        

        const getKnowledge = async () => {
          
          try {                
            let url = `${import.meta.env.VITE_DATA_URL}/twilio-table-sync/list-item-get-array?targetList=${kObj.sid}`;
            const res = await fetch(url, { method: "GET", cache: "no-store", headers: {'Content-type': 'application/json'} });
            if (res.ok) {
              let r = await res.json();
              console.log("in getKnowledge and r => ", r);
              knowledge.value = r;
            }
            
          } catch (e) { console.log("getKnowledge error => ", e); }      

        }

        onMounted(() => {
            getKnowledge();
        });

        return {
            knowledge,
            envvar:envvar,
            cs:contactStore.currentContact,
            apss: appSettingsStore?.settings,
            lists: listStore?.lists
        };
    },    
}
</script>

<template>
  
  <div class=" ">

      <div class="accordion w-auto" id="accordionExample">
        <div class="accordion-item" v-for="k in knowledge" v-bind:key="k.index">
          <h2 class="accordion-header" :id="'heading'+k.index">
            <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" :data-bs-target="'#acbody'+k.index" aria-expanded="false" :aria-controls="k.index">
              {{ k.data.Question}} ({{ k.data.Category }})
            </button>
          </h2>
          <div :id="'acbody'+k.index" class="accordion-collapse collapse" :aria-labelledby="'heading'+k.index" data-bs-parent="#accordionExample">
            <div class="accordion-body">
              <div class="greetings">
                {{ k.data.Answer }}
              </div>
            </div>
          </div>
        </div>
      </div>

</div>

</template>