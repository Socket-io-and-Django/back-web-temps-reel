<script setup>
// import {defineProps} from "vue";

import {defineEmits, ref} from "vue";

const text = ref('');
const emit = defineEmits(['send-new-message']);
// const props = defineProps({
//   messageNumber: Number,
// })
function onSubmit(e) {
  e.preventDefault();
  if(!text.value) {
    alert('Please add message')
    return
  }
  const newMessage = {
    text: text.value
  }
  emit('send-new-message', newMessage);
  text.value = '';
}
</script>

<template>
  <div>
    <form v-on:submit="onSubmit" class="send-message">
      <div class="message-control">
        <label>Message</label>
        <input type="text" name="text" v-model="text" placeholder="Message" />
      </div>
      <input type="submit" value="Send Message" class="btn btn-block" />
    </form>
  </div>
</template>

<style scoped>
/**, *::before, *::after {*/
/*  border: 0.5vmin solid #333333;*/
/*}*/
</style>