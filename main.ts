import { program } from "commander";
import { enalyser } from "./src/enalyser.ts";
import messages from "./src/messages.json" with { type: "json" };

if (import.meta.main) {
  program
    .name("enalyser")
    .description(
      "Analysiert Lastgangdaten von Solaranlagen. Autor: Finn Tegeler",
    )
    .version(messages.version);

  program.action(async () => {
    return await enalyser();
  });

  program.parse();
}
