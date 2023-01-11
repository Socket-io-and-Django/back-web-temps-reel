
<script setup>
import ClientApp from "@/components/Client-app.vue";
import {defineEmits, defineProps} from "vue";
const props = defineProps({
  clients: Array
})
const emit = defineEmits(['accept-to-chat']);

</script>

<template>
  <div class="waiting-list">
    <div>Your Waiting List</div>
    <div v-for="client in props.clients" v-bind:key="client.id">
        <client-app
            v-bind:client="client"
            v-on:accept-to-chat="emit('accept-to-chat', client.id)"
        />
    </div>

  </div>
</template>

<style scoped>
.waiting-list{
  display: flex;
  flex-direction: column;
}
</style>