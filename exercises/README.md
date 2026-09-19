# Exercises

No exercises have been written yet. This file documents the convention they
should follow so they stay consistent when they are.

## Structure

One folder per exercise, numbered so ordering is obvious:

```
exercises/
  01-first-swap/
    README.md      What to build, and why it matters
  02-.../
```

Each `README.md` covers:

1. **Goal** — what works at the end, in one sentence.
2. **Background** — the idea being introduced, kept short.
3. **Steps** — what to change, by file.
4. **Done when** — how you know it worked, observable in the browser.
5. **Going further** — optional, for people who finish early.

## Starting state

Exercises build on the running lab in `views/`, `public/` and `src/`. Each one
starts from the state the previous one finished in, so attendees work in a single
codebase rather than copying folders around.

## Solutions

Solutions live on branches, one per exercise:

```
solution/01-first-swap
solution/02-...
```

An attendee who gets stuck can look at the branch for their exercise without
being shown the answers to later ones:

```bash
git diff main solution/01-first-swap
```

## Language

**Exercise prose is written in Swedish.** Everything structural around it stays
English:

| | |
| --- | --- |
| Swedish | the prose in each exercise's `README.md` — goal, background, steps |
| English | folder and file names (`01-first-swap/`, not `01-forsta-bytet/`) |
| English | all code samples, identifiers, htmx attributes, comments |
| English | **any UI text the exercise adds to the app** — headings, labels, buttons, messages |

So an exercise is an English path containing Swedish prose, telling the reader in
Swedish to add English UI text. That is intended: the lab application is English
throughout, and only the teaching material is Swedish.

Do not mix the two within the prose itself.

## Writing for this audience

Attendees come from mixed programming backgrounds and many do not work with Node.
Exercises
should be about hypermedia and HTMX, not about Node, npm or tooling. Anything
requiring a terminal command beyond `./setup.sh` probably needs rethinking.
