// @ts-ignore
import LogInModule from './main.js';

/**
 * 处理react tsx中直接使用web components报错问题
 */
// @ts-ignore
export declare interface LoginModuleProps extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> {
	title?: string, // 标题
	id?: string, // 标识 可不传
	'main-style'?: string, // 主样式 用于更改背景图等
	'body-style'?: string, // form表单样式
	'item-style'?: string, // form表单每个item的样式
	method?: string, // 请求方式
	url?: string, // 请求地址
	user?: string, // 用户字段key
	password?: string, // 密码字段key
	publickey?: string, // 密码字段key
	captcha?: string, // 验证码能力
	captchasrc?: string, // 验证码能力
	captchaurl?: string, // 验证码地址
	captchamethod?: string, // 验证码请求类型
}

declare global {
	namespace JSX {
		interface IntrinsicElements {
			'login-module': LoginModuleProps
		}
	}
}

export declare type SubmitData = {
	data: User,
}

export declare type User = {
	username?: string,
	password?: string,
	[propName: string]: any,
}

export declare type AfterSubmitDetail = {
	response: { status?: number, message?: string, result?: any, [propName: string]: any },
	session: User,
	token: string | null,
} & SubmitData

export declare type SubmitError = {
	detail: { error: Error } & SubmitData,
	[propName: string]: any,
}

export declare type Submit = {
	detail: SubmitData,
	[propName: string]: any,
}

export declare type AfterSubmit = {
	detail: AfterSubmitDetail,
	[propName: string]: any,
}

// @ts-ignore
export default LogInModule;
