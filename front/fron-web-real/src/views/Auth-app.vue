<script setup>
import { defineProps } from "vue";
import IdentifyApp from "@/components/Identify-app.vue";
import ChatAreaApp from "@/components/Chat-area-app.vue";

const props = defineProps(
    {
  token: Object,
  username: Object
    });
// const emit = defineEmits(['user-logged-in']);
function userLoggedIn(token) {
  props.token.value = token.accessToken;
  props.username.value = token.username;
  // emit('user-logged-in', token);
}



</script>

<template>
  <div class="app-area">
    <chat-area-app v-if="props.token.value !== '' "
                   :token="props.token.value"
    />

    <IdentifyApp v-else
                 v-on:user-logged-in="userLoggedIn"
        :title="'Log In'"
    />

  </div>

</template>

<style scoped>


.app-area {

}
</style>