<script>  
  import { ref, onBeforeMount, onMounted } from 'vue'
  import { useRouter } from 'vue-router'
  import { toCurrency } from '../composables/tocurrency.js'
  import { useListStore } from '../stores/listStore'
  import { useAccountStore } from '../stores/accountStore'
  import { returnNewId } from '../composables/returnnewid.js'
  import { useCheckForLists } from '../composables/check-for-lists.js'

  export default {
    setup() {      

      const router = useRouter();      
      const listStore = useListStore();
      
      const cObj = listStore.lists.find(o => o.uniqueName === 'CatalogList');

      const catalog = ref([]);
      const categories = ref([]);
      const categoryFilter = ref("none");      
 
      const getCatalog = async () => {
        
        try {                
          if (cObj !== undefined) {          
            let url = `${import.meta.env.VITE_DATA_URL}/twilio-table-sync/list-item-get-array?targetList=${cObj.sid}`;
            const res = await fetch(url, { method: "GET", cache: "no-store", headers: {'Content-type': 'application/json'} });
            if (res.ok) {
              let r = await res.json();
              console.log("in getCatalog and r => ", r);
              catalog.value = r.sort((a, b) => a.data['dscr'] - b.data['dscr']);
              for(const o of catalog.value) { o.Show = true; o.added = false; }
              categories.value = Array.from(new Set(r.map(item => item.data.category))).sort((a, b) => (a < b) ? -1 : 1);
            }
          }
          
        } catch (e) { console.log("getCatalog error => ", e); }      

      }
     
      const newCartId = returnNewId();
      const cart = ref({SubTotal:0,Tax:0,Total:0});
      const cartItems = ref([]);
      
      function addToCart(i) {
        let idx = cartItems.value.findIndex(o => o.dscr === i.dscr);      
        if (idx < 0) {
          let ci = i;
          ci.CartId = newCartId;
          ci.qty = 1;
          ci.LineTotal = ci.qty * ci.price
          cartItems.value.push(ci);
        }
        let cidx = catalog.value.findIndex(o => o.data.dscr === i.dscr);
        catalog.value[cidx].data.added = true;
      }

      const changeQty = async (d,inc) => {
        console.log("changeQty dscr => ", d);
        console.log("changeQty inc => t/f ", inc);
        let idx = cartItems.value.findIndex(o => o.dscr === d);      
        cartItems.value[idx].qty = inc ? parseInt(cartItems.value[idx].qty) + 1 : parseInt(cartItems.value[idx].qty) - 1;
        
        if (cartItems.value[idx].qty === 0) {
          console.log("At 0! Remove from cart!");
          deleteFromCart(d);
        } else {
          cartItems.value[idx].LineTotal = cartItems.value[idx].qty * cartItems.value[idx].price;  
          await updateCartTotals();          
        }

      }

      const deleteFromCart = async (dscr) => {
        let lidx = cartItems.value.findIndex(o => o.dscr === dscr);
        cartItems.value.splice(lidx,1);            
        updateCartTotals();
        let cidx = catalog.value.findIndex(o => o.data.dscr === dscr);
        catalog.value[cidx].data.added = false;

      }

      const updateCartTotals = async () => {
      
        console.log("updateCartTotals...")

        let s = 0;
        cartItems.value.forEach(i => {
          s = s + i.LineTotal;
        });
        cart.value.SubTotal = s;
        cart.value.Tax = s * 0.08;
        cart.value.Total = s + cart.value.Tax;

      }

      const accountStore = useAccountStore();

      const orderProcessing = ref(false);
      const orderSuccess = ref(false);
      const cartObj = listStore.lists.find(o => o.uniqueName === 'CartList');
      const cartItemObj = listStore.lists.find(o => o.uniqueName === 'CartItemList');
      
      const placeOrder = async () => {
        orderProcessing.value = true;
        try {  
          
          await Promise.all(cartItems.value.map(async (item) => {
            await saveCartItem(item)
          })).then(async () => {         
            console.log("saved items to cart...");
            await saveCart();
            orderProcessing.value = false;
            orderSuccess.value = true;
          })
        } catch(e) {
          console.log("Error in placeOrder => ",e);
        }

      };

      const saveCart = async () => {
        let c = cart.value;
        c.CartId = newCartId;
        c.OrderStatus = "OPEN";
        c.ContactId = accountStore.account.ContactId;
        let url = `${import.meta.env.VITE_DATA_URL}/twilio-table-sync/list-item-create?targetList=${cartObj.sid}`;
        return await fetch(url, { method: "POST", headers: {'Content-type': 'application/json'}, body: JSON.stringify({"payload": c}) });
      };

      const saveCartItem = async (item) => {
        let i = item;
        i.CartId = newCartId;
        let url = `${import.meta.env.VITE_DATA_URL}/twilio-table-sync/list-item-create?targetList=${cartItemObj.sid}`;
        return await fetch(url, { method: "POST", headers: {'Content-type': 'application/json'}, body: JSON.stringify({"payload": i}) });
      };


      onBeforeMount(async ()  => {
        // MAKE SURE THAT MAIN TABLE SID IS SET
        await useCheckForLists();    
        if (!accountStore.account.ContactId) {
            console.log("User not logged in...");    
            router.replace( { name: 'home' })
        }            
      })

      onMounted(async () => {            
          getCatalog();
      });

      const step2 = ref(false);
      const step3 = ref(false);
      const step4 = ref(false);

      return {
        catalog, categories, categoryFilter,
        toCurrency, updateCartTotals,
        cart, cartItems, addToCart, changeQty,
        step2, step3, step4,        
        accountStore,
        baseUrl:import.meta.env.VITE_DATA_URL,
        placeOrder, orderProcessing, orderSuccess
      }
    }
  }
