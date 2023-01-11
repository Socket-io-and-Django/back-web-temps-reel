
<script setup>
import ConsultantApp from "@/components/Consultant-app.vue";
import {defineEmits, defineProps} from "vue";
const props = defineProps({
  consultants: Array
})
const emit = defineEmits(['ask-to-chat']);

</script>

<template>
  <div class="consultants-list">
    <div>Available Consultant</div>
      <div
          v-for="consultant in props.consultants" v-bind:key="consultant.id">

          <ConsultantApp
              v-bind:consultant="consultant"
              v-on:ask-to-chat="emit('ask-to-chat', consultant.id)"
          />
      </div>

  </div>
</template>

<style scoped>
.consultants-list{
  display: flex;
  flex-direction: column;
}
</style>