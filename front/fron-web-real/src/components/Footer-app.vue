<script setup>
import {computed} from "vue";
import { useRoute } from 'vue-router';
const route = useRoute();


const homePage = computed(() => {
  if(route.path === '/') {
    return true;
  }
  else {
    return false;
  }
})
</script>

<template>
  <footer>
    <p>Copyright &copy;</p>
    <router-link
        v-if="homePage"
        to="/about">About</router-link>
  </footer>
</template>


<style scoped>
a {
  color: #333333;
}
footer {
  margin-top: 30px;
  text-align: center;
}
</style>