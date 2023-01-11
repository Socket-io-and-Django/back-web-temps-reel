<script setup>

import {defineEmits, defineProps} from "vue";
import ButtonApp from "@/components/Button-app.vue";

const emit = defineEmits(['ask-to-chat']);

const props = defineProps({
  consultant: Object
})
</script>

<template>
    <h3>
      {{props.consultant.username}}
    </h3>
  <button-app
      :text="'ask to joint'"
      v-on:btn-click="emit('ask-to-chat', props.consultant.id)"
  />
</template>

<style scoped>

</style>