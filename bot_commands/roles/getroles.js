const { SlashCommandBuilder } = require('discord.js');
const settingsHandler = require('../../settings_handler.js'); 

module.exports = {
	data: new SlashCommandBuilder()
		.setName('getroles')
		.setDescription('Получить полный список назначенных ролей'),
	async execute(interaction) {		
		let settings = settingsHandler.getSettingsJson();
		if (settings == undefined) {
			await interaction.reply({ content: `Ошибка чтения дискорд-настроек`, ephemeral: true });
			return;
		}

		let outputString = "";
		if (settings["rp_master"] != undefined && Array.isArray(settings["rp_master"]) == true){
			outputString = `РП-мастер: ${settings["rp_master"].join(", ")}`;
		}
		if (settings["arbitrator"] != undefined && Array.isArray(settings["arbitrator"]) == true){
			outputString += `\nАрбитр: ${settings["arbitrator"].join(", ")}`;
		}
		if (settings["frac_head"] != undefined){
			outputString += `\nГлавы фракций:`;
			for (let head in settings["frac_head"]){
				outputString += `\n${head}: ${settings["frac_head"][head]}`;
			}
		}

		await interaction.reply(outputString);
	}
};
