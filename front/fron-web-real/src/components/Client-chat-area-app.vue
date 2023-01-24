<script setup>
import ButtonApp from "@/components/Button-app.vue";
import {defineProps, onMounted, ref} from "vue";
import SendMessageApp from "@/components/Send-message-app.vue";
import MessagesAreaApp from "@/components/Messages-area-app.vue";
import ChatBot from "@/components/ChatBot.vue";
import ConsultantsAreaApp from "@/components/Consultants-area-app.vue";

const messages = ref([]);
const askToJoin = ref(false);
const availableConsultants = ref([]);
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

const busy = ref(false);
const chatBot = ref(false);
function startEndChatBot() {
  chatBot.value = !chatBot.value;
}
function sendMessage(message) {
  props.socket.emit('chatMessage', message.text);
}
function askToChat(id) {
  props.socket.emit('askToChat', id);
  askToJoin.value=true;
  busy.value = true;
  messages.value.splice(1, messages.value.length -1);
}
function leaveChat(){
  props.socket.emit('leaveChat');
  busy.value = false;
  askToJoin.value=false;
  messages.value.splice(1, messages.value.length -1);
}
function chating() {
  props.socket.on('availableConsultants', (available) => {
    // console.log("availableConsultants  :", available)
    availableConsultants.value = available
    // console.log("availableConsultants", availableConsultants.value)
  })
  // message from server
  props.socket.on('message', (message) => {
    messages.value.push(message);
  })
  props.socket.on('refuseToChat', (message) => {
    console.log("in refuse")
    busy.value = false;
    askToJoin.value=false;
    messages.value.push(message);
  })
}
</script>

<template>
    <div class="chat-area" >
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
              v-if="!askToJoin "
              v-show="availableConsultants.length !== 0"
              v-bind:consultants="availableConsultants"
              v-on:ask-to-chat="askToChat"
          />
        <ButtonApp
            v-if="!busy"
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
        <ChatBot
            :socket="props.socket"
            :token="props.token"
            @close-chat-bot="startEndChatBot"
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
