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

Each `README.md` covers, using these Swedish headings:

1. **`Mål`** — what works at the end, in one sentence.
2. **`Bakgrund`** — the idea being introduced, kept short.
3. **`Steg`** — what to change, by file. Numbered `###` subheadings.
4. **`Klart når`** — how you know it worked. **Checks only:** a task list of
   things to observe, plus a collapsed troubleshooting entry for the ways it
   fails. Explanation does not belong here; the reader is ticking boxes.
5. **`Det som faktiskt hände`** — the idea the exercise exists for, said plainly
   once it has been done. This is where explanation goes, and where anything
   worth examining lives, as `###` subheadings — the network panel, the response,
   whatever the exercise made visible. It replaces a separate "going further"
   section: the extra material is reading and looking, not more to build, so it
   belongs with the payoff rather than after it.

A section is dropped when an exercise has nothing for it, rather than padded.
Exercise 1 has no `Det som faktiskt hände`, because installing a library is not
an idea to land.

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

## The exercise site

Attendees read these in a browser, not in an editor. The Markdown in this folder
is the source; [Material for MkDocs](https://squidfunk.github.io/mkdocs-material/)
turns it into a static site.

`mkdocs.yml` at the repo root holds the configuration and the nav order. Build
from the repo root:

```bash
docker run --rm -v "${PWD}:/docs" squidfunk/mkdocs-material:9.7.7 build
```

Live preview while writing, with reload on save, on <http://localhost:8000>:

```bash
docker run --rm -it -p 8000:8000 -v "${PWD}:/docs" squidfunk/mkdocs-material:9.7.7
```

Nothing is installed on the host and nothing is added to `package.json`. The
toolchain is an authoring tool, not a lab dependency — which is what keeps the
no-build-step rule intact for attendees.

**Commit the generated `exercises-site/`.** `src/server.ts` serves it at
<http://localhost:4000/exercises>, so attendees get the site by cloning and
running `./setup.sh`, with no extra tooling and no second server.

The output goes to `exercises-site/` rather than `public/` on purpose: the hot
reload watcher polls `public/` every 300ms, and the generated site is 49 files
and 2.6 MB (measured 2026-09-19).

**This file is excluded from the site** (`exclude_docs` in `mkdocs.yml`). It is
author notes in English; `index.md` beside it is the attendee-facing front page
in Swedish.

### Hiding hints

The reason for a real site rather than raw Markdown. A collapsed block:

```markdown
??? tip "Ledtråd — formen på en import map"

    Indented four spaces. Anything can go in here, including code blocks.
```

`???` starts collapsed, `???+` starts open, and `!!!` is a plain admonition that
cannot be collapsed at all — use that for things nobody should be able to skip,
like the htmx 2 version trap. Types worth knowing: `tip`, `warning`, `example`,
`question`, `note`, `danger`.

Version pinned deliberately: Material for MkDocs entered maintenance mode with
9.7.0 on 2025-11-11 — security and critical fixes only, with feature work moved
to its successor, [Zensical](https://zensical.org/). Since the built output is
committed, nothing shifts under the talk.

### Always link the official docs when a table introduces attributes

When an exercise presents htmx attributes in a table, the table carries a
**`Dokumentation`** column linking each one to the htmx 4 reference:

```markdown
| Attribut | Svarar på | Dokumentation |
| --- | --- | --- |
| `hx-get` | Vilken adress ska hämtas? | [Referens](https://four.htmx.org/reference/attributes/hx-get) |
```

The URL pattern is `https://four.htmx.org/reference/attributes/<attribute>`.
Verified 2026-09-19 for every attribute the progression uses: `hx-get`,
`hx-post`, `hx-target`, `hx-swap`, `hx-swap-oob`, `hx-trigger`, `hx-include`,
`hx-indicator`, `hx-push-url`, `hx-replace-url` and `hx-confirm` all return 200.

**Link `four.htmx.org`, never a bare search.** An attendee who looks up an
attribute unaided lands on htmx 2 documentation, where the answer looks right and
is wrong. Sending them somewhere correct is the point of the column.

The attribute name in the first column stays plain code — the link lives in the
documentation column, so nothing is linked twice.
