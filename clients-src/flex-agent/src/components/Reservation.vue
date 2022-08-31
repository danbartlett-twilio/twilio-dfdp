<script>
  import { ref, reactive, computed, watch, onMounted, inject } from 'vue'
  import { useRoute } from 'vue-router'
  import { useAppSettingsStore } from '../stores/appSettingsStore'
  import { useContactStore } from '../stores/contactStore'
  
  
  export default {
    setup() {
        const contactStore = useContactStore()      
        const appSettingsStore = useAppSettingsStore();
        const axios = inject("axios");
        const route = useRoute();
        const knowledge = reactive({ knowledge: [] });
    
        console.log ("import.meta.env.MODE => ", import.meta.env.MODE)
        console.log ("import.meta.env.VITE_FOO2 => ", import.meta.env.VITE_FOO2)
        const envvar = import.meta.env.VITE_FOO        

        const getKnowledge = async () => {
            await axios.get("http://localhost:3001/airtable/get-records", { params: { "targetTable": "knowledge", "sortField": "brand", "numberRecords": 100 } })
                .then((response) => {
                console.log("response ==> ", response);
                knowledge.knowledge = response.data.records;
            }).catch((error) => {
                console.log("Error in getKnowledge => ", error);
                axios.get("/default-data/KnowledgeList.json")
                .then((response) => {                
                  knowledge.knowledge = response.data; 
                })
            });
        };
        onMounted(() => {
            getKnowledge();
        });
        return {
            knowledge,
            envvar:envvar,
            cs:contactStore.currentContact,
            apss: appSettingsStore?.settings
        };
    },    
}
</script>

<template>
  
  <div class=" ">
<p>
  cs => {{cs}}
</p>
<p>
  apss => {{apss}}
</p>
      <div class="accordion w-auto" id="accordionExample">
        <div class="accordion-item" v-for="k in knowledge.knowledge" v-bind:key="k.index">
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