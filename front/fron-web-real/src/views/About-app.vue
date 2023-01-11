<script setup>
import {defineProps} from "vue";

const props = defineProps({
  token: Object
})
</script>

<template>
  <div class="about">
    <p>{{props.token}}</p>
    <router-link to="/">Home</router-link>
    <h1>This is an about page</h1>
  </div>
</template>
