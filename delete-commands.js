const { REST, Routes } = require('discord.js');
if (process.argv.length > 2 && process.argv[process.argv.length - 1] == "dev"){
	configPath = './dev_config.json';
}else{
	configPath = './config.json';
}
const { clientId, guildId, token } = require(configPath);

const rest = new REST().setToken(token);

// for guild-based commands
if (process.argv.length > 2 && process.argv[2] != "dev" && process.argv[2] != ""){
	rest.delete(Routes.applicationGuildCommand(clientId, guildId, process.argv[2]))
		.then(() => console.log('Successfully deleted all guild commands.'))
		.catch(console.error);
}else{
	rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: [] })
		.then(() => console.log('Successfully deleted all guild commands.'))
		.catch(console.error);
}

// for global commands
if (process.argv.length > 2 && process.argv[2] != "dev" && process.argv[2] != ""){
	rest.delete(Routes.applicationCommand(clientId, 'commandId'))
		.then(() => console.log('Successfully deleted all application commands.'))
		.catch(console.error);
}else{
	rest.put(Routes.applicationCommands(clientId), { body: [] })
		.then(() => console.log('Successfully deleted all application commands.'))
		.catch(console.error);
}
