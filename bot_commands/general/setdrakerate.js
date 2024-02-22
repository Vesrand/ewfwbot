const { SlashCommandBuilder } = require('discord.js');
const {GoogleSpreadsheet} = require('google-spreadsheet');
const {JWT} = require('google-auth-library');
const keys = require('../../service_acc.json'); 
const sheetConf = require('../../googlesheets_config.json'); 
if (process.argv[2] && process.argv[2] == "dev"){
	configPath = '../../dev_config.json';
}else{
	configPath = '../../config.json';
}
const config = require(configPath);

let oldValue = undefined;

module.exports = {
	data: new SlashCommandBuilder()
		.setName('setdrakerate')
		.setDescription('Изменить курс дрейка')
		.addNumberOption(option =>
			option
				.setName('new_rate')
				.setDescription('Новое значение курса дрейка')
				.setRequired(true)),
	async execute(interaction) {
		await interaction.deferReply(); // взаимодействие с google не всегда укладывается в отведенные 3 сек
		
		let newRate = interaction.options.getNumber('new_rate');
		if (!newRate || newRate <= 0){
			await interaction.reply({ content: `Ошибка: необходимо ввести числовое положительное значение курса дрейка`, ephemeral: true });
			return;
		}

		const serviceAccountAuth  = new JWT({
			email: keys.client_email,
			key: keys.private_key,
			scopes: ['https://www.googleapis.com/auth/spreadsheets'],
		});
		
		const doc = new GoogleSpreadsheet(config.googleSheetId, serviceAccountAuth);
	
		await doc.loadInfo();
		const sheet = doc.sheetsById[sheetConf.drake_rate.sheetId];
		await sheet.loadCells(sheetConf.drake_rate.address);
		const drakeRateCell = sheet.getCellByA1(sheetConf.drake_rate.address);
		oldValue = drakeRateCell.numberValue;
		drakeRateCell.numberValue = newRate;
		await sheet.saveUpdatedCells();
		
		console.log(`Курс дрейка изменен на ${newRate}`);
		await interaction.editReply(`Курс дрейка изменен на ${newRate}`);
	},
	async undo(interaction){
		await interaction.deferReply();
		if (oldValue == undefined){
			await interaction.reply("Отмена команды setdrakerate. Ошибка: Старое значение курса дрейка не было сохранено");
		}else{
			const serviceAccountAuth  = new JWT({
				email: keys.client_email,
				key: keys.private_key,
				scopes: ['https://www.googleapis.com/auth/spreadsheets'],
			});
			
			const doc = new GoogleSpreadsheet(config.googleSheetId, serviceAccountAuth);
		
			await doc.loadInfo();
			const sheet = doc.sheetsById[sheetConf.drake_rate.sheetId];
			await sheet.loadCells(sheetConf.drake_rate.address);
			const drakeRateCell = sheet.getCellByA1(sheetConf.drake_rate.address);
			drakeRateCell.numberValue = oldValue;
			await sheet.saveUpdatedCells();

			console.log(`Отмена команды setdrakerate. Курс дрейка был возвращен к значению ${oldValue}`);
			await interaction.editReply(`Отмена команды setdrakerate. Курс дрейка был возвращен к значению ${oldValue}`);
		}
	}
};
