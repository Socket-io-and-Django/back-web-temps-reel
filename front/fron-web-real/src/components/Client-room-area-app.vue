<script setup>

import {defineEmits, defineProps} from "vue";
import RoomApp from "@/components/Room-app.vue";
const emit = defineEmits(['join-room']);

const props = defineProps({
  rooms: Array
})

function joinRoom(newRoomId)
{
  console.log('newRoomId client room area', newRoomId);

  emit('join-room', newRoomId);
}

</script>

<template>
  <div>
    <div v-for="room in props.rooms" v-bind:key="room.id">
      <RoomApp
          v-bind:is-consultant="false"
          v-bind:room="room"
          v-on:join-room="joinRoom"
        />
    </div>
  </div>

</template>

<style scoped>

</style>