import * as fs from "fs";
import { createMarkdownArrayTableSync } from "parse-markdown-table";

const note = fs.readFileSync("Vocab.md", { encoding: "utf-8" }).split("\n");

/* Extract tables from the note */

/**
 * @type Map<string, string[][]>
 */
const tables = new Map();

note.forEach((line, index) => {
    if (line.startsWith("#")) {
        // See if the next non-empty line is the start of a table -
        // this assumes that each header has at most one table under it
        let searchIndex = index + 1,
            tableString = "";

        while (true) {
            let searchLine = note[searchIndex];
            // stop if we have reached the end of the file
            if (searchLine == undefined) break;

            searchLine = searchLine.trim();

            if (searchLine.startsWith("|")) {
                tableString += `${searchLine}\n`;
            } else if (searchLine) {
                break;
            }

            searchIndex++;
        }

        if (tableString) {
            // remove # marks
            const header = line.match(/#+\s+(.+)$/)[1];

            const table = createMarkdownArrayTableSync(tableString);
            const tableRows = [...table.rows];

            // @ts-expect-error
            tables.set(header, tableRows);
        }
    }
});

/* Write the output file */

let output = [];

tables.forEach((rows, header) => {
    let addedHeader = false;

    rows.forEach(([term, ...answer]) => {
        if (term.startsWith("*")) {
            if (!addedHeader) {
                output.push(`\n#flashcards/${header.replaceAll(" ", "-")}`);
                addedHeader = true;
            }

            output.push(`\n${term}`);

            if (answer.filter(Boolean).length) {
                output.push("??");
                output = output.concat(answer.filter(Boolean));
            }
        }
    });
});

fs.writeFileSync("Flashcards.md", output.join("\n").trim(), {
    encoding: "utf-8",
});
