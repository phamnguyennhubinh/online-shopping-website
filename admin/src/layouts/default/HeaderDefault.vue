<template>
  <a-layout-header style="background: #fff; padding: 0 30px; text-align: right">
    <div>
      <SearchOutlined style="color: #1677ff" class="ml-15 cursor-pointer" />
      <SettingTwoTone class="ml-15 cursor-pointer" />
      <a-dropdown>
        <a-avatar class="ml-15 cursor-pointer" style="background-color: #87d068">
          <template #icon>
            <UserOutlined />
          </template>
        </a-avatar>
        <template #overlay>
          <a-menu>
            <a-menu-item>
              <a href="javascript:;" @click="authStore.logout()">Logout</a>
            </a-menu-item>
          </a-menu>
        </template>
      </a-dropdown>
    </div>
    <!-- <a-typography-text role="button" strong @click="authStore.logout()">Logout</a-typography-text> -->
  </a-layout-header>
</template>
<script setup>
import { SearchOutlined, SettingTwoTone, UserOutlined } from '@ant-design/icons-vue'
import { useAuthStore } from '@/stores/auth';
const authStore = useAuthStore();
</script>
<style lang="scss" scoped>
.ml-15 {
  margin-left: 15px;
  cursor: pointer;
}
.cursor-pointer {
  cursor: pointer;
}
</style>