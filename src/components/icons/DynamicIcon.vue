<template>
  <i><Icon :icon="dynamicIcon" /></i>
</template>
<script setup lang="ts">
import { addIcon } from '@iconify/vue';
import { Icon } from '@iconify/vue';
import { ref, watch } from 'vue';
const props = defineProps<{ icon: string }>();
const dynamicIcon = ref('mdi-account');
watch(
  () => props.icon,
  async () => {
    dynamicIcon.value = await loadIcon(props.icon);
  }
);
(async () => {
  dynamicIcon.value = await loadIcon(props.icon);
})();
async function loadIcon(iconName: string) {
  const [collection, name] = iconName.split(':');
  try {
    switch (collection) {
      case 'mingcute':
        const path = import.meta.env.VITE_APP_PACKAGE_PATH + `/@iconify-icons/mingcute/${name}.js`;
        const icon = await import(/* @vite-ignore */ new URL(path, import.meta.url).href);
        addIcon(iconName, icon.default);
        return iconName;
      default:
        throw new Error('Icon not found');
    }
  } catch (error: unknown) {
    console.log((error as Error).message);
    const errorIcon = await import('@iconify-icons/mingcute/alert-line.js');
    addIcon('mingcute:alert-line', errorIcon.default);
    return 'mingcute:alert-line';
  }
}
</script>
<style lang="scss" scoped>
.icon {
}
</style>
