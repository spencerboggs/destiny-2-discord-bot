const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
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
        .setName('bestinslot')
        .setDescription('Get all rank 1 weapons across all categories.'),

    async execute(client, interaction) {
        const rank1Weapons = getRank1Weapons();

        if (rank1Weapons.length === 0) {
            return interaction.reply({ content: 'No rank 1 weapons found!', ephemeral: true });
        }

        let embed = new EmbedBuilder()
            .setTitle('All Rank 1 Weapons')
            .setDescription('Here are all the rank 1 weapons from all weapon categories:')
            .setColor("#FFD700");

        rank1Weapons.forEach(weapon => {
            const perkColumns = `__Column 1__ \n${weapon["PERKS Column 1"] || "N/A"}\n------------ \n__Column 2__ \n${weapon["Column 2"] || "N/A"}\n-------------------- - - - - -------------------- - - - - `;

            embed.addFields(
                { name: `**${weapon.Name}**`, value: `Tier: ${weapon.Tier} | Affinity: ${weapon["INFO Affinity"]}`, inline: false },
                { name: "Perks", value: perkColumns, inline: false }
            );
        });

        interaction.reply({ embeds: [embed] });
    }
};

function getRank1Weapons() {
    const rank1Weapons = [];

    for (const [category, weapons] of Object.entries(SHEETS)) {
        const rank1WeaponsInCategory = weapons.filter(w => w["TIER Rank"] === 1);
        rank1Weapons.push(...rank1WeaponsInCategory);
    }

    return rank1Weapons;
}
