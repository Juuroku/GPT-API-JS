import {key} from '/JS/modules/key.js';
import {mod_paths} from '/JS/config.js';
let mods = {};
for (const key in mod_paths) {
	mods[key] = await import(mod_paths[key]);
}
const { createApp } = Vue;

let api_url = 'https://api.openai.com/v1/chat/completions';
let headers = {'Content-Type': 'application/json; charset=utf-8', 'Authorization': `Bearer ${key}`};


const reg = new RegExp('^\n');

export const app = createApp({
	data() {
		return {
			obj: {
				"model": "gpt-3.5-turbo",
				"messages": [],
				"temperature": 0.5,
			},
			mods: mods,
			mod: null,
			comments: [],
			history: [],
			ctrl: null,
			pre_mod: "",
			mod_idx: "",
			user_input: ""
		}
	},
	methods: {
		changeMod: function() {
			if (this.$data.pre_mod != "") {
				let flag = confirm('Clean the history?');
				if (!flag) {
					this.$data.mod_idx = this.$data.pre_mod;
					if (this.$data.obj.pre_mod != '') this.msgEn();
					return;
				}
			}
			this.msgDis();
			this.$data.obj = {
				"model": "gpt-3.5-turbo",
				"messages": [],
				"temperature": 0.5,
			};
			let sel = this.$data.mod_idx;
			if (!sel || sel == '') {
				alert('No module selected!');
				this.$data.mod_idx = this.$data.pre_mod;
				if (this.$data.obj.pre_mod != '') this.msgEn();
				return;
			}
			this.$data.history.push(this.$data.obj.messages);
			this.$data.comments = [];
			
			console.log(sel);
			console.log(this.$data.mods);
			
			// read the mod config
			if (this.$data.mods[sel]) {
				let obj = {
					"model": "gpt-3.5-turbo",
					"messages": [],
					"temperature": 0.5,
				}
				
				this.$data.mod = this.$data.mods[sel];
				
				let mod = this.$data.mod;

				if (mod.system) obj.messages.push(mod.system);
				if (mod.logit_bias) obj.logit_bias = mod.logit_bias;
				if (mod.frequency_penalty) obj.frequency_penalty = mod.frequency_penalty;
				if (mod.presence_penalty) obj.presence_penalty = mod.presence_penalty;
				if (mod.temperature) obj.temperature = mod.temperature;
				
				this.$data.obj = obj;
				this.$data.pre_mod = this.$data.mod_idx;
				this.msgEn();
			} else {
				alert('Can\'t find the module!');
				this.$data.mod_idx = this.$data.pre_mod;
				return;
			}
			console.log(this.$data.obj);
			alert(`The module is set to ${sel.toUpperCase()}!`);
		},
		gpt_api: function(e) {
			if (!this.$data.mod) {
				alert('Select Mod!');
			} else {
				this.allDis();
				//let txar = document.getElementById('user-input');
				let string = this.$data.user_input;
				if (string === undefined || /^\s*$/.test(string)) {
					alert('No input!');
					this.allEn();
				} else {
					this.$data.obj.messages.push({ "role": "user", "content": string});
					console.log(this.$data.obj);
					
					document.getElementById('stop').disabled = null;
					this.$data.ctrl = new AbortController();
					fetch(api_url, {
						headers: headers,
						method: 'POST',
						body: JSON.stringify(this.$data.obj),
						signal: this.$data.ctrl.signal
					})
						.then((res) => {
							if (res.ok) {
								res.json().then((data) => {
									console.log(data);
									// parse the response and put into result div
									let l = this.$data.obj.messages.length;
									this.$data.obj.messages.push(data.choices[0].message);
									this.$data.comments.push(this.$data.obj.messages[l-1]);
									this.$data.comments.push(this.$data.obj.messages[l]);
									alert('OK');
									this.$data.user_input = "";
									this.allEn();
									document.getElementById('stop').disabled = 'disabled';
								})
								.catch((e) => {
									alert('JSON parse error');
									this.allEn();
									this.$data.obj.messages.pop();
									document.getElementById('stop').disabled = 'disabled';
								});
							} else {
								console.log(res);
								if (res.statusText) {
									alert(`Status: ${res.status} - ${res.statusText}`)
								} else {
									alert ('Error');
								}
								document.getElementById('stop').disabled = 'disabled';
								this.allEn();
								this.$data.obj.messages.pop();
							}
						})
						.catch((e) => {
							console.log(e.message);
							alert('Error');
							this.allEn();
							this.$data.obj.messages.pop();
							document.getElementById('stop').disabled = 'disabled';
						});
				}
			}
			
		},
		enterHandle: function(e) {
			console.log('key');
			if (!/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
				console.log('not');
				e.preventDefault();
				e.target.blur();
				this.gpt_api(e);
			}
		},
		stop_fetch: function() {
			this.$data.ctrl.abort();
			console.log("Cancel");
			document.getElementById('stop').disabled = 'disabled';
		},
		allDis: function() {
			let txar = document.getElementById('user-input');
			mod_btn.disabled = true;
			txar.disabled = true;
			yes.disabled = 'disabled';
			this.$refs.mods.disabled = 'disabled';
		},
		allEn: function() {
			let txar = document.getElementById('user-input');
			txar.disabled = null;
			txar.focus();
			yes.disabled = undefined;
			mod_btn.disabled = null;
			this.$refs.mods.disabled = null;
		},
		msgDis: function() {
			let txar = document.getElementById('user-input');
			txar.disabled = true;
			yes.disabled = 'disabled';
		},
		msgEn: function() {
			let txar = document.getElementById('user-input');
			txar.disabled = null;
			txar.focus();
			yes.disabled = undefined;
		},
		msgDis: function() {
			let txar = document.getElementById('user-input');
			txar.disabled = 'disabled';
			txar.focus();
			yes.disabled = 'disabled';
		},
		add_input: function() {
			
		}
	},
	mounted: function() {
	},
	updated: function() {
		// roll down to the latest message
		if (result.clientHeight < result.scrollHeight) {
			result.scrollTo({
				top: result.scrollHeight,
				left: 0,
				behavior: 'smooth'
			})
		}
	}
});

// pass instance to window to access from console
window.vm = app.mount("#main");
window.app = app;