const Discord = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
if (process.argv[2] && process.argv[2] == "dev"){
	configPath = './dev_config.json';
}else{
	configPath = './config.json';
}
const config = require(configPath);


const bot = new Discord.Client({ intents: [
    Discord.GatewayIntentBits.Guilds,
    Discord.GatewayIntentBits.GuildMessages,
    Discord.GatewayIntentBits.MessageContent,
    Discord.GatewayIntentBits.GuildMembers
]});

// Сбор команд из файлов
bot.commands = new Discord.Collection();
const foldersPath = path.join(__dirname, 'bot_commands');
const commandFolders = fs.readdirSync(foldersPath);
for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		if ('data' in command && 'execute' in command) {
			bot.commands.set(command.data.name, command); // Set a new item in the Collection with the key as the command name and the value as the exported module
		} else {
			console.log(`[WARNING] Команда в файле ${filePath} не содержит требуемых свойств "data" или "execute".`);
		}
	}
}


// 1. исполняется один раз при успешном запуске бота
bot.once(Discord.Events.ClientReady, function() {
    console.log(bot.user.username + " запустился!");
    console.log(`https://discord.com/api/oauth2/authorize?client_id=${config.clientId}&permissions=397284730944&scope=bot`);
});


// 2. реакция на команду
bot.on(Discord.Events.InteractionCreate, async interaction => {
    console.log(`команда получена ${interaction.commandName} от ${interaction.user.username}`);
    //проверки
    if (!interaction.isChatInputCommand()) return; //обрабатываем только слеш-команды на данный момент
	const command = interaction.client.commands.get(interaction.commandName);
    if (!command) {
		console.error(`Не найдено подходящей команды для ${interaction.commandName}.`);
		return;
	}

    //выполнение
	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'Произошла ошибка при выполнении команды', ephemeral: true });
		} else {
			await interaction.reply({ content: 'Произошла ошибка при выполнении команды', ephemeral: true });
		}
	}
});

// bot.on(Discord.Events.MessageCreate, (msg) => { // Реагирование на сообщения
//     console.log("команда получена" + msg.content);
// });
  
// 3. логин в дискорде
bot.login(config.token);