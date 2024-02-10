const { REST, Routes } = require('discord.js');
if (process.argv[2] && process.argv[2] == "dev"){
	configPath = './dev_config.json';
}else{
	configPath = './config.json';
}
const { clientId, guildId, token } = require(configPath);

const rest = new REST().setToken(token);

// for guild-based commands
// rest.delete(Routes.applicationGuildCommand(clientId, guildId, 'commandId'))
rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: [] })
	.then(() => console.log('Successfully deleted all guild commands.'))
	.catch(console.error);

// for global commands
// rest.delete(Routes.applicationCommand(clientId, 'commandId'))
rest.put(Routes.applicationCommands(clientId), { body: [] })
	.then(() => console.log('Successfully deleted all application commands.'))
	.catch(console.error);
