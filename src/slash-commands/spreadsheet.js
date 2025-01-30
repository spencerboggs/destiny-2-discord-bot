const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('spreadsheet')
        .setDescription('Get the link to the original spreadsheet.'),
    async execute(client, interaction) {
        let embed = new EmbedBuilder()
            .setTitle('Link to Orignial Spreadsheet')
            .setColor("#FFD700")
            .setURL('https://docs.google.com/spreadsheets/d/1JM-0SlxVDAi-C6rGVlLxa-J1WGewEeL8Qvq4htWZHhY/edit?gid=346832350#gid=346832350');
    
        embed.setFooter({ text: 'Created by Spencer Boggs' });
        interaction.reply({ embeds: [embed] });
    }
};
