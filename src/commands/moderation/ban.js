const { ApplicationCommandOptionType, Client, CommandInteraction } = require("discord.js");

module.exports = {
    name: "ban",
    category: "Moderation",
    description: "Ban a user",
    devOnly: false,
    disabled: false,
    roleRequired: ["Admin"],
    options: [
        {
            type: ApplicationCommandOptionType.User,
            name: "member",
            description: "Mention the user to ban",
            required: true,
        },
        {
            type: ApplicationCommandOptionType.String,
            name: "expires",
            description: "Select time to expire the ban",
            Choices: [{
                name: "1 hour",
                value: "1h",
            }, {
                name: "6 hours",
                value: "6h",
            }, {
                name: "12 hours",
                value: "12h",
            }, {
                name: "1 day",
                value: "1d",
            }, {
                name: "3 days",
                value: "3d",
            }, {
                name: "1 week",
                value: "7d",
            }, {
                name: "3 weeks",
                value: "21d",
            }, {
                name: "1 month",
                value: "30d",
            }],
            required: false,
        }
    ],
    execute: async (/**@type {Client} */ client, /**@type {CommandInteraction} */ interaction) => {
        
    }
}