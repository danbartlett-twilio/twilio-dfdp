<script>
  import { ref, reactive, onBeforeMount, onMounted } from 'vue'
  import { toCurrency } from '../composables/tocurrency.js'
  import { useContactStore } from '../stores/contactStore'
  import { useListStore } from '../stores/listStore'
  import Knowledge from '@/components/Knowledge.vue'
  import ContactCard from './ContactCard.vue'
  import SendSMS from './SendSMS.vue'
  import { returnNewId } from '../composables/returnnewid.js'
  import { useCheckForCurrentContact } from '../composables/check-for-contact.js'

  export default {
    setup() {

      const contactStore = useContactStore();
      const listStore = useListStore();            

      const catObj = listStore.lists.find(o => o.uniqueName === 'CatalogList');      
      const catalog = ref([]);
      const categories = ref([]);
      const categoryFilter = ref("none");
      
      const getCatalog = async () => {
        
        try {                
          let url = `${import.meta.env.VITE_DATA_URL}/twilio-table-sync/list-item-get-array?targetList=${catObj.sid}`;
          const res = await fetch(url, { method: "GET", cache: "no-store", headers: {'Content-type': 'application/json'} });
          if (res.ok) {
            let r = await res.json();
            console.log("in getCatalog and r => ", r);
            catalog.value = r.sort((a, b) => a.data['dscr'] - b.data['dscr']);
            for(const o of catalog.value) { o.Show = true; }
            categories.value = Array.from(new Set(r.map(item => item.data.category))).sort((a, b) => (a < b) ? -1 : 1);
          }
          
        } catch (e) { console.log("getContacts error => ", e); }      

      }

      function filterCatalog() {
        console.log("categoryFilter => ", categoryFilter.value);
        catalog.value.forEach(i => {
            console.log("item category => ", i.data.category);
            if(categoryFilter.value === "none" || categoryFilter.value === undefined || categoryFilter.value === null || categoryFilter.value === i.data.category) {
              i.Show = true;
            } else {
              i.Show = false;
            }
        });
      }

      const cartObj = listStore.lists.find(o => o.uniqueName === 'CartList');
      const carts = reactive({carts:[]});
      const cartIndex = ref(0);

      const getCarts = async () => {
        
        try {                
          let url = `${import.meta.env.VITE_DATA_URL}/twilio-table-sync/list-item-get-array?targetList=${cartObj.sid}&filterField=ContactId&filterFieldValue=${encodeURIComponent(contactStore.currentContact.contact.data.ContactId)}`;
          const res = await fetch(url, { method: "GET", cache: "no-store", headers: {'Content-type': 'application/json'} });
          if (res.ok) {
            let r = await res.json();
            console.log("in getCart and r => ", r);
            if(r.length > 0) {
              carts.carts = r.sort((a, b) => (a.dateCreated > b.dateCreated) ? -1 : 1);
            } else {
              // NO ACTIVE CART --> Add new one...
              let addCartUrl = `${import.meta.env.VITE_DATA_URL}/twilio-table-sync/list-item-create?targetList=${cartObj.sid}`;
              let payload = {
                CartId:returnNewId(),
                ContactId:contactStore.currentContact.contact.data.ContactId,
                SubTotal:0,
                Tax:0,
                Total:0,
                OrderStatus:"OPEN"
              };
              const resP = await fetch(addCartUrl, { method: "POST", headers: {'Content-type': 'application/json'}, body: JSON.stringify({"payload": payload}) });
              if (resP.ok) { 
                  let rp = await resP.json();
                  console.log("in getCart Post New and rp => ", rp);         
                  carts.carts.push(rp);
              }                 
            }
            
                        
          }
          
        } catch (e) { console.log("getCart error => ", e); }      

      }
      
      const cartItmObj = listStore.lists.find(o => o.uniqueName === 'CartItemList');
      const cartItems = ref([]);
      const getCartItems = async () => {
        
        try {                
          console.log("carts.carts[cartIndex.value].data.CartId => ", carts.carts[cartIndex.value].data.CartId);

          let url = `${import.meta.env.VITE_DATA_URL}/twilio-table-sync/list-item-get-array?targetList=${cartItmObj.sid}&filterField=CartId&filterFieldValue=${encodeURIComponent(carts.carts[cartIndex.value].data.CartId)}`;
          const res = await fetch(url, { method: "GET", cache: "no-store", headers: {'Content-type': 'application/json'} });
          if (res.ok) {
            let r = await res.json();
            console.log("in getCartItems and r => ", r);
            if(r.length > 0) {
              cartItems.value = r.sort((a, b) => (a.data.dscr > b.data.dscr) ? -1 : 1);
            }
            
                        
          }
          
        } catch (e) { console.log("getCartItems error => ", e); }      

      }

      let persistItems = [];
      
      function changeQty(i,inc) {
        console.log("changeQty i => ", i);
        console.log("changeQty inc => t/f ", inc);
        let idx = cartItems.value.findIndex(o => o.index === i);      
        cartItems.value[idx].data.qty = inc ? parseInt(cartItems.value[idx].data.qty) + 1 : parseInt(cartItems.value[idx].data.qty) - 1;
        
        if (cartItems.value[idx].data.qty === 0) {
          console.log("At 0! Remove from cart!");
          deleteFromCart(i);
        } else {
          cartItems.value[idx].data.LineTotal = cartItems.value[idx].data.qty * cartItems.value[idx].data.price;
          if (persistItems.indexOf(i) < 0) {
            persistItems.push({"localIndex":idx,"syncIndex":i,"action":"update"})
          }  
          queueUpdateCartTotals();          
        }

      }

      const addToCart = async (item) => {
        item.CartId = carts.carts[cartIndex.value].data.CartId;
        item.qty = 1;
        item.LineTotal = item.price;      
        let url = `${import.meta.env.VITE_DATA_URL}/twilio-table-sync/list-item-create?targetList=${cartItmObj.sid}`;
        const res = await fetch(url, { method: "POST", headers: {'Content-type': 'application/json'}, body: JSON.stringify({"payload": item}) });
        if (res.ok) {          
            console.log("Success! Item added to cart...");
            await getCartItems();
            queueUpdateCartTotals();
        }        
      }

      const deleteFromCart = async (idx) => {
        let url = `${import.meta.env.VITE_DATA_URL}/twilio-table-sync/list-item-delete?targetList=${cartItmObj.sid}&listItemIndex=${idx}`;
        const res = await fetch(url, { method: "POST", headers: {'Content-type': 'application/json'} });
        if (res.ok) {
            console.log("Success! Removed item from cart...");
            let lidx = cartItems.value.findIndex(o => o.index === idx);
            cartItems.value.splice(lidx,1);            
            queueUpdateCartTotals();
        } 
      }

      const cartUpdating = ref(false);
      let timeoutQueue = []
      function queueUpdateCartTotals() {
        cartUpdating.value = true;

        // Clear pending calls
        timeoutQueue.forEach(t => {
          clearTimeout(t);
        })
        timeoutQueue = [];
        
        let timeoutId = setTimeout(() => {
          updateCartTotals();
        }, "4000");
        console.log("timeoutId => ", timeoutId);
        timeoutQueue.push(timeoutId);

      };
      const updateCartTotals = async () => {
      
        console.log("updateCartTotals...")

        await Promise.all(persistItems.map(async (i) => {
            await saveItemUpdate(i);
        }))
        persistItems = [];

        let s = 0;
        cartItems.value.forEach(i => {
          s = s + i.data.LineTotal;
        });
        carts.carts[cartIndex.value].data.SubTotal = s;
        carts.carts[cartIndex.value].data.Tax = s * 0.08;
        carts.carts[cartIndex.value].data.Total = s + carts.carts[cartIndex.value].data.Tax;

        saveCartUpdate();

      }
      const saveItemUpdate = async (i) => {
        console.log("in saveItemUpdate and i => ", i);
        let url = `${import.meta.env.VITE_DATA_URL}/twilio-table-sync/list-item-update?targetList=${cartItmObj.sid}`;          
        url += `&listItemIndex=${i.syncIndex}`;
        let payload = cartItems.value[i.localIndex].data;
        const res = await fetch(url, { method: "POST", headers: {'Content-type': 'application/json'}, body: JSON.stringify({"payload": payload}) });
        if (res.ok) {
            console.log("Saved cart item update...");
        }                
      };
      const saveCartUpdate = async () => {
        console.log("in saveCartUpdate...");
        let url = `${import.meta.env.VITE_DATA_URL}/twilio-table-sync/list-item-update?targetList=${cartObj.sid}`;          
        url += `&listItemIndex=${carts.carts[cartIndex.value].index}`;
        let payload = carts.carts[cartIndex.value].data;
        const res = await fetch(url, { method: "POST", headers: {'Content-type': 'application/json'}, body: JSON.stringify({"payload": payload}) });
        if (res.ok) {
            console.log("Saved cart update...");
            cartUpdating.value = false;
        }                
      };


      onBeforeMount(async () => {            
          useCheckForCurrentContact();
      });

      onMounted(async () => {            
          getCatalog();
          await getCarts();
          console.log("Mounted and carts array => ", carts);
          await getCartItems();
      });

      const sendSMS = ref(false);

      return {
          cs: contactStore.currentContact,            
          catalog, categories, categoryFilter, filterCatalog,
          toCurrency: toCurrency,
          carts, cartIndex, cartItems,
          changeQty, addToCart, deleteFromCart, cartUpdating,
          sendSMS

      };
    },
    components: { Knowledge, ContactCard, SendSMS }
}    
</script>

