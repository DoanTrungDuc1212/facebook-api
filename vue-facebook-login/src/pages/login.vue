<template>
    <div>
      <div id="status">
        Please log into this webpage.
      </div>
  
      <!-- The JS SDK Login Button -->
      <fb:login-button config_id="1690633798419393" @onlogin="checkLoginState"></fb:login-button>
    </div>
  </template>
  
  <script>
  import { defineComponent, onMounted, onUnmounted, ref } from 'vue'
  
  export default defineComponent({
    setup() {
      const statusChangeCallback = (response) => {
        console.log('statusChangeCallback');
        console.log(response);
  
        if (response.status === 'connected') {
          testAPI();
        } else {
          document.getElementById('status').innerHTML = 'Please log into this webpage.';
        }
      }
  
      const checkLoginState = () => {
        FB.getLoginStatus((response) => {
          statusChangeCallback(response);
        });
      }
  
      const testAPI = () => {
        console.log('Welcome!  Fetching your information.... ');
  
        FB.api('/me', (response) => {
          console.log('Successful login for: ' + response.name);
          console.log(JSON.stringify(response));
  
          document.getElementById('status').innerHTML = 'Thanks for logging in, ' + response.name + '!' + response.accesstoken;
        });
      }
  
  
      
  
      onMounted(() => {
        window.addEventListener('scroll', handleScroll);
        document.addEventListener('click', handleClick);
      });
  
      onUnmounted(() => {
        window.removeEventListener('scroll', handleScroll);
        document.removeEventListener('click', handleClick);
      });
  
      return { checkLoginState };
    }
  });
  </script>
  