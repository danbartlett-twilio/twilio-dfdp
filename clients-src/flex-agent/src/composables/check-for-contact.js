import { useRouter } from 'vue-router'
import { useContactStore } from '../stores/contactStore'

export function useCheckForCurrentContact() {

    const contactStore = useContactStore() 
    const router = useRouter();    

    if (Object.keys(contactStore.currentContact.contact).length === 0) {    
        console.log("Contact not set, redirecting...")
        router.replace( { name: 'home' })
    }

    return true
}