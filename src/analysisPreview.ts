import { select } from "@inquirer/prompts";
import messages from "./messages.json" with { type: "json" };

export const previewAnalysis = async (selectedFiles: string[]): Promise<boolean> => {
    console.clear();

    console.log(`----${messages.analysisPreview.title}----`);

    console.log(messages.analysisPreview.description);
    console.log("");

    for (const file of selectedFiles) {
        console.log(`[📄] ${file}`);
    }

    console.log("");

    return await select<boolean>({
        message: messages.analysisPreview.question,
        choices: [
            { name: messages.analysisPreview.no, value: false },
            { name: messages.analysisPreview.yes.replaceAll("{count}", selectedFiles.length.toString()), value: true },
        ],
    });
};
