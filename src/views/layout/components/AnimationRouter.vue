<script setup lang="ts">
import { getTransitionType } from '../methods/layout';
</script>
<template>
  <router-view v-slot="{ Component, route }">
    <transition
      :name="(route.meta?.transition as string) || 'slide'"
      :mode="getTransitionType(route.meta.transition as string)"
    >
      <component :is="Component" />
    </transition>
  </router-view>
</template>
