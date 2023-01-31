<script setup>
// import {defineProps} from "vue";

import {defineEmits, ref} from "vue";

const roomName = ref('');
const emit = defineEmits(['create-new-room']);
function onSubmit(e) {
  e.preventDefault();
  if(!roomName.value) {
    alert('Please add new room name')
    return
  }

  emit('create-new-room', roomName.value);
  roomName.value = '';
}
</script>

<template>
  <div>
    <form v-on:submit="onSubmit" class="new-room">
      <div class="room-control">
        <input type="submit" value="Create Room" class="btn btn-block " />
        <input class="input" type="text" name="room" v-model="roomName" placeholder="New Room Name" />
      </div>
    </form>
  </div>
</template>

<style scoped>
.new-room{
  display: flex;
  flex-direction: row;
}
.btn{
  margin: 0;
  padding: 0;
}
.room-control{
  margin: 0;
  padding: 0;
}
/**, *::before, *::after {*/
/*  border: 0.5vmin solid #333333;*/
/*}*/
</style>