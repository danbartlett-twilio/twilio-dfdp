<script>
import { computed } from 'vue-demi';

export default {
    props: ['cs'],
    setup(props) {
        
        const cs = props.cs;

        const hasIvrVariables = computed(() => {
          return Object.keys(props.cs.passedParams.variables).length > 0 ? true : false
        })

        return {
            cs, hasIvrVariables
        }
    },
}
</script>

<template>
    <div>
        <div class="card mb-3">
          <div class="card-header bg-primary  fs-6 fw-bold text-white"><i class="bi-person "></i> {{cs.contact?.data['First Name'] }} {{ cs.contact?.data['Last Name'] }}</div>
          <div class="row g-0">
            <div class="col-md-9">
              <div class="card-body p-2">
                <div class="row">
                  <div class="col-8">
                    <span class="text-bold">{{ cs.contact?.data['Phone Number'] }}</span>
                  </div>
                  <div class="col-4 text-end">
                    <button class="btn btn-sm"><i class="bi-chat-left"></i></button>
                    <button class="btn btn-sm"><i class="bi-telephone"></i></button>
                  </div>
                </div>
                <div class="row" v-show="cs.contact?.data.Email != ''">
                  <div class="col-10">
                    <span class="text-bold">{{ cs.contact?.data.Email }}</span>
                  </div>
                  <div class="col-2 text-end">
                    <button class="btn btn-sm"><i class="bi-envelope"></i></button>
                  </div>
                </div>


                <div class="row">
                  <div class="col-10  text-truncate">
                    <small class="text-muted">
                      {{ cs.contact?.data.Address }},
                      {{ cs.contact?.data.City }}, {{ cs.contact?.data.State }} {{ cs.contact.postal }}
                    </small>
                  </div>
                  <div class="col-2 text-end">
                    <button class="btn btn-sm"><i class="bi-map"></i></button>
                  </div>
                </div>
                <div class="row" v-show="cs.contact?.data.Email != ''">
                  <div class="col-10">
                    <span class="text-italic">{{ cs.contact?.data.ContactId }}</span>
                  </div>
                </div>                
              </div>
              
            </div>
            <div class="col-md-3 gradient-custom text-center "
              style="border-top-left-radius: .5rem; border-bottom-left-radius: .5rem;">
              <img :src="cs.contact.data.avatar"
                alt="Avatar" class="img-fluid my-1 mt-2" style="width: 80px;" />                                        
            </div>            
          </div>
        </div>

        <div class="card mb-3" v-show="hasIvrVariables" >

            <div class="card-header bg-warning  fs-6 fw-bold">IVR Variables</div>
            <div class="card-body p-2">
                <table class="table table-striped">
                    <tbody>
                        <tr v-for="(value, name, index) in cs.passedParams.variables" :key="index" v-show="name !== undefined">
                            <td>{{name}}</td>
                            <td>{{value}}</td>
                        </tr>
                    </tbody>
                </table>

            </div>
        </div>
    </div>

</template>

