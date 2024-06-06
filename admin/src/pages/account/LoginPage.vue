<template>
  <a-form
    :model="formState"
    name="basic"
    autocomplete="off"
    @finish="onFinish"
    @finishFailed="onFinishFailed"
    class="login-form"
  >
    <h2 class="text-secondary text-center mb-4">Login</h2>
    <a-form-item
      label="Username"
      name="username"
      :rules="[{ required: true, message: 'Please input your username!' }]"
    >
      <a-input v-model:value="formState.username" />
    </a-form-item>

    <a-form-item
      label="Password"
      name="password"
      :rules="[{ required: true, message: 'Please input your password!' }]"
    >
      <a-input-password v-model:value="formState.password" />
    </a-form-item>
    <a-form-item class="action d-flex justify-content-center">
      <a-button type="primary" html-type="submit" size="large">Login</a-button>
      <!-- <router-link to="register">
        <a-button type="default" html-type="submit" size="large">Register</a-button>
      </router-link> -->
    </a-form-item>
  </a-form>
</template>
<script setup>
import { reactive } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';

const router = useRouter()

const formState = reactive({
  username: '',
  password: '',
});
const auth = useAuthStore();
  const login = () => {
    auth.login({
      phoneNumber: formState.username,
      password: formState.password
    })
  }
  
const onFinish = values => {
  console.log('Success:', values);
  login();
};

const onFinishFailed = errorInfo => {
  console.log('Failed:', errorInfo);
};

</script>
<style lang="scss">
  .login-form {
    padding: 20px;
    border-radius: 12px;
    background-color:#F2F4F5;
  }
  .action {
    button {
      margin-right: 10px;
    }
  }
</style>