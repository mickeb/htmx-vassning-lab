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

## Which htmx

**"htmx" always means htmx 4** (<https://four.htmx.org/>). Write "htmx 2"
explicitly if you ever need to refer to the older version.

htmx 4 is loaded with an **import map**.

Pin the version there. `npm install htmx.org` and unversioned CDN links both
give **htmx 2**, because htmx 4 sits on the `next` dist-tag until early 2027 —
the import map is the one place the version is named:

```html
<script type="importmap">
{ "imports": { "htmx.org": "https://cdn.jsdelivr.net/npm/htmx.org@4.0.0/dist/htmx.esm.js" } }
</script>
<script type="module">
  import htmx from 'htmx.org'
</script>
```

The import map must come before any module script using the bare specifier.

Differences most likely to bite while writing exercises:

- **Attribute inheritance is explicit.** Attributes do not inherit down the DOM
  any more; use the `:inherited` suffix (`hx-confirm:inherited="..."`).
- **Event names changed** to `htmx:before:request` / `htmx:after:swap` style.
- **`hx-vars`, `hx-prompt` and `hx-disinherit` are gone.**

Most htmx examples online are v2 and will look correct. Check the v4 reference.

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
