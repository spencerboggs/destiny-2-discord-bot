const { SlashCommandBuilder } = require('@discordjs/builders');
const { ActionRowBuilder, StringSelectMenuBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');

const SHEETS = {
    "Shotguns": require("../data/Shotguns.json"),
    "Snipers": require("../data/Snipers.json"),
    "Fusions": require("../data/Fusions.json"),
    "BGLs": require("../data/BGLs.json"),
    "Glaives": require("../data/Glaives.json"),
    "Traces": require("../data/Traces.json"),
    "Rocket_Sidearms": require("../data/Rocket_Sidearms.json"),
    "LMGs": require("../data/LMGs.json"),
    "HGLs": require("../data/HGLs.json"),
    "Swords": require("../data/Swords.json"),
    "Rockets": require("../data/Rockets.json"),
    "LFRs": require("../data/LFRs.json")
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ideal')
        .setDescription('Get all "Ideal" weapons based on selected weapon type'),

    async execute(client, interaction) {
        const weaponTypeMenu = new StringSelectMenuBuilder()
            .setCustomId('weaponType')
            .setPlaceholder('Select Weapon Type')
            .addOptions(
                { label: 'Shotguns', value: 'Shotguns' },
                { label: 'Snipers', value: 'Snipers' },
                { label: 'Fusions', value: 'Fusions' },
                { label: 'BGLs', value: 'BGLs' },
                { label: 'Glaives', value: 'Glaives' },
                { label: 'Traces', value: 'Traces' },
                { label: 'LMGs', value: 'LMGs' },
                { label: 'HGLs', value: 'HGLs' },
                { label: 'Swords', value: 'Swords' },
                { label: 'Rockets', value: 'Rockets' },
                { label: 'LFRs', value: 'LFRs' }
            );

        const row1 = new ActionRowBuilder().addComponents(weaponTypeMenu);

        await interaction.reply({
            content: '**Select your weapon type.**',
            components: [row1]
        });

        const filter = i => i.user.id === interaction.user.id;
        const collector = interaction.channel.createMessageComponentCollector({ filter, time: 15000 });

        let weaponSelection = null;

        collector.on('collect', async i => {
            if (i.isStringSelectMenu() && i.customId === 'weaponType') {
                weaponSelection = i.values[0];

                const idealWeapons = getIdealWeapons(weaponSelection);

                if (idealWeapons.length === 0) {
                    return await i.update({ content: `No "Ideal" weapons found in the **${weaponSelection}** category.`, components: [] });
                }

                let embed = new EmbedBuilder()
                    .setTitle(`Ideal Weapons: ${weaponSelection}`)
                    .setDescription(`Here are all the "Ideal" weapons in the selected category:`)
                    .setColor("#FFD700");

                idealWeapons.forEach(weapon => {
                    embed.addFields(
                        { name: `**${weapon.Name}**`, value: `Affinity: ${weapon["INFO Affinity"]}`, inline: false },
                        { name: "Weapon Frame", value: String(weapon["Frame"]) || "Unknown", inline: true },
                        { name: "Weapon Affinity", value: String(weapon["INFO Affinity"]) || "Unknown", inline: true },
                        { name: "Origin Trait", value: String(weapon["Origin Trait"]) || "N/A", inline: true },

                        { name: " ", value: "----------------------- - - - - ----------------------- - - - - ----------------------- - - - - ", inline: false },

                        { name: "Perk Column 1", value: String(weapon["PERKS Column 1"]) || "N/A", inline: true },
                        { name: "Perk Column 2", value: String(weapon["Column 2"]) || "N/A", inline: true },


                        { name: " ", value: "------------------------------------------------------------------------------------------", inline: false },
                    );
                });

                await i.update({
                    content: `You selected Weapon Type: ${weaponSelection}`,
                    embeds: [embed],
                    components: []
                });

                collector.stop();
            }
        });

        collector.on('end', collected => {
            if (collected.size === 0) {
                interaction.followUp({ content: 'No selection made, please try again.', ephemeral: true });
            }
        });
    }
};

function getIdealWeapons(category) {
    return SHEETS[category].filter(w => w.Name === "Ideal");
}
