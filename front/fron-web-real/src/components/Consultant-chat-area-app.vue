<script setup>
import ButtonApp from "@/components/Button-app.vue";
import {defineProps, onMounted, ref} from "vue";
import SendMessageApp from "@/components/Send-message-app.vue";
import MessagesAreaApp from "@/components/Messages-area-app.vue";
import ClientsAreaApp from "@/components/Clients-area-app.vue";
import RoomAreaApp from "@/components/Room-area-app.vue";

const props = defineProps({
  connected: Boolean,
  token: String,
  username: String,
  userRoles: Array,
  socket: Object
});

onMounted(() => {
  chating();
});
const messages = ref([]);
const waitingList = ref([]);
const roomsList = ref([]);
const busy = ref(false);

function sendMessage(message) {
  props.socket.emit('chatMessage', message.text);
}

function acceptToChat(id) {
  props.socket.emit('acceptToChat', id);
  busy.value = true;
  messages.value.splice(1, messages.value.length -1);
}

function refuseToChat(id) {
  props.socket.emit('refuseToChat', id);
  busy.value = false;
}

function leaveChat(){
  props.socket.emit('leaveChat');
  busy.value = false;
  messages.value.splice(1, messages.value.length -1);
}

function availability(){
    props.socket.emit('availability', busy.value);
    busy.value = !busy.value;
}
function joinRoom(room_id){
  props.socket.emit('joinRoom', room_id);
}
function modifyRoom( roomId, newRoomName, newRoomCapacity){
  console.log("modifyRoom")
  props.socket.emit('modifyRoom', roomId, newRoomName, newRoomCapacity);

}
function createNewRoom(newRoomName){
  props.socket.emit('createRoom', newRoomName);
}
function chating() {

  // isAvailable
  props.socket.on('isAvailable', (isAvailable) => {
    busy.value = !isAvailable;
    console.log('isAvailable: ', busy.value)
  });

  // message from server
  props.socket.on('messages',  (messagesList) => {
    messages.value =  messagesList;
    // const m = await messagesList[0];
    // console.log("message t: ", typeof (m.creationDatetime))
  });
  props.socket.on('waitingList', (clientsWaitingList) => {
    if(clientsWaitingList) {
      waitingList.value = clientsWaitingList
      // console.log('waitingList client: ', waitingList.value)
    }
  })
  props.socket.on('roomsList', (rooms) => {
    if(rooms) {
      roomsList.value = rooms;
    }
  })

}
</script>

<template>
    <div class="available-btn">
      <div v-if="busy">
        <ButtonApp
            :text="'Available'"
            :color="'green'"
            @btn-click="availability"
        />
      </div>
      <div v-else>
        <ButtonApp
            :text="'Not Available'"
            :color="'red'"
            @btn-click="availability"
        />
      </div>
    </div>
  <div class="console">

    <div class="chat" >
      <div>
        <SendMessageApp
            v-on:send-new-message="sendMessage"
        />
        <MessagesAreaApp
            v-bind:messages="messages"
        />
      </div>
      <ButtonApp
            v-if="busy"
            :text="'Leave Chat'"
            :color="'red'"
            @btn-click="leaveChat"
      />
    </div>
    <div class="waiting-list">
      <ClientsAreaApp
          v-show="waitingList.length !== 0 "
          v-bind:clients="waitingList"
          v-on:accept-to-chat="acceptToChat"
          v-on:refuse-to-chat="refuseToChat"
      />
    </div>
    <div class="room-area-app">
        <RoomAreaApp
            v-bind:rooms="roomsList"
            v-bind:is-consultant="true"
            v-on:create-new-room="createNewRoom"
            v-on:join-room="joinRoom"
            v-on:modify-room="modifyRoom"
        />
    </div>
  </div>

</template>

<style scoped>

*, *::before, *::after {
  box-sizing: border-box;
  font-family: Arial, Helvetica, sans-serif;
}

.chat-area-app {
  /*border: 0.5vmin solid red;*/

  display: grid;
  /*flex-direction: column;*/
  height: 70vmin;
}
.chat {
  /*border: 0.5vmin solid green;*/

  display: grid;
  grid-template-columns:  5fr 1fr;
  height: 60vmin;
}
.console {
  /*border: 0.5vmin solid green;*/

  display: grid;
  grid-template-columns:  auto auto 1fr 1fr;
  height: 60vmin;
}
.chat-area:first-child {
  margin-right: auto;
}
.chat-area:last-child {
  margin-left: auto;
}

.chat-control label {
  display: block;
}



/*.chat-area {*/
/*  display: flex;*/
/*  align-items: center;*/
/*  justify-content: space-between;*/
/*}*/

/*.chat-area label {*/
/*  flex: 1;*/
/*}*/

/*.chat-area input {*/
/*  flex: 2;*/
/*  height: 20px;*/
/*}*/
</style>