<template>
<div class="container-fluid">    

  <div class="row row-height">
    
    <div class="col scroll-column">
        
      <ContactCard :cs="cs" />

      <SendSMS v-show="sendSMS" 
          :messageTo="cs.contact?.data['Phone Number']" :messageBody="'Enter details about this Order.'" 
          @close-panel="sendSMS = false"
      />        

        <div class="card mb-3">
          <div class="card-header bg-success text-white text-center">ORDER DETAILS</div>          
          <div class="card-body">
            <p>
              <b>Order Status: {{carts.carts[cartIndex]?.data.OrderStatus}}</b>              
            </p>

            <table class="table table-striped align-middle">
              <thead>
              </thead>
              <tbody>
                <tr v-for="ci in cartItems" v-bind:key="ci.index" class="align-middle">
                  <td><img :src="'/clients/flex-agent/images/'+ci.data.img" style="max-height:50px;" class="img-responsive img-rounded" /></td>
                  <td>{{ci.data.dscr}}</td>
                  <td><span class="badge bg-info">{{ci.data.qty}}</span></td>
                  <td>
                       <div class="btn-group d-block mb-2" role="group" aria-label="Basic mixed styles example">
                        <button type="button" @click="changeQty(ci.index,true)" class="btn btn-success btn-sm"><i class="bi bi-plus"></i></button>
                        <button type="button" @click="changeQty(ci.index,false)" class="btn btn-warning btn-sm"><i class="bi bi-dash"></i></button>
                      </div>
                  </td>
                  <td>{{toCurrency(ci.data.price)}}</td>
                  <td>{{toCurrency(ci.data.LineTotal)}}</td>
                  <td><button type="button" @click="deleteFromCart(ci.index)" class="btn btn-danger btn-sm"><i class="bi bi-trash"></i></button></td>
                </tr>
                <tr>
                  <td>SubTotal</td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td>
                    <span v-show="cartUpdating">
                      <div class="spinner-grow spinner-grow-sm" role="status">
                        <span class="visually-hidden">Loading...</span>
                      </div>                 
                    </span>
                    <span v-show="!cartUpdating">
                      {{toCurrency(carts.carts[cartIndex]?.data.SubTotal)}}
                    </span>
                  </td>
                  <td></td>
                  </tr>
                  <tr>
                  <td>Tax</td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td>
                    <span v-show="cartUpdating">
                      <div class="spinner-grow spinner-grow-sm" role="status">
                        <span class="visually-hidden">Loading...</span>
                      </div>                   
                    </span>
                    <span v-show="!cartUpdating">
                      {{toCurrency(carts.carts[cartIndex]?.data.Tax)}}
                    </span>
                  </td>
                  <td></td>
                  </tr>         
                  <tr>
                  <td>Total</td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td>
                    <span v-show="cartUpdating">
                      <div class="spinner-grow spinner-grow-sm" role="status">
                        <span class="visually-hidden">Loading...</span>
                      </div>            
                    </span>
                    <span v-show="!cartUpdating">
                      {{toCurrency(carts.carts[cartIndex]?.data.Total)}}
                    </span>
                  </td>
                  <td></td>
                  </tr>                       
              </tbody>
            </table> 
          </div>
          <div class="card-body p-2 mb-3 text-center">            
              <button type="button" class="btn btn-danger p-2">Cancel Order</button>                
              <button type="button" class="btn btn-success p-2 ms-3">Complete Order</button>
              <button type="button" @click="sendSMS = !sendSMS" class="btn btn-info p-2 ms-3">Send SMS</button>            
          </div>
        </div>
        
        
      
    </div>
    <div class="col  d-inline-block scroll-column">

      <ul class="nav nav-tabs mb-3" id="pills-tab" role="tablist">
        <li class="nav-item" role="presentation">
          <button class="nav-link active" id="pills-catalog-tab" data-bs-toggle="pill" data-bs-target="#pills-catalog" type="button" role="tab" aria-controls="pills-catalog" aria-selected="true"><b>Catalog</b></button>
        </li>
        <li class="nav-item" role="presentation">
          <button class="nav-link" id="pills-orders-tab" data-bs-toggle="pill" data-bs-target="#pills-orders" type="button" role="tab" aria-controls="pills-order" aria-selected="false"><b>Past Orders</b></button>
        </li>
        <li class="nav-item" role="presentation">
          <button class="nav-link" id="pills-knowledge-tab" data-bs-toggle="pill" data-bs-target="#pills-knowledge" type="button" role="tab" aria-controls="pills-knowledge" aria-selected="false"><b>Knowledge</b></button>
        </li>        
      </ul>
      <div class="tab-content" id="pills-tabContent">
        <div class="tab-pane fade show active" id="pills-catalog" role="tabpanel" aria-labelledby="pills-home-tab" tabindex="0">

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
              <div class="w-100 h-50 mh-50 d-inline-block overflow-auto" style="max-height: 500px;">
                <table class="table table-striped align-middle">
                    <tbody>
                    <tr v-for="p in catalog" v-bind:key="p.index" v-show="p.Show">
                        <td><img :src="'/clients/flex-agent/images/'+p.data.img" style="max-height:40px;" class="img-responsive img-rounded" /></td>
                        <td>
                          {{p.data.dscr}}<br />
                          <small class="text-muted">{{p.data.category}}</small>
                        </td>
                        <td>{{toCurrency(p.price)}}</td>
                        <td><button type="button" @click="addToCart(p.data)" class="btn btn-success btn-sm"><i class="bi bi-cart-plus"></i></button></td>
                    </tr>
                    </tbody>
                </table>     


              </div>

          </div> 

        </div>
        <div class="tab-pane fade" id="pills-orders" role="tabpanel" aria-labelledby="pills-profile-tab" tabindex="0">

                      <div class="accordion accordion-flush" id="accordionFlushExample">
                      <div class="accordion-item">
                        <h2 class="accordion-header" id="flush-headingOne">
                          <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#flush-collapseOne" aria-expanded="false" aria-controls="flush-collapseOne">
                            Order Placed March 30, 2022
                          </button>
                        </h2>
                        <div id="flush-collapseOne" class="accordion-collapse collapse" aria-labelledby="flush-headingOne" data-bs-parent="#accordionFlushExample">
                          <div class="accordion-body">Placeholder content for this accordion, which is intended to demonstrate the <code>.accordion-flush</code> class. This is the first item's accordion body.</div>
                        </div>
                      </div>
                      <div class="accordion-item">
                        <h2 class="accordion-header" id="flush-headingTwo">
                          <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#flush-collapseTwo" aria-expanded="false" aria-controls="flush-collapseTwo">
                            Order Placed February 2, 2022
                          </button>
                        </h2>
                        <div id="flush-collapseTwo" class="accordion-collapse collapse" aria-labelledby="flush-headingTwo" data-bs-parent="#accordionFlushExample">
                          <div class="accordion-body">Placeholder content for this accordion, which is intended to demonstrate the <code>.accordion-flush</code> class. This is the second item's accordion body. Let's imagine this being filled with some actual content.</div>
                        </div>
                      </div>
                      <div class="accordion-item">
                        <h2 class="accordion-header" id="flush-headingThree">
                          <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#flush-collapseThree" aria-expanded="false" aria-controls="flush-collapseThree">
                            Order Placed October 12, 2021
                          </button>
                        </h2>
                        <div id="flush-collapseThree" class="accordion-collapse collapse" aria-labelledby="flush-headingThree" data-bs-parent="#accordionFlushExample">
                          <div class="accordion-body">Placeholder content for this accordion, which is intended to demonstrate the <code>.accordion-flush</code> class. This is the third item's accordion body. Nothing more exciting happening here in terms of content, but just filling up the space to make it look, at least at first glance, a bit more representative of how this would look in a real-world application.</div>
                        </div>
                      </div>
                    </div>

        </div>

        <div class="tab-pane fade" id="pills-knowledge" role="tabpanel" aria-labelledby="pills-knowledge-tab" tabindex="0">
          
          <div class="card">
            <div class="card-header text-white bg-info">Knowledge Base</div>
              <Knowledge />
          </div>
          

        </div>
      </div>




    </div>
  </div>  
</div>  
</template>
<style scoped>
.row-height{
  height: 100vh;
}
.scroll-column{  
  height: 100%;
  overflow-y: scroll;
}
</style>
