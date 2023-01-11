

<script setup>
import RegisterForm from "@/components/Register-form-app.vue";
import LogInApp from "@/components/LogIn-app.vue";
import ButtonApp from "@/components/Button-app.vue";
import { useRoute } from 'vue-router';

import { computed, ref, defineEmits, defineProps } from "vue";


const BACK_URL = 'http://localhost:9000';

const props = defineProps({
  title: String
})
const token = {
  accessToken: ref(""),
  username: ref("")
};

const emit = defineEmits(['user-logged-in']);

// const homePage = computed(() => this.$route.path === '/' );


const registered = {
  v: ref(true),
  textRegister: ref("Go To Register")
};

const route = useRoute();
const homePage = computed(() => {
  if(route.path === '/') {
    return true;
  }
  else {
    return false;
  }
})


function toggleRegister() {
  registered.v.value !== false ? registered.v.value = false : registered.v.value = true;
  registered.textRegister.value === 'Go To Register' ? registered.textRegister.value = 'Go To Log In' : registered.textRegister.value = 'Go To Register';
  return registered.v.value;
}

async function addUser(newUser) {
  const res = await fetch(`${BACK_URL}/register`, {
    method: 'POST',
    headers: {
      'Content-type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(newUser)
  })
  const data = await res.json()
  // registered.v.value = true;
  console.log("data", data);
}

async function logInUser(user) {
  const res = await fetch(`${BACK_URL}/auth`, {
    method: 'POST',
    headers: {
      'Content-type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(user)
  })
  const data = await res.json();

  // if('accessToken' in data) props.token.accessToken = data.accessToken;
  if('accessToken' in data) {
    token.accessToken = data.accessToken;
    token.username = user.username;
    emit('user-logged-in', token);

  }
}

</script>

<template>
  <header>
    <h1>
      {{props.title}}
    </h1>


<!--    <Button-->
<!--        v-on:btn-click="emit('toggle-register')"-->
<!--        v-bind:text="props.notShowRegister ? 'Close' : 'Add Task'"-->
<!--        v-bind:color="props.notShowRegister ? 'red' : 'gray'"/>-->

      <ButtonApp
          v-on:btn-click="toggleRegister"
          v-bind:text="registered.textRegister.value"
          v-bind:color="'blue'"
      />
<!--    <component :is="registered.v===true ? LogInApp : RegisterForm" />-->
    <LogInApp
        v-if="registered.v.value"
        v-show="homePage"
        v-on:log-in-user="logInUser"/>
    <RegisterForm
        v-else
        v-show="homePage"
        v-on:add-new-user="addUser"/>


  </header>
</template>

<style scoped>
</style>