import { analysis } from "./analysis/analysis.ts";
import { previewAnalysis } from "./analysisPreview.ts";
import { openFileSelector } from "./fileBrowser/fileBrowser.ts";
import { timeout } from "./util.ts";
import { askShouldWrite } from "./writeToFile/shouldWrite.ts";
import { writeResultsToFile } from "./writeToFile/writeToFile.ts";

export const enalyser = async () => {
    console.log("Willkommen bei enalyser v1.0.0");
    console.log("Autor: Finn Tegeler");
    console.log("GitHub: https://github.com/TnTGamesTV/enalyser")

    timeout(5000);

    const analysisFiles = await openFileSelector(Deno.cwd());

    if (!analysisFiles) {
        return;
    }

    const shouldStartAnalysis = await previewAnalysis(analysisFiles);

    if (!shouldStartAnalysis) {
        return;
    }

    const result = analysis(analysisFiles);

    const shouldWriteToDisk = await askShouldWrite();

    if (!shouldWriteToDisk) {
        return;
    }

    for (const resultItem of result) {
        writeResultsToFile({ ...resultItem }, resultItem.filePath);
    }

    console.log("Ergebnisse wurden erfolgreich gespeichert. Analyse beendet.");
};
