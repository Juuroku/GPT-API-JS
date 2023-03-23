import {key} from '/JS/modules/key.js';
import {mod_paths} from '/JS/config.js';
let mods = {};
for (const key in mod_paths) {
	mods[key] = await import(mod_paths[key]);
}
const { createApp } = Vue;

let api_url = 'https://api.openai.com/v1/chat/completions';
let headers = {'Content-Type': 'application/json; charset=utf-8', 'Authorization': 'Bearer ' + key};
let obj = {
	"model": "gpt-3.5-turbo",
	"messages": [],
	"temperature": 0.5,
}


const reg = new RegExp('^\n');

const app = createApp({
	data() {
		return {
			obj: obj,
			mods: mods,
			mod: null,
			comments: [],
			history: []
		}
	},
	methods: {
		changeMod: function() {
			this.msgEn();
			let sel = document.getElementById('mods').value;
			if (!sel || sel == '') {
				alert('No module selected!');
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
				this.msgEn();
			} else {
				alert('Can\'t find the module!');
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
				e.preventDefault();
				e.target.blur();
				let txar = document.getElementById('user-input');
				let string = txar.value;
				if (string === undefined || /^\s*$/.test(string)) {
					alert('No input!');
					this.allEn();
				} else {
					this.$data.obj.messages.push({ "role": "user", "content": string});
					console.log(this.$data.obj);
					
					fetch(api_url, {
						headers: headers,
						method: 'POST',
						body: JSON.stringify(this.$data.obj)
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
									txar.value = "";
									this.allEn();
									yes.disabled = undefined;
								})
								.catch((e) => {
									alert('JSON parse error');
									this.allEn();
									this.$data.obj.messages.pop();
								});
							} else {
								console.log(res);
								if (res.statusText) {
									alert(`Status: ${res.status} - ${res.statusText}`)
								} else {
									alert ('Error');
								}
								this.allEn();
								this.$data.obj.messages.pop();
							}
						})
						.catch((e) => {
							console.log(e.message);
							alert('Error');
							this.allEn();
							this.$data.obj.messages.pop();
						});
				}
			}
			
		},
		allDis: function() {
			console.log('dis');
			let txar = document.getElementById('user-input');
			mod_btn.disabled = true;
			txar.disabled = true;
			yes.disabled = 'disabled';
			this.$refs.mods.disabled = 'disabled';
		},
		allEn: function() {
			console.log('en');
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
}).mount("#main");