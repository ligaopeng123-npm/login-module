# login-module

登录模块，统一管理登录逻辑

##### 属性配置

| 属性       | 说明                                                    | 类型   | 默认值       |
| ---------- | ------------------------------------------------------- | ------ | ------------ |
| title      | 项目上面的项目名称                                      | string | 某某系统     |
| id         | 给当前dom传递的id，用于事件监听                         | string | login-module |
| body-style | form表单的样式                                          | string | ''           |
| style      | 登录页样式                                              | string | ''           |
| method     | 请求类型 GET POST                                       | string | POST         |
| url        | 是否需要组件去处理登录逻辑，<br />默认fetch下发数据请求 | string | null         |
| user       | form表单用户的name属性                                  | string | user         |
| password   | form表单密码的name属性                                  |        | password     |
|            |                                                         |        |              |

##### 事件配置

```
submit事件 在点击登录时触发，传递的登录信息在，detail字段中
afterSubmit 在登录数据下发服务端后触发 用于处理登录后的路由跳转等逻辑
```

```
<login-module url="https://www.baidu.com/"
                  user="account"
                  password="password"
                  id="form"
                  style="background-image: url(/assets/background.jpg)"
                  body-style="right: 200px;"
                  title="系统">
    </login-module>
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

```
/**
 * 处理react tsx中直接使用web components报错问题
 */
interface LoginModuleProps extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> {
	title: string,
	...
}

declare global {
	namespace JSX {
		interface IntrinsicElements {
			'login-module': LoginModuleProps
		}
	}
}
```

