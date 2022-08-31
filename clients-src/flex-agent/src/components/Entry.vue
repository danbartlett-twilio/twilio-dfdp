<script>
import { ref, onBeforeMount, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'  
import { useListStore } from '../stores/listStore'
import { useContactStore } from '../stores/contactStore'
import { useAppSettingsStore } from '../stores/appSettingsStore'

export default {
    
    setup() {
        
        const appSettingsStore = useAppSettingsStore();
    
        const listStore = useListStore();    
        const lists = ref([]);

        const contactStore = useContactStore();
        const currentContact = ref({});   
          
        const router = useRouter();
        const route = useRoute();    

        let nextPage = (route.params.targetPage) ? route.params.targetPage : 'knowledge';

        onBeforeMount(async () => {           

            // #1 MAKE SURE APP SETTINGS HAVE BEEN SET
            if (appSettingsStore.settings === null) {
                await appSettingsStore.getAppSettings();
            } 
            
            // #2 MAKE SURE LIST STORE HAS BEEN POPULATED
            if (listStore.lists.length === 0) {
                await listStore.getAllSyncLists();
                lists.value = listStore.lists
                console.log("lists => ", lists.value);
            } else {
                lists.value = listStore.lists;
            }

            // #3 SET CURRENT CONTACT
            await contactStore.getContact(route.params);
            if (contactStore.currentContact.anonymous === true && nextPage !== 'leads') {
                nextPage = "newContact"
            } else {
                currentContact.value = contactStore.currentContact;
                console.log("currentContact ==> ", currentContact.value);

            }
            /*console.log("route name => ", route.params.name)
            console.log("route channelType => ", route.params.channelType)
            console.log("route channelSid => ", route.params.channelSid)
            console.log("route targetPage => ", route.params.targetPage)
            console.log("route passedParams => ", route.params.passedParams)*/                        

            console.log("onMounted nextPage  ==> ", nextPage );
            router.replace( { name: nextPage })            
            
        });

        onMounted(() => {

        });

        return {

        };
    }
}


</script>

<template>
 
<div class="ccontainer-fluid d-flex flex-grow-1 flex-column">
    <div class="spinner-border" role="status">
    <span class="visually-hidden">Loading...</span>
    </div>
</div>

</template>