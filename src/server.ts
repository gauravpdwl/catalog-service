import app from "./app";
import logger from "./config/logger";
import config from "config";
import { initDb } from "./config/db";
import { createMessageProducerBroker } from "./common/factories/brokerFactory";
import { MessageProducerBroker } from "./common/types/broker";

const startServer = async () => {
    const PORT: number = config.get("server.port");
    let messageProducerBroker: MessageProducerBroker | null = null;

    try {
        // database connection initialization
        await initDb();
        logger.info("MongoDB Database Connected Successfully");

        // Connect to Kafka
        messageProducerBroker = createMessageProducerBroker();

        await messageProducerBroker.connect();

        app.listen(PORT, () => logger.info(`Listening on port ${PORT}`));
    } catch (err: unknown) {
        if (err instanceof Error) {
            if (messageProducerBroker) {
                await messageProducerBroker.disconnect();
            }

            logger.error(err.message);
            logger.on("finish", () => {
                process.exit(1);
            });
        }
    }
};

void startServer();
