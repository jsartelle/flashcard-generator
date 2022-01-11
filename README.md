Convert a Markdown note in this format:

```markdown
# Fruit
| Name   | Color  | Notes           |
| ------ | ------ | --------------- |
| apple  | red    | sometimes green |
| banana | yellow |                 |
| orange | orange |                 |

- Other data can go here but it won't be included.

# Vegetables

| Name     | Color  | Notes                   |
| -------- | ------ | ----------------------- |
| carrot   | orange |                         |
| broccoli | green  |                         |
| tomato   | red    | ==technically a fruit== |
```

into a note in this format:

```markdown
#flashcards/Fruit

apple
??
red
sometimes green

banana
??
yellow

orange
??
orange

#flashcards/Vegetables

carrot
??
orange

broccoli
??
green

tomato
??
red
==technically a fruit==
```

Tables must come directly after the header (blank lines are okay). Only one table per header is parsed.

For use with [Obsidian Spaced Repetition](https://github.com/st3v3nmw/obsidian-spaced-repetition).
