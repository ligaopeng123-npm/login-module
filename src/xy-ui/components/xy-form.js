import XyMessage from './xy-message.js';

export default class XyForm extends HTMLElement {
    
    static get observedAttributes() {
        return ['disabled']
    }
    
    constructor() {
        super();
        const shadowRoot = this.attachShadow({mode: 'open'});
        shadowRoot.innerHTML = `
        <style>
        :host {
            display:block;
        }
        form {
            display:grid;
            grid-template-columns:auto 1fr;
            grid-gap:.8em;
            align-items: center;
            justify-items: end;
        }
        :host([type=full]) form{
            grid-template-columns:1fr;
            justify-items: start;
        }
        :host([type=none]) form{
            display:contents;
        }
        :host(:not([type=full])) ::slotted(:not(xy-form-item)){
            justify-self: stretch;
            grid-column:span 2;
        }
        </style>
        <form id="form" method="${this.method}" action="${this.action}" ${this.novalidate ? 'novalidate' : ''}>
            <slot></slot>
        </form>
        `
    }
    
    checkValidity() {
        if (this.novalidate) {
            return true;
        }
        const elements = [...this.elements].reverse();
        let validity = true;
        elements.forEach(el => {
            if (el.checkValidity && !el.checkValidity()) {
                validity = false;
            }
        });
        this.invalid = !validity;
        return validity;
    }
    
    checkStatus = (response) => response.status >= 200 && response.status < 300;
    
    afterSubmit = async (data) => {
        // if(data.headers.get("content-type")=='application/json'){
        // 无论对错 结果都要抛出来
        // }
        this.submitBtn && (this.submitBtn.loading = false);
        /**
         * 请求返回数据
         * @type {any}
         */
        let resData = data;
        
        if (this.checkStatus(resData)) {
            resData = await data.json();
        } else {
            XyMessage.error(`登录失败，请检查网络设置！`)
        }
        this.dispatchEvent(new CustomEvent('submit', {
            detail: {
                data: resData,
                token: data?.headers?.get('token')
            }
        }));
    };
    
    async submit() {
        if (this.checkValidity() && !this.disabled) {
            //validity
            if (this.action) {
                this.submitBtn && (this.submitBtn.loading = true);
                if (this.method == 'GET') {
                    const formdata = new URLSearchParams(this.formdata).toString();
                    const data = await fetch(`${this.action}?${formdata}`);
                    this.afterSubmit(data);
                } else {
                    const data = await fetch(this.action, {
                        method: 'POST',
                        body: JSON.stringify(this.formdata.json),
                        mode: 'cors',
                        headers: {
                            'content-type': 'application/json',
                            // 'Access-Control-Expose-Headers': 'token',
                            // 'Access-Control-Allow-Headers': 'token'
                        },
                    });
                    this.afterSubmit(data);
                }
            }
        }
    }
    
    reset() {
        this.invalid = false;
        this.elements.forEach(el => {
            el.reset && el.reset();
        })
    }
    
    get validity() {
        return this.elements.every(el => el.validity);
    }
    
    get disabled() {
        return this.getAttribute('disabled') !== null;
    }
    
    get novalidate() {
        return this.getAttribute('novalidate') !== null;
    }
    
    get formdata() {
        const formdata = new FormData();
        const jsondata = {};
        if (!this.disabled) {
            this.elements.forEach(el => {
                formdata.set(el.name, el.value);
                jsondata[el.name] = el.value;
            })
        }
        formdata.json = jsondata;
        return formdata;
    }
    
    get method() {
        const method = (this.getAttribute('method') || 'get').toUpperCase();
        if (['GET', 'POST'].includes(method)) {
            return method;
        }
        return 'GET';
    }
    
    get action() {
        return this.getAttribute('action') || '';
    }
    
    get name() {
        return this.getAttribute('name');
    }
    
    get invalid() {
        return this.getAttribute('invalid') !== null;
    }
    
    /*
    get enctype() {
        const enctype = this.getAttribute('enctype');
        if( ['application/x-www-form-urlencoded','multipart/form-data','text/plain'].includes(enctype) ){
            return enctype;
        }
        return 'application/x-www-form-urlencoded';
    }
    */
    
    set novalidate(value) {
        if (value === null || value === false) {
            this.removeAttribute('novalidate');
        } else {
            this.setAttribute('novalidate', '');
        }
    }
    
    set invalid(value) {
        if (value === null || value === false) {
            this.removeAttribute('invalid');
        } else {
            this.setAttribute('invalid', '');
        }
    }
    
    set type(value) {
        this.setAttribute('type', value);
    }
    
    connectedCallback() {
        this.form = this.shadowRoot.getElementById('form');
        this.elements = [...this.querySelectorAll('[name]:not([disabled])')];
        this.submitBtn = this.querySelector('[htmltype=submit]');
        this.resetBtn = this.querySelector('[htmltype=reset]');
        if (this.submitBtn) {
            this.submitBtn.addEventListener('click', () => {
                this.submit();
            });
        }
        if (this.resetBtn) {
            this.resetBtn.addEventListener('click', () => {
                this.reset();
            });
        }
        this.form.addEventListener('keydown', (ev) => {
            if (ev.target == this.resetBtn) {
                return
            }
            switch (ev.keyCode) {
                case 13://Enter
                    this.submit();
                    break;
                default:
                    break;
            }
        })
        if (!this.novalidate) {
            this.elements.forEach((el) => {
                if (el.tagName == "XY-INPUT") {
                    el.addEventListener('input', () => {
                        this.invalid = !this.validity;
                    })
                } else {
                    el.addEventListener('change', () => {
                        this.invalid = !this.validity;
                    })
                }
            })
        }
    }
}

if (!customElements.get('xy-form')) {
    customElements.define('xy-form', XyForm);
}


class XyFormItem extends HTMLElement {
    
    constructor() {
        super();
        const shadowRoot = this.attachShadow({mode: 'open'});
        shadowRoot.innerHTML = `
        <style>
        :host {
            display:contents;
        }
        label{
            color:var(--fontColor,#333);
        }
        label.required:not(:empty)::before{
            content:'*';
            color:var(--errorColor,#f4615c);
        }
        .item{
            justify-self: stretch;
        }
        </style>
        <label>${this.legend}</label>
        <div class="item"><slot></slot></slot>
        `
    }
    
    get legend() {
        return this.getAttribute('legend') || '';
    }
    
    set legend(value) {
        this.setAttribute('legend', value);
    }
    
    connectedCallback() {
        this.form = this.closest('xy-form');
        this.labels = this.shadowRoot.querySelector('label');
        this.slots = this.shadowRoot.querySelector('slot');
        this.slots.addEventListener('slotchange', () => {
            this.input = this.querySelector('[name]');
            if (this.input && this.input.required) {
                this.labels.classList.add('required');
            }
        })
    }
}

if (!customElements.get('xy-form-item')) {
    customElements.define('xy-form-item', XyFormItem);
}