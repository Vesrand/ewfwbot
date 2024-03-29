const Discord = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
const settingsHandler = require('./settings_handler.js'); 
if (process.argv[2] && process.argv[2] == "dev"){
	configPath = './dev_config.json';
}else{
	configPath = './config.json';
}
const config = require(configPath);


const bot = new Discord.Client({ intents: [
    Discord.GatewayIntentBits.Guilds,
    // Discord.GatewayIntentBits.GuildMessages,
    // Discord.GatewayIntentBits.MessageContent,
    // Discord.GatewayIntentBits.GuildMembers
]});
let lastCommandName = "";

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

	let command = interaction.client.commands.get(interaction.commandName);
	if (interaction.commandName == "undo"){
		if(lastCommandName == ""){
			interaction.reply("Отсутствует запись о последней команде");
			return;
		}
		command = interaction.client.commands.get(lastCommandName);
	}
    if (!command) {
		console.error(`Не найдено подходящей команды для ${interaction.commandName}.`);
		return;
	}

	//проверка полномочий
	let userHasPermission = false;
	if (interaction.member.permissions.has(Discord.PermissionsBitField.Flags.Administrator)){
		//администраторы имеют полный доступ
		userHasPermission = true;
	}else{		
		const permissions = require('./permissions.json');
		let roleArr = [];
		if (interaction.commandName != "undo"){
			roleArr = permissions[interaction.commandName];
		}else{
			roleArr = permissions[lastCommandName];
		}
		userHasPermission = settingsHandler.checkCommandHasPermission(interaction, roleArr);
	}

    //выполнение
	if (userHasPermission == true){
		try {
			if (interaction.commandName == "undo"){
				if (command.undo != undefined){
					await command.undo(interaction);
				}else{
					interaction.reply(`Не определен метод undo для команды ${interaction.commandName}`);
				}
				lastCommandName = ""; // после undo в любом случае очищаем историю
			}else{
				await command.execute(interaction);
				if (command.undo != undefined){
					lastCommandName = interaction.commandName; // если есть режим undo - сохраняем историю
				}else if (interaction.commandName == 'getroles'){
					// ничего не делаем, команда getroles не влияет на undo
				}else{
					lastCommandName = ""; // если команда не имеет режима undo очищаем историю во избежание непредсказуемых отмен
				}
			}
		} catch (error) {
			console.error(error);
		}
	}else{
		interaction.reply({ content: `У вас нет прав на выполнение команды ${interaction.commandName}`, ephemeral: true });
	}
});

  
// 3. логин в дискорде
bot.login(config.token);