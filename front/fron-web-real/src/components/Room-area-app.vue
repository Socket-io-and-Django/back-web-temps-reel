<script setup>
import CreateRoomApp from "@/components/Create-room-app.vue";

import {defineEmits, defineProps} from "vue";
import RoomApp from "@/components/Room-app.vue";
const emit = defineEmits(['create-new-room', 'join-room', 'modify-room']);

const props = defineProps({
  rooms: Array,
  isConsultant: Boolean
})
function createNewRoom(newRoomName)
{
  emit('create-new-room', newRoomName);
}
function joinRoom(newRoomId)
{
  console.log('newRoomId room area', newRoomId);
  emit('join-room', newRoomId);
}

function modifyRoom(roomId, newRoomName, newRoomCapacity){
  console.log('modify room area', roomId, newRoomName, newRoomCapacity);

  emit('modify-room', roomId, newRoomName, newRoomCapacity);
}

</script>

<template>
  <div>
    <label>Rooms</label>
    <CreateRoomApp
        v-on:create-new-room="createNewRoom"
    />
  </div>
  <div>
    <div v-for="room in props.rooms" v-bind:key="room.id">
      <RoomApp
          v-bind:room="room"
          v-bind:is-consultant="props.isConsultant"
          v-on:join-room="joinRoom"
          v-on:modify-room="modifyRoom"
        />
    </div>
  </div>

</template>

<style scoped>

</style>