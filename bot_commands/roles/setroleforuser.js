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

let oldValue = {
	user: "",
	role: "",
	fraction: ""
}
const roleNames = {
	rp_master: "РП-мастер",
	arbitrator: "Арбитр",
	frac_head: "Глава Фракции",
}


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
					{ name: 'РП-мастер', value: 'rp_master' },
					{ name: 'Арбитр', value: 'arbitrator' },
					{ name: 'Глава Фракции', value: 'frac_head' },
				))
		.addStringOption(option =>
			option
				.setName('fraction')
				.setDescription('Фракция (для роли главы фракции)')
				.addChoices(
					{ name: 'Телванни', value: 'telvanni' },
					{ name: 'Редоран', value: 'redoran' },
					{ name: 'Хлаалу', value: 'hlaalu' },
					{ name: 'Храм', value: 'temple' },
					{ name: 'Шестой Дом', value: 'sixth' },
					{ name: 'Империя', value: 'imperial' },
					{ name: 'Культ Червя', value: 'worm' },
					{ name: 'Гильдия Магов', value: 'mages' },
					{ name: 'Гильдия Бойцов', value: 'fighters' },
					{ name: 'Гильдия Воров', value: 'thiefs' },
					{ name: 'Мораг Тонг', value: 'morag' },
					{ name: 'Двор Родерики', value: 'roderika' },
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
		oldValue.user = targetUser.username;
		oldValue.role = role;
		oldValue.fraction = fraction ? fraction : "";
		
		// чтение настроек
		let settings = settingsHandler.getSettingsJson();
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
			await interaction.reply({ content: `Ошибка записи дискорд-настроек`, ephemeral: true });
			return;
		}

		// вывод результата
		console.log(`Для пользователя ${targetUser.username} установлена роль бота: ${roleNames[role]}  ${oldValue.fraction}`);
		await interaction.reply(`Для пользователя ${targetUser.username} установлена роль бота: ${roleNames[role]}  ${oldValue.fraction}`);
	},
	async undo(interaction){
		if (oldValue.user == undefined || oldValue.user == "" || oldValue.role == undefined || oldValue.role == ""){
			await interaction.reply("Отмена команды setroleforuser. Ошибка: Значение до изменения не было сохранено");
		}else{

			// чтение настроек
			let settings = settingsHandler.getSettingsJson();
			if (settings == undefined) {
				await interaction.reply({ content: `Ошибка чтения дискорд-настроек`, ephemeral: true });
				return;
			}
			if (settings[oldValue.role] == undefined) {
				await interaction.reply({ content: `Ошибка: в настройках ролей не найдено записи для указанной роли`, ephemeral: true });
				return;
			}
			
			// удаление указанного пользователя из роли
			let deletedUser = undefined; // по этой переменной поймем, удалось ли удаление
			if (oldValue.role == "frac_head"){
				for (let head in settings["frac_head"]){
					if (settings["frac_head"][head] == oldValue.user){
						deletedUser = settings["frac_head"][head];
						settings["frac_head"][head] = "";
					}
				}
			}else{
				for (let i=0; i < settings[oldValue.role].length; i++){
					if (settings[oldValue.role][i] == oldValue.user){
						deletedUser = settings[oldValue.role].splice(i,1);
					}
				}
			}

			// сохранение настроек и вывод результата
			if (deletedUser && deletedUser == oldValue.user){
				let err = settingsHandler.setSettingsJson(settings);
				if (err){
					await interaction.reply({ content: `Ошибка записи дискорд-настроек`, ephemeral: true });
					return;
				}
				console.log(`Для пользователя ${oldValue.user} удалена роль бота: ${oldValue.role} ${oldValue.fraction}`);
				await interaction.reply(`Для пользователя ${oldValue.user} удалена роль бота: ${oldValue.role} ${oldValue.fraction}`);
			}else{
				await interaction.reply({ content: `Ошибка: для роли ${oldValue.role} не найдена запись пользователя ${oldValue.user}`, ephemeral: true });
			}
		}
	}
};
