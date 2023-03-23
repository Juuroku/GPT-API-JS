import {key} from '/JS/modules/key.js';
import {mod_paths} from '/JS/config.js';
let mods = {};
for (const key in mod_paths) {
	mods[key] = await import(mod_paths[key]);
}
//const mods = (mod_path !== undefined) && await import(mod_path);
const { createApp } = Vue;

//console.log(mod);

let api_url = 'https://api.openai.com/v1/chat/completions';
let headers = {'Content-Type': 'application/json; charset=utf-8', 'Authorization': 'Bearer ' + key};
let obj = {
	"model": "gpt-3.5-turbo",
	"messages": [],
	"temperature": 0.5,
}

/*
if (mod.system) obj.messages.push(mod.system);
if (mod.logit_bias) obj.logit_bias = mod.logit_bias;
if (mod.frequency_penalty) obj.frequency_penalty = mod.frequency_penalty;
if (mod.presence_penalty) obj.presence_penalty = mod.presence_penalty;
if (mod.temperature) obj.temperature = mod.temperature;
*/

const reg = new RegExp('^\n');

createApp({
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
			let sel = document.getElementById('mods').value;
			this.$data.history.push(this.$data.obj.messages);
			this.$data.comments = [];
			
			console.log(sel);
			console.log(this.$data.mods);
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
			}
			console.log(this.$data.obj);
		},
		gpt_api: function(e) {
			if (!this.$data.mod) {
				alert('Select Mod!');
			} else {
				e.preventDefault();
				e.target.blur();
				let txar = document.getElementById('user-input');
				let string = txar.value;
				txar.disabled = true;
				yes.disabled = 'disabled';
				if (string === undefined || /^\s*$/.test(string)) {
					alert('No input!');
					yes.disabled = undefined;
					txar.disabled = null;
					txar.focus();
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
									//if (!reg.test(data.choices[0].message.content)) result.innerHTML += '<br/>';
									//result.innerHTML += data.choices[0].message.content.replaceAll("\n", "<br/>");
									let l = this.$data.obj.messages.length;
									this.$data.obj.messages.push(data.choices[0].message);
									this.$data.comments.push(this.$data.obj.messages[l-1]);
									this.$data.comments.push(this.$data.obj.messages[l]);
									alert('OK');
									txar.value = "";
									txar.disabled = null;
									txar.focus();
									yes.disabled = undefined;
								})
								.catch((e) => {
									alert('JSON parse error');								
									txar.disabled = null;
									txar.focus();
									yes.disabled = undefined;
									this.$data.obj.messages.pop();
								});
							} else {
								console.log(res);
								if (res.statusText) {
									alert(`Status: ${res.status} - ${res.statusText}`)
								} else {
									alert ('No1');
								}
								txar.disabled = null;
								txar.focus();
								yes.disabled = undefined;
								this.$data.obj.messages.pop();
							}
						})
						.catch((e) => {
							console.log(e.message);
							alert('No');
							txar.disabled = null;
							txar.focus();
							yes.disabled = undefined;
							this.$data.obj.messages.pop();
						});
				}
			}
			
		},
		add_input: function() {
			
		}
	},
	mounted: function() {
		// for style test
		//this.$data.comments.push({"role": "user", "content": "Hello"});
		document.getElementById('user-input').focus();
	}
}).mount("#main");