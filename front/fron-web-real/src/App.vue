<script setup>
import {ref} from "vue";
import ButtonApp from "@/components/Button-app.vue";
import HeaderApp from "@/components/Header-app.vue";
const token = {
  accessToken: ref(""),
  username:ref("")
};

const BACK_URL = 'http://localhost:9000';

async function Logout() {
  const res = await fetch(`${BACK_URL}/logout`, {
    method: 'POST',
    headers: {
      'Content-type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({accessToken: token.accessToken.value})
  })

  const data = await res.json();
  if('accessToken' in data) token.accessToken.value = data.accessToken;
}
function userLoggedIn(token){
  token.accessToken.value = token.accessToken;
  token.username.value = token.username;
  console.log("app userLoggedIn: ", token)
}
</script>

<template>
  <div class="container">
    <HeaderApp
        v-show="token.accessToken.value !==''"
        :username="token.username.value"/>
    <router-link
        v-on:user-logged-in="userLoggedIn"
        to="/">Home</router-link> |
    <router-link to="/about">About</router-link>
    <ButtonApp
        v-show="token.accessToken.value !==''"
        :text="'LogOut'"
        v-on:btn-click="Logout"/>
    <router-view
        :username="token.username"
        :token="token.accessToken"></router-view>
  </div>
</template>

<style>
#app {
  display: grid;
  font-family: Avenir, Helvetica, Arial, sans-serif;
  /*-webkit-font-smoothing: antialiased;*/
  /*-moz-osx-font-smoothing: grayscale;*/
  text-align: center;
  color: #2c3e50;
}
*{
  box-sizing: border-box;
  margin: 0;
  padding: 0 ;
}
.container {
  max-width: 80vmin;
  margin: 30px auto;
  overflow: auto;
  min-height: 300px;
  border: 1px solid steelblue;
  padding: 30px;
  border-radius: 5px;
}

.btn {
  display: inline-block;
  background: #000000;
  color: #ffffff;
  border: none;
  padding: 5px 10px;
  margin: 5px;
  border-radius: 5px;
  cursor: pointer;
  text-decoration: none;
  font-size: 2vmin;
  font-family: inherit;
}

.btn:focus {
  outline: none;
}

.btn:active {
  transform: scale(0.98);
}

.btn-block {
  display: block;
  width: 100%;
}

</style>