</script>

<template>
  <div class="container-fluid pt-3">
    <h1 class="mb-5">Place an order!</h1>
    
      <div v-show="!orderSuccess" class="accordion" id="accordionExample">
        <div class="accordion-item">
          <h2 class="accordion-header" id="headingOne">
            <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapseOne" aria-expanded="true" aria-controls="collapseOne">
              <span class="fs-4 fw-bolder">#1 Shop</span>
              <span class="ms-5 fst-italic"><i class="bi-cart"></i> Items in cart ({{cartItems.length}})</span>
            </button>
          </h2>
          <div id="collapseOne" class="accordion-collapse collapse show" aria-labelledby="headingOne" data-bs-parent="#accordionExample">
            <div class="accordion-body">

                <div class="w-100 d-inline-block card overflow-hidden" >
                    <div class="card-header text-center fs-3 fw-bold">
                      CATALOG
                    </div>
                    <div class="container p-2">
                      <select class="form-select" aria-label="Category Filter" v-model="categoryFilter" @change="filterCatalog()">
                        <option value="none" selected>Filter by Category (All)</option>
                        <option v-for="c in categories" :value="c" :key="c">{{ c }}</option>                  
                      </select>            
                    </div>
                    <div class="w-100">
                      <table class="table table-striped align-middle">
                          <tbody>
                            <tr v-for="p in catalog" v-bind:key="p.index" v-show="p.Show">
                              <td><img :src="'https://dfdp-3990-dev.twil.io/clients/flex-agent/images/'+p.data.img" style="max-height:75px;" class="img-responsive img-rounded" /></td>
                              <td>
                                {{p.data.dscr}}<br />
                                <small class="text-muted">{{p.data.category}}</small>
                              </td>
                              <td>{{toCurrency(p.price)}}</td>
                              <td>
                                <button v-show="!p.data.added" type="button" @click="addToCart(p.data)" class="btn btn-primary"><i class="bi bi-cart-plus"></i></button>
                                <button v-show="p.data.added" type="button" class="btn btn-success"><i class="bi bi-check"></i></button>
                              </td>
                            </tr>
                          </tbody>
                      </table>     

                        <div class="d-grid">
                          <button :disabled="cartItems.length===0" @click="step2 = true,updateCartTotals()" onclick="document.getElementById('step2Button').click();" class="btn btn-primary btn-lg">
                            Continue -- Items in cart ({{cartItems.length}})
                          </button>
                        </div>    
                    </div>

                </div> 

             
            </div>
          </div>
        </div>
        <div v-show="step2" class="accordion-item">
          <h2 class="accordion-header" id="headingTwo">
            <button id="step2Button" class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseTwo" aria-expanded="false" aria-controls="collapseTwo">
              <span class="fs-4 fw-bolder">#2 Finalize Cart</span>
            </button>
          </h2>
          <div id="collapseTwo" class="accordion-collapse collapse" aria-labelledby="headingTwo" data-bs-parent="#accordionExample">            
            <div class="w-100">
              <table class="table table-striped align-middle">
                  <tbody>                  
                    <tr v-for="c in cartItems" v-bind:key="c.dscr" class="align-middle">
                      <td><img :src="`${baseUrl}/clients/flex-agent/images/`+c.img" style="max-height:45px;" class="img-responsive img-rounded" /></td>
                      <td>{{c.dscr}}</td>
                      <td><button class="btn btn-secondary btn-sm">{{c.qty}}</button></td>
                      <td>
                            <div class="btn-group d-block" role="group" aria-label="Basic mixed styles example">
                            <button type="button" @click="changeQty(c.dscr,true)" class="btn btn-success btn-sm"><i class="bi bi-plus"></i></button>
                            <button type="button" @click="changeQty(c.dscr,false)" class="btn btn-warning btn-sm"><i class="bi bi-dash"></i></button>
                          </div>
                      </td>
                      <td>{{toCurrency(c.price)}}</td>
                      <td>{{toCurrency(c.LineTotal)}}</td>
                    </tr>
                    <tr>
                      <td></td>
                      <td>SubTotal</td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td>{{toCurrency(cart.SubTotal)}}</td>
                    </tr>
                    <tr>
                      <td></td>
                      <td>Tax</td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td>{{toCurrency(cart.Tax)}}</td>
                    </tr>  
                    <tr>
                      <td></td>
                      <td>Total</td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td>{{toCurrency(cart.Total)}}</td>
                    </tr>                                      
                  </tbody>
              </table>     

                <div class="d-grid">
                  <button @click="step3 = true" onclick="document.getElementById('step3Button').click();" class="btn btn-primary btn-lg">Continue</button>
                </div>    
            </div>          
          </div>
        </div>
        <div v-show="step3" class="accordion-item">
          <h2 class="accordion-header" id="headingThree">
            <button id="step3Button" class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseThree" aria-expanded="false" aria-controls="collapseThree">
              <span class="fs-4 fw-bolder">#3 Your Account</span>
            </button>
          </h2>        
           <div id="collapseThree" class="accordion-collapse collapse" aria-labelledby="headingThree" data-bs-parent="#accordionExample">
            <div class="accordion-body">
              <div class="mb-3">
                <label for="exampleFormControlInput1" class="form-label">First Name</label>
                <input type="text" disabled v-model="accountStore.account['First Name']" class="form-control" id="exampleFormControlInput1" placeholder="">
              </div>
              <div class="mb-3">
                <label for="exampleFormControlInput1" class="form-label">Last Name</label>
                <input type="text" disabled v-model="accountStore.account['Last Name']" class="form-control" id="exampleFormControlInput1" placeholder="">
              </div>              
              <div class="mb-3">
                <label for="exampleFormControlInput1" class="form-label">Phone Number</label>
                <input type="text" disabled v-model="accountStore.account['Phone Number']" class="form-control" id="exampleFormControlInput1" placeholder="Doe">
              </div>                           

              <div class="mb-3">
                <label for="exampleFormControlInput1" class="form-label">Email</label>
                <input type="text" disabled v-model="accountStore.account['Email']" class="form-control" id="exampleFormControlInput1" placeholder="user@domain.com" >
              </div>  
                <div class="d-grid">
                  <button @click="step4 = true" onclick="document.getElementById('step4Button').click();" class="btn btn-primary btn-lg">Continue</button>
                </div> 
            </div>            
          </div>
        </div>
        <div v-show="step4" class="accordion-item">
          <h2 class="accordion-header" id="headingFour">
            <button id="step4Button" class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseFour" aria-expanded="false" aria-controls="collapseFour">
              <span class="fs-4 fw-bolder">#4 Place Order!</span>
            </button>
          </h2>
          <div id="collapseFour" class="accordion-collapse collapse" aria-labelledby="headingFour" data-bs-parent="#accordionExample">
            <div class="accordion-body">
              <div class="row">
                <div class="col">
                  <div class="card">
                    <h5 class="card-header">Order Total</h5>
                    <div class="card-body">
                      <h5 class="card-title">{{toCurrency(cart.Total)}}</h5>
                    </div>
                  </div>                  
                </div>
                <div class="col">
                  <div class="card">
                    <h5 class="card-header">Customer</h5>
                    <div class="card-body">
                      <h5 class="card-title">{{accountStore.account["First Name"]}} {{accountStore.account["Last Name"]}}</h5>
                      <p class="card-text">Phone: {{accountStore.account["Phone Number"]}}</p>
                      <p class="card-text">Email: {{accountStore.account["Email"]}}</p>
                    </div>
                  </div>                  
                </div>
              </div>
                <div class="d-grid mt-3">
                  <button v-show="!orderProcessing" @click="placeOrder()" class="btn btn-success btn-lg">Place Order</button>
                  <div v-show="orderProcessing" class="spinner-border" role="status">
                    <span class="visually-hidden">Loading...</span>
                  </div>
                </div>               
            </div>
          </div>
        </div>  
      </div>
      <div v-show="orderSuccess" class="alert alert-success">
        Awesome! Order processed!
      </div>
  </div>
</template>

<style scoped>
</style>
