import { select, Separator } from "@inquirer/prompts";
import * as path from "@std/path";

import messages from "../messages.json" with { type: "json" };

/**
 * Opens the file browser
 * @param startPath the path to start the file browser on
 * @returns the path of the selected file/folder or undefined if the user cancels the operation
 */
export const openFileSelector = async (
    startPath: string,
): Promise<string[] | undefined> => {
    console.clear();

    let fileBrowserViewResult: FileBrowserViewResult = {
        action: "goDown",
        path: startPath,
    };

    const selectedFiles = [];

    while (
        fileBrowserViewResult.action !== "cancel" &&
        fileBrowserViewResult.action !== "finish"
    ) {
        const newResult = await openFileBrowserView(
            fileBrowserViewResult.path,
            selectedFiles,
        );

        if (newResult.action === "select") {
            selectedFiles.push(newResult.path);
            continue;
        }

        fileBrowserViewResult = newResult;
    }

    if (fileBrowserViewResult.action === "finish") {
        return selectedFiles;
    }

    if (fileBrowserViewResult.action === "cancel") {
        return;
    }
};

type FileBrowserViewResult =
    | {
        action: "cancel";
    }
    | {
        action: "goUp";
        path: string;
    }
    | {
        action: "goDown";
        path: string;
    }
    | { action: "select"; path: string }
    | { action: "finish" };

/**
 * Opens the file browser view
 * @param path returns the path of the selected item or undefined if the user cancels the operation
 */
const openFileBrowserView = async (
    currentPath: string,
    selectedFiles: string[],
): Promise<FileBrowserViewResult> => {
    const items = Deno.readDirSync(currentPath);

    const filteredItems = [];

    for (const item of items) {
        if (item.isFile) {
            if (item.name.endsWith(".csv")) {
                filteredItems.push(item);
            }
            continue;
        }

        filteredItems.push(item);
    }

    const choices = filteredItems.sort((a, b) =>
        ("" + a.name).localeCompare("" + b.name)
    ).map((item) =>
        getChoice(item, path.join(currentPath, item.name), selectedFiles)
    );

    const choice = await select<string>({
        message: messages.fileBrowser.title,
        choices: [
            {
                name: messages.fileBrowser.abort.shortText,
                value: "abort",
                description: messages.fileBrowser.abort.longText,
            },
            {
                name: selectedFiles.length > 0
                    ? messages.fileBrowser.startAnalysis.shortText
                    : messages.fileBrowser.startAnalysis.disabledText,
                value: "startAnalysis",
                description: messages.fileBrowser.startAnalysis.longText
                    .replaceAll("{count}", selectedFiles.length.toString()),
                disabled: selectedFiles.length === 0,
            },
            {
                name: messages.fileBrowser.goToParentFolder.shortText,
                value: "goUp",
                description: messages.fileBrowser.goToParentFolder.longText,
            },
            new Separator(),
            ...choices,
        ],
        loop: false,
    });

    if (choice == "goUp") {
        return {
            action: "goUp",
            path: path.join(currentPath, ".."),
        };
    } else if (choice == "abort") {
        return {
            action: "cancel",
        };
    } else if (choice == "startAnalysis") {
        return {
            action: "finish",
        };
    } else {
        const selectedItem = filteredItems.find((item) => item.name === choice);

        if (!selectedItem) {
            return {
                action: "cancel",
            };
        }

        if (selectedItem.isDirectory) {
            return {
                action: "goDown",
                path: path.join(currentPath, selectedItem.name),
            };
        } else {
            return {
                action: "select",
                path: path.join(currentPath, choice),
            };
        }
    }
};

const getChoice = (
    item: Deno.DirEntry,
    path: string,
    selectedFiles: string[],
) => {
    const isSelected = selectedFiles.includes(path);

    const name = item.isDirectory
        ? `[📁] ${item.name}`
        : `[📄] ${item.name}${isSelected ? " (❎)" : ""}`;
    const value = item.name;
    const description = item.isDirectory
        ? messages.fileBrowser.enterFolder.longText
        : messages.fileBrowser.addFile.longText;

    return {
        name,
        value,
        description,
    };
};
