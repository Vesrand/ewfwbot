const { SlashCommandBuilder } = require('discord.js');
const settingsHandler = require('../../settings_handler.js'); 
const cnst = require('../../constants.js');

let oldValue = "";


module.exports = {
	data: new SlashCommandBuilder()
		.setName('setchat')
		.setDescription('Привязать дискорд-пользователя к роли для бота')
		.addStringOption(option =>
			option
				.setName('chattype')
				.setDescription('Тип чата')
				.setRequired(true)
				.addChoices(
					{ name: cnst.CHATS.chronicles.NAME, value: cnst.CHATS.chronicles.VALUE },
					{ name: cnst.CHATS.frac_chat.NAME, value: cnst.CHATS.frac_chat.VALUE }
				))
		.addStringOption(option =>
			option
				.setName('fraction')
				.setDescription('Фракция (для чата фракции)')
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
		let chattype = interaction.options.getString('chattype');
		if (!chattype || chattype == ""){
			await interaction.reply({ content: `Ошибка: необходимо указать тип чата`, ephemeral: true });
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

		// установка настроек чата
        if (settings.chats_settings == undefined){
            settings.chats_settings = {};
        }
        for (let chat in settings.chats_settings){ // проверяем был ли текущий чат уже установлен для другой фракции и удаляем старое значение
            if (settings.chats_settings[chat] == interaction.channel.name){
                delete settings.chats_settings[chat];
            }
        }
        if (chattype == cnst.CHATS.frac_chat.VALUE){
            if (fraction != undefined && fraction != ""){
                settings.chats_settings[fraction] = interaction.channel.name;
            }else{
                await interaction.reply({ content: `Ошибка: для чата фракции необходимо указать фракцию`, ephemeral: true });
                return;
            }
        }else{ // случай для летописи
			fraction = undefined; // обнуляем фракцию, чтобы введенный по ошибке параметр фракции не мешался в ответном сообщении
            settings.chats_settings.chronicles = interaction.channel.name;
        }

		// запись настроек
		let err = settingsHandler.setSettingsJson(settings);
		if (err){
			console.log(`ОШИБКА: метод setchat, ошибка записи натроек: /n${err}`);
			await interaction.reply({ content: `Ошибка записи дискорд-настроек`, ephemeral: true });
			return;
		}

		// вывод результата
		console.log(`Чат ${interaction.channel.name} установлен как: ${cnst.CHATS[chattype].NAME}  ${fraction ? cnst.FRACTIONS[fraction].NAME : ""}`);
		await interaction.reply(`Чат ${interaction.channel.name} установлен как: ${cnst.CHATS[chattype].NAME}  ${fraction ? cnst.FRACTIONS[fraction].NAME : ""}`);
	},
	async undo(interaction){
		if (oldValue != ""){
			let err = settingsHandler.setSettingsJson(JSON.parse(oldValue));
			if (err){
				console.log(`ОШИБКА: undo для метода setchat, ошибка записи натроек: /n${err}`);
				await interaction.reply({ content: `Ошибка записи дискорд-настроек`, ephemeral: true });
			}else{
				await interaction.reply(`Последнее изменение настройки ролей было отменено`);
			}
		}
	}
};
