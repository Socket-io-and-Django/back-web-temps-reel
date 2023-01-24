<script setup>
import { defineProps, defineEmits } from "vue";
import IdentifyApp from "@/components/Identify-app.vue";
import ChatAreaApp from "@/components/Chat-area-app.vue";

const props = defineProps(
    {
  token: Object,
  username: Object
    });
const emit = defineEmits(['user-logged-in']);
function userLoggedIn(token) {
  // eslint-disable-next-line vue/no-mutating-props
  props.token.value = token.accessToken;
  // eslint-disable-next-line vue/no-mutating-props
  props.username.value = token.username;
  emit('user-logged-in', token);
}



</script>

<template>
  <div class="app-area">
    <ChatAreaApp v-if="props.token.value !== '' "
                   :token="props.token.value"
                   :username="props.username.value"
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