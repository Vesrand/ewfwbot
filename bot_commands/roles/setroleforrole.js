const { SlashCommandBuilder } = require('discord.js');
const settingsHandler = require('../../settings_handler.js'); 
const cnst = require('../../constants.js');

let oldValue = "";


module.exports = {
	data: new SlashCommandBuilder()
		.setName('setroleforrole')
		.setDescription('Привязать дискорд-роль к роли для бота')
		.addRoleOption(option =>
			option
				.setName('discordrole')
				.setDescription('Дискорд-роль')
				.setRequired(true))
		.addStringOption(option =>
			option
				.setName('botrole')
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
		let discordRole = interaction.options.getRole('discordrole');
		if (!discordRole || discordRole.name == ""){
			await interaction.reply({ content: `Ошибка: необходимо указать дискорд-роль`, ephemeral: true });
			return;
		}
		let botrole = interaction.options.getString('botrole');
		if (!botrole || botrole == ""){
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

		// установка ролей
		if (botrole == "frac_head"){
			if (fraction != undefined && fraction != ""){
				if (settings.frac_head == undefined){
					settings.frac_head = {};
				}
				if (settings.frac_head[fraction] == undefined){
					settings.frac_head[fraction] = {};
				}
				if (settings.frac_head[fraction].dsRoles == undefined){
					settings.frac_head[fraction].dsRoles = [discordRole.name];
				}else{
					let foundUser = settings.frac_head[fraction].dsRoles.find(item => item == discordRole.name);
					if (!foundUser){
						settings.frac_head[fraction].dsRoles.push(discordRole.name);
					}else{
						await interaction.reply(`Отмена операции: дискорд-роли ${discordRole.name} уже назначена роль ${cnst.ROLES[botrole].NAME}`);
						return;
					}
				}
			}else{
				await interaction.reply({ content: `Ошибка: для роли главы фракции необходимо указать фракцию`, ephemeral: true });
				return;
			}
		}else{
			fraction = undefined; // обнуляем фракцию, чтобы введенный по ошибке параметр фракции не мешался в ответном сообщении
			if (settings[botrole] == undefined){
				settings[botrole] = {};
			}
			if (settings[botrole].dsRoles == undefined){
				settings[botrole].dsRoles = [discordRole.name];
			}else{
				let foundUser = settings[botrole].dsRoles.find(item => item == discordRole.name);
				if (!foundUser){
					settings[botrole].dsRoles.push(discordRole.name);
				}else{
					await interaction.reply(`Отмена операции: дискорд-роли ${discordRole.name} уже назначена роль ${cnst.ROLES[botrole].NAME}`);
					return;
				}
			}
		}

		// запись настроек
		let err = settingsHandler.setSettingsJson(settings);
		if (err){
			console.log(`ОШИБКА: метод setroleforrole, ошибка записи натроек: /n${err}`);
			await interaction.reply({ content: `Ошибка записи дискорд-настроек`, ephemeral: true });
			return;
		}

		// вывод результата
		console.log(`Для дискорд-роли ${discordRole.name} установлена роль бота: ${cnst.ROLES[botrole].NAME}  ${fraction ? cnst.FRACTIONS[fraction].NAME : ""}`);
		await interaction.reply(`Для дискорд-роли ${discordRole.name} установлена роль бота: ${cnst.ROLES[botrole].NAME}  ${fraction ? cnst.FRACTIONS[fraction].NAME : ""}`);
	},
	async undo(interaction){
		if (oldValue != ""){
			let err = settingsHandler.setSettingsJson(JSON.parse(oldValue));
			if (err){
				console.log(`ОШИБКА: undo для метода setroleforrole, ошибка записи натроек: /n${err}`);
				await interaction.reply({ content: `Ошибка записи дискорд-настроек`, ephemeral: true });
			}else{
				await interaction.reply(`Последнее изменение настройки ролей было отменено`);
			}
		}
	}
};
