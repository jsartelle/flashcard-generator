# Flashcard Generator

Pulls out tables from Markdown notes and converts them for use with [Obsidian Spaced Repetition](https://github.com/st3v3nmw/obsidian-spaced-repetition).

The first column forms the front of the card, all other columns are added to the back. By default the [Multi-line basic](https://github.com/st3v3nmw/obsidian-spaced-repetition/wiki/Flashcard-Types#multi-line-basic) style is used.

## Usage

`node index.js [path] [-fr] [--tag=string]`

### Options

- `-f` - Overwrite the destination folder without prompting.
- `-r` - Use the [Multi-line reversed](https://github.com/st3v3nmw/obsidian-spaced-repetition/wiki/Flashcard-Types#multi-line-reversed) style, where a second card is created with the front and back flipped.
- `--tag` - Change the root tag added to each note (default: *flashcards*)

## Output

Files are saved to the `Flashcards` directory in subfolders matching the note title. A new file is created for each table. Files are named after the previous header, or the note title if there aren't any previous headers.