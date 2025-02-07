<template>
  <template v-for="(item, index) in menuMap" :key="index">
    <el-sub-menu v-if="item.children" :index="cusKey + '-' + index">
      <template #title>
        <i v-if="item.icon" class="iconfont" :class="item.icon"></i>
        <span>
          {{ t('sider.' + item.name) }}
          <!-- {{ uiText[item.path.replace(/\//g, '')]?.text || item.path.replace(/\//g, '') }} -->
        </span>
      </template>
      <CreateMenu
        v-bind:menuMap="item.children"
        v-bind:cusKey="cusKey + '-' + index"
        @itemClick="itemClick"
        :parent="parent + item.path + '/'"
      ></CreateMenu>
    </el-sub-menu>
    <el-menu-item v-else :index="parent + item.path" @click="itemClick">
      <template #title>
        <router-link :to="parent + item.path">
          <i v-if="item.icon" class="iconfont" :class="item.icon"></i>
          {{ t('sider.' + item.name) }}
          <!-- {{ t(item.name) }} -->
        </router-link>
      </template>
    </el-menu-item>
  </template>
</template>
<script lang="ts" setup>
import type { MessageSchema } from '@/types/schema';
import { useI18n } from 'vue-i18n';
const { t } = useI18n<{ mesasge: MessageSchema }>();
const props = withDefaults(
  defineProps<{ parent?: string; menuMap: Array<any>; cusKey: string }>(),
  {
    parent: '',
    cusKey: '',
    itemClick: () => {}
  }
);
const emits = defineEmits(['itemClick']);
function itemClick() {
  emits('itemClick');
}
</script>
