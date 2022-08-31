
import { useRouter } from 'vue-router'
import { useEnvStore } from '../stores/envStore'

export function useCheckEnvVars() {

    const envStore = useEnvStore() 
    const router = useRouter();

    if (envStore.envVars.twilioAccountSid === null) {
        router.replace( { name: 'home' })
    }

    return true
}