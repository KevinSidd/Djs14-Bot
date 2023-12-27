const chalk = require("chalk");
const logger = require("../../../modules/logger");
const timedMod = require("../../../modules/handlers/timedMod");
const ms = require("ms");
const config = require("../../../../config");

module.exports = async (client) => {
    logger.info(`Logged in as ${chalk.bold.underline(client.user.username)}!`);
    const guild_data = client.guilds.cache.get(config.serverID);

    if (guild_data) {
        logger.info(`Fetched data for server • ${guild_data.name}`)
    } else {
        logger.error("Configured server not found");
        process.exit(1);
    }

    if (config.createDbConnection) {
        setTimeout(() => {
            timedMod().then(() => {
                setInterval(() => {
                    timedMod()
                }, ms("2m"));
            })
        }, ms("5s"));
    }
}