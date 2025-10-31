// index.js
require('dotenv').config(); // Load .env variables
const express = require("express");
const { Client, GatewayIntentBits } = require("discord.js");

const app = express();
app.use(express.json());

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
});

// ⚠️ TOKEN is now loaded from environment variables
const TOKEN = process.env.DISCORD_BOT_TOKEN;
const GUILD_ID = process.env.GUILD_ID || "1433663714497925214"; // Optional to use env for server ID

// List of valid roles
const roles = [
    "Elite Jonin",
    "Jonin",
    "Rogue",
    "Spec Jonin",
    "Chunin",
    "Genin",
    "Academy Student"
];

client.once("ready", () => console.log(`Bot logged in as ${client.user.tag}`));

app.post("/api/updateRank", async (req, res) => {
    const { username, newRank } = req.body;
    if (!username || !newRank) return res.sendStatus(400);

    if (!roles.includes(newRank)) {
        console.log(`Invalid role received: ${newRank}`);
        return res.sendStatus(400);
    }

    try {
        const guild = await client.guilds.fetch(GUILD_ID);
        await guild.members.fetch();

        // Find a member whose display name includes the Roblox username
        const member = guild.members.cache.find(m =>
            m.displayName.toLowerCase().includes(username.toLowerCase())
        );

        if (!member) {
            console.log(`No Discord member found for ${username}`);
            return res.sendStatus(404);
        }

        // Find the role by name
        const role = guild.roles.cache.find(r => r.name === newRank);
        if (!role) {
            console.log(`No role found named ${newRank}`);
            return res.sendStatus(404);
        }

        // Assign the role
        await member.roles.add(role);
        console.log(`Assigned ${newRank} to ${member.displayName}`);
        res.sendStatus(200);

    } catch (err) {
        console.error("Error assigning role:", err);
        res.sendStatus(500);
    }
});

// Start bot
client.login(TOKEN);
app.listen(process.env.PORT || 3000, () => console.log("Listening on port 3000"));
