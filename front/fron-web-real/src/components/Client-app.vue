<script setup>

import {defineEmits, defineProps} from "vue";
import ButtonApp from "@/components/Button-app.vue";

const emit = defineEmits(['accept-to-chat', 'refuse-to-chat']);

const props = defineProps({
  client: Object
})
</script>

<template>
  <div>
    <h4>
      {{props.client.username}}
    </h4>
  </div>
  <button-app
      :text="'accept Chat'"
      v-on:btn-click="emit('accept-to-chat', props.client.id)"
  />
  <button-app
      :text="'refuse Chat'"
      v-on:btn-click="emit('refuse-to-chat', props.client.id)"
  />
</template>

<style scoped>

</style>