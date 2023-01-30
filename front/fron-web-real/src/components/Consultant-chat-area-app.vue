<script setup>
import ButtonApp from "@/components/Button-app.vue";
import {defineProps, onMounted, ref} from "vue";
import SendMessageApp from "@/components/Send-message-app.vue";
import MessagesAreaApp from "@/components/Messages-area-app.vue";
import ClientsAreaApp from "@/components/Clients-area-app.vue";

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
    // console.log("avail: ", busy.value)
    props.socket.emit('availability', busy.value);
    busy.value = !busy.value;
}


function chating() {

  // isAvailable
  props.socket.on('isAvailable', (isAvailable) => {
    busy.value = !isAvailable;
    console.log('isAvailable: ', busy.value)
  });

  // message from server
  props.socket.on('message', async (messagesList) => {
    messages.value = await messagesList.reverse();
    // const m = await messagesList[0];
    // console.log("message t: ", typeof (m.creationDatetime))
  });
  props.socket.on('waitingList', (clientsWaitingList) => {
      if(clientsWaitingList) {
        waitingList.value = clientsWaitingList
          // console.log('waitingList client: ', waitingList.value)
        }
  })

}
</script>

<template>
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
    <div class="chat" >
        <div>
          <SendMessageApp
              v-on:send-new-message="sendMessage"
              v-bind:messagesNumber="messages.length"
          />
          <MessagesAreaApp
              v-bind:messages="messages" />

        </div>
      <div class="chat-area-app">
          <ClientsAreaApp
              v-show="waitingList.length !== 0 "
              v-bind:clients="waitingList"
              v-on:accept-to-chat="acceptToChat"
              v-on:refuse-to-chat="refuseToChat"
          />

      </div>

        <ButtonApp
            v-if="busy"
            :text="'Leave Chat'"
            :color="'red'"
            @btn-click="leaveChat"
        />
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
  grid-template-columns: 5fr 3fr 1fr;
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
