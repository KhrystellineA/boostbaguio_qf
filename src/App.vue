<template>
  <router-view />
</template>

<script>
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'App',
  
  mounted() {
    // Set page title
    document.title = 'BaguioBoost - Navigate Baguio\'s Jeepneys with Ease'
    
    // You can add global initialization here
    console.log('BaguioBoostPH App initialized')
  }
})
</script>

<style lang="sass">
// Import global styles
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap')

*
  margin: 0
  padding: 0
  box-sizing: border-box

body
  font-family: 'Roboto', sans-serif
  -webkit-font-smoothing: antialiased
  -moz-osx-font-smoothing: grayscale

// Smooth scrolling
html
  scroll-behavior: smooth

// Custom scrollbar
::-webkit-scrollbar
  width: 10px

::-webkit-scrollbar-track
  background: #f1f1f1

::-webkit-scrollbar-thumb
  background: #888
  border-radius: 5px

::-webkit-scrollbar-thumb:hover
  background: #555
</style>