<template>
  <div id="app">
    <FacebookLogin />
  </div>
</template>

<script>
import FacebookLogin from './pages/login.vue';

export default {
  name: 'App',
  components: {
    FacebookLogin
  }
};
</script>

<style>
/* Add your styles here */
</style>
