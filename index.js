import fs from "fs";
import { createMarkdownArrayTableSync } from "parse-markdown-table";
import path from "path";
import process from "process";
import readline from "readline";
import sanitize from "sanitize-filename";
import { promisify } from "util";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

/**
 * @typedef TableArray
 * @type {[term: string, answer: (readonly string[])[]][]}
 */

const rl = readline.createInterface({
    input: process.stdin,
    // @ts-expect-error - this is literally copied from the Node docs
    output: process.stdout,
});
const question = promisify(rl.question).bind(rl);

const argv = yargs(hideBin(process.argv))
    .usage(`Usage: node $0 [path] [-fr] [--tag=string]`)
    .demandCommand(1, 1)
    .option({
        f: {
            description: "Force overwrite the destination folder",
            type: "boolean",
            default: false,
        },
        r: {
            description: "Create reversed cards",
            type: "boolean",
            default: false,
        },
        tag: {
            description: "Root tag name",
            type: "string",
            default: "flashcards",
        },
    })
    .parseSync();

const folderPath = String(argv._[0]);

try {
    const stats = fs.statSync(folderPath);
    if (!stats.isDirectory()) {
        throw null;
    }
} catch {
    throw new Error("Positional argument must be a valid folder path.");
}

const flashcardsDir = "Flashcards";
if (fs.existsSync(flashcardsDir)) {
    if (argv.f) {
        fs.rmSync(flashcardsDir, {
            recursive: true,
            force: true,
        });
    } else {
        // @ts-expect-error - changing module and target in jsconfig breaks the VSCode TypeScript server
        const response = await question(
            "Flashcards folder will be overwritten if you continue. (y/n)\n"
        );
        if (response.toLowerCase()[0] === "y") {
            fs.rmSync(flashcardsDir, {
                recursive: true,
                force: true,
            });
        } else {
            process.exit(0);
        }
    }
}
fs.mkdirSync(flashcardsDir);

const noteNames = fs.readdirSync(folderPath);

noteNames.forEach(filename => {
    if (path.extname(filename) !== ".md") return;

    const notePath = path.join(folderPath, filename);
    const note = fs.readFileSync(notePath, { encoding: "utf-8" });
    const noteTitle = path.basename(filename, path.extname(filename));

    const tables = getTables(note, noteTitle);
    writeFiles(tables, noteTitle);
});

process.exit(0);

/* --- Functions --- */

/**
 * @param {string} note
 * @param {string} noteTitle
 */
function getTables(note, noteTitle) {
    /**
     * @type {TableArray}
     */
    const tables = [];
    const noteSplit = note.split("\n");

    let header = noteTitle;
    let tableString = "";

    function addTable() {
        const table = createMarkdownArrayTableSync(tableString);
        const tableRows = [...table.rows];

        tables.push([header, tableRows]);
        tableString = "";
    }

    noteSplit.forEach((line, index) => {
        if (index === noteSplit.length - 1 && tableString) {
            addTable();
        } else if (line.startsWith("#")) {
            // remove # marks
            const match = line.match(/#+\s+(.+)$/);
            if (match) header = match[1];
        } else if (line.startsWith("|")) {
            line = line.trim();
            tableString += `${line}\n`;
        } else if (tableString) {
            addTable();
        }
    });

    return tables;
}

/**
 * @param {TableArray} tables
 * @param {string} noteTitle
 */
function writeFiles(tables, noteTitle) {
    tables.forEach(([name, rows]) => {
        let outputString = `---
tags: ${argv.tag}/${noteTitle.replaceAll(" ", "-")}/${name.replaceAll(" ", "-")}
---
`;

        rows.forEach(([term, ...answer]) => {
            outputString += `${term}
${argv.r ? "??" : "?"}
${answer.filter(Boolean).join("\n")}

`;
        });

        let attempt = 0;
        while (true) {
            const outputDir = path.join(flashcardsDir, noteTitle);
            if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

            const filename = name + (attempt ? ` (${attempt})` : "");
            const outputPath = path.join(outputDir, sanitize(filename + ".md"));

            if (!fs.existsSync(outputPath)) {
                fs.writeFileSync(outputPath, outputString, {
                    encoding: "utf-8",
                });
                break;
            }

            attempt++;
        }
    });
}
