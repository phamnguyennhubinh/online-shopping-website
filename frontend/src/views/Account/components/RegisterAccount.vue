<template>
  <section class="container shadow">
    <a-breadcrumb class="bread_crumb">
      <a-breadcrumb-item>Home</a-breadcrumb-item>
      <a-breadcrumb-item
        ><a href="http://localhost:8080/login">Login</a></a-breadcrumb-item
      >
      <a-breadcrumb-item
        ><a href="http://localhost:8080/register"
          >Register</a
        ></a-breadcrumb-item
      >
    </a-breadcrumb>
    <h2 class="text-align-center">REGISTER ACCOUNT</h2>
    <a-form
      ref="formRef"
      :model="formState"
      name="basic"
      :label-col="{ span: 8 }"
      :wrapper-col="{ span: 8 }"
      autocomplete="off"
      @finish="onFinish"
      @finishFailed="onFinishFailed"
    >
      <a-form-item
        label="Name:"
        name="fullName"
        :rules="[
          { required: true, message: 'Please input your fullName!' },
          {
            pattern: /^[A-Za-zÀ-ỹ\s]*[A-Za-zÀ-ỹ][A-Za-zÀ-ỹ\s]*$/,
            message: 'Please enter a valid name with only letters and spaces',
            trigger: ['blur', 'change'],
          },
        ]"
      >
        <a-input v-model:value="formState.fullName" class="border-none" />
      </a-form-item>

      <a-form-item
        label="Email:"
        name="email"
        :rules="[
          { required: true, message: 'Please input your email!' },
          {
            type: 'email',
            message: 'Please enter a valid email address',
            trigger: ['blur', 'change'],
          },
        ]"
      >
        <a-input v-model:value="formState.email" class="border-none" />
      </a-form-item>

      <a-form-item
        label="phone number:"
        name="phoneNumber"
        :rules="[
          { required: true, message: 'Please input your phone number!' },
          {
            pattern: /^(0[2-9][0-9]{8}|[2-9][0-9]{8})$/,
            message: 'Please enter a valid phone number',
            trigger: ['blur', 'change'],
          },
        ]"
      >
        <a-input v-model:value="formState.phoneNumber" class="border-none" />
      </a-form-item>

      <a-form-item
        label="Birthday:"
        name="birthday"
        :rules="[
          { required: true, message: 'Please input your birthday!' },
          {
            validator: validateBirthday,
            message:
              'Please enter a valid birthday in the format dd/mm/yyyy and not in the future',
            trigger: ['blur', 'change'],
          },
        ]"
      >
        <a-date-picker
          v-model:value="formState.birthday"
          format="DD/MM/YYYY"
          class="border-none"
        />
      </a-form-item>

      <a-form-item
        label="Password"
        name="password"
        :rules="[
          { required: true, message: 'Please input your password!' },
          { validator: validateStrongPassword, trigger: ['blur', 'change'] },
        ]"
      >
        <a-input-password
          v-model:value="formState.password"
          class="border-none"
        />
      </a-form-item>

      <a-form-item
        has-feedback
        label="Confirm"
        name="checkPass"
        :rules="[
          { required: true, message: 'Please input your password!' },
          { validator: validateCheckPassword, trigger: ['blur', 'change'] },
        ]"
      >
        <a-input
          v-model:value="formState.checkPass"
          type="password"
          autocomplete="off"
          class="border-none"
        />
      </a-form-item>

      <a-form-item :wrapper-col="{ offset: 8, span: 8 }">
        <a-button class="btn-welcome" type="primary" html-type="submit"
          >REGISTER</a-button
        >
      </a-form-item>
      <a-form-item :wrapper-col="{ offset: 8, span: 8 }" class="center">
        <router-link :to="{ name: 'LoginAccount' }">
          <a>LOGIN</a>
        </router-link>
      </a-form-item>
    </a-form>
  </section>
