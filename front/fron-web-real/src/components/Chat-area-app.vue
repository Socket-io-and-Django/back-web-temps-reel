<script setup>
import ButtonApp from "@/components/Button-app.vue";
import {defineProps, ref} from "vue";
import  { io } from "socket.io-client";
import ClientChatAreaApp from "@/components/Client-chat-area-app.vue";
import ConsultantChatAreaApp from "@/components/Consultant-chat-area-app.vue";

const props = defineProps({
  username: String,
  token: String,
});


const connected = ref(false);
const isConsultant = ref(false);
const userRoles = [];

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
    if(roles.length !== 0 ){
      roles.forEach(role => {
        userRoles.push(role);
        if(role === 4242){
          console.log("con")
          isConsultant.value = true
        }
      })
    }
    console.log("userRoles: ", userRoles)
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
      <ConsultantChatAreaApp v-if="isConsultant === true"
                             :userRoles="userRoles"
                             :token="props.token"
                             :connected="connected"
                             :socket="socket"
                             :username="props.username"
                             />

      <ClientChatAreaApp v-else
          :userRoles="userRoles"
          :token="props.token"
          :connected="connected"
          :socket="socket"
          :username="props.username"
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
