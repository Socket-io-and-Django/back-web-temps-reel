<script setup>

import { defineProps, defineEmits } from "vue";

const emit = defineEmits(['btn-click']);

function onClick() {
  emit('btn-click');

}
const props = defineProps({
  text: String,
  color: String
})

</script>

<template>
  <div>
    <button v-on:click="onClick" class="btn" v-bind:style="{background: props.color }">{{props.text}}</button>
  </div>
</template>

<style scoped>

</style>