</template>
<script setup>
import { reactive } from "vue";
import { nextTick } from "vue";
import { message } from "ant-design-vue";
import { useRouter } from "vue-router";
import { useCounterStore } from "@/stores";
import { onMounted } from "vue";
// import { v4 as uuidv4 } from 'uuid';

// import {computed} from "vue";
import { ref } from "vue";
// import moment from "moment";
const counterStore = useCounterStore();
// const arrayFormRegister = ref([]);
const router = useRouter();
const formRef = ref(null);
// const arrayNew = ref([]);
onMounted(async () => {
  // await counterStore.fetchListAccounts();
  localStorage.setItem("listAcc", JSON.stringify(counterStore.getListAcc));
});
// const randomId = ref(generateRandomId()); // comma
const formState = reactive({
  fullName: "",
  password: "",
  phoneNumber: "",
  email: "",
  checkPass: "",
  birthday: "",
  remember: true,
});
// const generateRandomId = () => {
//   return Math.random().toString(36).substring(2, 10);
// };
const onFinish = (values) => {
  registerAcc();
  message.success("Đăng ký thành công!");
  router.push({name: "LoginAccount"});
  console.log("Success:", values);
};
const onFinishFailed = (errorInfo) => {
  console.log("Failed:", errorInfo);
};
// Check password
const validateCheckPassword = (_, value) => {
  if (value !== formState.password) {
    return Promise.reject("Passwords do not match.");
  }

  return Promise.resolve();
};

const validateStrongPassword = (_, value) => {
  // Define your criteria for a strong password
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  if (!passwordRegex.test(value)) {
    return Promise.reject(
      "Password must be strong: at least 8 characters, including at least one uppercase letter, one lowercase letter, one number, and one special character."
    );
  }

  return Promise.resolve();
};

// function formatBirthday(birthdayObject) {
//   if (birthdayObject) {
//     const day = birthdayObject.$D;
//     const month = birthdayObject.$M + 1; // Tháng trong Day.js bắt đầu từ 0, nên cần cộng thêm 1
//     const year = birthdayObject.$y;
//     return `${day}/${month}/${year}`;
//   } else {
//     console.log("Ngày sinh không hợp lệ.");
//   }
// }

const validateBirthday = (_, value) => {
  const selectedDate = new Date(value);

  if (isNaN(selectedDate.getTime())) {
    // Invalid date
    return Promise.reject("Invalid date format");
  }

  // Check if the date is not in the future
  const currentDate = new Date();
  if (selectedDate > currentDate) {
    return Promise.reject("Birthday cannot be in the future");
  }

  return Promise.resolve();
};
const registerAcc = async () => {
  await nextTick();
  formRef.value.validate().then( async (valid) => {
    if (valid) {
      const newAccountObject = {
        fullName: formState.fullName,
        phoneNumber: formState.phoneNumber,
        email: formState.email,
        // birthday: formatBirthday(formState.birthday),
        password: formState.password,
      };
      try {
        const result = await counterStore.addAcc(newAccountObject);
        console.log(result);
      } catch (error) {
        console.log("Error?");
      }

    } else {
      console.log("Form is not valid");
    }
  });
};
</script>

<style lang="scss" scoped>
@import "@/style/styles.scss";
.center {
  text-align: center;
}
.border-none {
  border-radius: 0;
  padding: 7px 10px;
}
.shadow {
  box-shadow: 0 0 5px 0 rgba(0, 0, 0, 0.25);
  margin-top: 45px;
}
.text-align-center {
  text-align: center;
  margin-top: 20px;
}
.btn-welcome {
  background-color: #f16179;
  border: 1px solid #f16179;
  font-size: 16px;
  color: $font-color;
  border-radius: 0;
  width: 100%;
  &:hover {
    background-color: #f89cab;
    color: $button;
    border: 1px solid $button;
  }
}
a {
  text-decoration: none;
}
</style>
