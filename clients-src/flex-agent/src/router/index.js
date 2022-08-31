import { createRouter, createWebHashHistory } from 'vue-router'
import { useAppSettingsStore } from '../stores/appSettingsStore'

import HomeView from '../views/HomeView.vue'
import Entry from '../components/Entry.vue'

import AppointmentsView from '../views/AppointmentsView.vue'
import TicketsView from '../views/TicketsView.vue'
import TicketView from '../views/TicketView.vue'
import LeadsView from '../views/LeadsView.vue'
import LeadView from '../views/LeadView.vue'
import CartView from '../views/CartView.vue'
import ContactView from '../views/ContactView.vue'
import ContactsView from '../views/ContactsView.vue'
import DeliveriesView from '../views/DeliveriesView.vue'
import GameView from '../views/GameView.vue'
import KnowledgeView from '../views/KnoweldgeView.vue'
import SettingsView from '../views/SettingsView.vue'
import NewContactView from '../views/NewContactView.vue'

const routes = [
  { path: '/', name:'home', component: HomeView},
  { path: '/entry/:name/:channelType/:channelSid/:targetPage?/:passedParams?', name:'entry', component: Entry },  
  { path: '/appointments', name:'appointments',component: AppointmentsView },
  { path: '/tickets', name:'tickets', component: TicketsView},
  { path: '/ticket/:ticketId', name:'ticket', component: TicketView},
  { path: '/cart', name:'cart', component: CartView},
  { path: '/contact', name:'contact', component: ContactView},
  { path: '/contacts', name:'contacts', component: ContactsView},  
  { path: '/leads', name:'leads', component: LeadsView},
  { path: '/lead/:leadId', name:'lead', component: LeadView},
  { path: '/deliveries', name:'deliveries', component: DeliveriesView},
  { path: '/game', name:'game', component: GameView},
  { path: '/knowledge', name:'knowledge', component: KnowledgeView },
  { path: '/settings', name:'setting', component: SettingsView},
  { path: '/new-contact', name:'newContact', component: NewContactView},

];

const router = createRouter({
  //history: createWebHistory(),
  history: createWebHashHistory(),
  routes
})
export default router;