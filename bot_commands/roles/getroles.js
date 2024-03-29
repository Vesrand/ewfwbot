const { SlashCommandBuilder } = require('discord.js');
const settingsHandler = require('../../settings_handler.js'); 
const cnst = require('../../constants.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('getroles')
		.setDescription('Получить полный список назначенных ролей'),
	async execute(interaction) {	
		let settings = settingsHandler.getSettingsJson(); // если файла не существовало, он будет создан
		if (settings == undefined) {
			await interaction.reply({ content: `Ошибка чтения дискорд-настроек`, ephemeral: true });
			return;
		}

		let outputString = "";
		for (let role in settings){ //РП-мастер и арбитр
			if (role != cnst.ROLES.frac_head.VALUE && role != cnst.CHATS.chats_settings.VALUE){
				outputString += `__**${cnst.ROLES[role].NAME}**__ ${getUsersRolesString(settings[role])}\n`;
			}
		}
		if (settings[cnst.ROLES.frac_head.VALUE]){ //главы фракций
			outputString += `__**${cnst.ROLES.frac_head.NAME}**__\n`;
			for (let fracHead in settings[cnst.ROLES.frac_head.VALUE]){
				outputString += `- __**${cnst.FRACTIONS[fracHead].NAME}**__ ${getUsersRolesString(settings.frac_head[fracHead])}\n`;
			}
		}
		if (settings[cnst.CHATS.chats_settings.VALUE]){ // настройки чатов
			outputString += `\n__**${cnst.CHATS.chats_settings.NAME}**__\n`;
			for (let chat in settings[cnst.CHATS.chats_settings.VALUE]){
				if (chat == cnst.CHATS.chronicles.VALUE){
					outputString += `- __**${cnst.CHATS.chronicles.NAME}**__ ${settings.chats_settings.chronicles}\n`; // летопись
				}else{
					outputString += `- __**${cnst.FRACTIONS[chat].NAME}**__ ${settings.chats_settings[chat]}\n`; // фракционные чаты
				}
			}
		}

		if (outputString != ""){
			await interaction.reply(outputString);
		}else{			
			await interaction.reply("На данный момент ни одной роли не задано");
		}
	}
};

function getUsersRolesString(inRole){
	let outString = "";

	if (inRole.dsUsers && Array.isArray(inRole.dsUsers)){
		outString += ` *Дискорд-пользователи:* ${inRole.dsUsers.join(", ")}`;
	}
	if (inRole.dsRoles && Array.isArray(inRole.dsRoles)){
		outString += ` *Дискорд-роли:* ${inRole.dsRoles.join(", ")}`;
	}

	return outString;
}