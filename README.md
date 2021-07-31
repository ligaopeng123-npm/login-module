# login-module

登录模块，统一管理登录逻辑

##### 属性配置

| 属性       | 说明                                                    | 类型   | 默认值       |
| ---------- | ------------------------------------------------------- | ------ | ------------ |
| title      | 项目上面的项目名称                                      | string | 某某系统     |
| id         | 拼接本地数据存储的key值                                 | string | login-module |
| main-style | 登录页样式，可替换背景图                           | string | ''           |
| body-style      | form表单的样式                                     | string | ''           |
| method     | 请求类型 GET POST                                       | string | POST         |
| url        | 是否需要组件去处理登录逻辑，<br />默认fetch下发数据请求 | string | null         |
| user       | form表单用户的name属性                                  | string | user         |
| password   | form表单密码的name属性                                  | string | password     |
| captcha | 验证码能力 | string  | '' |
| captchaurl | 验证码地址 | string \| null | null |
| captchamethod | 验证码请求类型 | string | POST |
| publickey | 加密公钥 | string | null |

##### 事件配置 （注意webpace5摇树配置会导致导入不可用时，请直接使用import  ‘@gaopeng123/login-module’ 导入)

```
submit事件 在点击登录时触发，传递的登录信息在，detail字段中
afterSubmit 在登录数据下发服务端后触发 用于处理登录后的路由跳转等逻辑
submitError 在fetch出错情况下触发
```

```tsx
<login-module
        url="/login"
        method="POST"
        publickey="*"
        user="userId"
        password="password"
        captcha="captcha"
        captchamethod="GET"
        captchaurl="/captcha"
        id="form"
        main-style="background-image: url(./assets/background.jpg)"
        body-style="right: 200px;"
        title="系统">
</login-module>
```

```js
// 事件订阅
<script>
        const form = document.querySelector('#form');
        form.addEventListener('submit', (data)=> {
        	console.log(data)
        });
        form.addEventListener('afterSubmit', (data)=> {
	        console.log(data)
        });
    </script>
```

