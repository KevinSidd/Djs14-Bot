const { ApplicationCommandOptionType, EmbedBuilder, Colors, Message, Client, CommandInteraction } = require("discord.js");
const { openai } = require("../../modules/handlers/openAi");
const logger = require("../../modules/logger");
const { getDatabase } = require("../../modules/handlers/database");
const { Op } = require("sequelize");
const config = require("../../configs/config");

module.exports = {
    name: "openai",
    category: "General",
    description: "Get response from OpenAI",
    devOnly: false,
    disabled: false,
    channelOnly: ["commands"],
    roleRequired: [],
    options: [
        {
            type: ApplicationCommandOptionType.String,
            name: "prompt",
            description: "The prompt to send to OpenAI",
            required: true,
        },
        {
            type: ApplicationCommandOptionType.String,
            name: "model",
            description: "Model to use for generating response",
            choices: [
                { name: "🟢 GPT-3.5 Turbo", value: "gpt-3.5-turbo" },
                { name: "🟡 GPT-4", value: "gpt-4" }
            ],
            required: false,
        }
    ],

    /**
     * 
     * @param {Client} client 
     * @param {CommandInteraction} interaction 
     * @returns 
     */

    runSlash: async (client, interaction) => {
        if (!config.enableOpenAiSupport) {
            return interaction.reply({ content: "OpenAI module is disabled", ephemeral: true });
        }

        await interaction.deferReply({ ephemeral: false });

        const db = getDatabase("openai");
        const clientId = client.user.id;
        const userId = interaction.user.id;
        const prompt = interaction.options.getString("prompt");
        const respModel = interaction.options.getString("model") || "gpt-3.5-turbo";

        try {
            const [data] = await db.findOrCreate({
                where: {
                    [Op.and]: [
                        { clientId: clientId },
                        { userId: userId }
                    ]
                },
                defaults: {
                    clientId,
                    userId,
                    prompts: JSON.stringify([]),
                    responses: JSON.stringify([]),
                    userRole: 'user',
                    clientRole: 'assistant'
                }
            });

            let prompts = JSON.parse(data.prompts || '[]');
            let responses = JSON.parse(data.responses || '[]');

            if (typeof prompt === 'string' && prompt.trim() !== '') {
                prompts.push(prompt);
                await db.update(
                    { prompts: JSON.stringify(prompts) },
                    { where: { clientId, userId } }
                );
            }

            const oldMsgs = formatConversationForAPI(prompts, responses);

            const response = await openai.chat.completions.create({
                model: respModel,
                messages: oldMsgs,
            });

            const resMsg = response.choices[0].message.content;

            if (typeof resMsg === 'string' && resMsg.trim() !== '') {
                responses.push(resMsg);
                await db.update(
                    { responses: JSON.stringify(responses) },
                    { where: { clientId, userId } }
                );
            }

            const charLim = 4000;
            await handleResponse(interaction, resMsg, charLim);
        } catch (error) {
            logger.error(error);
            await interaction.editReply({ content: `Error occurred: ${error.message}` });
        }
    },

    /**
     * 
     * @param {Client} client 
     * @param {Message} message 
     * @param {Array} args 
     */

    runLegacy: async (client, message, args) => {

    }
};

function formatConversationForAPI(prompts, responses) {
    let formattedHistory = [];
    let start = Math.max(0, prompts.length - 3);
    for (let i = start; i < prompts.length; i++) {
        formattedHistory.push({ role: 'user', content: prompts[i] });
        if (responses[i]) {
            formattedHistory.push({ role: 'assistant', content: responses[i] });
        }
    }
    return formattedHistory;
}

async function handleResponse(interaction, resMsg, charLim) {
    if (resMsg.length <= charLim) {
        await interaction.editReply({
            embeds: [createResponseEmbed(resMsg, interaction)]
        });
    } else {
        for (let i = 0; i < resMsg.length; i += charLim) {
            const part = resMsg.substring(i, Math.min(i + charLim, resMsg.length));
            await interaction.followUp({
                embeds: [createResponseEmbed(part, interaction)]
            });
        }
    }
}

function createResponseEmbed(message, interaction) {
    return new EmbedBuilder()
        .setColor(Colors.Aqua)
        .setAuthor({ name: "OpenAI Response" })
        .setDescription(message)
        .setFooter({
            text: `Requested by ${interaction.user.username}`,
            iconURL: interaction.user.displayAvatarURL(),
        })
        .setTimestamp(Date.now());
}