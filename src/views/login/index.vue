<!-- <template>
    <van-form ref="formRef" class="flex flex-col items-center" @submit="handleSubmit">
        <van-field class="enter-y items-center mb-25px !rounded-md" v-model="formData.username" name="username"
            placeholder="用户名">
            <template #left-icon>
                <Icon>
                    <UserOutlined />
                </Icon>
            </template>
        </van-field>
        <van-field class="enter-y items-center mb-25px !rounded-md" v-model="formData.password"
            :type="switchPassType ? 'password' : 'text'" name="password" placeholder="密码"
            @click-right-icon="switchPassType = !switchPassType">
            <template #left-icon>
                <Icon>
                    <LockOutlined />
                </Icon>
            </template>
            <template #right-icon>
                <Icon v-if="switchPassType">
                    <EyeInvisibleOutlined />
                </Icon>
                <Icon v-else>
                    <EyeOutlined />
                </Icon>
            </template>
        </van-field>

        <div class="enter-y w-full px-5px flex justify-between mb-100px">
            <div class="flex items-center">
                <van-switch class="mr-8px !text-30px" v-model="rememberMe" />
                <span class="!text-25px">记住我</span>
            </div>
            <a class="!text-25px">忘记密码?</a>
        </div>

        <van-button class="enter-y !rounded-md !mb-25px" type="primary" block native-type="submit" :loading="loading">
            登 录
        </van-button>
        <van-button class="enter-y !mb-25 !rounded-md" plain type="primary" block>
            注 册
        </van-button>
    </van-form>
</template>
  
<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { showLoadingToast, showSuccessToast } from 'vant';
import type { FormInstance } from 'vant';

const router = useRouter();

const formRef = ref<FormInstance>();
const loading = ref(false);
const rememberMe = ref(false);
const switchPassType = ref(true);
const formData = reactive({
    username: 'admin',
    password: '123456',
});


function handleSubmit() {
    formRef.value
        ?.validate()
        .then(async () => {
            try {
                loading.value = true;
                showLoadingToast('登录中...');
                showSuccessToast('登录成功，即将进入系统');
                router.replace('/');
            } finally {
                loading.value = false;
            }
        })
        .catch(() => {
            console.error('验证失败');
        });
}

onMounted(() => { });
</script>
  
<style scoped lang="less"></style>
   -->
<template>
    <div class="login-container">
        <!--引入粒子特效-->
        <!-- <Particles id="tsparticles" :options="options" /> -->
        <div style="height:100vh;">
            <div style="height:35vh;line-height:35vh;text-align:center;">
                <span style="font-size:3.5rem;margin-bottom:15vh;color:#fff;"><b>alex系统管理平台</b></span>
            </div>
            <van-form @submit="onSubmit">
                <van-cell-group inset>
                    <van-field v-model="loginForm.username" name="username" label="用户名" placeholder="用户名"
                        :rules="[{ required: true, message: '请填写用户名' }]" />
                    <van-field v-model="loginForm.password" type="password" name="password" label="密码" placeholder="密码"
                        :rules="[{ required: true, message: '请填写密码' }]" />
                </van-cell-group>
                <div style="margin: 16px;">
                    <van-button round block type="primary" native-type="submit">
                        提交
                    </van-button>
                </div>
            </van-form>
        </div>
    </div>
</template>
<script setup lang="ts">
import { ref, } from 'vue';
import { LoginForm } from './login';
import { LoginParams } from "@/api/user/login";
import { useRouter } from "vue-router";
import { useUserStore } from "@/store/modules/user/user";

const router = useRouter();
const userStore = useUserStore();
const loginForm = ref<LoginForm>({
    username: "",
    password: "",
});

const onSubmit = async (values) => {
    let param: LoginParams = {
        type: "account",
        username: loginForm.value.username,
        password: loginForm.value.password,
        isRememberMe: true,
    };
    const res = await userStore.login(param);
    if (res) {
        router.push("/");
    }
    console.log('submit', values, res);
};
// const onSubmit = () => {
//     formRef.value
//         .validate()
//         .then(async () => {
//             let param: LoginParams = {
//                 type: "account",
//                 username: loginForm.username,
//                 password: loginForm.password,
//                 isRememberMe: true,
//             };
//             const res = await userStore.login(param);
//             if (res) {
//                 router.push("/");
//             }
//         })
//         .catch((error: ValidateErrorEntity<loginForm>) => {
//             console.log("error", error);
//         });
// };

