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
        <input type="submit" value="Send Message" class="btn btn-block" />
        <input type="text" name="text" v-model="text" placeholder="Message" />
      </div>
    </form>
  </div>
</template>

<style scoped>
.message-control{
  display: flex;
  flex-direction: row;
}
/**, *::before, *::after {*/
/*  border: 0.5vmin solid #333333;*/
/*}*/
</style>