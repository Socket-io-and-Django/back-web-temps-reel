<script setup>
// @ is an alias to /src
// import RegisterForm from "@/components/Register-form-app.vue";
// import LogInApp from "@/components/LogIn-app.vue";
import ButtonApp from "@/components/Button-app.vue";
import {defineProps, ref} from "vue";
import  { io } from "socket.io-client";
import SendMessageApp from "@/components/Send-message-app.vue";
import MessagesAreaApp from "@/components/Messages-area-app.vue";
import ConsultantsAreaApp from "@/components/Consultants-area-app.vue";
import ClientsAreaApp from "@/components/Clients-area-app.vue";
import ChatBot from "@/components/ChatBot.vue";


const messages = ref([]);
const connected = ref(false);
const askToJoin = ref(false);
// const registered = ref(true);
const availableConsultants = ref([]);
const waitingList = ref([]);
const userRoles = [];
const props = defineProps({
  token: String,
});
const busy = ref(false);
const chatBot = ref(false);

function startEndChatBot() {
  chatBot.value = !chatBot.value;
}
function sendMessage(message) {
  socket.value.emit('chatMessage', message.text);
}
function askToChat(id) {
  socket.value.emit('askToChat', id);
  askToJoin.value=true;
  busy.value = true;
  messages.value.splice(1, messages.value.length -1);
}


function acceptToChat(id) {
  socket.value.emit('acceptToChat', id);
  busy.value = true;
  messages.value.splice(1, messages.value.length -1);

}
function leaveChat(){
  socket.value.emit('leaveChat');
  busy.value = false;
  askToJoin.value=false;
  messages.value.splice(1, messages.value.length -1);
}
const socket = ref({});
function connectToSocket(token) {

  socket.value = io("ws://localhost:3000", {
    auth: {
      token: token
    }
  });

  socket.value.on("connect_error",(er) => {
    console.error("Oops! Authentication failed:", er.message, " , ", er.cause)
  })
  socket.value.on("connect", () => {
    connected.value = true;
  })
  socket.value.on("roles", (roles) => {
    if(roles.length !== 0){
      roles.forEach(role => {
        userRoles.push(role);
      })
    }
    console.log("roles: ", userRoles)
  })
  socket.value.on('availableConsultants', (available) => {
    // console.log("availableConsultants  :", available)
    availableConsultants.value = available
    // console.log("availableConsultants", availableConsultants.value)
  })
  // message from server
  socket.value.on('message', (message) => {
    messages.value.push(message);
  })

  socket.value.on('waitingList', (clientsWaitingList) => {

      if(clientsWaitingList) {
        waitingList.value = clientsWaitingList
          // console.log('waitingList client: ', waitingList.value)

    }
  })
}
</script>

<template>
  <div class="chat-area-app">
      <ButtonApp
          v-if="!connected"
          v-on:btn-click="connectToSocket(props.token)"
          v-bind:text="'Chat'"
          v-bind:color="'gray'"
      />
    <div class="chat-area" v-else>
      <div class="chat" v-if="!chatBot">
        <div>
          <MessagesAreaApp
              v-bind:messages="messages" />
          <SendMessageApp
              v-on:send-new-message="sendMessage"
              v-bind:messagesNumber="messages.length"
          />

        </div>
          <ConsultantsAreaApp
              v-if="!askToJoin && !userRoles.includes(4242)"
              v-show="availableConsultants.length !== 0"
              v-bind:consultants="availableConsultants"
              v-on:ask-to-chat="askToChat"
          />
          <ClientsAreaApp
              v-if="userRoles.includes(4242)"
              v-show="waitingList.length !== 0 "
              v-bind:clients="waitingList"
              v-on:accept-to-chat="acceptToChat"
          />
        <ButtonApp
            v-if="!userRoles.includes(4242) && !busy"
            :text="'Chat Bot'"
            :color="'blue'"
            @btn-click="startEndChatBot"
        />
        <ButtonApp
            v-if="busy"
            :text="'Leave Chat'"
            :color="'red'"
            @btn-click="leaveChat"
        />
      </div>

      <div class="chat-bot-area" v-else>
        <chat-bot
            :socket="socket"
            :token="props.token"
            @close-chat-bot="startEndChatBot"
        />
      </div>
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
