<script setup>
import { ref, defineEmits } from "vue";
import ButtonApp from "@/components/Button-app.vue";
const username = ref('');
const password = ref('');

const emit = defineEmits(['add-new-user']);

function onSubmit() {
  if(!(username.value && password.value)) {
    alert('Username and Password are required');
    return
  }
  const newUser = {
    username: username.value,
    password: password.value,
  }
  emit('add-new-user', newUser);
  username.value = '';
  password.value = '';
}

</script>

<template>
  <div class="register-form">
    <div class="form-control">
      <label>Username</label>
      <input type="text" name="username" v-model="username" placeholder="New Username" />
    </div>
    <div class="form-control">
      <label>Password</label>
      <input
          type="password"
          name="password"
          v-model="password"
          placeholder="New Password" />
    </div>
    <ButtonApp
        v-on:btn-click="onSubmit"
        v-bind:text="'Register'"
        v-bind:color="'blue'"
    />

  </div>
</template>

<style scoped>


.register-form {
  margin-bottom: 40px;
}

.form-control {
  margin: 20px 0;
}

.form-control label {
  display: block;
}

.form-control input {
  width: 60%;
  height: 40px;
  margin: 5px;
  padding: 3px 7px;
  font-size: 17px;
}

.form-control {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.form-control label {
  flex: 1;
}

.form-control input {
  flex: 2;
  height: 20px;
}
</style>