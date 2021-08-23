import './xy-ui/components/xy-input.js';
import './xy-ui/components/xy-checkbox.js';
import './xy-ui/components/xy-form.js';
import { get, post } from '@gaopeng123/fetch';
// 静态资源依赖
import './assets/icon.svg';
// import './assets/test.svg';

export default class LogInModule extends HTMLElement {
	shadow: any = null;
	
	constructor() {
		super();
		this.shadow = this.attachShadow({ mode: 'closed' });
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
	
	get sessionId() {
		return `${this.formId}-login-user`;
	}
	
	get session() {
		const data = sessionStorage.getItem(`${this.sessionId}`);
		return data ? JSON.parse(data) : {};
	}
	
	set session(val) {
		sessionStorage.setItem(`${this.sessionId}`, JSON.stringify(val));
	}
	
	get captchaImg() {
		return this.shadow.querySelector(`#captchaImg`);
	}
	
	create = () => {
		const config = this.getConfig();
		const { title, url, user, password, method, publickey, captcha, captchasrc } = config;
		
		/**
		 * 项目title赋值
		 */
		this.checkChange(this.shadow.querySelector('#title').innerText, title, () => {
			this.shadow.querySelector('#title').innerText = title;
		});
		
		/**
		 * 服务端请求
		 */
		this.checkChange(this.form.getAttribute('action'), url, () => {
			this.form.setAttribute('action', url);
		});
		/**
		 * 请求类型
		 */
		this.checkChange(this.form.getAttribute('method'), method, () => {
			this.form.setAttribute('method', method);
		});
		
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
		
		/**
		 * 密码加密绑定
		 */
		this.checkChange(this.shadow.querySelector(`#password`).getAttribute('publickey'), publickey, () => {
			this.shadow.querySelector(`#password`).setAttribute('publickey', publickey);
		});
		
		/**
		 * 验证码绑定
		 */
		captcha && this.checkChange(this.shadow.querySelector(`#captcha`).getAttribute('name'), captcha, () => {
			this.shadow.querySelector(`#captcha`).setAttribute('name', captcha);
		});
		/**
		 * 设置验证码地址
		 */
		captcha && captchasrc && this.checkChange(this.captchaImg.getAttribute('src'), captchasrc, () => {
			this.captchaImg.setAttribute('src', captchasrc);
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
		'main-style': '',
		method: 'POST', // POST GET
		url: null, // 默认不支持传参
		user: 'user',
		password: 'password',
		captcha: '',
		captchasrc: null,
		captchaurl: null,
		captchamethod: 'POST',
		publickey: null // 加密公钥
	};
	__config: any = {};
	getConfig = (): any => {
		return Object.assign({}, this.defaultConfig, this.__config);
	};
	
	/**
	 * 生命周期钩子函数 处理挂载
	 */
	connectedCallback() {
		this.shadow.innerHTML = this.getTemplate();
		this.addEvents();
		if (this.checkbox) this.checkbox.checked = true;
		this.setCaptcha();
	}
	
	/**
	 * 移除文档流
	 */
	disconnectedCallback() {
		this.removeEvents();
	}
	
	removeEvents() {
		this.form.removeEventListener('submit', this.watchSubmit);
		this.form.removeEventListener('submitError', this.submitError);
		this.shadow.querySelector(`#bth-login`).removeEventListener('click', this.onSubmit);
		if (this.getConfig().captcha) {
			this.captchaImg?.removeEventListener('click', this.setCaptcha);
		}
	}
	
	addEvents() {
		this.form.addEventListener('submit', this.watchSubmit);
		this.form.addEventListener('submitError', this.submitError);
		this.shadow.querySelector(`#bth-login`).addEventListener('click', this.onSubmit);
		this.addCaptchaEvent();
	}
	
	addCaptchaEvent() {
		if (this.getConfig().captcha) {
			this.captchaImg?.addEventListener('click', this.setCaptcha);
		}
	}
	
	/**
	 * 对外传递消息数据结构
	 * @param data
	 */
	getDetail(data: any) {
		return Object.assign({}, data, {
			session: this.session
		});
	}
	
	/**
	 * 提交回调 给外部提供的接口
	 */
	onSubmit = () => {
		if (this.form.checkValidity()) {
			/**
			 * 如果是记住密码状态 则将密码缓存起来
			 */
			if (this.checkbox && this.checkbox.checked) {
				this.session = Object.assign({
					keepLogged: this.checkbox.checked
				}, this.form.formdata?.json);
			} else {
				this.session = Object.assign({}, this.form.formdata?.json);
			}
			/**
			 * 将消息发送出去
			 */
			this.dispatchEvent(new CustomEvent('submit', {
				detail: this.getDetail({ data: this.form.formdata?.json })
			}));
		}
	};
	
	/**
	 * 监听提交事件
	 * @param data
	 */
	watchSubmit = (res: any) => {
		const { data, token } = res?.detail;
		this.dispatchEvent(new CustomEvent('afterSubmit', {
			detail: this.getDetail({ data: this.form.formdata?.json, token, response: data })
		}));
	};
	
	/**
	 * 提交出错
	 * @param data
	 */
	submitError = (data: any) => {
		this.dispatchEvent(new CustomEvent('submitError', {
			// 避免数据重复
			detail: data?.detail
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
		// 参数请参考文档
		return [
			'title',
			'id',
			'body-style',
			'main-style',
			'item-style',
			'url',
			'method',
			'user',
			'password',
			'captcha',
			'captchasrc',
			'captchaurl',
			'captchamethod',
			'publickey'
		];
	}
	
	/**
	 * 获取验证码
	 */
	getCaptcha = async (): Promise<Blob> => {
		const { captchaurl, captchamethod } = this.getConfig();
		const headers = {
			'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
		};
		const data = captchamethod === 'POST' ? post(captchaurl, {
			headers: headers,
			responseType: 'blob'
		}) : get(captchaurl, {
			headers: headers,
			responseType: 'blob'
		});
		return await data;
	};
	
	/**
	 * 设置验证码
	 */
	setCaptcha = async () => {
		const { captcha, captchaurl } = this.getConfig();
		if (captcha) {
			if (captchaurl) {
				const captcha = await this.getCaptcha();
				this.captchaImg.setAttribute('src', window.URL?.createObjectURL(captcha));
			} else {
				this.dispatchEvent(new CustomEvent('captchaClick', {
					detail: { time: Date.now() }
				}));
			}
		}
	};
	
	/**
	 * 模板获取
	 */
	getTemplate = () => {
		const config = this.getConfig();
		const { title, url, user, password, method, publickey, captcha } = config;
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
				xy-form > .item {
					margin: 24px 24px;
					display: block;
				}
				xy-input, xy-button{
					width: 100%;
				}
				xy-input {
					height: 38px;
				}
				.login-module {
					height: 100%;
				    width: 100%;
				    position: absolute;
					display: flex;
				    justify-content: center;
				    align-items: center;
				    background-repeat:no-repeat;
                    background-attachment:fixed;
                    background-position:center;
                    background-size: cover;
                    background-color:black;
                    background-image:radial-gradient(white, rgba(255,255,255,.2) 2px, transparent 40px),
					radial-gradient(white, rgba(255,255,255,.15) 1px, transparent 30px),
					radial-gradient(white, rgba(255,255,255,.1) 2px, transparent 40px),
					radial-gradient(rgba(255,255,255,.4), rgba(255,255,255,.1) 2px, transparent 30px);
					
				}
				
				.login-module-bg {
					background-size: 550px 550px, 350px 350px, 250px 250px, 150px 150px;
					background-position: 0 0, 40px 60px, 130px 270px, 70px 100px;
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
				
				#captchaImg {
					cursor: pointer;
				}

			</style>
			<div class="login-module ${config[`main-style`] ? '' : 'login-module-bg'}" id="login" style="${config[`main-style`]}">
				<xy-form id="login-module" action="${url}" method="${method}"
					style="${config['body-style']}" form-style="display:block;">
					<xy-form-item class="login-title" style="${config['item-style']}">
						<span id="title">${title}</span>
					</xy-form-item>
					<xy-form-item style="${config['item-style']}" class="item">
						<xy-input id="user" icon="user" color="#999" required name="${user}" placeholder="请输入用户名"></xy-input>
					</xy-form-item style="${config['item-style']}">
					<xy-form-item style="${config['item-style']}" class="item">
						<xy-input id="password" icon="lock" publickey="${publickey}" name="${password}" required type="password" placeholder="请输入密码"></xy-input>
					</xy-form-item>
		` + (captcha ? `
                    <xy-form-item id="captchaItem" style="${config['item-style']}" class="item">
                        <xy-input style="width: 70%;" id="captcha" icon="message" name="${captcha}" required type="captcha" placeholder="请输入验证码"></xy-input>
                        <img id="captchaImg" width="24" height="24" alt="验证码"
                        style="width: 80px;height: 37px;float: right;border-radius: 4px;" />
                    </xy-form-item>
            ` : '') + `
		            <!--<xy-form-item >-->
						<!--<div class="login-manipulate">-->
							<!--<xy-checkbox id="checked">记住密码</xy-checkbox>-->
							<!--<a style="float: right;" href="javascript:void(0);">忘记密码</a>-->
						<!--</div>-->
					<!--</xy-form-item>-->
                    <xy-form-item class="item">
                        <xy-button id="bth-login" type="primary" htmltype="submit">登录</xy-button>
                    </xy-form-item>
                </xy-form>
            </div>`
			;
	};
}

if (!customElements.get('login-module')) {
	customElements.define('login-module', LogInModule);
}
