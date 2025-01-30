const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Get info on all commands.'),
    async execute(client, interaction) {
        let embed = new EmbedBuilder()
            .setTitle('All Commands')
            .setDescription('Here are all the commands available:')
            .setColor("#FFD700");
        embed.addFields(
            { name: '**/refreshdata**', value: 'Refresh the data for all weapons.' },
            { name: '**/weapon**', value: 'Get info on a specific weapon in the spreadsheet.' },
            { name: '**/bestinslot**', value: 'Get all rank 1 weapons across all categories.' },
            { name: '**/top**', value: 'Get the top 5 weapons for a given category.' },
            { name: '**/ideal**', value: 'Get the ideal roll for a given weapon.' },
            { name: '**/spreadsheet**', value: 'Get the link to the original spreadsheet.' },
        );
        embed.setFooter({ text: 'Created by Spencer Boggs' });
        interaction.reply({ embeds: [embed] });
    }
};


        