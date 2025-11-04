require("dotenv").config();
const express = require("express");
const { Client, GatewayIntentBits } = require("discord.js");

const app = express();
app.use(express.json());

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
});

const TOKEN = process.env.DISCORD_BOT_TOKEN;
const GUILD_ID = process.env.GUILD_ID;

const rankRoles = [
  "Elite Jonin",
  "Jonin",
  "Rogue",
  "Spec Jonin",
  "Chunin",
  "Genin",
  "Academy Student",
];

const villageRoles = ["Leaf", "Cloud", "Mist", "Stone", "Sand", "Lunar", "Rain"];

client.once("ready", () => console.log(`✅ Bot logged in as ${client.user.tag}`));

app.post("/api/updateRank", async (req, res) => {
  const { username, newRank, village, fullName } = req.body;

  if (!username || !newRank || !village || !fullName)
    return res.status(400).json({ error: "Missing required fields" });

  try {
    const guild = await client.guilds.fetch(GUILD_ID);
    await guild.members.fetch();

    const member = guild.members.cache.find((m) =>
      m.displayName.toLowerCase().includes(username.toLowerCase())
    );

    if (!member) {
      console.log(`❌ No member found for ${username}`);
      return res.sendStatus(404);
    }

    // 🏅 Rank Role
    const rankRole = guild.roles.cache.find((r) => r.name === newRank);
    if (rankRole && !member.roles.cache.has(rankRole.id)) {
      await member.roles.add(rankRole);
      console.log(`🏅 Added ${newRank} to ${member.displayName}`);
    }

    // 🌍 Village Role (remove old one first)
    const newVillageRole = guild.roles.cache.find((r) => r.name === village);
    if (newVillageRole) {
      const oldVillages = member.roles.cache.filter((r) =>
        villageRoles.includes(r.name)
      );
      for (const [, role] of oldVillages) await member.roles.remove(role);
      await member.roles.add(newVillageRole);
      console.log(`🌍 Set ${member.displayName}'s village to ${village}`);
    }

    // 🪶 Nickname Update (e.g. "Tobi Mu (bababrrf4e)")
    await member.setNickname(fullName).catch(() => {
      console.log(`⚠️ Couldn't change nickname for ${username} (permissions?)`);
    });

    console.log(`✅ Updated ${username}: ${newRank}, ${village}, ${fullName}`);
    return res.sendStatus(200);
  } catch (err) {
    console.error("❌ Error updating rank/village/nickname:", err);
    return res.sendStatus(500);
  }
});

client.login(TOKEN);
app.listen(process.env.PORT || 3000, () =>
  console.log(`🚀 Listening on port ${process.env.PORT || 3000}`)
);
