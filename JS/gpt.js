// load key and configure
import {key} from '/JS/modules/key.js';
import {mod_paths} from '/JS/config.js';

// set default module
let mods = {
	"default GPT-3.5": {
		system: null
	}
};

// load modules
let loading = [];
for (const key in mod_paths) {
	try {
		mods[key] = await import(mod_paths[key]);
		if (!mods[key].system) {
			loading.push(`${key.toUpperCase()} has no system configure!`);
			delete mods[key];
		}
	} catch(e) {
		// add loading error message
		loading.push(`${key.toUpperCase()} import failed!`);
	}
}

// if error exists, alert
if (loading.length) alert(loading.length + "mod(s) not loaded:\n" + loading.join("\n"));

// import functinons from Vue
const { createApp, nextTick } = Vue;

// Open AI Api url and headers
let api_url = 'https://api.openai.com/v1/chat/completions';
let headers = {'Content-Type': 'application/json; charset=utf-8', 'Authorization': `Bearer ${key}`};

export const app = createApp({
	data() {
		return {
			obj: {
				"model": "gpt-3.5-turbo",
				"messages": [],
				"temperature": 0.5,
			}, // main object post to api
			mods: mods, // modules
			mod: null, // selected module
			comments: [], // display
			history: [], // store past messages
			ctrl: null, // AbortController to abort fetch 
			pre_mod: "", // last selected module (index)
			mod_idx: "", // selected module (index) (v-model)
			user_input: "", // user input (v-model)
			scr_show: false // show or hide 'To the bottom' button
		}
	},
	methods: {
		change_mod: function() {
			let sel = this.$data.mod_idx;
			// check module
			if (!sel || sel == '') {
				alert('No module is selected!');
				this.$data.mod_idx = this.$data.pre_mod;
				return;
			}
			
			// let user confirm to clear messages
			if (this.$data.pre_mod != "") {
				let flag = confirm('Clear the results?');
				if (!flag) {
					// set to previous if user cancel
					this.$data.mod_idx = this.$data.pre_mod;
					if (this.$data.obj.pre_mod != '') this.msgEn();
					return;
				} else {
					// push messages to history
					this.$data.history.push({mod: this.$data.pre_mod, messages: this.$data.obj.messages});
				}
			}
			
			// disable message input
			this.msgDis();			
			
			// clear results
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

				// biuld obj
				obj.messages.push(mod.system);
				if (mod.logit_bias) obj.logit_bias = mod.logit_bias;
				if (mod.frequency_penalty) obj.frequency_penalty = mod.frequency_penalty;
				if (mod.presence_penalty) obj.presence_penalty = mod.presence_penalty;
				if (mod.temperature) obj.temperature = mod.temperature;
				
				this.$data.obj = obj;
				this.$data.pre_mod = this.$data.mod_idx;
				
				// enable message input
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
				let string = this.$data.user_input;
				if (string === undefined || /^\s*$/.test(string)) {
					alert('No input!');
					this.allEn();
				} else {
					this.$data.obj.messages.push({ "role": "user", "content": string});
					console.log(this.$data.obj);
					
					this.$refs.stop.disabled = null;
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
									console.log('comp :', data.usage.completion_tokens);
									console.log("total :", data.usage.total_tokens);
									alert('OK');
									this.$data.user_input = "";
									this.allEn();
									this.$refs.stop.disabled = 'disabled';
								})
								.catch((e) => {
									alert('JSON parse error');
									this.allEn();
									this.$data.obj.messages.pop();
									this.$refs.stop.disabled = 'disabled';
								});
							} else {
								console.log(res);
								if (res.statusText) {
									alert(`Status: ${res.status} - ${res.statusText}`)
								} else {
									alert ('Error');
								}
								this.$refs.stop.disabled = 'disabled';
								this.allEn();
								this.$data.obj.messages.pop();
							}
						})
						.catch((e) => {
							console.log(e.message);
							alert('Error');
							this.allEn();
							this.$data.obj.messages.pop();
							this.$refs.stop.disabled = 'disabled';
						});
				}
			}
			
		},
		enterHandle: function(e) {
			if (!/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
				e.preventDefault();
				e.target.blur();
				this.gpt_api(e);
			}
		},
		stop_fetch: function() {
			this.$data.ctrl.abort();
			console.log("Cancel");
			this.$refs.stop.disabled = 'disabled';
		},
		allDis: function() {
			let txar = this.$refs.txar;
			mod_btn.disabled = true;
			txar.disabled = true;
			yes.disabled = 'disabled';
			this.$refs.mods.disabled = 'disabled';
		},
		allEn: function() {
			let txar = this.$refs.txar;
			txar.disabled = null;
			txar.focus();
			yes.disabled = undefined;
			mod_btn.disabled = null;
			this.$refs.mods.disabled = null;
		},
		msgDis: function() {
			let txar = this.$refs.txar;
			txar.disabled = true;
			yes.disabled = 'disabled';
		},
		msgEn: function() {
			let txar = this.$refs.txar;
			txar.disabled = null;
			txar.focus();
			yes.disabled = undefined;
		},
		msgDis: function() {
			let txar = this.$refs.txar
			txar.disabled = 'disabled';
			txar.focus();
			yes.disabled = 'disabled';
		},
		add_input: function() {
			
		},
		scroll_down: function() {
			let result = this.$refs.result;
			result.scrollTo({
				top: result.scrollHeight,
				left: 0,
				behavior: 'smooth'
			});
		}
	},
	mounted: function() {
	},
	updated: function() {
	},
	watch:{
		"comments.length": {
			async handler(val) {
				// watch the updating of comments

				let result = this.$refs.result;
				if (!result) return;

				// wait untill dom updated 
				await nextTick();
				// roll down to the latest message
				if (result.clientHeight < result.scrollHeight) {
					this.scr_show = true;
					result.scrollTo({
						top: result.scrollHeight,
						left: 0,
						behavior: 'smooth'
					});
				} else this.scr_show = false;
			},
			immediate: true
		}
	}
});

// pass instance to window to access from console
window.vm = app.mount("#main");
window.app = app;