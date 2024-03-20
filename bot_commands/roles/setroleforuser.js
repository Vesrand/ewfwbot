const { SlashCommandBuilder } = require('discord.js');
const {GoogleSpreadsheet} = require('google-spreadsheet');
const {JWT} = require('google-auth-library');
const settingsHandler = require('../../settings_handler.js'); 
if (process.argv[2] && process.argv[2] == "dev"){
	configPath = '../../dev_config.json';
}else{
	configPath = '../../config.json';
}
const config = require(configPath);
const cnst = require('../../constants.js');

let oldValue = "";


module.exports = {
	data: new SlashCommandBuilder()
		.setName('setroleforuser')
		.setDescription('Привязать дискорд-пользователя к роли для бота')
		.addUserOption(option =>
			option
				.setName('user')
				.setDescription('User')
				.setRequired(true))
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
		let targetUser = interaction.options.getUser('user');
		if (!targetUser || targetUser.username == ""){
			await interaction.reply({ content: `Ошибка: необходимо указать пользователя`, ephemeral: true });
			return;
		}
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
		// установка ролей
		if (role == "frac_head"){
			if (fraction != undefined && fraction != ""){
				if (settings.frac_head == undefined){
					settings.frac_head = {};
				}
				settings.frac_head[fraction] = targetUser.username;
			}else{
				await interaction.reply({ content: `Ошибка: для роли главы фракции необходимо указать фракцию`, ephemeral: true });
				return;
			}
		}else{
			if (settings[role] == undefined){
				settings[role] = [targetUser.username];
			}else{
				let foundUser = settings[role].find(item => item == targetUser.username);
				if (!foundUser){
					settings[role].push(targetUser.username);
				}else{
					await interaction.reply(`Отмена операции: пользователю ${targetUser.username} уже назначена роль ${role}`);
					return;
				}
			}
		}

		// запись настроек
		let err = settingsHandler.setSettingsJson(settings);
		if (err){
			console.log(`ОШИБКА: undo для метода setroleforuser, ошибка записи натроек: /n${err}`);
			await interaction.reply({ content: `Ошибка записи дискорд-настроек`, ephemeral: true });
			return;
		}

		// вывод результата
		console.log(`Для пользователя ${targetUser.username} установлена роль бота: ${cnst.ROLES[role].NAME}  ${oldValue.setFraction}`);
		await interaction.reply(`Для пользователя ${targetUser.username} установлена роль бота: ${cnst.ROLES[role].NAME}  ${oldValue.setFraction}`);
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
