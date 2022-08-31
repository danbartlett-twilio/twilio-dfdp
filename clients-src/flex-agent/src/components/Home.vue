<script>
import { ref, reactive, onBeforeMount } from 'vue'
import { useAppSettingsStore } from '../stores/appSettingsStore'
import { useListStore } from '../stores/listStore'
import { useContactStore } from '../stores/contactStore'

export default {
  setup() {
    const appSettingsStore = useAppSettingsStore();
    const appset = reactive({settings:{}});
    
    const listStore = useListStore();    
    const lists = ref([]);

    const contactStore = useContactStore();  

    onBeforeMount(async () => {        
      if (appSettingsStore.settings === null) {
        await appSettingsStore.getAppSettings();
        appset.settings = appSettingsStore.settings        
      } else {
        appset.settings = appSettingsStore.settings;
      }
      if (listStore.lists.length === 0) {
        await listStore.getAllSyncLists();
        lists.value = listStore.lists        
      } else {
        lists.value = listStore.lists;
      }

    })

    return {
      appset, lists, cs:contactStore
    }
  }

}

</script>

<template>
  <div class="container-fluid">
    <div class="card mb-3">

      <div class="card-header text-white bg-secondary fs-4 fw-bold">
        <i class="bi-house "></i>
        Home Page -- Deployable Flex Demo Platform!
      </div>
      <div class="card-body p-2">
        <h3>Twilio Flex, the Programmable Contact Center</h3>
        <p class="lead">Waiting for the next task...</p>
      </div>
    </div>
  </div>
</template>
