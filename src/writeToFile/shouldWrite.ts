import { select } from "@inquirer/prompts";
import messages from "../messages.json" with { type: "json" };

export const askShouldWrite = async (): Promise<boolean> => {
    return await select<boolean>({
        message: messages.shouldWriteToDisk.question,
        choices: [
            { name: messages.shouldWriteToDisk.no, value: false },
            { name: messages.shouldWriteToDisk.yes, value: true },
        ],
    });
};
