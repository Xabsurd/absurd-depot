<script setup lang="ts">
import type { MessageSchema } from '@/types/schema';
import { useI18n } from 'vue-i18n';
const { t } = useI18n<{ message: MessageSchema }>();
</script>

<template>
  <div class="loading">
    <div class="spinner"></div>
    <p>{{ t('status.loading') }}</p>
  </div>
</template>

<style scoped lang="scss">
.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  --size: 50px;
  background-color: var(--content-bg-color);
}

.spinner {
  width: var(--size);
  height: var(--size);
  border: 7px solid var(--header-bg-color);
  border-top-color: var(--header-text-color);
  border-radius: 50%;
  animation: spin 1s infinite linear;
  margin-bottom: 15px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
