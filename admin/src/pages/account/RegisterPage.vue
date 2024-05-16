<template>
  <a-form :model="formState" 
          name="basic" 
          autocomplete="off" 
          @finish="onFinish" 
          @finishFailed="onFinishFailed"
          class="login-form">
    <h2 class="text-secondary text-center mb-4">Register</h2>
    <a-form-item label="Username"
                 name="username" 
                 :rules="[{ 
                  required: true, 
                  message: 'Please input your username!' }]">
      <a-input v-model:value="formState.username" />
    </a-form-item>
    <a-form-item label="Password" 
                 name="password" 
                 :rules="[{ 
                  required: true, 
                  message: 'Please input your password!'
                }]">
      <a-input-password v-model:value="formState.password" />
    </a-form-item>
    <a-form-item  label="Confirm password" 
                  name="confirmPassword" 
                  :rules="[{ validator: validatePass}]">
      <a-input-password v-model:value="formState.confirmPassword" />
    </a-form-item>
    <a-form-item class="action">
      <a-button type="primary" html-type="submit">Submit</a-button>
      <router-link to="login">
        <a-button type="default" html-type="submit">Login</a-button>
      </router-link>
    </a-form-item>
  </a-form>
</template>
<script setup>
import { reactive } from 'vue';
import { useAuthStore } from '@/stores/auth';
const auth = useAuthStore();

const formState = reactive({
  username: '',
  password: '',
  confirmPassword: '',
});

let validatePass = async (rule, value) => {
  if (value === '') {
    return Promise.reject('Please input the password again');
  } else if (value !== formState.password) {
    return Promise.reject("Two inputs don't match!");
  } else {
    return Promise.resolve();
  }
};

const register = () => {
  auth.register(formState, () => {
    // call success
  })
}

const onFinish = values => {
  console.log('Success:', values);
  register();
};

const onFinishFailed = errorInfo => {
  console.log('Failed:', errorInfo);
};
</script>
<style lang="scss">
.login-form {
  padding: 20px;
  border-radius: 12px;
  background-color: #F2F4F5;
  .ant-form-item-label {
    min-width: 130px;
    text-align: left;
  }
}

.action {
  button {
    margin-right: 10px;
  }
}
</style>