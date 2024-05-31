<template>
  <div>
    <fb:login-button @login="checkLoginState"></fb:login-button>
    <div id="status">{{ statusMessage }}</div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      statusMessage: ''
    };
  },
  methods: {
    statusChangeCallback(response) {
      console.log('statusChangeCallback');
      console.log(response);
      if (response.status === 'connected') {
        console.log(JSON.stringify(response));
        testAPI();
      } else {
        this.statusMessage = 'Please log into this webpage.';
      }
    },
    checkLoginState() {
      FB.getLoginStatus(function (response) {   // See the onlogin handler
                statusChangeCallback(response);
            });
    },
    testAPI() {
      console.log('Welcome! Fetching your information....');
      FB.api('/me', function (response){
        console.log('Successful login for: ' + response.name);
        this.statusMessage = 'Thanks for logging in, ' + response.name + '!' + response.accessToken;
      });
    }
  },
  mounted() {
    window.fbAsyncInit = () => {
      FB.init({
        appId: '463293956105488',
        cookie: true,
        xfbml: true,
        version: 'v20.0'
      });

      FB.getLoginStatus(function (response) {   // Called after the JS SDK has been initialized.
        statusChangeCallback(response);        // Returns the login status.
      });
    };
  }
};
</script>

<script async defer crossorigin="anonymous" src="https://connect.facebook.net/en_US/sdk.js"></script>

<style scoped>
/* Add any scoped styles here */
</style>
