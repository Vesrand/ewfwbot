const { SlashCommandBuilder } = require('discord.js');
const settingsHandler = require('../../settings_handler.js'); 
const cnst = require('../../constants.js');

let oldValue = "";


module.exports = {
	data: new SlashCommandBuilder()
		.setName('clearrole')
		.setDescription('Привязать дискорд-пользователя к роли для бота')
		.addStringOption(option =>
			option
				.setName('role')
				.setDescription('Роль для бота')
				.setRequired(true)
				.addChoices(
					{ name: cnst.ROLES.rp_master.NAME, value: cnst.ROLES.rp_master.VALUE },
					{ name: cnst.ROLES.arbitrator.NAME, value: cnst.ROLES.arbitrator.VALUE },
					{ name: cnst.ROLES.frac_head.NAME, value: cnst.ROLES.frac_head.VALUE }
				))
		.addStringOption(option =>
			option
				.setName('fraction')
				.setDescription('Фракция (для роли главы фракции)')
				.addChoices(
					{ name: cnst.FRACTIONS.telvanni.NAME, value: cnst.FRACTIONS.telvanni.VALUE },
					{ name: cnst.FRACTIONS.redoran.NAME, value: cnst.FRACTIONS.redoran.VALUE },
					{ name: cnst.FRACTIONS.hlaalu.NAME, value: cnst.FRACTIONS.hlaalu.VALUE },
					{ name: cnst.FRACTIONS.temple.NAME, value: cnst.FRACTIONS.temple.VALUE },
					{ name: cnst.FRACTIONS.sixth.NAME, value: cnst.FRACTIONS.sixth.VALUE },
					{ name: cnst.FRACTIONS.imperial.NAME, value: cnst.FRACTIONS.imperial.VALUE },
					{ name: cnst.FRACTIONS.worm.NAME, value: cnst.FRACTIONS.worm.VALUE },
					{ name: cnst.FRACTIONS.mages.NAME, value: cnst.FRACTIONS.mages.VALUE },
					{ name: cnst.FRACTIONS.fighters.NAME, value: cnst.FRACTIONS.fighters.VALUE },
					{ name: cnst.FRACTIONS.thiefs.NAME, value: cnst.FRACTIONS.thiefs.VALUE },
					{ name: cnst.FRACTIONS.morag.NAME, value: cnst.FRACTIONS.morag.VALUE },
					{ name: cnst.FRACTIONS.roderika.NAME, value: cnst.FRACTIONS.roderika.VALUE }
				)),
	async execute(interaction) {
		//чтение входных данных
		let role = interaction.options.getString('role');
		if (!role || role == ""){
			await interaction.reply({ content: `Ошибка: необходимо указать роль для бота`, ephemeral: true });
			return;
		}
		let fraction = interaction.options.getString('fraction');
		
		// чтение настроек
		let settings = settingsHandler.getSettingsJson();
		oldValue = JSON.stringify(settings);
		if (settings == undefined) {
			await interaction.reply({ content: `Ошибка чтения дискорд-настроек`, ephemeral: true });
			return;
		}

        // очистка роли
		if (role == cnst.ROLES.frac_head.VALUE){ // для frac_head
			if (fraction != undefined && fraction != ""){
                if (settings.frac_head && settings.frac_head[fraction]){
                    delete settings.frac_head[fraction];
                }            
			}else{
				await interaction.reply({ content: `Ошибка: для роли главы фракции необходимо указать фракцию`, ephemeral: true });
				return;
			}
		}else{ // для остальных
			fraction = undefined; // обнуляем фракцию, чтобы введенный по ошибке параметр фракции не мешался в ответном сообщении
            if (settings[role]){
                delete settings[role];
            }            
        }

		// запись настроек
		let err = settingsHandler.setSettingsJson(settings);
		if (err){
			console.log(`ОШИБКА: метод setroleforuser, ошибка записи натроек: /n${err}`);
			await interaction.reply({ content: `Ошибка записи дискорд-настроек`, ephemeral: true });
			return;
		}

		// вывод результата
		console.log(`Удалена роль бота: ${cnst.ROLES[role].NAME}  ${fraction ? cnst.FRACTIONS[fraction].NAME : ""}`);
		await interaction.reply(`Удалена роль бота: ${cnst.ROLES[role].NAME}  ${fraction ? cnst.FRACTIONS[fraction].NAME : ""}`);
	},
	async undo(interaction){
		if (oldValue != ""){
			let err = settingsHandler.setSettingsJson(JSON.parse(oldValue));
			if (err){
				console.log(`ОШИБКА: undo для метода setroleforuser, ошибка записи натроек: /n${err}`);
				await interaction.reply({ content: `Ошибка записи дискорд-настроек`, ephemeral: true });
			}else{
				await interaction.reply(`Последнее изменение настройки ролей было отменено`);
			}
		}
	}
};
