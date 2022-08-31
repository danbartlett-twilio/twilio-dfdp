import { defineStore } from 'pinia'

export const useAccountStore = defineStore('account', {
  state: () => ({ 
    account: {},
    listIndex: null
  })
})
