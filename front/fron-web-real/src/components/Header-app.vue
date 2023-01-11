<script setup>
import {defineProps} from "vue";
const props = defineProps({
  username: String
})

//
// const homePage = computed(() => {
//   if(route.path === '/') {
//     return true;
//   }
//   else {
//     return false;
//   }
// })
</script>

<template>
  <header>
    <h2>Welcome {{props.username}}</h2>
  </header>
</template>


<style scoped>
header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5vmin;
}
</style>