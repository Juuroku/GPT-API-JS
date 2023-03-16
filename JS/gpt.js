import {key} from '/JS/modules/key.js';
import {mod_path} from '/JS/config.js';
const mod = (mod_path !== undefined) && await import(mod_path);

console.log(mod);

let api_url = 'https://api.openai.com/v1/chat/completions';
let headers = {'Content-Type': 'application/json; charset=utf-8', 'Authorization': 'Bearer ' + key};
let obj = {
	"model": "gpt-3.5-turbo",
	"messages": [],
	"temperature": 0.5,
}

if (mod.system) obj.messages.push(mod.system);
if (mod.logit_bias) obj.logit_bias = mod.logit_bias;
if (mod.frequency_penalty) obj.frequency_penalty = mod.frequency_penalty;
if (mod.presence_penalty) obj.presence_penalty = mod.presence_penalty;
if (mod.temperature) obj.temperature = mod.temperature;

const reg = new RegExp('^\n');

yes.addEventListener('click', ()=> {
	let string = document.getElementById('user-input').value;
	yes.disabled = 'disabled';
	if (string === undefined || string === '') {
		alert('nothing');
		//result.innerHTML = "nothing";
		yes.disabled = undefined;
	} else {
		obj.messages.push({ "role": "user", "content": string});
		console.log(obj);
		
		fetch(api_url, {
			headers: headers,
			method: 'POST',
			body: JSON.stringify(obj)
		})
			.then((res) => {
				if (res.ok) {
					alert('OK');
					res.json().then((data) => {
						console.log(data);
						if (!reg.test(data.choices[0].message.content)) result.innerHTML += '<br/>';
						result.innerHTML += data.choices[0].message.content.replaceAll("\n", "<br/>");
						obj.messages.push(data.choices[0].message);
						yes.disabled = undefined;
					})
				} else {
					console.log(res);
					if (res.statusText) {
						alert(`Status: ${res.status} - ${res.statusText}`)
					} else {
						alert ('No1');
					}
					yes.disabled = undefined;
					obj.messages.pop();
				}
			})
			.catch((e) => {
				console.log(e.message);
				alert('No')
				yes.disabled = undefined;
				obj.messages.pop();
			});
	}
});