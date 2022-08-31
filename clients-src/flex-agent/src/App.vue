<script setup>
  import { RouterLink, RouterView } from 'vue-router'
  import SideNav from '@/components/SideNav.vue'
</script>

<template>   



  <div class="d-flex flex-row">
    
    <div class="vh-100 flex-shrink-1 bg-secondary" style="max-width:60px;">

      <SideNav />

    </div>

    <div class="p-2 flex-grow-1">

        <RouterView /> 

    </div>
    
  </div>



</template>      

<style></style>
