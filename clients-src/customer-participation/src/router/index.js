import { createRouter, createWebHashHistory } from 'vue-router'

import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import CartView from '../views/CartView.vue'
import TicketsView from '../views/TicketsView.vue'
import TicketView from '../views/TicketView.vue'
import SupportView from '../views/SupportView.vue'


const router = createRouter({
  //history: createWebHistory(import.meta.env.BASE_URL),
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/cart',
      name: 'cart',
      component: CartView
    },
    {
      path: '/tickets',
      name: 'tickets',
      component: TicketsView
    },    
    {
      path: '/ticket/:ticketId',
      name: 'ticket',
      component: TicketView
    },        
    {
      path: '/support/:instructions?',
      name: 'support',
      component: SupportView
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView
    }            

  ]
})

export default router
