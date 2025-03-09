<script setup lang="ts">
import QuestionEditor from '../../components/admin/questions/QuestionEditor.vue';
</script>

<template>
  <div>
    <QuestionEditor :isEditMode="false" />
  </div>
</template>

<style scoped>
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>