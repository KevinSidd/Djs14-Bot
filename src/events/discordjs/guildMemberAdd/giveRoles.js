const { Client, GuildMember } = require("discord.js");
const { getDatabase } = require("../../../modules/handlers/database");
const { getRole } = require("../../../modules/utils");
const logger = require("../../../modules/logger");
const { Op } = require("sequelize");
const config = require("../../../configs/config");

/**
 * @param {Client} client 
 * @param {GuildMember} member 
 */

module.exports = async (client, member) => {
    if (!config.createDbConnection || !config.userJoinRoles.enabled) return;

    const guild = member.guild;
    const db = getDatabase("savedRoles");

    const defaultRoles = config.userJoinRoles.defaultRoles;
    const serverRoles = [];
    for (let i = 0; i < defaultRoles.length; i++) {
        const role = await getRole(defaultRoles[i], guild);
        if (!role) continue;
        serverRoles.push(role.id);
    }

    try {
        await member.roles.add(serverRoles);
    } catch (e) {
        logger.error(`Failed to give default roles, ${e}`);
    }

    if (config.userJoinRoles.giveOldRoles) {
        const data = await db.findOne({
            where: {
                [Op.and]: [
                    {
                        user: member.id,
                        guild: member.guild.id,
                    }
                ]
            }
        });

        if (!data) return;

        const oldRoles = JSON.parse(data.roles);
        const oldServerRoles = [];

        for (let i = 0; i < oldRoles.length; i++) {
            const role = await getRole(oldRoles[i], guild);
            if (!role) continue;
            oldServerRoles.push(role.id);
        };

        try {
            await member.roles.add(oldServerRoles);
        } catch (e) {
            logger.error(`Failed to give old roles, ${e}`);
        }
    }
}