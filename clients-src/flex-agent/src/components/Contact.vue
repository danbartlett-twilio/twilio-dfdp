<script>
  import { ref, reactive, computed, watch, onMounted, inject } from 'vue'
  import { useRoute } from 'vue-router'
  import ContactCard from './ContactCard.vue'
  import Knowledge from './Knowledge.vue'
  import { useContactStore } from '../stores/contactStore'
  
  
  export default {
    components: {
     ContactCard,
     Knowledge
    },    
    setup() {
        
        const contactStore = useContactStore()      

        return {
          cs:contactStore.currentContact
        };
    },    
}
</script>

<template>
  <div class="container-fluid">  

    <div class="row row-height">                    
           <div class="col-md-6 scroll-column ">
     
            <ContactCard :cs="cs" />

            <div class="card mb-3">

                <div class="card-header fs-4 fw-bold">Account Information</div>
                <div class="card-body p-2">

                  <div class="row">
                    <div class="col">
                      <p class="text-center">
                        <span class="badge bg-info text-dark">Details</span>
                      </p>
                      <p><b>ACCOUNT</b></p>
                      
                        <div class="row mb-3">
                          <div class="col text-muted">Accout Number:</div>
                          <div class="col text-end fw-bold">8833002</div>
                        </div>
                        <div class="row mb-3">
                          <div class="col text-muted">PIN Code:</div>
                          <div class="col text-end fw-bold">4558</div>
                        </div>
                        <div class="row mb-3">
                          <div class="col text-muted">UID:</div>
                          <div class="col text-end fw-bold">{{cs.contact.ContactId}}</div>
                        </div>

                      <p class="mt-4"><b>LOYALTY</b></p>
                        <div class="row mb-3">
                          <div class="col text-muted">Loyalty Level:</div>
                          <div class="col text-end fw-bold">GOLD</div>
                        </div>
                        <div class="row mb-3">
                          <div class="col text-muted">Lifetime Sales:</div>
                          <div class="col text-end fw-bold">$593.00</div>
                        </div>                      
                   
                    </div>
                    <div class="col">
                      <p class="text-center">
                        <span class="badge bg-info text-dark">Customer Journey</span>
                      </p>
                      <ul class="timeline">
                          <li class="timeline-item mb-5">
                            <h6 class="fw-bold">Placed Order</h6>
                            <p class="text-muted mb-2 fw-bold">06/17/2022</p>
                            <p class="text-muted">
                              4 items @ $34.50
                            </p>
                          </li>
                          <li class="timeline-item mb-5">
                            <h6 class="fw-bold">Added item to cart</h6>
                            <p class="text-muted mb-2 fw-bold">06/16/2022</p>
                            <p class="text-muted">
                              2 widgets
                            </p>
                          </li>
                          <li class="timeline-item mb-5">
                            <h6 class="fw-bold">Signed up for account</h6>
                            <p class="text-muted mb-2 fw-bold">06/12/2022</p>
                            <p class="text-muted">
                              From google adwords
                            </p>
                          </li>
                          <li class="timeline-item mb-5">
                            <h6 class="fw-bold">Browsed website</h6>
                            <p class="text-muted mb-2 fw-bold">05/27/2022</p>
                            <p class="text-muted">
                              Matched browsing history
                            </p>
                          </li>

                        </ul>

                    </div>
                  </div>

                </div>
            </div>

           </div>

           <div class="col-md-6 ">

              <ul class="nav nav-tabs mb-3" id="pills-tab" role="tablist">
                  <li class="nav-item" role="presentation">
                    <button class="nav-link active fw-bold" id="pills-catalog-tab" data-bs-toggle="pill" data-bs-target="#pills-catalog" type="button" role="tab" aria-controls="pills-catalog" aria-selected="true">Engagement Analysis</button>
                  </li>
                  <li class="nav-item" role="presentation">
                    <button class="nav-link  fw-bold" id="pills-orders-tab" data-bs-toggle="pill" data-bs-target="#pills-orders" type="button" role="tab" aria-controls="pills-order" aria-selected="false">Past Orders</button>
                  </li>
                  <li class="nav-item" role="presentation">
                    <button class="nav-link  fw-bold" id="pills-knowledge-tab" data-bs-toggle="pill" data-bs-target="#pills-knowledge" type="button" role="tab" aria-controls="pills-knowledge" aria-selected="false">Knowledge</button>
                  </li>        
                </ul>
                <div class="tab-content" id="pills-tabContent">
                  <div class="tab-pane fade show active" id="pills-catalog" role="tabpanel" aria-labelledby="pills-home-tab" tabindex="0">

                    <div class="w-100 d-inline-block card overflow-hidden" >
                        <div class="card-header text-center fs-3 f4-b">
                          Engagement Analysis
                        </div>
                        <div class="container p-2">
                            
                            <div class="progress mt-4 mb-4" style="height: 30px;">
                              <div class="progress-bar progress-bar-striped" role="progressbar" style="width: 45%" aria-valuenow="10" aria-valuemin="0" aria-valuemax="100"><b>Positive</b></div>
                            </div>
                            <div class="progress mb-4" style="height: 30px;">
                              <div class="progress-bar progress-bar-striped bg-success" role="progressbar" style="width: 30%" aria-valuenow="25" aria-valuemin="0" aria-valuemax="100"><b>Value</b></div>
                            </div>
                            <div class="progress mb-4" style="height: 30px;">
                              <div class="progress-bar progress-bar-striped bg-info" role="progressbar" style="width: 60%" aria-valuenow="50" aria-valuemin="0" aria-valuemax="100"><b>Information</b></div>
                            </div>
                            <div class="progress mb-4" style="height: 30px;">
                              <div class="progress-bar progress-bar-striped bg-warning" role="progressbar" style="width: 90%" aria-valuenow="75" aria-valuemin="0" aria-valuemax="100"><b>Concern</b></div>
                            </div>
                            <div class="progress mb-4" style="height: 30px;">
                              <div class="progress-bar progress-bar-striped bg-danger" role="progressbar" style="width: 56%" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100"><b>Anger</b></div>
                            </div>
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


    .timeline {
      border-left: 1px solid hsl(0, 0%, 90%);
      position: relative;
      list-style: none;
    }

    .timeline .timeline-item {
      position: relative;
    }

    .timeline .timeline-item:after {
      position: absolute;
      display: block;
      top: 0;
    }

    .timeline .timeline-item:after {
      background-color: hsl(0, 0%, 90%);
      left: -38px;
      border-radius: 50%;
      height: 11px;
      width: 11px;
      content: "";
    }
</style>