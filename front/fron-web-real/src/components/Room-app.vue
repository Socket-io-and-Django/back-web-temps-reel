<script setup>

import {defineEmits, defineProps, ref} from "vue";
import ButtonApp from "@/components/Button-app.vue";

const emit = defineEmits(['join-room', 'modify-room']);

const props = defineProps({
  room: Object,
  isConsultant: Boolean
})

const roomName = ref("");
const roomCapacity = ref(0);
function joinRoom()
{
  emit('join-room', props.room._id);
}
function modifyRoom()
{
  emit('join-room', props.room._id);
}

function onSubmit(){

  console.log('onSubmit modify', props.room._id, roomName.value, roomCapacity.value);
  emit('modify-room', props.room._id, roomName.value, roomCapacity.value);
}

</script>

<template>
  <div>
    <h4>
      {{props.room.roomName}}
    </h4>
  </div>
  <button-app
      :text="'Join Room'"
      v-on:btn-click="joinRoom"
  />
  <div v-if="props.isConsultant" >
    <button-app
        :text="'Modify Room'"
        v-on:btn-click="modifyRoom"
    />
    <form v-on:submit="onSubmit" class="new-room">
      <div class="room-name-modify-control">
        <input class="input" type="text" name="room" v-model="roomName" placeholder="New Room Name" />
      </div>
      <div class="room-capacity-modify-control">
        <input class="input" type="number" name="room" v-model="roomCapacity" placeholder="New Room Capacity" />
      </div>
    </form>
  </div>
</template>

<style scoped>

</style>