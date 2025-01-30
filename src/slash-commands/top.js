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
        .setName('top')
        .setDescription('Get top tier weapons based on selected criteria'),

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

                const row2 = new ActionRowBuilder().addComponents(
                    new StringSelectMenuBuilder()
                        .setCustomId('tierType')
                        .setPlaceholder('Select Sorting Method')
                        .addOptions(
                            { label: 'S Tier', value: 'S' },
                            { label: 'Affiliation', value: 'Affiliation' }
                        )
                );

                await i.update({
                    content: `Weapon Type: ${weaponSelection}.\n**Now select the sorting method.**`,
                    components: [row2]
                });
            }

            if (i.isStringSelectMenu() && i.customId === 'tierType') {
                const tierSelection = i.values[0];

                let results = [];
                if (tierSelection === 'S') {
                    results = getWeaponsByTier(weaponSelection, 'S');
                } else if (tierSelection === 'Affiliation') {
                    results = getTopAffiliationWeapons(weaponSelection);
                }

                let embed = new EmbedBuilder()
                    .setTitle(`Top Weapons: ${weaponSelection} - ${tierSelection}`)
                    .setDescription(`Here are the top weapons based on your selection:`)
                    .setColor("#FFD700");

                results.forEach(weapon => {
                    if (weapon.Name.toLowerCase().includes("ideal")) return;

                    embed.addFields(
                        { name: `**${weapon.Name}**`, value: `Tier: ${weapon.Tier} | Affinity: ${weapon["INFO Affinity"]}`, inline: false },
                        { name: "Perk Column 1", value: weapon["PERKS Column 1"] || "N/A", inline: true },
                        { name: "Perk Column 2", value: weapon["Column 2"] || "N/A", inline: true },
                        { name: " ", value: "-------------------- - - - - -------------------- - - - - ", inline: false }
                    );
                });

                await i.update({
                    content: `You selected Weapon Type: ${weaponSelection}, Tier Type: ${tierSelection}`,
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

function getAffiliations(category) {
    const affiliations = ["Solar", "Arc", "Void", "Stasis", "Strand", "Kinetic"];
    let availableAffiliations = [];
    const weapons = SHEETS[category];

    affiliations.forEach(aff => {
        if (weapons.some(w => w["INFO Affinity"] === aff)) {
            availableAffiliations.push(aff);
        }
    });

    return availableAffiliations;
}

function getWeaponsByTier(category, tier) {
    return SHEETS[category].filter(w => w.Tier === tier && !w.Name.toLowerCase().includes("ideal"));
}

function getTopAffiliationWeapons(category) {
    const affiliations = ["Solar", "Arc", "Void", "Stasis", "Strand", "Kinetic"];
    let topWeapons = [];

    affiliations.forEach(aff => {
        const weapon = SHEETS[category].filter(w => w["INFO Affinity"] === aff && !w.Name.toLowerCase().includes("ideal"))
            .sort((a, b) => b.TIER_RANK - a.TIER_RANK)[0];
        if (weapon) {
            topWeapons.push(weapon);
        }
    });

    return topWeapons;
}
