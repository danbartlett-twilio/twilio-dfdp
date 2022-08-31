
import { useRouter } from 'vue-router'
import { useListStore } from '../stores/listStore'

export async function useCheckForLists() {

    const listStore = useListStore() 
    const router = useRouter();

    if (listStore.lists.length === 0) {
        console.log("Lists not set, routing to home...")
        router.replace( { name: 'home' })
        return false
    } else {
        return true
    }

    
}