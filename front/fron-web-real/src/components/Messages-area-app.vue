
<script setup>
import MessageApp from "@/components/Message-app.vue";
import {defineProps} from "vue";
const props = defineProps({
  messages: Array
})
// const messagesList = document.querySelector('.messages-list');
// function scrollDown(){
//   messagesList.scrollTop = messagesList.scrollHeight;
// }
// onUpdated(scrollDown);

</script>

<template>
  <div
      class="messages-list">
    <div v-for="message in props.messages" v-bind:key="message.id" >
      <MessageApp
          v-bind:message="message" />
    </div>
  </div>
</template>

<style scoped>

.messages-list {
  display: flex;
  flex-direction: column;
  padding: 30px;
  max-height: 500px;
  overflow-y: scroll;
}

</style>