# GPT-3.5 API Web Interface
	This is a small project that using `GPT-3.5` API from [Open AI](https://openai.com/) to practice JavaScript, Vue.js and modules.

## Table of Contents
   - [Installation](#Installation)
   - [Usage](#Usage)
   - [Configure](#Configure)
   - [Contributing](#Contributing)

## Installation
	1. Clone the project to your host.
	2. The project uses `import` method in JavaScript, which requires a web server to function properly. Therefore, it is required to install and configure a web server such as Nginx to run the project.
	3. Assign the directory of the project as the root directory of the web.
	4. Start the web server and configure it to listen on a port. Then the project will be accessible at the port on your host such as `localhost:80`.
	
## Configure

### Set the key
	1. Edit [/JS/modules/key.js](/JS/modules/key.js).
	2. Change `OPENAI-API-KEY` to your own key.
	
### Set the system
	1. Edit [/JS/config.js](/JS/config.js).
	2. Assign the path of the module you want to use to `mod_path`. You can also add your own module.
		This is a template of a module:
		```JavaScript
		export const system = {
				"role": "system",
				"content": `You are a ICS converter.
		You output plain text in ICS format according to user input messages without other text.
		You give a ICS file content of one event in each message.
		You have to give a summary.
		You should add the location and URL information if possible.
		You do not translate summary or memo or anything.
		If there are no information about year, consider as ${new Date().getFullYear()}.`
		};

		export const logit_bias = {
			"5297" : -0.5,
			"2949" : 0.5
		};

		export const temperature = 0;

		export const frequency_penalty = 2;
		export const presence_penalty = 2;
		```
		- **system**: Edit the `content` to tell the AI what should do.
		- **logit_bias**: Use this field to maake AI output more or less of certain tokens. The key must be a non-negative number representing a token, and the value should be between -100 and 100. Higher value make the AI use the token more frequently. Tokens can be found using [the tokenizer](https://platform.openai.com/tokenizer).
		- For More information on other parameters, see [official documentation](https://platform.openai.com/docs/api-reference/chat).

## Usage
	1. Open the URL (such as `localhost:80`) of your service in a web browser.
	2. Input some text in the textarea in the upper left conner.
	3. Click on submit.
	4. If the request gets a proper response, the browser will alert `OK`, and the content from the AI will be appended under the textarea.
	5. If the request gets an error, the browser will alert `Error: status - status text`.
	6. You can submit the next message whether the last one got `OK` or not. If the last message got `OK`, both the user input and the AI's response will be appended to the messages. Otherwise, the last user input will be delete.

## Contributing
You can report bugs or make feature requests through the issue, or fork the project and make your own version.
To report the bugs, please use the `bug` tag.
To request new feature, please use the `enhancement` tag.