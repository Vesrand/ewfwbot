// пустая команда, обрабатывается отдельно в главном файле
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('undo')
		.setDescription('Отмена последнего изменения'),
	async execute(interaction) {		
		console.log(`Ошибка, вызван execute метод Undo`);
		await interaction.reply(`Ошибка, вызван execute метод Undo`);
	},
	async undo(interaction){
		console.log(`Ошибка, вызван undo метод Undo`);
		await interaction.reply("Команда undo не имеет собственного режима отмены изменений");
	}
};
