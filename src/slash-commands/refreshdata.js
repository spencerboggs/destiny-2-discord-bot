const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const axios = require("axios");
const fs = require("fs");

const SHEET_ID = "1JM-0SlxVDAi-C6rGVlLxa-J1WGewEeL8Qvq4htWZHhY";

const SHEETS = {
    1595979957: "Shotguns",
    1090554564: "Snipers",
    1318165198: "Fusions",
    657764751: "BGLs",
    1239299765: "Glaives",
    288998351: "Traces",
    550485113: "Rocket_Sidearms",
    1919916707: "LMGs",
    439751986: "HGLs",
    473850359: "Swords",
    981030684: "Rockets",
    29008106: "LFRs",
};

async function fetchSheetData(gid, sheetName) {
    const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&gid=${gid}`;

    try {
        const response = await axios.get(url);
        const jsonText = response.data.match(/google\.visualization\.Query\.setResponse\((.*)\);/)[1];
        const jsonData = JSON.parse(jsonText).table;

        const headers = jsonData.cols.map(col => col.label);
        const rows = jsonData.rows.map(row =>
            row.c.map(cell => (cell ? cell.v : null))
        );

        const formattedData = rows.map(row =>
            Object.fromEntries(row.map((value, index) => [headers[index], value]))
        );

        fs.writeFileSync(`./src/data/${sheetName}.json`, JSON.stringify(formattedData, null, 4));
        // console.log(`Saved ${sheetName}.json`);
    } catch (error) {
        console.error(`Failed to fetch ${sheetName}:`, error.message);
    }
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('refreshdata')
        .setDescription('Fetch and refresh all weapon data from the spreadsheet.'),

    async execute(client, interaction) {
        try {
            await interaction.reply({ content: 'Refreshing weapon data...', flags: 64 });

            for (const [gid, name] of Object.entries(SHEETS)) {
                await fetchSheetData(gid, name);
            }

            console.log("Data refresh complete!");

            await interaction.followUp({ content: 'Weapon data has been refreshed and saved to JSON files!', flags: 64 });
        } catch (error) {
            console.error('Error during data refresh:', error);
            await interaction.followUp({ content: 'Failed to refresh data!', flags: 64 });
        }
    }
};