// const options = {
//     background: {
//         color: {
//             value: "#000", //粒子颜色
//         },
//     },
//     fpsLimit: 60,
//     interactivity: {
//         events: {
//             onClick: {
//                 enable: true,
//                 mode: "push", //可用的click模式有: "push", "remove", "repulse", "bubble"。
//             },
//             onHover: {
//                 enable: true,
//                 mode: "grab", //可用的hover模式有: "grab", "repulse", "bubble"。
//             },
//             resize: true,
//         },
//         modes: {
//             bubble: {
//                 distance: 400,
//                 duration: 2,
//                 opacity: 0.8,
//                 size: 40,
//             },
//             push: {
//                 quantity: 4,
//             },
//             repulse: {
//                 distance: 200,
//                 duration: 0.4,
//             },
//         },
//     },
//     particles: {
//         color: {
//             value: "#ffffff",
//         },
//         links: {
//             color: "#ffffff", //'#dedede'。线条颜色。
//             distance: 150, //线条长度
//             enable: true, //是否有线条
//             opacity: 0.5, //线条透明度。
//             width: 1, //线条宽度。
//         },
//         collisions: {
//             enable: false,
//         },
//         move: {
//             direction: "none",
//             enable: true,
//             outMode: "bounce",
//             random: false,
//             speed: 2, //粒子运动速度。
//             straight: false,
//         },
//         number: {
//             density: {
//                 enable: true,
//                 area: 800,
//             },
//             value: 80, //粒子数量。
//         },
//         opacity: {
//             value: 0.5, //粒子透明度。
//         },
//         shape: {
//             type: "circle", //可用的粒子外观类型有："circle","edge","triangle", "polygon","star"
//         },
//         size: {
//             random: true,
//             value: 5,
//         },
//     },
//     detectRetina: true,
// };
</script>
<style rel="stylesheet/scss" lang="scss">
$bg: #2d3a4b;
$light_gray: #eee;

/* reset element-ui css */
.login-container {
    .a-input {
        display: inline-block;
        height: 47px;
        width: 85%;

        input {
            background: transparent;
            border: 0px;
            -webkit-appearance: none;
            border-radius: 0px;
            padding: 12px 5px 12px 15px;
            color: $light_gray;
            height: 47px;

            &:-webkit-autofill {
                -webkit-box-shadow: 0 0 0px 1000px $bg inset !important;
                -webkit-text-fill-color: #fff !important;
            }
        }
    }

    .a-form-item {
        border: 1px solid rgba(255, 255, 255, 0.1);
        background: rgba(0, 0, 0, 0.1);
        border-radius: 5px;
        color: #454545;
    }
}
</style>
  
<style rel="stylesheet/scss" lang="scss" scoped>
$bg: #2d3a4b;
$dark_gray: #889aa4;
$light_gray: #eee;

.login-container {
    position: fixed;
    height: 100%;
    width: 100%;
    background-color: $bg;

    .title {
        font-size: 26px;
        font-weight: 400;
        color: $light_gray;
        margin: 0px auto 40px auto;
        text-align: center;
        font-weight: bold;
    }

    .login-form {
        position: absolute;
        left: 0;
        right: 0;
        width: 520px;
        max-width: 100%;
        padding: 35px 35px 15px 35px;
        margin: 120px auto;
    }

    .tips {
        font-size: 14px;
        color: #fff;
        margin-bottom: 10px;

        span {
            &:first-of-type {
                margin-right: 16px;
            }
        }
    }

    .svg-container {
        padding: 6px 5px 6px 15px;
        color: $dark_gray;
        vertical-align: middle;
        width: 30px;
        display: inline-block;

        &_login {
            font-size: 20px;
        }
    }

    .show-pwd {
        position: absolute;
        right: 10px;
        top: 7px;
        font-size: 16px;
        color: $dark_gray;
        cursor: pointer;
        user-select: none;
    }
}
</style>
    