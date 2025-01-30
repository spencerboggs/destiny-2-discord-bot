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
        .setName('wishlist')
        .setDescription('Add, remove, or view your wish list.')
        .addSubcommand(subcommand =>
            subcommand
                .setName('add')
                .setDescription('Add a weapon to your wish list.')
                .addStringOption(option =>
                    option.setName('name')
                        .setDescription('The name of the weapon')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove')
                .setDescription('Remove a weapon from your wish list.')
                .addStringOption(option =>
                    option.setName('name')
                        .setDescription('The name of the weapon')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('view')
                .setDescription('View your wish list.')

                .addBooleanOption(option =>
                    option.setName('public')
                        .setDescription('By default, viewing your wish list will be private.')
                        .setRequired(false)
            )    
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('clear')
                .setDescription('Clear your wish list.')
                .addBooleanOption(option =>
                    option.setName('confirm')
                        .setDescription('Confirm that you want to clear your wish list.')
                        .setRequired(false)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('help')
                .setDescription('Get help with the wish list command.')
    ),
    
    
    async execute(client, interaction) {
        const subcommand = interaction.options.getSubcommand();
        const username = interaction.user.username;

        if (!fs.existsSync(__dirname + '/../wishlists')) {
            fs.mkdirSync(__dirname + '/../wishlists');
        }

        if (!fs.existsSync(__dirname + `/../wishlists/${username}.json`)) {
            fs.writeFileSync(__dirname + `/../wishlists/${username}.json`, JSON.stringify([], null, 2));
        }

        const wishListPath = __dirname + `/../wishlists/${username}.json`;
        // const wishList = require(wishListPath);
        const wishList = JSON.parse(fs.readFileSync(wishListPath, 'utf8'));
        
        if (subcommand === 'add') {
            const weaponName = interaction.options.getString('name');
            let foundWeapon = null;
            let category = "";

            if (wishList.length >= 20) {
                return interaction.reply({ content: `You have reached the maximum of 20 weapons in your wish list.`, flags: 64 });
            }

            for (const [sheet, weapons] of Object.entries(SHEETS)) {
                const weapon = weapons.find(w => w.Name.toLowerCase() === weaponName.toLowerCase());
                if (weapon) {
                    foundWeapon = weapon;
                    category = sheet;
                    break;
                }

                const weaponStart = weapons.find(w => w.Name.toLowerCase().startsWith(weaponName.toLowerCase()));
                if (weaponStart) {
                    foundWeapon = weaponStart;
                    category = sheet;
                    break;
                }
            }

            if (!foundWeapon) {
                return interaction.reply({ content: `Weapon **${weaponName}** not found!`, flags: 64 });
            }

            if (wishList.some(w => w.Name.toLowerCase() === weaponName.toLowerCase())) {
                return interaction.reply({ content: `Weapon **${weaponName}** is already in your wish list.`, flags: 64 });
            }

            foundWeapon.Category = category.slice(0, -1);

            wishList.push(foundWeapon);
            fs.writeFileSync(wishListPath, JSON.stringify(wishList, null, 2));
            return interaction.reply({ content: `Weapon **${foundWeapon.Name}** added to your wish list.`, flags: 64 });

        } else if (subcommand === 'remove') {
            const weaponName = interaction.options.getString('name');
            let index = wishList.findIndex(w => w.Name.toLowerCase() === weaponName.toLowerCase());

            if (index === -1) {
                const weaponStart = wishList.findIndex(w => w.Name.toLowerCase().startsWith(weaponName.toLowerCase()));
                if (weaponStart !== -1) {
                    index = weaponStart;
                }
            }

            if (index === -1) {
                return interaction.reply({ content: `Weapon **${weaponName}** not found in your wish list.`, flags: 64 });
            }

            const removedWeapon = wishList.splice(index, 1);
            fs.writeFileSync(wishListPath, JSON.stringify(wishList, null, 2));
            return interaction.reply({ content: `Weapon **${removedWeapon[0].Name}** removed from your wish list.`, flags: 64 });
            
        } else if (subcommand === 'view') {
            let embed = new EmbedBuilder()
                .setTitle(`Your Wish List`)
                .setColor("#FFD700");
            if (wishList.length === 0) {
                embed.setDescription("Your wish list is empty.");
                embed.addFields(
                    { name: "Add a weapon", value: "Use `/wishlist add` to add a weapon to your wish list." }
                );
                embed.setFooter({ text: 'This message will be private until weapons are added to your list.' });
                return interaction.reply({ embeds: [embed], flags: 64 });
            }
            wishList.forEach((weapon, index) => {
                const inline = (wishList.length) % 2 === 0 || (wishList.length) % 3 === 0 || (wishList.length - 1) % 3 === 0 || wishList.length >= 10;
                let seperator = "\n";
                if (wishList.some(w => w.Name.includes("\n")) && wishList.some(w => w.Name.includes("\n") && w.Name !== weapon.Name)) {
                    seperator = "\n\n";
                }
                embed.addFields({
                    name: weapon.Name,
                    value: `${weapon["INFO Affinity"]} ${weapon.Category}\nRank: ${weapon["TIER Rank"]} | Tier: ${weapon.Tier} ${seperator} ----------------------`,
                    inline: inline
                });
            });


            const isPublic = interaction.options.getBoolean('public');
            
            if (isPublic) {
                return interaction.reply({ embeds: [embed] });
            }
            return interaction.reply({ embeds: [embed], flags: 64 });

            
        } else if (subcommand === 'clear') {
            const confirm = interaction.options.getBoolean('confirm');
            if (!confirm) {
                return interaction.reply({ content: `Please confirm that you want to clear your wish list.`, flags: 64 });
            }

            fs.writeFileSync(wishListPath, JSON.stringify([], null, 2));
            return interaction.reply({ content: `Your wish list has been cleared.`, flags: 64 });

        } else if (subcommand === 'help') {
            let embed = new EmbedBuilder()
                .setTitle(`Wish List Command Help`)
                .setColor("#FFD700");
            embed.addFields(
                { name: "**/wishlist add**", value: "Add a weapon to your wish list." },
                { name: "**/wishlist remove**", value: "Remove a weapon from your wish list." },
                { name: "**/wishlist view**", value: "View your wish list." },
                { name: "**/wishlist clear**", value: "Clear your wish list." }
            );
            return interaction.reply({ embeds: [embed] });
        }

    }
};