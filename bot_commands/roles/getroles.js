const { SlashCommandBuilder } = require('discord.js');
const settingsHandler = require('../../settings_handler.js'); 
const cnst = require('../../constants.js');

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
		if (settings[cnst.ROLES.rp_master.VALUE] != undefined && Array.isArray(settings[cnst.ROLES.rp_master.VALUE]) == true){
			outputString = `${cnst.ROLES.rp_master.NAME}: ${settings[cnst.ROLES.rp_master.VALUE].join(", ")}`;
		}
		if (settings[cnst.ROLES.arbitrator.VALUE] != undefined && Array.isArray(settings[cnst.ROLES.arbitrator.VALUE]) == true){
			outputString += `\n${cnst.ROLES.arbitrator.NAME}: ${settings[cnst.ROLES.arbitrator.VALUE].join(", ")}`;
		}
		if (settings[cnst.ROLES.frac_head.VALUE] != undefined){
			outputString += `\nГлавы фракций:`;
			for (let head in settings[cnst.ROLES.frac_head.VALUE]){
				if (settings[cnst.ROLES.frac_head.VALUE][head] != ""){
					outputString += `\n${head}: ${settings[cnst.ROLES.frac_head.VALUE][head]}`;
				}
			}
		}

		await interaction.reply(outputString);
	}
};
