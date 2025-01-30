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
        .setName('weapon')
        .setDescription('Get information about a specific weapon.')
        .addStringOption(option =>
            option.setName('name')
                .setDescription('The name of the weapon')
                .setRequired(true)
        ),

    async execute(client, interaction) {
        const weaponName = interaction.options.getString('name');

        if (weaponName.toLowerCase().startsWith("ideal")) {
            return interaction.reply({ content: `Please use the \`/ideal\` command to get ideal weapon stats.`, ephemeral: true });
        }

        let foundWeapon = null;
        let category = "";

        for (const [sheet, weapons] of Object.entries(SHEETS)) {
            const weapon = weapons.find(w => w.Name.toLowerCase() === weaponName.toLowerCase());
            if (weapon) {
                foundWeapon = weapon;
                category = sheet;
                break;
            }
        }

        if (!foundWeapon) {
            return interaction.reply({ content: `Weapon **${weaponName}** not found!`, ephemeral: true });
        }

        let embed = new EmbedBuilder()
            .setTitle(`**${foundWeapon.Name}**`)
            .setDescription(`Category: **${category}**`)
            .setColor("#FFD700")
            .addFields(

                { name: "Weapon Frame", value: String(foundWeapon["Frame"]) || "Unknown", inline: true },
                { name: "Weapon Affinity", value: String(foundWeapon["INFO Affinity"]) || "Unknown", inline: true },
                { name: "Origin Trait", value: String(foundWeapon["Origin Trait"]) || "N/A", inline: true },

                { name: " ", value: "----------------------- - - - - ----------------------- - - - - ----------------------- - - - - ", inline: false },

                { name: "Perk Column 1", value: String(foundWeapon["PERKS Column 1"]) || "N/A", inline: true },
                { name: "Perk Column 2", value: String(foundWeapon["Column 2"]) || "N/A", inline: true },
                { name: "Enhanceable?", value: String(foundWeapon["Enhance"]) || "N/A", inline: true },

                { name: " ", value: "----------------------- - - - - ----------------------- - - - - ----------------------- - - - - ", inline: false },

                { name: "Weapon Tier", value: String(foundWeapon["Tier"]) || "N/A", inline: true },
                { name: "Weapon Rank", value: String(foundWeapon["TIER Rank"]) || "N/A", inline: true },

        )
            

        interaction.reply({ embeds: [embed] });
    }
};
