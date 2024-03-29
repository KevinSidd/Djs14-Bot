const { ApplicationCommandOptionType, CommandInteraction, Client, EmbedBuilder, Colors, ActionRowBuilder, ButtonBuilder, Message } = require("discord.js");

module.exports = {
    name: "avatar",
    category: "General",
    description: "Get the avatar of a user",
    devOnly: false,
    disabled: false,
    channelOnly: [],
    roleRequired: [],
    options: [
        {
            type: ApplicationCommandOptionType.User,
            name: "mention",
            description: "The user to get the avatar of",
            required: false
        },
        {
            type: ApplicationCommandOptionType.String,
            name: "extension",
            description: "The extension of the avatar to get",
            required: false,
            choices: [
                {
                    name: "PNG",
                    value: "png"
                },
                {
                    name: "GIF",
                    value: "gif"
                },
            ]
        }
    ],

    /**
     * 
     * @param {Client} client 
     * @param {CommandInteraction} interaction 
     * @returns 
     */

    runSlash: async (client, interaction) => {
        await interaction.deferReply({ ephemeral: true });

        const user = interaction.options.getUser("mention") || interaction.user;
        let imageURL = user.displayAvatarURL({ size: 4096 });
        const extension = interaction.options.getString("extension");

        if (extension == "gif") {
            imageURL = user.displayAvatarURL({ size: 4096, extension: "gif" });
        } else if (extension == "png") {
            imageURL = user.displayAvatarURL({ size: 4096, extension: "png", forceStatic: true });
        }

        return interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setColor(Colors.Aqua)
                    .setTitle(`${user.username}'s avatar`)
                    .setImage(imageURL)
                    .setTimestamp(Date.now())
                    .setFooter({
                        text: `Requested by ${interaction.user.username}`,
                        iconURL: interaction.user.displayAvatarURL()
                    })
            ],
            components: [
                new ActionRowBuilder()
                    .setComponents([
                        new ButtonBuilder()
                            .setEmoji("🖼")
                            .setLabel("Link to avatar")
                            .setStyle("Link")
                            .setURL(imageURL),
                    ])
            ]
        });
    },

    /**
     * 
     * @param {Client} client 
     * @param {Message} message 
     * @param {Array} args 
     */

    runLegacy: async (client, message, args) => {
        
    }
}