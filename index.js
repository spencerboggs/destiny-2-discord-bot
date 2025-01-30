const { SlashCommandBuilder } = require('@discordjs/builders');
const Discord = require('discord.js');
/**
 * @fileoverview Destiny 2 Endgame Analysis Bot
 * Copyright (c) 2025 Spencer Boggs
 */

require('dotenv').config();
const { Client, GatewayIntentBits, Collection, REST, Routes, ActivityType } = require("discord.js");
const fs = require("fs");
const path = require('path');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ]
});

client.slashCommands = new Collection();
const slashCommands = [];
const commandSlashFiles = fs.readdirSync('./src/slash-commands').filter(file => file.endsWith(".js"));

for (const file of commandSlashFiles) {
    const command = require(`./src/slash-commands/${file}`);

    if (!command.data || !command.data.name) {
        console.error(`Command file ${file} is missing a valid 'data' property with 'name'.`);
        continue;
    }

    client.slashCommands.set(command.data.name, command);
    slashCommands.push(command.data.toJSON());
}

client.once("ready", async () => {
    console.clear();
    console.log("\x1b[1mDestiny 2 Endgame Analysis Bot IS ONLINE!\x1b[0m\n");

    client.user.setPresence({
        activities: [{ name: `Destiny 2 Endgame Analysis`, type: ActivityType.Playing }],
        status: 'dnd'
    });

    const today = new Date();
    const date = today.toISOString().split("T")[0];
    const time = today.toTimeString().split(" ")[0];
    console.log(`Online since: ${date} at ${time}\n`);

    console.log(`Current Server Count: ${client.guilds.cache.size}`);
    client.guilds.cache.forEach(guild => {
        console.log(` - ${guild.name} (${guild.id}) - ${guild.memberCount} members`);
    });

    const clientId = process.env.CLIENT_ID;
    const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

    (async () => {
        try {
            console.log("\x1b[32mRegistering Slash Commands...\x1b[0m");
            const data = await rest.put(
                Routes.applicationCommands(clientId),
                { body: slashCommands }
            );
            console.log(`Registered ${data.length} slash commands.`);
        } catch (error) {
            console.error("Failed to register slash commands:", error);
        }
    })();
});

client.on("interactionCreate", async interaction => {
    if (interaction.isCommand()) {
        const command = client.slashCommands.get(interaction.commandName);
        if (!command) return;

        try {
            await command.execute(client, interaction);
        } catch (err) {
            console.error("Error executing command:", err);
            await interaction.reply({ content: `An error occurred: ${err.message}`, ephemeral: true });
        }
    }
});

client.login(process.env.TOKEN);
