import './xy-ui/components/xy-input.js';
import './xy-ui/components/xy-checkbox.js';
import './xy-ui/components/xy-form.js';
// 静态资源依赖
import './assets/icon.svg';
import './assets/background.jpg';

export default class LogInModule extends HTMLElement {
	shadow: any = null;
	
	constructor() {
		super();
		this.shadow = this.attachShadow({ mode: 'closed' });
		this.shadow.innerHTML = this.getTemplate();
	}
	
	/**
	 * form id 动态绑定一些属性
	 */
	get formId() {
		return `${this.getConfig().id || `login-module`}`;
	}
	
	get form() {
		return this.shadow.querySelector(`xy-form`);
	}
	
	get checkbox() {
		return this.shadow.querySelector(`#checked`);
	}
	
	create = () => {
		const config = this.getConfig();
		const { style, title, url, user, password } = config;
		
		/**
		 * 项目title赋值
		 */
		this.checkChange(this.shadow.querySelector('#title').innerText, title, () => {
			this.shadow.querySelector('#title').innerText = title;
		});
		/**
		 * 样式绑定
		 */
		if (style) {
			this.shadow.querySelector('#login').style = style;
		}
		
		/**
		 * body的属性
		 */
		if (config[`body-style`]) {
			this.form.style = config[`body-style`];
		}
		/**
		 * 服务端请求
		 */
		if (url) {
			this.form.setAttribute('action', url);
		}
		
		/**
		 * 用户绑定
		 */
		this.checkChange(this.shadow.querySelector(`#user`).getAttribute('name'), user, () => {
			this.shadow.querySelector(`#user`).setAttribute('name', user);
		});
		
		/**
		 * 密码绑定
		 */
		this.checkChange(this.shadow.querySelector(`#password`).getAttribute('name'), password, () => {
			this.shadow.querySelector(`#password`).setAttribute('name', password);
		});
	};
	/**
	 * 新老数据比对后再赋值
	 * @param oldValue
	 * @param newValue
	 * @param handle
	 */
	checkChange = (oldValue: string, newValue: string, handle: any) => {
		if (oldValue !== newValue && handle) handle();
	};
	
	readonly defaultConfig: any = {
		title: '某某系统',
		id: 'login-module',
		'body-style': '',
		style: '',
		method: 'POST', // POST GET
		url: null, // 默认不支持传参
		user: 'user',
		password: 'password'
	};
	__config: any = {};
	getConfig = (): any => {
		return Object.assign({}, this.defaultConfig, this.__config);
	};
	
	/**
	 * 生命周期钩子函数 处理挂载
	 */
	connectedCallback() {
		this.addEvents();
		this.checkbox.checked = true;
	}
	
	/**
	 * 移除文档流
	 */
	disconnectedCallback() {
		this.removeEvents();
	}
	
	removeEvents() {
		this.form.removeEventListener('submit', this.watchSubmit);
		this.shadow.querySelector(`#bth-login`).removeEventListener('click', this.onSubmit);
	}
	
	addEvents() {
		this.form.addEventListener('submit', this.watchSubmit);
		this.shadow.querySelector(`#bth-login`).addEventListener('click', this.onSubmit);
	}
	
	/**
	 * 提交回调 给外部提供的接口
	 */
	onSubmit = () => {
		if (this.form.checkValidity()) {
			/**
			 * 如果是记住密码状态 则将密码缓存起来
			 */
			if (this.checkbox.checked) {
				sessionStorage.setItem(`${this.formId}-login-user`, JSON.stringify(this.form.formdata?.json));
			}
			/**
			 * 将消息发送出去
			 */
			this.dispatchEvent(new CustomEvent('submit', {
				detail: {
					data: this.form.formdata?.json
				}
			}));
		}
	};
	
	/**
	 * 监听提交事件
	 * @param data
	 */
	watchSubmit = (data: any) => {
		this.dispatchEvent(new CustomEvent('afterSubmit', {
			detail: {
				data: data
			}
		}));
	};
	
	/**
	 * 当自定义元素的一个属性被增加、移除或更改时被调用。
	 * 需要setAttribute 才能被触发
	 */
	attributeChangedCallback(name: string, oldValue: string, newValue: string) {
		if (oldValue !== newValue) {
			this.__config[name] = newValue;
			setTimeout(() => {
				this.create();
			});
		}
	}
	
	/**
	 * 暴露哪些属性可以被监听
	 * @returns {string[]}
	 */
	static get observedAttributes() {
		return ['title', 'id', 'body-style', 'style', 'url', 'user', 'password'];
	}
	
	/**
	 * 模板获取
	 */
	getTemplate = () => {
		return `
			<style>
				xy-form {
					min-width: 300px;
					border: 1px solid #f6f2f2;
    				padding: 24px;
    				color: #999;
    				background-color: #fff;
    				position: absolute;
				}
				xy-input, xy-button{
					width: 100%;
				}
				xy-input {
					height: 38px;
				}
				.login-module{
					height: 100%;
				    width: 100%;
				    position: absolute;
					display: flex;
				    justify-content: center;
				    align-items: center;
				    background-image: url("assets/background.jpg");
				}
				.login-title {
					color: #333;
					text-align: center;
				}
				.login-title {
					color: #333;
					text-align: center;
					font-size: 28px;
					font-family: PingFangSC-Semibold, PingFang SC;
					font-weight: 600;
				}
				.login-manipulate {
					margin-bottom: 24px;
					color: #666
				}

			</style>
			<div class="login-module" id="login">
				<xy-form id="login-module" method="${this.getConfig().method}">
					<xy-form-item class="login-title">
						<span id="title"></span>
					</xy-form-item>
					<xy-form-item>
						<xy-input id="user" icon="user" color="#999" required name="user" placeholder="请输入用户名"></xy-input>
					</xy-form-item>
					<xy-form-item>
						<xy-input id="password" icon="lock" name="password" required type="password" placeholder="请输入密码"></xy-input>
					</xy-form-item>
					<xy-form-item >
						<div class="login-manipulate">
							<xy-checkbox id="checked">记住密码</xy-checkbox>
							<a style="float: right;" href="javascript:void(0);">忘记密码</a>
						</div>
					</xy-form-item>
					<xy-form-item>
						<xy-button id="bth-login" type="primary" htmltype="submit">登录</xy-button>
					</xy-form-item>
				</xy-form>
			</div>
		`;
	};
}
if (!customElements.get('login-module')) {
	customElements.define('login-module', LogInModule);
}