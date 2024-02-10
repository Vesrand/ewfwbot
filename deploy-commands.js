const { REST, Routes } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
let configPath = "";
if (process.argv[2] && process.argv[2] == "dev"){
	configPath = './dev_config.json';
}else{
	configPath = './config.json';
}
const { clientId, guildId, token } = require(configPath);

const commands = [];
// Grab all the command folders from the commands directory you created earlier
const foldersPath = path.join(__dirname, 'bot_commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	// Grab all the command files from the commands directory you created earlier
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	// Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		if ('data' in command && 'execute' in command) {
			commands.push(command.data.toJSON());
		} else {
			console.log(`[WARNING] Команда в файле ${filePath} не содержит требуемых свойств "data" или "execute".`);
		}
	}
}

const rest = new REST().setToken(token);

(async () => {
	try {
		console.log(`Начинается обновление ${commands.length} слеш-команд.`);

		const data = await rest.put(
			Routes.applicationGuildCommands(clientId, guildId), // Routes.applicationCommands(clientId), - вариант для регистрации глобально
			{ body: commands },
		);

		console.log(`Успешно перезагружено ${data.length} слеш-команд.`);
	} catch (error) {
		console.error(error);
	}
})();
