<script>
import { ref } from 'vue'

export default {
    props: ['messageTo', 'messageBody'],
    setup(props) {
        
      const messageTo = props.messageTo;
      const passedMessageBody = props.messageBody;

      const messageBody = ref(passedMessageBody);

      const sending = ref(false);
      const messageSent = ref(false)

      const sendSMS = async () => {
        sending.value = true;
        
        let msg = {
          MESSAGE_TO: messageTo,
          MESSAGE_BODY: messageBody.value
        };

        let url = `${import.meta.env.VITE_DATA_URL}/sms/simple-send`;
        const res = await fetch(url, { method: "POST", headers: {'Content-type': 'application/json'}, body: JSON.stringify({"payload": msg}) });
        if (res.ok) {
            console.log("Success! SMS Sent!");
            messageSent.value = true;
          
        } else {

        }
        sending.value = false;
      }


        return {
            messageTo, messageBody, sending, messageSent, sendSMS
        }
    },
}
</script>

<template>
  <div>

    <div class="card mb-3" >
      <div class="card-header bg-warning  fs-4 fw-bold mb-3">
        <i class="bi-phone"></i>
        Send SMS Message
        <button @click="$emit('close-panel')" class="btn btn-sm btn-secondary float-end">
          <i class="bi-x-circle"></i>
        </button>        
      </div>
      <div class="card-body p-2">
        <div v-show="messageSent" class="alert alert-success text-center fw-bold">
          Success! Message Sent!
          <button @click="messageSent = false" class="btn btn-sm btn-secondary float-end">
            Send Another
          </button>
        </div>
        <div v-show="!messageSent">
          <div class="mb-3">
            <label for="exampleFormControlInput1" class="form-label fw-bold fs-4">To</label>
            <p class="form-control-text">
              {{messageTo}}
            </p>
          </div>      
          <div class="mb-3">
            <label for="exampleFormControlInput1" class="form-label fw-bold fs-4">Message</label>
            <textarea rows="5" class="form-control" v-model="messageBody" placeholder="Enter Message"></textarea>          
          </div>                            
          <div class="d-grid">
              <button v-show="!sending" @click="sendSMS()" class="btn btn-primary btn-lg">                
                  <i class="bi-send"></i>
                  SEND SMS NOW
              </button>
              <div v-show="sending" class="spinner-border" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>              
          </div>
        </div>  
      </div>           
    </div>  

  </div>

</template>

