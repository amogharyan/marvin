## GROQ — Comprehensive Reference

This document is a consolidated, organized, and extensive reference for GROQ (Graph-Relational Object Queries). It is intended to be a single-source resource an AI agent or developer can use to understand, author, and integrate advanced GROQ queries.

Contents

- Overview
- Quick Examples
- Core Concepts and Syntax
- Expressions and Operators
- Filters and Boolean Logic
- Projections and Object Construction
- Traversal, References, and Dereferencing
- Arrays, Slices and Ordering
- Pipe operator and Flow
- Built-in Functions (common & advanced)
- Special Variables (@ and ^)
- Conditionals, select(), and inline conditionals
- Text matching & full-text behaviour
- Scoring, boosting and search-related functions
- Geo and Date/Time helpers
- Image/Asset patterns
- Performance & Best Practices
- Integration notes (clients, HTTP API, versioning)
- Edge cases, gotchas
- Examples: from beginner to advanced
- Quick cheat sheet
- Links and references

--

## Overview

GROQ is a query language designed for querying JSON documents with expressive filters, projections, joins (via queries in projections), transformations, and a concise syntax optimized for describing exactly the shape of the returned data. It is used extensively in Sanity's Content Lake, but the language and specification are implementation-agnostic and open (see the GROQ spec).

Key goals:

- Query JSON documents with filters and projections.
- Compose queries (subqueries inside projections) to join documents.
- Transform and compute values server-side with functions.
- Return exactly the shape needed (performance + simplicity).

Contract (how an AI integration should think about queries):

- Input: GROQ string, optional parameter map ($vars), execution context (API version, dataset, perspective).
- Output: JSON result (array/object/scalar) matching the projection/outer expression.
- Error modes: parse errors (invalid syntax), runtime errors (type mismatch), authorization/permission errors (API/role restrictions), timeouts/limits (platform-specific).

Edge cases to watch for: undefined / null propagation, arrays vs single value semantics, dereferencing arrays (need []), placement of ellipsis operator `...` (projection overriding), API version differences.

--

## Quick examples

Return all movie documents:

```groq
*[_type == "movie"]
```

Return movies with selected fields:

```groq
*[_type == "movie"]{ _id, title, releaseYear }
```

Sort movies by release year descending and take first 10:

```groq
*[_type == "movie"] | order(releaseYear desc)[0...10]{ title, releaseYear }
```

Return a movie with its director expanded (dereference):

```groq
*[_type == "movie"]{ title, director-> { _id, name } }
```

Join-style subquery (people with their movies):

```groq
*[_type == "person"]{ _id, name, "movies": *[_type == "movie" && references(^._id)].title }
```

--

## Core Concepts and Syntax

- Expression: any value-producing construct. A query is an expression.
- `*`: root set (all documents).
- Filters: bracketed expressions after sets: `*[ <filter-expression> ]`.
- Projection: `{ ... }` used to shape returned objects.
- Selector/slice: `[index]` or `[start...end]` to select elements (works on arrays/results).
- Pipe `|`: passes a value (usually a set/array) into a function or projection.

Parsing notes:

- GROQ reads left-to-right flow. Use parentheses when composing ambiguous expressions.

--

## Expressions and Operators

Common operators:

- Comparison: `==`, `!=`, `<`, `<=`, `>`, `>=`
- Logical: `&&` (and), `||` (or), `!` (not)
- Membership: `in` (element in array)
- Existence: `defined()` function is recommended for checking presence
- Arithmetic: `+`, `-`, `*`, `/`, `%`, `**` (exponentiation)
- Concatenation: `+` (strings/arrays/objects)

Operator tips:

- String comparison is lexicographic and case-sensitive unless modified (e.g., `lower(title)`).
- When comparing datetimes, convert with `dateTime()` or compare to `now()`.

--

## Filters and Boolean Logic

Filter examples:

```groq
*[_type == "movie" && releaseYear >= 1979]
*[_type in ["movie","person"]]
*["sci-fi" in genres]
*[_id in path("a.b.c.*")]
```

Match and text search:

- `match` is token-based and intended for natural language text. Use carefully; it's different from substring.

Presence checks:

- `defined(field)` — true if the field exists and is not undefined.

References filtering:

- `references("doc-id")` selects documents that reference that document id.

Combine filters with parentheses when mixing `in`, `match`, and boolean operators.

--

## Projections and Object Construction

A projection is used to return only certain fields or to compute new ones.

Examples:

```groq
*[_type == "movie"]{ _id, title, "directorName": director->name }
```

Computed fields and ellipsis:

- Use `...` (ellipsis) inside a projection to include all fields returned by that projection in addition to explicit fields.
- Placement matters for API versions >= 2021-03-25: properties that come last win.

Array projections and applying to each element:

- `images[]{ caption, "url": asset->url }` applies projection to every array member.

Object projection syntax note:

- You can name returned fields with string-literal keys: `"posterUrl": poster.asset->url`.

--

## Traversal, References, and Dereferencing

References are objects with `_ref` (and optionally `_weak`). Dereference using `->`.

Single reference dereference:

```groq
{ director-> { name } }
```

Array of references — remember the `[]` when dereferencing:

```groq
producers[]-> { _id, name }
```

Gotcha: `producers->` (without `[]`) will return a single null; must use `producers[]->` to map over array.

Parent operator `^`:

- Inside a nested subquery, use `^` to reference the enclosing document. Example: `references(^._id)` in a subquery inside a projection.

--

## Arrays, Slices and Ordering

Slice and selector examples:

```groq
// Single index
*[_type == "movie"][0]         // first movie object (not array)
// Inclusive slice
*[_type == "movie"][0..5]      // first 6 movies
// Exclusive end slice
*[_type == "movie"][0...5]     // indexes 0..4 (5 items)
```

Ordering with `order()` (pipe function):

```groq
*[_type == "movie"] | order(releaseYear desc, title) [0..9]
```

Notes:

- Default ordering is ascending by `_id`.
- `order()` must be used with a pipe `| order(...)` when applied as a pipe function.

--

## Pipe operator and Flow

The pipe operator `|` sends the left-hand side value to the right-hand expression (often a function like `order()` or `score()`).

It is required when using pipe-functions (e.g., `order()`, `score()`), but optional for projections.

Examples:

```groq
*[_type == "post"] | score(body match $term) | order(_score desc, _updatedAt desc)
```

--

## Built-in Functions (common & advanced)

This is a curated list of commonly used functions with short descriptions and examples. Not exhaustive; refer to the spec for the full list.

- count(collection): number of items.

  - Example: `count(actors)` or `count(*[_type=="movie"])`

- sum(collection): sum of numeric members.

- min(collection), max(collection): numeric min/max.

- coalesce(a, b, ...): return first non-null value.

  - Example: `coalesce(title.fi, title.en, "(untitled)")`

- defined(x): true if x exists.

- select(cond => value, cond2 => value2, fallback): conditional expression that returns first matching case.

- order(...): pipe-function for sorting.

- score(expression): compute text-match score (used with `match`). Must be used with pipe: `| score(...)`.

- boost(condition, boostValue): helper to boost scores inside `score()`.

- round(n, decimals?), floor, ceil: numeric rounding.

- now(): current timestamp. Useful with dateTime() or comparisons.

- dateTime(strOrField): parse or coerce ISO timestamps into comparable date/time values.

- references(idOrExpression): returns true for documents referencing target(s).

- path("pattern"): used with `_id in path("...")` pattern-matching.

- array::unique(array), array::compact(array), array::join(list, sep) (namespaced helpers for arrays).

- string::startsWith, string::endsWith (namespaced string helpers depending on platform impl).

- pt::text(portableText): convert Sanity portable text to plain text.

- geo::distance(point, point) and geo::intersects(geomA, geomB): geospatial helpers.

Notes on functions:

- Some functions are pipe-functions (require the `|`), others are regular.
- `score()` is a pipe function that sets `_score` which can then be used by `order(_score desc)`.

--

## Special Variables (@ and ^)

- `@` (at): refers to the current root value in that scope. Useful inside nested array filtering to reference the item you're iterating over.
- `^` (caret): refers to the enclosing parent document when inside subqueries/projections.

Example using both:

```groq
*[_type == "person"]{ name, "movies": *[_type == "movie" && references(^._id)].title }
```

--

## Conditionals and select()

`select()` returns first matching condition.

```groq
{ "popularity": select(popularity > 20 => "high", popularity > 10 => "medium", "low") }
```

Projections also have inline conditional shorthand: `cond => { projection }` inside arrays of projections (useful for polymorphic arrays).

--

## Text matching & full-text behaviour

- `match` tokenizes input and supports wildcard `*` for prefix tokens.
- It is meant for human-language and token matching — not a substring operator.

Examples:

```groq
*[_type == "post" && body match "aliens"]
*[_type == "post" && title match "wo*"]
```

Gotchas:

- `"my-pretty-pony-123.jpg" match "my*.jpg"` may not behave as a naive wildcard; `match` tokenizes and matches tokens.

--

## Scoring, boosting and search-related functions

Use `score()` and `boost()` to compute ranking weights for `order(_score desc)`.

Example combining boosts:

```groq
*[_type == "post"] | score(boost(title match $term, 4), boost(body match $term, 1)) | order(_score desc)
```

Tips:

- Compute `_score` with `score()` and order by `_score`.
- Combine `boost()` to prefer certain fields.

--

## Geo and Date/Time helpers

- Geo functions: `geo::distance(pointA, pointB)` returns distance in meters, `geo::contains`, `geo::intersects`.
- Date helpers: `dateTime()`, `now()`, compare datetimes with `dateTime()` conversions.

Example: stores within 10 miles (~16093.4 meters):

```groq
*[_type == "storefront" && geo::distance(location, $userLocation) < 16093.4]
```

--

## Image / Asset patterns

Images are usually stored as references to asset documents. Best patterns:

```groq
*[_type == "movie"]{ title, "posterUrl": poster.asset->url }
// For arrays
*[_type == "movie"]{ title, images[]{ caption, "url": asset->url } }
```

When extracting a single value per array member, use `images[].asset->url` (blank filter projection) to return an array of URLs.

--

## Performance & Best Practices

- Always limit and order results for predictable pagination: `| order(...) [ $start..$end ]`.
- Avoid projecting large nested objects unless required. Use `...` thoughtfully.
- Combine multiple independent queries into a single object projection to reduce round-trips.
- Use indices and efficient filters (e.g., `_type == "movie"` first) to narrow down sets early.
- Use `defined()` to avoid scanning optional fields.
- For search-heavy tasks, use `score()` + `boost()` rather than brute-force string comparisons.

API-level considerations:

- Respect API versioning: some semantics (ellipsis placement, etc.) change across versions.
- Watch for attribute limits and query complexity limits set by the platform.

--

## Integration notes (clients, HTTP API, and versioning)

Clients:

- JavaScript: use official `@sanity/client` (or other implementations) to run queries with parameter binding.
- PHP: official PHP client.
- Other: groq-js, groq-go, groqfmt, groq-cli exist as tooling.

HTTP endpoint basics:

- Endpoint expects a query string and variables map. Provide API version and dataset in headers/URL as required.

Parameter binding example (JS client):

```js
client.fetch('*[_type == "movie" && title match $term]{ _id, title }', {
  term: "Alien*",
});
```

Versioning:

- Check API version when running queries; breaking changes may alter semantics (e.g., ellipsis precedence changed 2021-03-25 in Sanity's API).

--

## Edge Cases and Gotchas

- Dereferencing arrays: remember `arr[]->`, not `arr->`.
- Ellipsis placement matters for overriding fields in newer API versions.
- `match` is token-based — not substring.
- `in` on arrays tests membership of a scalar in an array, not deep structural inclusion unless using `[]` traversal.
- When combining ordering and slicing, the order you pipe and slice affects results: `*[] | order(...) [0..9]` vs `*[] [0..9] | order(...)` — the former orders the complete set before slicing.
- Null vs undefined: `null` is a value; undefined fields may behave differently—use `defined()` to check existence.

--

## Examples — from simple to advanced

1. Basic projection and computation:

```groq
*[_type == "movie"]{ title, "actorCount": count(actors) }
```

2. Expand reference but only grab a nested field:

```groq
*[_type == "movie"]{ title, director->name }
```

3. Join using parent operator:

```groq
*[_type == "person"]{ _id, name, "movies": *[_type=="movie" && references(^._id)].title }
```

4. Conditional projection and nested query:

```groq
*[_type == "movie"]{ title, releaseYear, releaseYear >= 2020 => { "isNew": true } }
```

5. Full-text score and ordering with boosts:

```groq
*[_type == "post"] | score(boost(title match $term, 4), boost(body match $term, 1)) | order(_score desc, _updatedAt desc) { title, _score }
```

6. Paginated query with safe ordering:

```groq
*[_type == "movie" && defined(releaseYear)] | order(releaseYear desc, _id asc)[$start..$end]{ title, releaseYear }
```

7. Geo filter example:

```groq
*[_type == "storefront" && geo::distance(location, $userLocation) < 16093.4]{ name, location }
```

8. Handling polymorphic content arrays conditionally (references vs inline objects):

```groq
{ "content": content[]{ _type == "reference" => @->, _type != "reference" => @ } }
```

--

## Quick cheat sheet

- `*` — all documents
- `[...]` — filter
- `{...}` — projection
- `->` — dereference
- `[]` after field — project/operate over array members
- `|` — pipe to function
- `order(...)` — sorting (used with `|`)
- `count()` — number of elements
- `coalesce()` — first non-null
- `select()` — conditional
- `match` — tokenized full-text match

--

## Links & authoritative references

- GROQ official spec: https://spec.groq.dev/
- Sanity GROQ docs and cheat-sheet: https://www.sanity.io/docs/groq and https://www.sanity.io/docs/content-lake/query-cheat-sheet
- Sanity how queries work (tutorial): https://www.sanity.io/docs/content-lake/how-queries-work
- GROQ repository and test-suite: https://github.com/sanity-io/GROQ

--

## Final notes for AI agent integrators

When implementing GROQ execution or generation:

- Normalize inputs: validate query string and variables, ensure proper API version supplied.
- Use parameter binding (`$var`) to avoid injection and for cache-friendly queries.
- Handle errors robustly: surface parse errors with context, and runtime errors with safe fallbacks.
- Provide automated tests with example JSON fixtures and expected query outputs, including edge cases (arrays, references, nulls).

Suggested small testcases for integration:

- Query a dataset with: documents of types `movie`, `person`, `imageAsset`. Test dereference, array deref, parent `^` referencing, scoring, slices, and `coalesce()`.

If you want, I can:

1. expand the full functions reference (complete signatures),
2. add a set of runnable unit tests and a tiny harness, or
3. produce a condensed cheat-sheet printable PDF.

--

Updated: consolidated from Sanity docs and GROQ specification; reviewed for accuracy and grouped for developer and AI integration use.

If you'd like, I can now:

1. expand the full functions reference (complete signatures),
2. add a set of runnable unit tests and a tiny harness, or
3. produce a condensed cheat-sheet printable PDF.

Tell me which of these extras to do next.

---

## ORGANIZED & VERIFIED (APPENDED COPY — ORIGINAL ABOVE LEFT INTACT)

Note: Per your request I did not delete or change the existing content above. Below is a non-destructive, organized review and appended cleaned/verified section you can use immediately. If you want these changes merged into the top of the file or split into separate files (recommended: `groq.md` for GROQ and `groq-api.md` for the Groq API content present below), tell me and I will do that without deleting the original content.

### Quick review summary

- Status: The file contains a very thorough GROQ reference and many useful examples. Good coverage of filters, projections, dereferencing, `|` (pipe), `order()`, `score()/boost()`, `match`, `select()`, geo helpers, and integration notes.
- Strengths: practical examples, coverage of gotchas (ellipsis placement, array deref, `match` behavior), and integration suggestions (parameter binding, API versioning). This is already very useful for an AI integrator.
- Issues found (non-blocking):
  1. The file contains a large amount of non-GROQ Groq API docs, SDK snippets, model/vision/tts/transcription docs and rate-limit pages that are unrelated to the GROQ language itself. These belong in a different document (for example `groq-api.md`).
  2. Duplicate or repeated sections — the Reasoning and some other sections appear multiple times (likely pasted content). This doesn't break anything but makes the document noisy.
  3. Function list is curated but not exhaustive — the spec has additional names and detailed parameter/return types. If you want a verbatim function table (signature + example + return type), I can add it.
  4. A few examples mention API-version behavior (ellipsis precedence change) — accurate, but you may want to list the recommended API version string and exact semantic differences for clarity.

### Accuracy & verification notes

- I cross-checked key GROQ topics against Sanity docs and the GROQ spec during the earlier scrape. The GROQ-specific content (operators, projection rules, dereferencing, `references()`, `^` parent operator, `@`, `match` tokenization, `order` and pipe semantics) is correct and matches the authoritative sources.
- Warning: `match` semantics are token-based — not substring. This is already noted in the file, and that note is correct.
- Ellipsis operator semantics: your note about placement changing in v2021-03-25 is correct for Sanity's API. If you depend on a specific behavior, bind the API version explicitly in your client or document the expected server behavior.

### Recommended organization (non-destructive)

I appended this cleaned organization so you and an agent can quickly consume a compact, verified reference. Recommended repo structure (I can implement):

- `groq.md` — GROQ language reference (this file or split to keep original and cleaned)
- `groq-functions.md` — full function reference (signatures + examples)
- `groq-examples.md` — curated runnable examples and small dataset for tests
- `groq-api.md` — API + SDK usage (currently mixed into this document) — move all Groq API/vision/tts/transcription/Rate Limits content here

If you'd like, I can split the file accordingly while preserving the original content in a `groq.md.orig` copy (non-destructive). Say "split" to do that.

### Appended cleaned/organized GROQ reference (concise)

Below is a compact, organized reference extracted and cleaned from the file above. Keep the original (above) for full examples and historical material — use this appended portion as the canonical, skimmable reference.

#### Table of contents (appended)

1. Overview & Contract
2. Syntax & Flow (root, filters, projections, slices)
3. Operators & expressions
4. Arrays, traversal, references, dereferencing
5. Projections, ellipsis, computed fields
6. Special variables (`@`, `^`)
7. Built-in functions (curated) + notes about pipe functions
8. Text/search/score/boost patterns
9. Geo & Date helpers
10. Best practices, performance & pagination
11. Gotchas & edge-cases
12. Suggested next steps & tests

#### 1) Overview & contract

- Input: query string (GROQ), variables map (`$var`), execution context (API version/dataset).
- Output: JSON value (array/object/scalar), shaped by projection/outer expression.
- Errors: parse / runtime / permission / limit errors — provide helpful messages and keep queries parameterized.

#### 2) Syntax & flow (essentials)

- `*` — all documents; `*[ filter ]` applies filter.
- Projection: `{ field, "alias": expr }`
- Selector/slice `[...]` after a set or array (`[0]`, `[0..9]`, `[0...10]`).
- Pipe `|` passes values to pipe-functions (e.g., `| order(...)`, `| score(...)`).

#### 3) Operators & expressions (concise)

- Comparisons: `==`, `!=`, `<`, `<=`, `>`, `>=`.
- Boolean: `&&`, `||`, `!`.
- `in` tests membership: `"sci-fi" in genres`.
- Arithmetic: `+ - * / % **`.

#### 4) Arrays, traversal, references

- To operate/expand each array member use `field[]` or `field[]{ ... }`.
- Dereference: `ref->` (single) and `array[]->` (map over array of refs).
- Parent operator `^` refers to enclosing document in subqueries.

#### 5) Projections & ellipsis

- `...` includes unspecified fields — placement matters (later wins in newer API versions). Prefer listing `...` first then explicit fields to override.

#### 6) Special variables

- `@` refers to current scope item; `^` refers to parent document.

#### 7) Built-in functions (curated quick list)

- count(), sum(), min(), max(), round(), floor(), ceil()
- coalesce(a,b,...)
- defined(x)
- select(cond => value, ...)
- order(...), score(...), boost(...)
- dateTime(), now()
- references(id/expression), path(pattern)
- array::unique/compact/join, string::startsWith/endsWith
- geo::distance/contains/intersects

Notes: `order()` and `score()` are pipe functions — use `| order(...)` and `| score(...)`.

#### 8) Text/search patterns

- `match` is tokenized full-text match (not substring); use `score()` and `boost()` for ranking.

#### 9) Geo & Date

- `geo::distance(pointA,pointB)` returns meters. Use `dateTime()` for timestamp comparisons. Convert to Zulu/timezone-neutral strings when comparing.

#### 10) Best practices

- Always order before slicing for deterministic pagination: `*[] | order(...)[$start..$end]`.
- Parameterize queries with `$var` for safety and caching.
- Keep projections minimal; use `...` thoughtfully.

#### 11) Gotchas

- Use `array[]->` to deref arrays.
- `match` tokenization surprises; test thoroughly.
- Ellipsis override rules changed between API versions — document which version you target.

#### 12) Next steps I can take (pick any)

1. Expand into a full function reference: I will pull exact signatures from the GROQ spec and append a table (function name, args, return, example).
2. Split the current file into `groq.md` (language) and `groq-api.md` (Groq API / SDK / models) — preserves original and creates clean docs.
3. Create a small JSON fixture dataset and runnable node tests using `groq-js` to validate 15 canonical queries (dereference, arrays, slices, score, geo, coalesce). I will include `package.json` and `README.md`.

---

If you want me to append the full function table or create the test harness now, say which option (1/2/3) or say "do all" and I'll implement it next, preserving the original file contents as requested.

import OpenAI from "openai";
const client = new OpenAI({
apiKey: process.env.GROQ_API_KEY,
baseURL: "https://api.groq.com/openai/v1",
});

const response = await client.responses.create({
model: "openai/gpt-oss-20b",
input: "Explain the importance of fast language models",
});
console.log(response.output_text);

---

description: Get up and running with the Groq API in minutes: create an API key, set up your environment, and make your first request.
title: Quickstart - GroqDocs
image: https://console.groq.com/og_cloudv5.jpg

---

# Quickstart

Get up and running with the Groq API in a few minutes.

## [Create an API Key](#create-an-api-key)

Please visit [here](https://console.groq.com/keys) to create an API Key.

## [Set up your API Key (recommended)](#set-up-your-api-key-recommended)

Configure your API key as an environment variable. This approach streamlines your API usage by eliminating the need to include your API key in each request. Moreover, it enhances security by minimizing the risk of inadvertently including your API key in your codebase.

### [In your terminal of choice:](#in-your-terminal-of-choice)

shell

```
export GROQ_API_KEY=<your-api-key-here>
```

## [Requesting your first chat completion](#requesting-your-first-chat-completion)

curlJavaScriptPythonJSON

### [Install the Groq Python library:](#install-the-groq-python-library)

shell

```
pip install groq
```

### [Performing a Chat Completion:](#performing-a-chat-completion)

Python

```
import os

from groq import Groq

client = Groq(
    api_key=os.environ.get("GROQ_API_KEY"),
)

chat_completion = client.chat.completions.create(
    messages=[
        {
            "role": "user",
            "content": "Explain the importance of fast language models",
        }
    ],
    model="llama-3.3-70b-versatile",
)

print(chat_completion.choices[0].message.content)
```

## [Using third-party libraries and SDKs](#using-thirdparty-libraries-and-sdks)

Vercel AI SDKLiteLLMLangChain

### [Using AI SDK:](#using-ai-sdk)

[AI SDK](https://ai-sdk.dev/) is a Javascript-based open-source library that simplifies building large language model (LLM) applications. Documentation for how to use Groq on the AI SDK [can be found here](https://console.groq.com/docs/ai-sdk/).

First, install the `ai` package and the Groq provider `@ai-sdk/groq`:

shell

```
pnpm add ai @ai-sdk/groq
```

Then, you can use the Groq provider to generate text. By default, the provider will look for `GROQ_API_KEY` as the API key.

JavaScript

```
import { groq } from '@ai-sdk/groq';
import { generateText } from 'ai';

const { text } = await generateText({
  model: groq('llama-3.3-70b-versatile'),
  prompt: 'Write a vegetarian lasagna recipe for 4 people.',
});
```

Now that you have successfully received a chat completion, you can try out the other endpoints in the API.

### [Next Steps](#next-steps)

- Check out the [Playground](https://console.groq.com/playground) to try out the Groq API in your browser
- Join our GroqCloud [developer community](https://community.groq.com/)
- Add a how-to on your project to the [Groq API Cookbook](https://github.com/groq/groq-api-cookbook)

---

description: Learn how to use OpenAI&#x27;s client libraries with Groq API, including configuration, supported features, and limitations.
title: OpenAI Compatibility - GroqDocs
image: https://console.groq.com/og_cloudv5.jpg

---

# OpenAI Compatibility

We designed Groq API to be mostly compatible with OpenAI's client libraries, making it easy to configure your existing applications to run on Groq and try our inference speed.

We also have our own [Groq Python and Groq TypeScript libraries](https://console.groq.com/docs/libraries) that we encourage you to use.

## [Configuring OpenAI to Use Groq API](#configuring-openai-to-use-groq-api)

To start using Groq with OpenAI's client libraries, pass your Groq API key to the `api_key` parameter and change the `base_url` to `https://api.groq.com/openai/v1`:

PythonJavaScript

python

```
import os
import openai

client = openai.OpenAI(
    base_url="https://api.groq.com/openai/v1",
    api_key=os.environ.get("GROQ_API_KEY")
)
```

You can find your API key [here](https://console.groq.com/keys).

## [Currently Unsupported OpenAI Features](#currently-unsupported-openai-features)

Note that although Groq API is mostly OpenAI compatible, there are a few features we don't support just yet:

### [Text Completions](#text-completions)

The following fields are currently not supported and will result in a 400 error (yikes) if they are supplied:

- `logprobs`
- `logit_bias`
- `top_logprobs`
- `messages[].name`
- If `N` is supplied, it must be equal to 1.

### [Temperature](#temperature)

If you set a `temperature` value of 0, it will be converted to `1e-8`. If you run into any issues, please try setting the value to a float32 `> 0` and `<= 2`.

### [Audio Transcription and Translation](#audio-transcription-and-translation)

The following values are not supported:

- `vtt`
- `srt`

## [Responses API](#responses-api)

Groq also supports the [Responses API](https://console.groq.com/docs/responses-api), which is a more advanced interface for generating model responses that supports both text and image inputs while producing text outputs. You can build stateful conversations by using previous responses as context, and extend your model's capabilities through function calling to connect with external systems and data sources.

### [Feedback](#feedback)

If you'd like to see support for such features as the above on Groq API, please reach out to us and let us know by submitting a "Feature Request" via "Chat with us" in the menu after clicking your organization in the top right. We really value your feedback and would love to hear from you! 🤩

## [Next Steps](#next-steps)

Migrate your prompts to open-source models using our [model migration guide](https://console.groq.com/docs/prompting/model-migration), or learn more about prompting in our [prompting guide](https://console.groq.com/docs/prompting).

---

description: Learn how to use the OpenAI-compatible Responses API with Groq, including built-in tools, tool use examples, and supported features.
title: Responses API - GroqDocs
image: https://console.groq.com/og_cloudv5.jpg

---

# Responses API

Groq's Responses API is fully compatible with OpenAI's Responses API, making it easy to integrate advanced conversational AI capabilities into your applications. The Responses API supports both text and image inputs while producing text outputs, stateful conversations, and function calling to connect with external systems.

The Responses API is currently in beta. Please let us know your feedback in our [Community](https://community.groq.com).

## [Configuring OpenAI Client for Responses API](#configuring-openai-client-for-responses-api)

To use the Responses API with OpenAI's client libraries, configure your client with your Groq API key and set the base URL to `https://api.groq.com/openai/v1`:

javascript

```
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

const response = await client.responses.create({
  model: "openai/gpt-oss-20b",
  input: "Tell me a fun fact about the moon in one sentence.",
});

console.log(response.output_text);
```

```
import openai

client = openai.OpenAI(
    api_key="your-groq-api-key",
    base_url="https://api.groq.com/openai/v1"
)

response = client.responses.create(
    model="llama-3.3-70b-versatile",
    input="Tell me a fun fact about the moon in one sentence.",
)

print(response.output_text)
```

```
curl https://api.groq.com/openai/v1/responses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $GROQ_API_KEY" \
  -d '{
    "model": "llama-3.3-70b-versatile",
    "input": "Tell me a fun fact about the moon in one sentence."
  }'
```

You can find your API key [here](https://console.groq.com/keys).

## [Multi-turn Conversations](#multiturn-conversations)

The Responses API on Groq doesn't support stateful conversations yet, so you'll need to keep track of the conversation history yourself and provide it in every request.

javascript

```
import OpenAI from "openai";
import * as readline from "readline";

const client = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1",
});

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

function askQuestion(query) {
    return new Promise((resolve) => {
        rl.question(query, resolve);
    });
}

const messages = [];

async function main() {
    while (true) {
        const userInput = await askQuestion("You: ");

        if (userInput.toLowerCase().trim() === "stop") {
            console.log("Goodbye!");
            rl.close();
            break;
        }

        messages.push({
            role: "user",
            content: userInput,
        });

        const response = await client.responses.create({
            model: "openai/gpt-oss-20b",
            input: messages,
        });

        const assistantMessage = response.output_text;
        messages.push(...response.output);

        console.log(`Assistant: ${assistantMessage}`);
    }
}

main();
```

```
import os
from openai import OpenAI

client = OpenAI(
    api_key=os.environ.get("GROQ_API_KEY"),
    base_url="https://api.groq.com/openai/v1",
)

messages = []


def main():
    while True:
        user_input = input("You: ")

        if user_input.lower().strip() == "stop":
            print("Goodbye!")
            break

        messages.append({
            "role": "user",
            "content": user_input,
        })

        response = client.responses.create(
            model="openai/gpt-oss-20b",
            input=messages,
        )

        assistant_message = response.output_text
        messages.extend(response.output)

        print(f"Assistant: {assistant_message}")


if __name__ == "__main__":
    main()
```

## [Image Inputs](#image-inputs)

The Responses API supports image inputs with all [vision-capable models](https://console.groq.com/docs/vision). Here's an example of how to pass an image to the model:

javascript

```
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

const response = await client.responses.create({
  model: "meta-llama/llama-4-scout-17b-16e-instruct",
  input: [
    {
      role: "user",
      content: [
        {
            type: "input_text",
            text: "What are the main colors in this image? Give me the hex code for each color in a list."
        },
        {
            type: "input_image",
            detail: "auto",
            image_url: "https://console.groq.com/og_cloud.png"
        }
      ]
    }
  ],
});

console.log(response.output_text);
```

```
import os
from openai import OpenAI

client = OpenAI(
    api_key=os.environ.get("GROQ_API_KEY"),
    base_url="https://api.groq.com/openai/v1",
)

response = client.responses.create(
    model="meta-llama/llama-4-scout-17b-16e-instruct",
    input=[
        {
            "role": "user",
            "content": [
                {
                    "type": "input_text",
                    "text": "What are the main colors in this image? Give me the hex code for each color in a list."
                },
                {
                    "type": "input_image",
                    "detail": "auto",
                    "image_url": "https://console.groq.com/og_cloud.png"
                }
            ]
        }
    ],
)

print(response.output_text)
```

```
curl -X POST https://api.groq.com/openai/v1/responses \
  -H "Authorization: Bearer ${GROQ_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "meta-llama/llama-4-scout-17b-16e-instruct",
    "input": [
      {
        "role": "user",
        "content": [
          {
            "type": "input_text",
            "text": "What are the main colors in this image? Give me the hex code for each color in a list."
          },
          {
            "type": "input_image",
            "detail": "auto",
            "image_url": "https://console.groq.com/og_cloud.png"
          }
        ]
      }
    ]
  }'
```

## [Built-In Tools](#builtin-tools)

In addition to a model's regular [tool use capabilities](https://console.groq.com/docs/tool-use), the Responses API supports various built-in tools to extend your model's capabilities.

### [Model Support](#model-support)

While all models support the Responses API, these built-in tools are only supported for the following models:

| Model ID                                                                       | Browser Search | Code Execution |
| ------------------------------------------------------------------------------ | -------------- | -------------- |
| [openai/gpt-oss-20b](https://console.groq.com/docs/model/openai/gpt-oss-20b)   | ✅             | ✅             |
| [openai/gpt-oss-120b](https://console.groq.com/docs/model/openai/gpt-oss-120b) | ✅             | ✅             |

Here are examples using code execution and browser search:

### [Code Execution Example](#code-execution-example)

Enable your models to write and execute Python code for calculations, data analysis, and problem-solving - see our [code execution documentation](https://console.groq.com/docs/code-execution) for more details.

javascript

```
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

const response = await client.responses.create({
  model: "openai/gpt-oss-20b",
  input: "What is 1312 X 3333? Output only the final answer.",
  tool_choice: "required",
  tools: [
    {
      type: "code_interpreter",
      container: {
        "type": "auto"
      }
    }
  ]
});

console.log(response.output_text);
```

```
import openai

client = openai.OpenAI(
    api_key="your-groq-api-key",
    base_url="https://api.groq.com/openai/v1"
)

response = client.responses.create(
    model="openai/gpt-oss-20b",
    input="What is 1312 X 3333? Output only the final answer.",
    tool_choice="required",
    tools=[
        {
            "type": "code_interpreter",
            "container": {
                "type": "auto"
            }
        }
    ]
)

print(response.output_text)
```

```
curl https://api.groq.com/openai/v1/responses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $GROQ_API_KEY" \
  -d '{
    "model": "openai/gpt-oss-20b",
    "input": "What is 1312 X 3333? Output only the final answer.",
    "tool_choice": "required",
    "tools": [
      {
        "type": "code_interpreter",
        "container": {
          "type": "auto"
        }
      }
    ]
  }'
```

### [Browser Search Example](#browser-search-example)

Give your models access to real-time web content and up-to-date information - see our [browser search documentation](https://console.groq.com/docs/browser-search) for more details.

javascript

```
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

const response = await client.responses.create({
  model: "openai/gpt-oss-20b",
  input: "Analyze the current weather in San Francisco and provide a detailed forecast.",
  tool_choice: "required",
  tools: [
    {
      type: "browser_search"
    }
  ]
});

console.log(response.output_text);
```

```
import openai

client = openai.OpenAI(
    api_key="your-groq-api-key",
    base_url="https://api.groq.com/openai/v1"
)

response = client.responses.create(
    model="openai/gpt-oss-20b",
    input="Analyze the current weather in San Francisco and provide a detailed forecast.",
    tool_choice="required",
    tools=[
        {
            "type": "browser_search"
        }
    ]
)

print(response.output_text)
```

```
curl https://api.groq.com/openai/v1/responses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $GROQ_API_KEY" \
  -d '{
    "model": "openai/gpt-oss-20b",
    "input": "Analyze the current weather in San Francisco and provide a detailed forecast.",
    "tool_choice": "required",
    "tools": [
      {
        "type": "browser_search"
      }
    ]
  }'
```

## [Structured Outputs](#structured-outputs)

Use structured outputs to ensure the model's response follows a specific JSON schema. This is useful for extracting structured data from text, ensuring consistent response formats, or integrating with downstream systems that expect specific data structures.

For a complete list of models that support structured outputs, see our [structured outputs documentation](https://console.groq.com/docs/structured-outputs).

javascript

```
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

const response = await openai.responses.create({
  model: "moonshotai/kimi-k2-instruct-0905",
  instructions: "Extract product review information from the text.",
  input: "I bought the UltraSound Headphones last week and I'm really impressed! The noise cancellation is amazing and the battery lasts all day. Sound quality is crisp and clear. I'd give it 4.5 out of 5 stars.",
  text: {
    format: {
      type: "json_schema",
      name: "product_review",
      schema: {
        type: "object",
        properties: {
          product_name: { type: "string" },
          rating: { type: "number" },
          sentiment: {
            type: "string",
            enum: ["positive", "negative", "neutral"]
          },
          key_features: {
            type: "array",
            items: { type: "string" }
          }
        },
        required: ["product_name", "rating", "sentiment", "key_features"],
        additionalProperties: false
      }
    }
  }
});

console.log(response.output_text);
```

```
import os
from openai import OpenAI

client = OpenAI(
    api_key=os.environ.get("GROQ_API_KEY"),
    base_url="https://api.groq.com/openai/v1"
)

response = client.responses.create(
    model="moonshotai/kimi-k2-instruct-0905",
    instructions="Extract product review information from the text.",
    input="I bought the UltraSound Headphones last week and I'm really impressed! The noise cancellation is amazing and the battery lasts all day. Sound quality is crisp and clear. I'd give it 4.5 out of 5 stars.",
    text={
        "format": {
            "type": "json_schema",
            "name": "product_review",
            "schema": {
                "type": "object",
                "properties": {
                    "product_name": {"type": "string"},
                    "rating": {"type": "number"},
                    "sentiment": {
                        "type": "string",
                        "enum": ["positive", "negative", "neutral"]
                    },
                    "key_features": {
                        "type": "array",
                        "items": {"type": "string"}
                    }
                },
                "required": ["product_name", "rating", "sentiment", "key_features"],
                "additionalProperties": False
            }
        }
    }
)

print(response.output_text)
```

```
curl -X POST "https://api.groq.com/openai/v1/responses" \
  -H "Authorization: Bearer $GROQ_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "moonshotai/kimi-k2-instruct-0905",
    "instructions": "Extract product review information from the text.",
    "input": "I bought the UltraSound Headphones last week and I'\''m really impressed! The noise cancellation is amazing and the battery lasts all day. Sound quality is crisp and clear. I'\''d give it 4.5 out of 5 stars.",
    "text": {
      "format": {
        "type": "json_schema",
        "name": "product_review",
        "schema": {
          "type": "object",
          "properties": {
            "product_name": { "type": "string" },
            "rating": { "type": "number" },
            "sentiment": {
              "type": "string",
              "enum": ["positive", "negative", "neutral"]
            },
            "key_features": {
              "type": "array",
              "items": { "type": "string" }
            }
          },
          "required": ["product_name", "rating", "sentiment", "key_features"],
          "additionalProperties": false
        }
      }
    }
  }'
```

Result

JSON

```
{
  "product_name": "UltraSound Headphones",
  "rating": 4.5,
  "sentiment": "positive",
  "key_features": [
      "noise cancellation",
      "long battery life",
      "crisp and clear sound quality"
  ]
}
```

### [Using a Schema Validation Library](#using-a-schema-validation-library)

When working with Structured Outputs, you can use popular schema validation libraries like [Zod](https://zod.dev/) for TypeScript and [Pydantic](https://docs.pydantic.dev/latest/) for Python. These libraries provide type safety, runtime validation, and seamless integration with JSON Schema generation.

javascript

```
import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";

const openai = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1",
});

const Recipe = z.object({
  title: z.string(),
  description: z.string(),
  prep_time_minutes: z.number(),
  cook_time_minutes: z.number(),
  ingredients: z.array(z.string()),
  instructions: z.array(z.string()),
});

const response = await openai.responses.parse({
  model: "openai/gpt-oss-20b",
  input: [
    { role: "system", content: "Create a recipe." },
    {
      role: "user",
      content: "Healthy chocolate coconut cake",
    },
  ],
  text: {
    format: zodTextFormat(Recipe, "recipe"),
  },
});

const recipe = response.output_parsed;
console.log(recipe);
```

```
import os
from openai import OpenAI
from pydantic import BaseModel


class Recipe(BaseModel):
    title: str
    description: str
    prep_time_minutes: int
    cook_time_minutes: int
    ingredients: list[str]
    instructions: list[str]


client = OpenAI(
    api_key=os.environ.get("GROQ_API_KEY"),
    base_url="https://api.groq.com/openai/v1",
)

response = client.responses.parse(
    model="openai/gpt-oss-20b",
    input=[
        {"role": "system", "content": "Create a recipe."},
        {
            "role": "user",
            "content": "Healthy chocolate coconut cake",
        },
    ],
    text_format=Recipe,
)

recipe = response.output_parsed
print(recipe)
```

## [Reasoning](#reasoning)

Use reasoning to let the model produce an internal chain of thought before generating a response. This is useful for complex problem solving, multi-step agentic workflow planning, and scientific analysis.

For a complete list of models that support reasoning, see our [reasoning documentation](https://console.groq.com/docs/reasoning).

javascript

```
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

const response = await client.responses.create({
  model: "openai/gpt-oss-20b",
  input: "How are AI models trained? Be brief.",
  reasoning: {
    effort: "low"
  }
});

console.log(response.output_text);
```

```
import openai

client = openai.OpenAI(
    api_key="your-groq-api-key",
    base_url="https://api.groq.com/openai/v1"
)

response = client.responses.create(
    model="openai/gpt-oss-20b",
    input="How are AI models trained? Be brief.",
    reasoning={
        "effort": "low"
    }
)

print(response.output_text)
```

```
curl https://api.groq.com/openai/v1/responses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $GROQ_API_KEY" \
  -d '{
    "model": "openai/gpt-oss-20b",
    "input": "How are AI models trained? Be brief.",
    "reasoning": {"effort": "low"}
  }'
```

Result

JSON

```
{
  "id": "resp_01k3hgcytaf7vawfkph3pef9qk",
  "object": "response",
  "status": "completed",
  "created_at": 1756155509,
  "output": [
    {
      "type": "reasoning",
      "id": "resp_01k3hgcytaf7vsyqqdk1932swk",
      "status": "completed",
      "content": [
        {
          "type": "reasoning_text",
          "text": "Need brief explanation."
        }
      ],
      "summary": []
    },
    {
      "type": "message",
      "id": "msg_01k3hgcytaf7w9wzkh0w18ww1q",
      "status": "completed",
      "role": "assistant",
      "content": [
        {
          "type": "output_text",
          "text": "AI models are trained by showing them many examples and adjusting their internal parameters so they make better predictions.1. **Define a task** (e.g., classify images, translate text, predict next word).  2. **Gather data**—a large set of input‑output pairs.  3. **Choose a model architecture** (e.g., neural network layers).  4. **Initialize weights** randomly or from a pre‑trained checkpoint.  5. **Feed data** through the network, compute an error (loss) between the model’s output and the true answer.  6. **Back‑propagate the error** to update the weights using an optimizer (e.g., SGD, Adam).  7. **Repeat** over many epochs until the loss stops improving.  8. **Validate** on a separate dataset to check generalization.  The process uses gradient descent and large‑scale computation (GPUs/TPUs) to handle the massive parameter count.",
          "annotations": [],
          "logprobs": null
        }
      ]
    }
  ],
  "previous_response_id": null,
  "model": "openai/gpt-oss-20b",
  "reasoning": {
    "effort": "low"
  },
  "max_output_tokens": null,
  "text": {
    "format": {
      "type": "text"
    }
  },
  "tools": [],
  "tool_choice": "auto",
  "truncation": "disabled",
  "metadata": {},
  "temperature": 1,
  "top_p": 1,
  "user": null,
  "service_tier": "default",
  "background": false,
  "error": null,
  "incomplete_details": null,
  "usage": {
    "input_tokens": 80,
    "input_tokens_details": {
      "cached_tokens": 0,
      "reasoning_tokens": 0
    },
    "output_tokens": 213,
    "output_tokens_details": {
      "cached_tokens": 0,
      "reasoning_tokens": 0
    },
    "total_tokens": 293
  },
  "parallel_tool_calls": true,
  "store": false,
  "top_logprobs": 0,
  "max_tool_calls": null
}
```

The reasoning traces can be found in the `result.output` array as type "reasoning":

Reasoning Traces

JSON

```
{
  "type": "reasoning",
  "id": "resp_01k3hgcytaf7vsyqqdk1932swk",
  "status": "completed",
  "content": [
    {
      "type": "reasoning_text",
      "text": "Need brief explanation."
    }
  ],
  "summary": []
},
```

## [Model Context Protocol (MCP)](#model-context-protocol-mcp)

The Responses API also supports the [Model Context Protocol (MCP)](https://console.groq.com/docs/mcp), an open-source standard that enables AI applications to connect with external systems like databases, APIs, and tools. MCP provides a standardized way for AI models to access and interact with your data and workflows.

With MCP, you can build AI agents that access your codebase through GitHub, query databases with natural language, browse the web for real-time information, or connect to any API-based service like Slack, Notion, or Google Calendar.

### [MCP Example](#mcp-example)

Here's an example using [Hugging Face's MCP server](https://huggingface.co/settings/mcp) to search for trending AI models.

javascript

```
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

const response = await client.responses.create({
  model: "openai/gpt-oss-120b",
  input: "What models are trending on Huggingface?",
  tools: [
    {
      type: "mcp",
      server_label: "Huggingface",
      server_url: "https://huggingface.co/mcp",
    }
  ]
});

console.log(response);
```

```
import openai
import os

client = openai.OpenAI(
    api_key=os.environ.get("GROQ_API_KEY"),
    base_url="https://api.groq.com/openai/v1"
)

response = client.responses.create(
    model="openai/gpt-oss-120b",
    input="What models are trending on Huggingface?",
    tools=[
        {
            "type": "mcp",
            "server_label": "Huggingface",
            "server_url": "https://huggingface.co/mcp",
        }
    ]
)

print(response)
```

```
curl -X POST "https://api.groq.com/openai/v1/responses" \
  -H "Authorization: Bearer $GROQ_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "openai/gpt-oss-120b",
    "input": "What models are trending on Huggingface?",
    "tools": [
      {
        "type": "mcp",
        "server_label": "Huggingface",
        "server_url": "https://huggingface.co/mcp",
      }
    ]
  }'
```

For comprehensive examples including GitHub integration, web search, and payment processing, see our full [MCP documentation](https://console.groq.com/docs/mcp).

## [Unsupported Features](#unsupported-features)

Although Groq's Responses API is mostly compatible with OpenAI's Responses API, there are a few features we don't support just yet:

- `previous_response_id`
- `store`
- `truncation`
- `include`
- `safety_identifier`
- `prompt_cache_key`

Want to see one of these features supported? Let us know on our [Community forum](https://community.groq.com)!

## [Detailed Usage Metrics](#detailed-usage-metrics)

To include detailed usage metrics for each request (such as exact inference time), set the following header:

text

```
Groq-Beta: inference-metrics
```

In the response body, the `metadata` field will include the following keys:

- `completion_time`: The time in seconds it took to generate the output
- `prompt_time`: The time in seconds it took to process the input prompt
- `queue_time`: The time in seconds the requests was queued before being processed
- `total_time`: The total time in seconds it took to process the request

JSON

```
{
  "metadata": {
    "completion_time": "2.567331286",
    "prompt_time": "0.003652567",
    "queue_time": "0.018393202",
    "total_time": "2.570983853"
  }
}
```

To calculate output tokens per second, combine the information from the `usage` field with the `metadata` field:

text

```
output_tokens_per_second = usage.output_tokens / metadata.completion_time
```

## [Next Steps](#next-steps)

Explore more advanced use cases in our built-in [browser search](https://console.groq.com/docs/browser-search) and [code execution](https://console.groq.com/docs/code-execution) documentation, or learn about connecting to external systems with [MCP](https://console.groq.com/docs/mcp).

---

description: Explore all available models on GroqCloud.
title: Supported Models - GroqDocs
image: https://console.groq.com/og_cloudv5.jpg

---

# Supported Models

Explore all available models on GroqCloud.

## [Featured Models and Systems](#featured-models-and-systems)

[![Groq Compound icon](https://console.groq.com/_next/image?url=%2Fgroq-circle.png&w=96&q=75)Groq CompoundGroq Compound is an AI system powered by openly available models that intelligently and selectively uses built-in tools to answer user queries, including web search and code execution.Token Speed\~450 tpsModalitiesCapabilities](/docs/compound/systems/compound)[![OpenAI GPT-OSS 120B icon](https://console.groq.com/_next/static/media/openailogo.523c87a0.svg)OpenAI GPT-OSS 120BGPT-OSS 120B is OpenAI's flagship open-weight language model with 120 billion parameters, built in browser search and code execution, and reasoning capabilities.Token Speed\~500 tpsModalitiesCapabilities](/docs/model/openai/gpt-oss-120b)

## [Production Models](#production-models)

**Note:** Production models are intended for use in your production environments. They meet or exceed our high standards for speed, quality, and reliability. Read more [here](https://console.groq.com/docs/deprecations).

| MODEL ID                                                                                                                                                              | SPEED (T/SEC) | PRICE PER 1M TOKENS      | RATE LIMITS (DEVELOPER PLAN) | CONTEXT WINDOW (TOKENS) | MAX COMPLETION TOKENS | MAX FILE SIZE |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- | ------------------------ | ---------------------------- | ----------------------- | --------------------- | ------------- |
| [![Meta](https://console.groq.com/_next/image?url=%2FMeta_logo.png&w=48&q=75)Llama 3.1 8B](/docs/model/llama-3.1-8b-instant)llama-3.1-8b-instant                      | 560           | $0.05 input$0.08 output  | 250K TPM1K RPM               | 131,072                 | 131,072               | \-            |
| [![Meta](https://console.groq.com/_next/image?url=%2FMeta_logo.png&w=48&q=75)Llama 3.3 70B](/docs/model/llama-3.3-70b-versatile)llama-3.3-70b-versatile               | 280           | $0.59 input$0.79 output  | 300K TPM1K RPM               | 131,072                 | 32,768                | \-            |
| [![Meta](https://console.groq.com/_next/image?url=%2FMeta_logo.png&w=48&q=75)Llama Guard 4 12B](/docs/model/meta-llama/llama-guard-4-12b)meta-llama/llama-guard-4-12b | 1200          | $0.20 input$0.20 output  | 30K TPM100 RPM               | 131,072                 | 1,024                 | 20 MB         |
| [![OpenAI](https://console.groq.com/_next/static/media/openailogo.523c87a0.svg)GPT OSS 120B](/docs/model/openai/gpt-oss-120b)openai/gpt-oss-120b                      | 500           | $0.15 input$0.60 output  | 250K TPM1K RPM               | 131,072                 | 65,536                | \-            |
| [![OpenAI](https://console.groq.com/_next/static/media/openailogo.523c87a0.svg)GPT OSS 20B](/docs/model/openai/gpt-oss-20b)openai/gpt-oss-20b                         | 1000          | $0.075 input$0.30 output | 250K TPM1K RPM               | 131,072                 | 65,536                | \-            |
| [![OpenAI](https://console.groq.com/_next/static/media/openailogo.523c87a0.svg)Whisper](/docs/model/whisper-large-v3)whisper-large-v3                                 | \-            | $0.111 per hour          | 200K ASH300 RPM              | \-                      | \-                    | 100 MB        |
| [![OpenAI](https://console.groq.com/_next/static/media/openailogo.523c87a0.svg)Whisper Large V3 Turbo](/docs/model/whisper-large-v3-turbo)whisper-large-v3-turbo      | \-            | $0.04 per hour           | 400K ASH400 RPM              | \-                      | \-                    | 100 MB        |

## [Production Systems](#production-systems)

Systems are a collection of models and tools that work together to answer a user query.

| MODEL ID                                                                                                                                              | SPEED (T/SEC) | PRICE PER 1M TOKENS | RATE LIMITS (DEVELOPER PLAN) | CONTEXT WINDOW (TOKENS) | MAX COMPLETION TOKENS | MAX FILE SIZE |
| ----------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- | ------------------- | ---------------------------- | ----------------------- | --------------------- | ------------- |
| [![Groq](https://console.groq.com/_next/image?url=%2Fgroq-circle.png&w=48&q=75)Compound](/docs/compound/systems/compound)groq/compound                | 450           | \-                  | 200K TPM200 RPM              | 131,072                 | 8,192                 | \-            |
| [![Groq](https://console.groq.com/_next/image?url=%2Fgroq-circle.png&w=48&q=75)Compound Mini](/docs/compound/systems/compound-mini)groq/compound-mini | 450           | \-                  | 200K TPM200 RPM              | 131,072                 | 8,192                 | \-            |

[Learn More About Agentic ToolingDiscover how to build powerful applications with real-time web search and code execution](https://console.groq.com/docs/agentic-tooling)

## [Preview Models](#preview-models)

**Note:** Preview models are intended for evaluation purposes only and should not be used in production environments as they may be discontinued at short notice. Read more about deprecations [here](https://console.groq.com/docs/deprecations).

| MODEL ID                                                                                                                                                                                                        | SPEED (T/SEC) | PRICE PER 1M TOKENS      | RATE LIMITS (DEVELOPER PLAN) | CONTEXT WINDOW (TOKENS) | MAX COMPLETION TOKENS | MAX FILE SIZE |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- | ------------------------ | ---------------------------- | ----------------------- | --------------------- | ------------- |
| [![Meta](https://console.groq.com/_next/image?url=%2FMeta_logo.png&w=48&q=75)Llama 4 Maverick 17B 128E](/docs/model/meta-llama/llama-4-maverick-17b-128e-instruct)meta-llama/llama-4-maverick-17b-128e-instruct | 600           | $0.20 input$0.60 output  | 300K TPM1K RPM               | 131,072                 | 8,192                 | 20 MB         |
| [![Meta](https://console.groq.com/_next/image?url=%2FMeta_logo.png&w=48&q=75)Llama 4 Scout 17B 16E](/docs/model/meta-llama/llama-4-scout-17b-16e-instruct)meta-llama/llama-4-scout-17b-16e-instruct             | 750           | $0.11 input$0.34 output  | 300K TPM1K RPM               | 131,072                 | 8,192                 | 20 MB         |
| [![Meta](https://console.groq.com/_next/image?url=%2FMeta_logo.png&w=48&q=75)Llama Prompt Guard 2 22M](/docs/model/meta-llama/llama-prompt-guard-2-22m)meta-llama/llama-prompt-guard-2-22m                      | \-            | $0.03 input$0.03 output  | 30K TPM100 RPM               | 512                     | 512                   | \-            |
| [![Meta](https://console.groq.com/_next/image?url=%2FMeta_logo.png&w=48&q=75)Prompt Guard 2 86M](/docs/model/meta-llama/llama-prompt-guard-2-86m)meta-llama/llama-prompt-guard-2-86m                            | \-            | $0.04 input$0.04 output  | 30K TPM100 RPM               | 512                     | 512                   | \-            |
| [![Moonshot AI](https://console.groq.com/_next/image?url=%2Fmoonshot_logo.png&w=48&q=75)Kimi K2 0905](/docs/model/moonshotai/kimi-k2-instruct-0905)moonshotai/kimi-k2-instruct-0905                             | 200           | $1.00 input$3.00 output  | 250K TPM1K RPM               | 262,144                 | 16,384                | \-            |
| [![PlayAI](https://console.groq.com/_next/static/media/playailogo.bf59d168.svg)PlayAI TTS](/docs/model/playai-tts)playai-tts                                                                                    | \-            | $50.00 per 1M characters | 50K TPM250 RPM               | 8,192                   | 8,192                 | \-            |
| [![PlayAI](https://console.groq.com/_next/static/media/playailogo.bf59d168.svg)PlayAI TTS Arabic](/docs/model/playai-tts-arabic)playai-tts-arabic                                                               | \-            | $50.00 per 1M characters | 50K TPM250 RPM               | 8,192                   | 8,192                 | \-            |
| [![Alibaba Cloud](https://console.groq.com/_next/image?url=%2Fqwen_logo.png&w=48&q=75)Qwen3-32B](/docs/model/qwen/qwen3-32b)qwen/qwen3-32b                                                                      | 400           | $0.29 input$0.59 output  | 300K TPM1K RPM               | 131,072                 | 40,960                | \-            |

## [Deprecated Models](#deprecated-models)

Deprecated models are models that are no longer supported or will no longer be supported in the future. See our deprecation guidelines and deprecated models [here](https://console.groq.com/docs/deprecations).

## [Get All Available Models](#get-all-available-models)

Hosted models are directly accessible through the GroqCloud Models API endpoint using the model IDs mentioned above. You can use the `https://api.groq.com/openai/v1/models` endpoint to return a JSON list of all active models:

shell

```
curl -X GET "https://api.groq.com/openai/v1/models" \
     -H "Authorization: Bearer $GROQ_API_KEY" \
     -H "Content-Type: application/json"
```

```
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const getModels = async () => {
  return await groq.models.list();
};

getModels().then((models) => {
  // console.log(models);
});
```

```
import requests
import os

api_key = os.environ.get("GROQ_API_KEY")
url = "https://api.groq.com/openai/v1/models"

headers = {
    "Authorization": f"Bearer {api_key}",
    "Content-Type": "application/json"
}

response = requests.get(url, headers=headers)

print(response.json())
```

---

description: Understand Groq API rate limits, headers, and best practices for managing request and token quotas in your applications.
title: Rate Limits - GroqDocs
image: https://console.groq.com/og_cloudv5.jpg

---

# Rate Limits

Rate limits act as control measures to regulate how frequently users and applications can access our API within specified timeframes. These limits help ensure service stability, fair access, and protection against misuse so that we can serve reliable and fast inference for all.

## [Understanding Rate Limits](#understanding-rate-limits)

Rate limits are measured in:

- **RPM:** Requests per minute
- **RPD:** Requests per day
- **TPM:** Tokens per minute
- **TPD:** Tokens per day
- **ASH:** Audio seconds per hour
- **ASD:** Audio seconds per day

[Cached tokens](https://console.groq.com/docs/prompt-caching) do not count towards your rate limits.

Rate limits apply at the organization level, not individual users. You can hit any limit type depending on which threshold you reach first.

**Example:** Let's say your RPM = 50 and your TPM = 200K. If you were to send 50 requests with only 100 tokens within a minute, you would reach your limit even though you did not send 200K tokens within those 50 requests.

## [Rate Limits](#rate-limits)

The following is a high level summary and there may be exceptions to these limits. You can view the current, exact rate limits for your organization on the [limits page](https://console.groq.com/settings/limits) in your account settings.

FreeDeveloper

| MODEL ID                                      | RPM | RPD   | TPM  | TPD  | ASH  | ASD   |
| --------------------------------------------- | --- | ----- | ---- | ---- | ---- | ----- |
| allam-2-7b                                    | 30  | 7K    | 6K   | 500K | \-   | \-    |
| groq/compound                                 | 30  | 250   | 70K  | \-   | \-   | \-    |
| groq/compound-mini                            | 30  | 250   | 70K  | \-   | \-   | \-    |
| llama-3.1-8b-instant                          | 30  | 14.4K | 6K   | 500K | \-   | \-    |
| llama-3.3-70b-versatile                       | 30  | 1K    | 12K  | 100K | \-   | \-    |
| meta-llama/llama-4-maverick-17b-128e-instruct | 30  | 1K    | 6K   | 500K | \-   | \-    |
| meta-llama/llama-4-scout-17b-16e-instruct     | 30  | 1K    | 30K  | 500K | \-   | \-    |
| meta-llama/llama-guard-4-12b                  | 30  | 14.4K | 15K  | 500K | \-   | \-    |
| meta-llama/llama-prompt-guard-2-22m           | 30  | 14.4K | 15K  | 500K | \-   | \-    |
| meta-llama/llama-prompt-guard-2-86m           | 30  | 14.4K | 15K  | 500K | \-   | \-    |
| moonshotai/kimi-k2-instruct                   | 60  | 1K    | 10K  | 300K | \-   | \-    |
| moonshotai/kimi-k2-instruct-0905              | 60  | 1K    | 10K  | 300K | \-   | \-    |
| openai/gpt-oss-120b                           | 30  | 1K    | 8K   | 200K | \-   | \-    |
| openai/gpt-oss-20b                            | 30  | 1K    | 8K   | 200K | \-   | \-    |
| playai-tts                                    | 10  | 100   | 1.2K | 3.6K | \-   | \-    |
| playai-tts-arabic                             | 10  | 100   | 1.2K | 3.6K | \-   | \-    |
| qwen/qwen3-32b                                | 60  | 1K    | 6K   | 500K | \-   | \-    |
| whisper-large-v3                              | 20  | 2K    | \-   | \-   | 7.2K | 28.8K |
| whisper-large-v3-turbo                        | 20  | 2K    | \-   | \-   | 7.2K | 28.8K |

| MODEL ID                                      | RPM | RPD  | TPM  | TPD | ASH  | ASD |
| --------------------------------------------- | --- | ---- | ---- | --- | ---- | --- |
| allam-2-7b                                    | 300 | 60K  | 60K  | \-  | \-   | \-  |
| groq/compound                                 | 200 | 20K  | 200K | \-  | \-   | \-  |
| groq/compound-mini                            | 200 | 20K  | 200K | \-  | \-   | \-  |
| llama-3.1-8b-instant                          | 1K  | 500K | 250K | \-  | \-   | \-  |
| llama-3.3-70b-versatile                       | 1K  | 500K | 300K | \-  | \-   | \-  |
| meta-llama/llama-4-maverick-17b-128e-instruct | 1K  | 500K | 300K | \-  | \-   | \-  |
| meta-llama/llama-4-scout-17b-16e-instruct     | 1K  | 500K | 300K | \-  | \-   | \-  |
| meta-llama/llama-guard-4-12b                  | 100 | 50K  | 30K  | 1M  | \-   | \-  |
| meta-llama/llama-prompt-guard-2-22m           | 100 | 50K  | 30K  | \-  | \-   | \-  |
| meta-llama/llama-prompt-guard-2-86m           | 100 | 50K  | 30K  | \-  | \-   | \-  |
| moonshotai/kimi-k2-instruct                   | 1K  | 500K | 250K | \-  | \-   | \-  |
| moonshotai/kimi-k2-instruct-0905              | 1K  | 500K | 250K | \-  | \-   | \-  |
| openai/gpt-oss-120b                           | 1K  | 500K | 250K | \-  | \-   | \-  |
| openai/gpt-oss-20b                            | 1K  | 500K | 250K | \-  | \-   | \-  |
| playai-tts                                    | 250 | 100K | 50K  | 2M  | \-   | \-  |
| playai-tts-arabic                             | 250 | 100K | 50K  | 2M  | \-   | \-  |
| qwen/qwen3-32b                                | 1K  | 500K | 300K | \-  | \-   | \-  |
| whisper-large-v3                              | 300 | 200K | \-   | \-  | 200K | 4M  |
| whisper-large-v3-turbo                        | 400 | 200K | \-   | \-  | 400K | 4M  |

## [Rate Limit Headers](#rate-limit-headers)

In addition to viewing your limits on your account's [limits](https://console.groq.com/settings/limits) page, you can also view rate limit information such as remaining requests and tokens in HTTP response headers as follows:

The following headers are set (values are illustrative):

| Header                         | Value    | Notes                                    |
| ------------------------------ | -------- | ---------------------------------------- |
| retry-after                    | 2        | In seconds                               |
| x-ratelimit-limit-requests     | 14400    | Always refers to Requests Per Day (RPD)  |
| x-ratelimit-limit-tokens       | 18000    | Always refers to Tokens Per Minute (TPM) |
| x-ratelimit-remaining-requests | 14370    | Always refers to Requests Per Day (RPD)  |
| x-ratelimit-remaining-tokens   | 17997    | Always refers to Tokens Per Minute (TPM) |
| x-ratelimit-reset-requests     | 2m59.56s | Always refers to Requests Per Day (RPD)  |
| x-ratelimit-reset-tokens       | 7.66s    | Always refers to Tokens Per Minute (TPM) |

## [Handling Rate Limits](#handling-rate-limits)

When you exceed rate limits, our API returns a `429 Too Many Requests` HTTP status code.

**Note**: `retry-after` is only set if you hit the rate limit and status code 429 is returned. The other headers are always included.

## [Need Higher Rate Limits?](#need-higher-rate-limits)

## If you need higher rate limits, you can [request them here](https://groq.com/self-serve-support).

description: Learn how to generate text and have conversations with Groq&#x27;s Chat Completions API, including streaming, JSON mode, and advanced features.
title: Text Generation - GroqDocs
image: https://console.groq.com/og_cloudv5.jpg

---

# Text Generation

Generating text with Groq's Chat Completions API enables you to have natural, conversational interactions with Groq's large language models. It processes a series of messages and generates human-like responses that can be used for various applications including conversational agents, content generation, task automation, and generating structured data outputs like JSON for your applications.

## [Chat Completions](#chat-completions)

Chat completions allow your applications to have dynamic interactions with Groq's models. You can send messages that include user inputs and system instructions, and receive responses that match the conversational context.

Chat models can handle both multi-turn discussions (conversations with multiple back-and-forth exchanges) and single-turn tasks where you need just one response.

For details about all available parameters, [visit the API reference page.](https://console.groq.com/docs/api-reference#chat-create)

### [Getting Started with Groq SDK](#getting-started-with-groq-sdk)

To start using Groq's Chat Completions API, you'll need to install the [Groq SDK](https://console.groq.com/docs/libraries) and set up your [API key](https://console.groq.com/keys).

PythonJavaScript

shell

```
pip install groq
```

## [Performing a Basic Chat Completion](#performing-a-basic-chat-completion)

The simplest way to use the Chat Completions API is to send a list of messages and receive a single response. Messages are provided in chronological order, with each message containing a role ("system", "user", or "assistant") and content.

Python

```
from groq import Groq

client = Groq()

chat_completion = client.chat.completions.create(
    messages=[
        # Set an optional system message. This sets the behavior of the
        # assistant and can be used to provide specific instructions for
        # how it should behave throughout the conversation.
        {
            "role": "system",
            "content": "You are a helpful assistant."
        },
        # Set a user message for the assistant to respond to.
        {
            "role": "user",
            "content": "Explain the importance of fast language models",
        }
    ],

    # The language model which will generate the completion.
    model="llama-3.3-70b-versatile"
)

# Print the completion returned by the LLM.
print(chat_completion.choices[0].message.content)
```

## [Streaming a Chat Completion](#streaming-a-chat-completion)

For a more responsive user experience, you can stream the model's response in real-time. This allows your application to display the response as it's being generated, rather than waiting for the complete response.

To enable streaming, set the parameter `stream=True`. The completion function will then return an iterator of completion deltas rather than a single, full completion.

Python

```
from groq import Groq

client = Groq()

stream = client.chat.completions.create(
    #
    # Required parameters
    #
    messages=[
        # Set an optional system message. This sets the behavior of the
        # assistant and can be used to provide specific instructions for
        # how it should behave throughout the conversation.
        {
            "role": "system",
            "content": "You are a helpful assistant."
        },
        # Set a user message for the assistant to respond to.
        {
            "role": "user",
            "content": "Explain the importance of fast language models",
        }
    ],

    # The language model which will generate the completion.
    model="llama-3.3-70b-versatile",

    #
    # Optional parameters
    #

    # Controls randomness: lowering results in less random completions.
    # As the temperature approaches zero, the model will become deterministic
    # and repetitive.
    temperature=0.5,

    # The maximum number of tokens to generate. Requests can use up to
    # 2048 tokens shared between prompt and completion.
    max_completion_tokens=1024,

    # Controls diversity via nucleus sampling: 0.5 means half of all
    # likelihood-weighted options are considered.
    top_p=1,

    # A stop sequence is a predefined or user-specified text string that
    # signals an AI to stop generating content, ensuring its responses
    # remain focused and concise. Examples include punctuation marks and
    # markers like "[end]".
    stop=None,

    # If set, partial message deltas will be sent.
    stream=True,
)

# Print the incremental deltas returned by the LLM.
for chunk in stream:
    print(chunk.choices[0].delta.content, end="")
```

## [Performing a Chat Completion with a Stop Sequence](#performing-a-chat-completion-with-a-stop-sequence)

Stop sequences allow you to control where the model should stop generating. When the model encounters any of the specified stop sequences, it will halt generation at that point. This is useful when you need responses to end at specific points.

Python

```
from groq import Groq

client = Groq()

chat_completion = client.chat.completions.create(
    #
    # Required parameters
    #
    messages=[
        # Set an optional system message. This sets the behavior of the
        # assistant and can be used to provide specific instructions for
        # how it should behave throughout the conversation.
        {
            "role": "system",
            "content": "You are a helpful assistant."
        },
        # Set a user message for the assistant to respond to.
        {
            "role": "user",
            "content": "Count to 10.  Your response must begin with \"1, \".  example: 1, 2, 3, ...",
        }
    ],

    # The language model which will generate the completion.
    model="llama-3.3-70b-versatile",

    #
    # Optional parameters
    #

    # Controls randomness: lowering results in less random completions.
    # As the temperature approaches zero, the model will become deterministic
    # and repetitive.
    temperature=0.5,

    # The maximum number of tokens to generate. Requests can use up to
    # 2048 tokens shared between prompt and completion.
    max_completion_tokens=1024,

    # Controls diversity via nucleus sampling: 0.5 means half of all
    # likelihood-weighted options are considered.
    top_p=1,

    # A stop sequence is a predefined or user-specified text string that
    # signals an AI to stop generating content, ensuring its responses
    # remain focused and concise. Examples include punctuation marks and
    # markers like "[end]".
    # For this example, we will use ", 6" so that the llm stops counting at 5.
    # If multiple stop values are needed, an array of string may be passed,
    # stop=[", 6", ", six", ", Six"]
    stop=", 6",

    # If set, partial message deltas will be sent.
    stream=False,
)

# Print the completion returned by the LLM.
print(chat_completion.choices[0].message.content)
```

## [Performing an Async Chat Completion](#performing-an-async-chat-completion)

For applications that need to maintain responsiveness while waiting for completions, you can use the asynchronous client. This lets you make non-blocking API calls using Python's asyncio framework.

Python

```
import asyncio

from groq import AsyncGroq


async def main():
    client = AsyncGroq()

    chat_completion = await client.chat.completions.create(
        #
        # Required parameters
        #
        messages=[
            # Set an optional system message. This sets the behavior of the
            # assistant and can be used to provide specific instructions for
            # how it should behave throughout the conversation.
            {
                "role": "system",
                "content": "You are a helpful assistant."
            },
            # Set a user message for the assistant to respond to.
            {
                "role": "user",
                "content": "Explain the importance of fast language models",
            }
        ],

        # The language model which will generate the completion.
        model="llama-3.3-70b-versatile",

        #
        # Optional parameters
        #

        # Controls randomness: lowering results in less random completions.
        # As the temperature approaches zero, the model will become
        # deterministic and repetitive.
        temperature=0.5,

        # The maximum number of tokens to generate. Requests can use up to
        # 2048 tokens shared between prompt and completion.
        max_completion_tokens=1024,

        # Controls diversity via nucleus sampling: 0.5 means half of all
        # likelihood-weighted options are considered.
        top_p=1,

        # A stop sequence is a predefined or user-specified text string that
        # signals an AI to stop generating content, ensuring its responses
        # remain focused and concise. Examples include punctuation marks and
        # markers like "[end]".
        stop=None,

        # If set, partial message deltas will be sent.
        stream=False,
    )

    # Print the completion returned by the LLM.
    print(chat_completion.choices[0].message.content)

asyncio.run(main())
```

### [Streaming an Async Chat Completion](#streaming-an-async-chat-completion)

You can combine the benefits of streaming and asynchronous processing by streaming completions asynchronously. This is particularly useful for applications that need to handle multiple concurrent conversations.

Python

```
import asyncio

from groq import AsyncGroq


async def main():
    client = AsyncGroq()

    stream = await client.chat.completions.create(
        #
        # Required parameters
        #
        messages=[
            # Set an optional system message. This sets the behavior of the
            # assistant and can be used to provide specific instructions for
            # how it should behave throughout the conversation.
            {
                "role": "system",
                "content": "You are a helpful assistant."
            },
            # Set a user message for the assistant to respond to.
            {
                "role": "user",
                "content": "Explain the importance of fast language models",
            }
        ],

        # The language model which will generate the completion.
        model="llama-3.3-70b-versatile",

        #
        # Optional parameters
        #

        # Controls randomness: lowering results in less random completions.
        # As the temperature approaches zero, the model will become
        # deterministic and repetitive.
        temperature=0.5,

        # The maximum number of tokens to generate. Requests can use up to
        # 2048 tokens shared between prompt and completion.
        max_completion_tokens=1024,

        # Controls diversity via nucleus sampling: 0.5 means half of all
        # likelihood-weighted options are considered.
        top_p=1,

        # A stop sequence is a predefined or user-specified text string that
        # signals an AI to stop generating content, ensuring its responses
        # remain focused and concise. Examples include punctuation marks and
        # markers like "[end]".
        stop=None,

        # If set, partial message deltas will be sent.
        stream=True,
    )

    # Print the incremental deltas returned by the LLM.
    async for chunk in stream:
        print(chunk.choices[0].delta.content, end="")

asyncio.run(main())
```

## [Structured Outputs and JSON](#structured-outputs-and-json)

Need reliable, type-safe JSON responses that match your exact schema? Groq's Structured Outputs feature is designed so that model responses strictly conform to your JSON Schema without validation or retry logic.

For complete guides on implementing structured outputs with JSON Schema or using JSON Object Mode, see our [structured outputs documentation](https://console.groq.com/docs/structured-outputs).

Key capabilities:

- **JSON Schema enforcement**: Responses match your schema exactly
- **Type-safe outputs**: No validation or retry logic needed
- **Programmatic refusal detection**: Handle safety-based refusals programmatically
- **JSON Object Mode**: Basic JSON output with prompt-guided structure

---

description: Integrate Groq&#x27;s fast speech-to-text API for instant audio transcription and translation in your applications.
title: Speech to Text - GroqDocs
image: https://console.groq.com/og_cloudv5.jpg

---

# Speech to Text

Groq API is designed to provide fast speech-to-text solution available, offering OpenAI-compatible endpoints that enable near-instant transcriptions and translations. With Groq API, you can integrate high-quality audio processing into your applications at speeds that rival human interaction.

## [API Endpoints](#api-endpoints)

We support two endpoints:

| Endpoint       | Usage                           | API Endpoint                                        |
| -------------- | ------------------------------- | --------------------------------------------------- |
| Transcriptions | Convert audio to text           | https://api.groq.com/openai/v1/audio/transcriptions |
| Translations   | Translate audio to English text | https://api.groq.com/openai/v1/audio/translations   |

## [Supported Models](#supported-models)

| Model ID               | Model                                                                                | Supported Language(s) | Description                                                                                                    |
| ---------------------- | ------------------------------------------------------------------------------------ | --------------------- | -------------------------------------------------------------------------------------------------------------- |
| whisper-large-v3-turbo | [Whisper Large V3 Turbo](https://console.groq.com/docs/model/whisper-large-v3-turbo) | Multilingual          | A fine-tuned version of a pruned Whisper Large V3 designed for fast, multilingual transcription tasks.         |
| whisper-large-v3       | [Whisper Large V3](https://console.groq.com/docs/model/whisper-large-v3)             | Multilingual          | Provides state-of-the-art performance with high accuracy for multilingual transcription and translation tasks. |

## [Which Whisper Model Should You Use?](#which-whisper-model-should-you-use)

Having more choices is great, but let's try to avoid decision paralysis by breaking down the tradeoffs between models to find the one most suitable for your applications:

- If your application is error-sensitive and requires multilingual support, use  
  `whisper-large-v3`  
  .
- If your application requires multilingual support and you need the best price for performance, use  
  `whisper-large-v3-turbo`  
  .

The following table breaks down the metrics for each model.

| Model                  | Cost Per Hour | Language Support | Transcription Support | Translation Support | Real-time Speed Factor | Word Error Rate |
| ---------------------- | ------------- | ---------------- | --------------------- | ------------------- | ---------------------- | --------------- |
| whisper-large-v3       | $0.111        | Multilingual     | Yes                   | Yes                 | 189                    | 10.3%           |
| whisper-large-v3-turbo | $0.04         | Multilingual     | Yes                   | No                  | 216                    | 12%             |

## [Working with Audio Files](#working-with-audio-files)

### Audio File Limitations

Max File Size

25 MB (free tier), 100MB (dev tier)

Max Attachment File Size

25 MB. If you need to process larger files, use the `url` parameter to specify a url to the file instead.

Minimum File Length

0.01 seconds

Minimum Billed Length

10 seconds. If you submit a request less than this, you will still be billed for 10 seconds.

Supported File Types

Either a URL or a direct file upload for `flac`, `mp3`, `mp4`, `mpeg`, `mpga`, `m4a`, `ogg`, `wav`, `webm`

Single Audio Track

Only the first track will be transcribed for files with multiple audio tracks. (e.g. dubbed video)

Supported Response Formats

`json`, `verbose_json`, `text`

Supported Timestamp Granularities

`segment`, `word`

### [Audio Preprocessing](#audio-preprocessing)

Our speech-to-text models will downsample audio to 16KHz mono before transcribing, which is optimal for speech recognition. This preprocessing can be performed client-side if your original file is extremely large and you want to make it smaller without a loss in quality (without chunking, Groq API speech-to-text endpoints accept up to 25MB for free tier and 100MB for [dev tier](https://console.groq.com/settings/billing)). For lower latency, convert your files to `wav` format. When reducing file size, we recommend FLAC for lossless compression.

The following `ffmpeg` command can be used to reduce file size:

shell

```
ffmpeg \
  -i <your file> \
  -ar 16000 \
  -ac 1 \
  -map 0:a \
  -c:a flac \
  <output file name>.flac
```

### [Working with Larger Audio Files](#working-with-larger-audio-files)

For audio files that exceed our size limits or require more precise control over transcription, we recommend implementing audio chunking. This process involves:

1. Breaking the audio into smaller, overlapping segments
2. Processing each segment independently
3. Combining the results while handling overlapping

[To learn more about this process and get code for your own implementation, see the complete audio chunking tutorial in our Groq API Cookbook. ](https://github.com/groq/groq-api-cookbook/tree/main/tutorials/audio-chunking)

## [Using the API](#using-the-api)

The following are request parameters you can use in your transcription and translation requests:

| Parameter                   | Type   | Default                            | Description                                                                                                                                                                                                                                                                                                                                                                   |
| --------------------------- | ------ | ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| file                        | string | Required unless using url instead  | The audio file object for direct upload to translate/transcribe.                                                                                                                                                                                                                                                                                                              |
| url                         | string | Required unless using file instead | The audio URL to translate/transcribe (supports Base64URL).                                                                                                                                                                                                                                                                                                                   |
| language                    | string | Optional                           | The language of the input audio. Supplying the input language in ISO-639-1 (i.e. en, tr\`) format will improve accuracy and latency.The translations endpoint only supports 'en' as a parameter option.                                                                                                                                                                       |
| model                       | string | Required                           | ID of the model to use.                                                                                                                                                                                                                                                                                                                                                       |
| prompt                      | string | Optional                           | Prompt to guide the model's style or specify how to spell unfamiliar words. (limited to 224 tokens)                                                                                                                                                                                                                                                                           |
| response_format             | string | json                               | Define the output response format.Set to verbose_json to receive timestamps for audio segments.Set to text to return a text response.                                                                                                                                                                                                                                         |
| temperature                 | float  | 0                                  | The temperature between 0 and 1\. For translations and transcriptions, we recommend the default value of 0.                                                                                                                                                                                                                                                                   |
| timestamp_granularities\[\] | array  | segment                            | The timestamp granularities to populate for this transcription. response_format must be set verbose_json to use timestamp granularities.Either or both of word and segment are supported. segment returns full metadata and word returns only word, start, and end timestamps. To get both word-level timestamps and full segment metadata, include both values in the array. |

### [Example Usage of Transcription Endpoint](#example-usage-of-transcription-endpoint)

The transcription endpoint allows you to transcribe spoken words in audio or video files.

PythonJavaScriptcurl

The Groq SDK package can be installed using the following command:

shell

```
pip install groq
```

The following code snippet demonstrates how to use Groq API to transcribe an audio file in Python:

Python

```
import os
import json
from groq import Groq

# Initialize the Groq client
client = Groq()

# Specify the path to the audio file
filename = os.path.dirname(__file__) + "/YOUR_AUDIO.wav" # Replace with your audio file!

# Open the audio file
with open(filename, "rb") as file:
    # Create a transcription of the audio file
    transcription = client.audio.transcriptions.create(
      file=file, # Required audio file
      model="whisper-large-v3-turbo", # Required model to use for transcription
      prompt="Specify context or spelling",  # Optional
      response_format="verbose_json",  # Optional
      timestamp_granularities = ["word", "segment"], # Optional (must set response_format to "json" to use and can specify "word", "segment" (default), or both)
      language="en",  # Optional
      temperature=0.0  # Optional
    )
    # To print only the transcription text, you'd use print(transcription.text) (here we're printing the entire transcription object to access timestamps)
    print(json.dumps(transcription, indent=2, default=str))
```

### [Example Usage of Translation Endpoint](#example-usage-of-translation-endpoint)

The translation endpoint allows you to translate spoken words in audio or video files to English.

PythonJavaScriptcurl

The Groq SDK package can be installed using the following command:

shell

```
pip install groq
```

The following code snippet demonstrates how to use Groq API to translate an audio file in Python:

Python

```
import os
from groq import Groq

# Initialize the Groq client
client = Groq()

# Specify the path to the audio file
filename = os.path.dirname(__file__) + "/sample_audio.m4a" # Replace with your audio file!

# Open the audio file
with open(filename, "rb") as file:
    # Create a translation of the audio file
    translation = client.audio.translations.create(
      file=(filename, file.read()), # Required audio file
      model="whisper-large-v3", # Required model to use for translation
      prompt="Specify context or spelling",  # Optional
      language="en", # Optional ('en' only)
      response_format="json",  # Optional
      temperature=0.0  # Optional
    )
    # Print the translation text
    print(translation.text)
```

## [Understanding Metadata Fields](#understanding-metadata-fields)

When working with Groq API, setting `response_format` to `verbose_json` outputs each segment of transcribed text with valuable metadata that helps us understand the quality and characteristics of our transcription, including `avg_logprob`, `compression_ratio`, and `no_speech_prob`.

This information can help us with debugging any transcription issues. Let's examine what this metadata tells us using a real example:

JSON

```
{
  "id": 8,
  "seek": 3000,
  "start": 43.92,
  "end": 50.16,
  "text": " document that the functional specification that you started to read through that isn't just the",
  "tokens": [51061, 4166, 300, 264, 11745, 31256],
  "temperature": 0,
  "avg_logprob": -0.097569615,
  "compression_ratio": 1.6637554,
  "no_speech_prob": 0.012814695
}
```

As shown in the above example, we receive timing information as well as quality indicators. Let's gain a better understanding of what each field means:

- `id:8`: The 9th segment in the transcription (counting begins at 0)
- `seek`: Indicates where in the audio file this segment begins (3000 in this case)
- `start` and `end` timestamps: Tell us exactly when this segment occurs in the audio (43.92 to 50.16 seconds in our example)
- `avg_logprob` (Average Log Probability): -0.097569615 in our example indicates very high confidence. Values closer to 0 suggest better confidence, while more negative values (like -0.5 or lower) might indicate transcription issues.
- `no_speech_prob` (No Speech Probability): 0.0.012814695 is very low, suggesting this is definitely speech. Higher values (closer to 1) would indicate potential silence or non-speech audio.
- `compression_ratio`: 1.6637554 is a healthy value, indicating normal speech patterns. Unusual values (very high or low) might suggest issues with speech clarity or word boundaries.

### [Using Metadata for Debugging](#using-metadata-for-debugging)

When troubleshooting transcription issues, look for these patterns:

- Low Confidence Sections: If `avg_logprob` drops significantly (becomes more negative), check for background noise, multiple speakers talking simultaneously, unclear pronunciation, and strong accents. Consider cleaning up the audio in these sections or adjusting chunk sizes around problematic chunk boundaries.
- Non-Speech Detection: High `no_speech_prob` values might indicate silence periods that could be trimmed, background music or noise, or non-verbal sounds being misinterpreted as speech. Consider noise reduction when preprocessing.
- Unusual Speech Patterns: Unexpected `compression_ratio` values can reveal stuttering or word repetition, speaker talking unusually fast or slow, or audio quality issues affecting word separation.

### [Quality Thresholds and Regular Monitoring](#quality-thresholds-and-regular-monitoring)

We recommend setting acceptable ranges for each metadata value we reviewed above and flagging segments that fall outside these ranges to be able to identify and adjust preprocessing or chunking strategies for flagged sections.

By understanding and monitoring these metadata values, you can significantly improve your transcription quality and quickly identify potential issues in your audio processing pipeline.

### [Prompting Guidelines](#prompting-guidelines)

The prompt parameter (max 224 tokens) helps provide context and maintain a consistent output style. Unlike chat completion prompts, these prompts only guide style and context, not specific actions.

Best Practices

- Provide relevant context about the audio content, such as the type of conversation, topic, or speakers involved.
- Use the same language as the language of the audio file.
- Steer the model's output by denoting proper spellings or emulate a specific writing style or tone.
- Keep the prompt concise and focused on stylistic guidance.

We can't wait to see what you build! 🚀

---

description: Instantly generate lifelike audio from text using Groq&#x27;s fast text-to-speech API with support for multiple voices and languages.
title: Text to Speech - GroqDocs
image: https://console.groq.com/og_cloudv5.jpg

---

# Text to Speech

Learn how to instantly generate lifelike audio from text.

## [Overview](#overview)

The Groq API speech endpoint provides fast text-to-speech (TTS), enabling you to convert text to spoken audio in seconds with our available TTS models.

With support for 23 voices, 19 in English and 4 in Arabic, you can instantly create life-like audio content for customer support agents, characters for game development, and more.

## [API Endpoint](#api-endpoint)

| Endpoint | Usage                 | API Endpoint                                |
| -------- | --------------------- | ------------------------------------------- |
| Speech   | Convert text to audio | https://api.groq.com/openai/v1/audio/speech |

## [Supported Models](#supported-models)

| Model ID          | Model Card                                                     | Supported Language(s) | Description                                           |
| ----------------- | -------------------------------------------------------------- | --------------------- | ----------------------------------------------------- |
| playai-tts        | [Card ](https://console.groq.com/docs/model/playai-tts)        | English               | High-quality TTS model for English speech generation. |
| playai-tts-arabic | [Card ](https://console.groq.com/docs/model/playai-tts-arabic) | Arabic                | High-quality TTS model for Arabic speech generation.  |

## [Working with Speech](#working-with-speech)

### [Quick Start](#quick-start)

The speech endpoint takes four key inputs:

- **model:** `playai-tts` or `playai-tts-arabic`
- **input:** the text to generate audio from
- **voice:** the desired voice for output
- **response format:** defaults to `"wav"`

PythonJavaScriptcurl

The Groq SDK package can be installed using the following command:

shell

```
pip install groq
```

The following is an example of a request using `playai-tts`. To use the Arabic model, use the `playai-tts-arabic` model ID and an Arabic prompt:

Python

```
import os
from groq import Groq

client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

speech_file_path = "speech.wav"
model = "playai-tts"
voice = "Fritz-PlayAI"
text = "I love building and shipping new features for our users!"
response_format = "wav"

response = client.audio.speech.create(
    model=model,
    voice=voice,
    input=text,
    response_format=response_format
)

response.write_to_file(speech_file_path)
```

### [Parameters](#parameters)

| Parameter       | Type   | Required | Value                                                                                                                                                                                       | Description                                                                                                                              |
| --------------- | ------ | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| model           | string | Yes      | playai-ttsplayai-tts-arabic                                                                                                                                                                 | Model ID to use for TTS.                                                                                                                 |
| input           | string | Yes      | \-                                                                                                                                                                                          | User input text to be converted to speech. Maximum length is 10K characters.                                                             |
| voice           | string | Yes      | See available [English](https://console.groq.com/docs/text-to-speech/#available-english-voices) and [Arabic](https://console.groq.com/docs/text-to-speech/#available-arabic-voices) voices. | The voice to use for audio generation. There are currently 26 English options for playai-tts and 4 Arabic options for playai-tts-arabic. |
| response_format | string | Optional | "wav"                                                                                                                                                                                       | Format of the response audio file. Defaults to currently supported "wav".                                                                |

### [Available English Voices](#available-english-voices)

The `playai-tts` model currently supports 19 English voices that you can pass into the `voice` parameter (`Arista-PlayAI`, `Atlas-PlayAI`, `Basil-PlayAI`, `Briggs-PlayAI`, `Calum-PlayAI`,`Celeste-PlayAI`, `Cheyenne-PlayAI`, `Chip-PlayAI`, `Cillian-PlayAI`, `Deedee-PlayAI`, `Fritz-PlayAI`, `Gail-PlayAI`,`Indigo-PlayAI`, `Mamaw-PlayAI`, `Mason-PlayAI`, `Mikail-PlayAI`, `Mitch-PlayAI`, `Quinn-PlayAI`, `Thunder-PlayAI`).

Experiment to find the voice you need for your application:

Arista-PlayAI

0:000:00

Atlas-PlayAI

0:000:00

Basil-PlayAI

0:000:00

Briggs-PlayAI

0:000:00

Calum-PlayAI

0:000:00

Celeste-PlayAI

0:000:00

Cheyenne-PlayAI

0:000:00

Chip-PlayAI

0:000:00

Cillian-PlayAI

0:000:00

Deedee-PlayAI

0:000:00

Fritz-PlayAI

0:000:00

Gail-PlayAI

0:000:00

Indigo-PlayAI

0:000:00

Mamaw-PlayAI

0:000:00

Mason-PlayAI

0:000:00

Mikail-PlayAI

0:000:00

Mitch-PlayAI

0:000:00

Quinn-PlayAI

0:000:00

Thunder-PlayAI

0:000:00

### [Available Arabic Voices](#available-arabic-voices)

The `playai-tts-arabic` model currently supports 4 Arabic voices that you can pass into the `voice` parameter (`Ahmad-PlayAI`, `Amira-PlayAI`, `Khalid-PlayAI`, `Nasser-PlayAI`).

Experiment to find the voice you need for your application:

Ahmad-PlayAI

0:000:00

Amira-PlayAI

0:000:00

Khalid-PlayAI

0:000:00

Nasser-PlayAI

0:000:00

---

description: Learn how to use multimodal vision models on Groq for image understanding, OCR, and more.
title: Images and Vision - GroqDocs
image: https://console.groq.com/og_cloudv5.jpg

---

# Images and Vision

Groq API offers fast inference and low latency for multimodal models with vision capabilities for understanding and interpreting visual data from images. By analyzing the content of an image, multimodal models can generate human-readable text for providing insights about given visual data.

## [Supported Models](#supported-models)

Groq API supports powerful multimodal models that can be easily integrated into your applications to provide fast and accurate image processing for tasks such as visual question answering, caption generation, and Optical Character Recognition (OCR).

Llama 4 ScoutLlama 4 Maverick

### [meta-llama/llama-4-scout-17b-16e-instruct](https://console.groq.com/docs/model/llama-4-scout-17b-16e-instruct)

Model ID

`meta-llama/llama-4-scout-17b-16e-instruct`

Description

A powerful multimodal model capable of processing both text and image inputs that supports multilingual, multi-turn conversations, tool use, and JSON mode.

Context Window

128K tokens

Preview Model

Currently in preview and should be used for experimentation.

Image Size Limit

Maximum allowed size for a request containing an image URL as input is 20MB. Requests larger than this limit will return a 400 error.

Image Resolution Limit

Maximum allowed resolution for a request containing images is 33 megapixels (33177600 total pixels) per image. Images larger than this limit will return a 400 error.

Request Size Limit (Base64 Encoded Images)

Maximum allowed size for a request containing a base64 encoded image is 4MB. Requests larger than this limit will return a 413 error.

Images per Request

You can process a maximum of 5 images.

### [meta-llama/llama-4-maverick-17b-128e-instruct](https://console.groq.com/docs/model/llama-4-maverick-17b-128e-instruct)

Model ID

`meta-llama/llama-4-maverick-17b-128e-instruct`

Description

A powerful multimodal model capable of processing both text and image inputs that supports multilingual, multi-turn conversations, tool use, and JSON mode.

Context Window

128K tokens

Preview Model

Currently in preview and should be used for experimentation.

Image Size Limit

Maximum allowed size for a request containing an image URL as input is 20MB. Requests larger than this limit will return a 400 error.

Image Resolution Limit

Maximum allowed resolution for a request containing images is 33 megapixels (33177600 total pixels) per image. Images larger than this limit will return a 400 error.

Request Size Limit (Base64 Encoded Images)

Maximum allowed size for a request containing a base64 encoded image is 4MB. Requests larger than this limit will return a 413 error.

Images per Request

You can process a maximum of 5 images.

## [How to Use Vision](#how-to-use-vision)

Use Groq API vision features via:

- **GroqCloud Console Playground**: Use [Llama 4 Scout](https://console.groq.com/playground?model=meta-llama/llama-4-scout-17b-16e-instruct) or [Llama 4 Maverick](https://console.groq.com/playground?model=meta-llama/llama-4-maverick-17b-128e-instruct) as the model and upload your image.
- **Groq API Request:** Call the [chat.completions](https://console.groq.com/docs/text-chat#generating-chat-completions-with-groq-sdk) API endpoint and set the model to  
  `meta-llama/llama-4-scout-17b-16e-instruct`  
   or  
  `meta-llama/llama-4-maverick-17b-128e-instruct`  
  . See code examples below.

## [How to Pass Images from URLs as Input](#how-to-pass-images-from-urls-as-input)

The following are code examples for passing your image to the model via a URL:

curlJavaScriptPythonJSON

Python

```
from groq import Groq
import os

client = Groq(api_key=os.environ.get("GROQ_API_KEY"))
completion = client.chat.completions.create(
    model="meta-llama/llama-4-scout-17b-16e-instruct",
    messages=[
        {
            "role": "user",
            "content": [
                {
                    "type": "text",
                    "text": "What's in this image?"
                },
                {
                    "type": "image_url",
                    "image_url": {
                        "url": "https://upload.wikimedia.org/wikipedia/commons/f/f2/LPU-v1-die.jpg"
                    }
                }
            ]
        }
    ],
    temperature=1,
    max_completion_tokens=1024,
    top_p=1,
    stream=False,
    stop=None,
)

print(completion.choices[0].message)
```

## [How to Pass Locally Saved Images as Input](#how-to-pass-locally-saved-images-as-input)

To pass locally saved images, we'll need to first encode our image to a base64 format string before passing it as the `image_url` in our API request as follows:

Python

```
from groq import Groq
import base64
import os

# Function to encode the image
def encode_image(image_path):
  with open(image_path, "rb") as image_file:
    return base64.b64encode(image_file.read()).decode('utf-8')

# Path to your image
image_path = "sf.jpg"

# Getting the base64 string
base64_image = encode_image(image_path)

client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

chat_completion = client.chat.completions.create(
    messages=[
        {
            "role": "user",
            "content": [
                {"type": "text", "text": "What's in this image?"},
                {
                    "type": "image_url",
                    "image_url": {
                        "url": f"data:image/jpeg;base64,{base64_image}",
                    },
                },
            ],
        }
    ],
    model="meta-llama/llama-4-scout-17b-16e-instruct",
)

print(chat_completion.choices[0].message.content)
```

## [Tool Use with Images](#tool-use-with-images)

The `meta-llama/llama-4-scout-17b-16e-instruct`, `meta-llama/llama-4-maverick-17b-128e-instruct` models support tool use! The following cURL example defines a `get_current_weather` tool that the model can leverage to answer a user query that contains a question about the weather along with an image of a location that the model can infer location (i.e. New York City) from:

shell

```
curl https://api.groq.com/openai/v1/chat/completions -s \
-H "Content-Type: application/json" \
-H "Authorization: Bearer $GROQ_API_KEY" \
-d '{
"model": "meta-llama/llama-4-scout-17b-16e-instruct",
"messages": [
{
    "role": "user",
    "content": [{"type": "text", "text": "Whats the weather like in this state?"}, {"type": "image_url", "image_url": { "url": "https://cdn.britannica.com/61/93061-050-99147DCE/Statue-of-Liberty-Island-New-York-Bay.jpg"}}]
}
],
"tools": [
{
    "type": "function",
    "function": {
    "name": "get_current_weather",
    "description": "Get the current weather in a given location",
    "parameters": {
        "type": "object",
        "properties": {
        "location": {
            "type": "string",
            "description": "The city and state, e.g. San Francisco, CA"
        },
        "unit": {
            "type": "string",
            "enum": ["celsius", "fahrenheit"]
        }
        },
        "required": ["location"]
    }
    }
}
],
"tool_choice": "auto"
}' | jq '.choices[0].message.tool_calls'
```

The following is the output from our example above that shows how our model inferred the state as New York from the given image and called our example function:

python

```
[
  {
    "id": "call_q0wg",
    "function": {
      "arguments": "{\"location\": \"New York, NY\",\"unit\": \"fahrenheit\"}",
      "name": "get_current_weather"
    },
    "type": "function"
  }
]
```

## [JSON Mode with Images](#json-mode-with-images)

The `meta-llama/llama-4-scout-17b-16e-instruct` and `meta-llama/llama-4-maverick-17b-128e-instruct` models support JSON mode! The following Python example queries the model with an image and text (i.e. "Please pull out relevant information as a JSON object.") with `response_format`set for JSON mode:

Python

```
from groq import Groq
import os

client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

completion = client.chat.completions.create(
    model="meta-llama/llama-4-scout-17b-16e-instruct",
    messages=[
        {
            "role": "user",
            "content": [
                {
                    "type": "text",
                    "text": "List what you observe in this photo in JSON format."
                },
                {
                    "type": "image_url",
                    "image_url": {
                        "url": "https://upload.wikimedia.org/wikipedia/commons/d/da/SF_From_Marin_Highlands3.jpg"
                    }
                }
            ]
        }
    ],
    temperature=1,
    max_completion_tokens=1024,
    top_p=1,
    stream=False,
    response_format={"type": "json_object"},
    stop=None,
)

print(completion.choices[0].message)
```

## [Multi-turn Conversations with Images](#multiturn-conversations-with-images)

The `meta-llama/llama-4-scout-17b-16e-instruct` and `meta-llama/llama-4-maverick-17b-128e-instruct` models support multi-turn conversations! The following Python example shows a multi-turn user conversation about an image:

Python

```
from groq import Groq
import os

client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

completion = client.chat.completions.create(
    model="meta-llama/llama-4-scout-17b-16e-instruct",
    messages=[
        {
            "role": "user",
            "content": [
                {
                    "type": "text",
                    "text": "What is in this image?"
                },
                {
                    "type": "image_url",
                    "image_url": {
                        "url": "https://upload.wikimedia.org/wikipedia/commons/d/da/SF_From_Marin_Highlands3.jpg"
                    }
                }
            ]
        },
        {
            "role": "user",
            "content": "Tell me more about the area."
        }
    ],
    temperature=1,
    max_completion_tokens=1024,
    top_p=1,
    stream=False,
    stop=None,
)

print(completion.choices[0].message)
```

## [Venture Deeper into Vision](#venture-deeper-into-vision)

### [Use Cases to Explore](#use-cases-to-explore)

Vision models can be used in a wide range of applications. Here are some ideas:

- **Accessibility Applications:** Develop an application that generates audio descriptions for images by using a vision model to generate text descriptions for images, which can then be converted to audio with one of our audio endpoints.
- **E-commerce Product Description Generation:** Create an application that generates product descriptions for e-commerce websites.
- **Multilingual Image Analysis:** Create applications that can describe images in multiple languages.
- **Multi-turn Visual Conversations:** Develop interactive applications that allow users to have extended conversations about images.

These are just a few ideas to get you started. The possibilities are endless, and we're excited to see what you create with vision models powered by Groq for low latency and fast inference!

### [Next Steps](#next-steps)

Check out our [Groq API Cookbook](https://github.com/groq/groq-api-cookbook) repository on GitHub (and give us a ⭐) for practical examples and tutorials:

- [Image Moderation](https://github.com/groq/groq-api-cookbook/blob/main/tutorials/image%5Fmoderation.ipynb)
- [Multimodal Image Processing (Tool Use, JSON Mode)](https://github.com/groq/groq-api-cookbook/tree/main/tutorials/multimodal-image-processing)

We're always looking for contributions. If you have any cool tutorials or guides to share, submit a pull request for review to help our open-source community!

---

description: Reasoning models on Groq for complex problem-solving, step-by-step analysis, and explicit reasoning formats with fast inference.
title: Reasoning - GroqDocs
image: https://console.groq.com/og_cloudv5.jpg

---

# Reasoning

Reasoning models excel at complex problem-solving tasks that require step-by-step analysis, logical deduction, and structured thinking and solution validation. With Groq inference speed, these types of models can deliver instant reasoning capabilities critical for real-time applications.

## [Why Speed Matters for Reasoning](#why-speed-matters-for-reasoning)

Reasoning models are capable of complex decision making with explicit reasoning chains that are part of the token output and used for decision-making, which make low-latency and fast inference essential. Complex problems often require multiple chains of reasoning tokens where each step build on previous results. Low latency compounds benefits across reasoning chains and shaves off minutes of reasoning to a response in seconds.

## [Supported Models](#supported-models)

| Model ID            | Model                                                                          |
| ------------------- | ------------------------------------------------------------------------------ |
| openai/gpt-oss-20b  | [OpenAI GPT-OSS 20B](https://console.groq.com/docs/model/openai/gpt-oss-20b)   |
| openai/gpt-oss-120b | [OpenAI GPT-OSS 120B](https://console.groq.com/docs/model/openai/gpt-oss-120b) |
| qwen/qwen3-32b      | [Qwen 3 32B](https://console.groq.com/docs/model/qwen3-32b)                    |

## [Reasoning Format](#reasoning-format)

Groq API supports explicit reasoning formats through the `reasoning_format` parameter, giving you fine-grained control over how the model's reasoning process is presented. This is particularly valuable for valid JSON outputs, debugging, and understanding the model's decision-making process.

**Note:** The format defaults to `raw` or `parsed` when JSON mode or tool use are enabled as those modes do not support `raw`. If reasoning is explicitly set to `raw` with JSON mode or tool use enabled, we will return a 400 error.

### [Options for Reasoning Format](#options-for-reasoning-format)

| reasoning_format Options | Description                                                                                      |
| ------------------------ | ------------------------------------------------------------------------------------------------ |
| parsed                   | Separates reasoning into a dedicated message.reasoning field while keeping the response concise. |
| raw                      | Includes reasoning within <think> tags in the main text content.                                 |
| hidden                   | Returns only the final answer.                                                                   |

### [Including Reasoning in the Response](#including-reasoning-in-the-response)

You can also control whether reasoning is included in the response by setting the `include_reasoning` parameter.

| include_reasoning Options | Description                                                                                  |
| ------------------------- | -------------------------------------------------------------------------------------------- |
| true                      | Includes the reasoning in a dedicated message.reasoning field. This is the default behavior. |
| false                     | Excludes reasoning from the response.                                                        |

**Note:** The `include_reasoning` parameter cannot be used together with `reasoning_format`. These parameters are mutually exclusive.

## [Reasoning Effort](#reasoning-effort)

### [Options for Reasoning Effort (Qwen 3 32B)](#options-for-reasoning-effort-qwen-3-32b)

The `reasoning_effort` parameter controls the level of effort the model will put into reasoning. This is only supported by [Qwen 3 32B](https://console.groq.com/docs/model/qwen3-32b).

| reasoning_effort Options | Description                                                     |
| ------------------------ | --------------------------------------------------------------- |
| none                     | Disable reasoning. The model will not use any reasoning tokens. |
| default                  | Enable reasoning.                                               |

### [Options for Reasoning Effort (GPT-OSS)](#options-for-reasoning-effort-gptoss)

The `reasoning_effort` parameter controls the level of effort the model will put into reasoning. This is only supported by [GPT-OSS 20B](https://console.groq.com/docs/model/openai/gpt-oss-20b) and [GPT-OSS 120B](https://console.groq.com/docs/model/openai/gpt-oss-120b).

| reasoning_effort Options | Description                                                                        |
| ------------------------ | ---------------------------------------------------------------------------------- |
| low                      | Low effort reasoning. The model will use a small number of reasoning tokens.       |
| medium                   | Medium effort reasoning. The model will use a moderate number of reasoning tokens. |
| high                     | High effort reasoning. The model will use a large number of reasoning tokens.      |

## [Quick Start](#quick-start)

Get started with reasoning models using this basic example that demonstrates how to make a simple API call for complex problem-solving tasks.

JavaScript

```
import Groq from 'groq-sdk';

const client = new Groq();
const completion = await client.chat.completions.create({
    model: "openai/gpt-oss-20b",
    messages: [
        {
            role: "user",
            content: "How many r's are in the word strawberry?"
        }
    ],
    temperature: 0.6,
    max_completion_tokens: 1024,
    top_p: 0.95,
    stream: true
});

for await (const chunk of completion) {
    process.stdout.write(chunk.choices[0].delta.content || "");
}
```

```
from groq import Groq

client = Groq()
completion = client.chat.completions.create(
    model="openai/gpt-oss-20b",
    messages=[
        {
            "role": "user",
            "content": "How many r's are in the word strawberry?"
        }
    ],
    temperature=0.6,
    max_completion_tokens=1024,
    top_p=0.95,
    stream=True
)

for chunk in completion:
    print(chunk.choices[0].delta.content or "", end="")
```

```
curl "https://api.groq.com/openai/v1/chat/completions" \
  -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${GROQ_API_KEY}" \
  -d '{
         "messages": [
           {
             "role": "user",
             "content": "How many r'\''s are in the word strawberry?"
           }
         ],
         "model": "openai/gpt-oss-20b",
         "temperature": 0.6,
         "max_completion_tokens": 4096,
         "top_p": 0.95,
         "stream": true,
         "stop": null
       }'
```

## [Quick Start with Tool Use](#quick-start-with-tool-use)

This example shows how to combine reasoning models with function calling to create intelligent agents that can perform actions while explaining their thought process.

bash

```
curl https://api.groq.com//openai/v1/chat/completions -s \
  -H "authorization: bearer $GROQ_API_KEY" \
  -d '{
    "model": "openai/gpt-oss-20b",
    "messages": [
        {
            "role": "user",
            "content": "What is the weather like in Paris today?"
        }
    ],
    "tools": [
        {
            "type": "function",
            "function": {
                "name": "get_weather",
                "description": "Get current temperature for a given location.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "location": {
                            "type": "string",
                            "description": "City and country e.g. Bogotá, Colombia"
                        }
                    },
                    "required": [
                        "location"
                    ],
                    "additionalProperties": false
                },
                "strict": true
            }
        }
    ]}'
```

## [Recommended Configuration Parameters](#recommended-configuration-parameters)

| Parameter             | Default        | Range                                      | Description                                                                                                                                                                                                                                                                                                                                                        |
| --------------------- | -------------- | ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| messages              | \-             | \-                                         | Array of message objects. Important: Avoid system prompts - include all instructions in the user message!                                                                                                                                                                                                                                                          |
| temperature           | 0.6            | 0.0 - 2.0                                  | Controls randomness in responses. Lower values make responses more deterministic. Recommended range: 0.5-0.7 to prevent repetitions or incoherent outputs                                                                                                                                                                                                          |
| max_completion_tokens | 1024           | \-                                         | Maximum length of model's response. Default may be too low for complex reasoning - consider increasing for detailed step-by-step solutions                                                                                                                                                                                                                         |
| top_p                 | 0.95           | 0.0 - 1.0                                  | Controls diversity of token selection                                                                                                                                                                                                                                                                                                                              |
| stream                | false          | boolean                                    | Enables response streaming. Recommended for interactive reasoning tasks                                                                                                                                                                                                                                                                                            |
| stop                  | null           | string/array                               | Custom stop sequences                                                                                                                                                                                                                                                                                                                                              |
| seed                  | null           | integer                                    | Set for reproducible results. Important for benchmarking - run multiple tests with different seeds                                                                                                                                                                                                                                                                 |
| response_format       | {type: "text"} | {type: "json_object"} or {type: "text"}    | Set to json_object type for structured output.                                                                                                                                                                                                                                                                                                                     |
| reasoning_format      | raw            | "parsed", "raw", "hidden"                  | Controls how model reasoning is presented in the response. Must be set to either parsed or hidden when using tool calling or JSON mode.                                                                                                                                                                                                                            |
| reasoning_effort      | default        | "none", "default", "low", "medium", "high" | Controls the level of effort the model will put into reasoning. none and default are only supported by [Qwen 3 32B](https://console.groq.com/docs/model/qwen3-32b). low, medium, and high are only supported by [GPT-OSS 20B](https://console.groq.com/docs/model/openai/gpt-oss-20b) and [GPT-OSS 120B](https://console.groq.com/docs/model/openai/gpt-oss-120b). |

## [Accessing Reasoning Content](#accessing-reasoning-content)

Accessing the reasoning content in the response is dependent on the model and the reasoning format you are using. See the examples below for more details and refer to the [Reasoning Format](#reasoning-format) section for more information.

### [Non-GPT-OSS Models](#nongptoss-models)

RawParsedHidden

When using `raw` reasoning format, the reasoning content is accessible in the main text content of assistant responses within `<think>` tags. This example demonstrates making a request with `reasoning_format` set to `raw` to see the model's internal thinking process alongside the final answer.

JavaScript

```
import { Groq } from 'groq-sdk';

const groq = new Groq();

const chatCompletion = await groq.chat.completions.create({
  "messages": [
    {
      "role": "user",
      "content": "How do airplanes fly? Be concise."
    }
  ],
  "model": "qwen/qwen3-32b",
  "stream": false,
  "reasoning_format": "raw"
});

console.log(chatCompletion.choices[0].message);
```

```
from groq import Groq

client = Groq()

chat_completion = client.chat.completions.create(
    messages=[
        {
            "role": "user",
            "content": "How do airplanes fly? Be concise."
        }
    ],
    model="qwen/qwen3-32b",
    stream=False,
    reasoning_format="raw"
)

print(chat_completion.choices[0].message)
```

```
curl https://api.groq.com/openai/v1/chat/completions -s \
  -H "authorization: bearer $GROQ_API_KEY" \
  -H "content-type: application/json" \
  -d '{
    "messages": [
      {
        "role": "user",
        "content": "How do airplanes fly? Be concise."
      }
    ],
    "model": "qwen/qwen3-32b",
    "stream": false,
    "reasoning_format": "raw"
  }'
```

Example Output (response.choices\[0\].message)

JSON

```
{
  "role": "assistant",
  "content": "<think>Okay, the user is asking how airplanes fly and wants a concise answer. Let me start by recalling the basics of flight mechanics. First, lift is essential. Airplanes generate lift with their wings. The shape of the wing, or airfoil, causes air to move faster over the top, creating lower pressure compared to the bottom. This pressure difference lifts the plane. But wait, I should mention Bernoulli's principle here. Also, angle of attack affects lift by directing airflow downward, which pushes the wing up by Newton's third law. Both factors contribute to lift. Thrust is needed to move the plane forward, providing the speed necessary for lift. Engines like jet engines or propellers generate thrust. Drag is the opposing force; the plane must overcome it. Stability and control come into play too—ailerons, rudder, elevator for maneuvers. Wait, the user wants it concise. Maybe I should prioritize the main points: lift due to wings' shape and angle, thrust from engines, and balance forces. Avoid getting too technical with equations but mention the key components. Also, mention that controlled flight involves managing these forces. Let me make sure I'm not missing anything crucial. Maybe lift, thrust, drag, weight—those are the four forces. But since the user wants it brief, I can simplify to the main elements without listing all four forces. Double-check if Bernoulli's principle is accurate here. Some debates exist about its role versus Newton's laws, but a simplified explanation is acceptable here. Also, mention that the engines provide forward motion, which is crucial for sustaining lift. Putting it all together: airplanes fly by generating lift through their wings' design and angle of attack, using engines for thrust to maintain speed, and controlling flight with adjustable surfaces. Should be concise and cover the essentials.</think>Airplanes fly by generating **lift** through the shape of their wings (airfoils), which causes faster airflow over the top and slower air underneath, creating a pressure difference. **Thrust** from engines (or propellers) propels them forward, countering **drag**, while **control surfaces** (ailerons, rudder, elevator) adjust airflow for stability and direction. Lift must overcome **weight** (gravity) to stay aloft."
}
```

When using `parsed` reasoning format, the model's reasoning is separated into a dedicated `reasoning` field, making it easier to access both the final answer and the thinking process programmatically. This format is ideal for applications that need to process or display reasoning content separately from the main response.

JavaScript

```
import { Groq } from 'groq-sdk';

const groq = new Groq();

const chatCompletion = await groq.chat.completions.create({
  "messages": [
    {
      "role": "user",
      "content": "How do airplanes fly? Be concise."
    }
  ],
  "model": "qwen/qwen3-32b",
  "stream": false,
  "reasoning_format": "parsed"
});

console.log(chatCompletion.choices[0].message);
```

```
from groq import Groq

client = Groq()

chat_completion = client.chat.completions.create(
    messages=[
        {
            "role": "user",
            "content": "How do airplanes fly? Be concise."
        }
    ],
    model="qwen/qwen3-32b",
    stream=False,
    reasoning_format="parsed"
)

print(chat_completion.choices[0].message)
```

```
curl https://api.groq.com/openai/v1/chat/completions -s \
  -H "authorization: bearer $GROQ_API_KEY" \
  -H "content-type: application/json" \
  -d '{
    "messages": [
      {
        "role": "user",
        "content": "How do airplanes fly? Be concise."
      }
    ],
    "model": "qwen/qwen3-32b",
    "stream": false,
    "reasoning_format": "parsed"
  }'
```

Example Output (response.choices\[0\].message)

JSON

```
{
  "role": "assistant",
  "content": "Airplanes fly by generating **lift** through their wings' shape (airfoils), creating a pressure difference (lower pressure above, higher below). **Thrust** from engines overcomes drag, propelling the plane forward. Controlled movement (pitch, roll, yaw) adjusts lift and direction. In short: **lift + thrust > weight + drag** enables flight.",
  "reasoning": "Okay, the user is asking how airplanes fly and wants a concise answer. Let me break this down. First, I need to recall the basic principles of flight. The main concepts are lift, thrust, drag, and weight. Lift is generated by the wings, right? The shape of the wing causes air to move faster over the top, creating lower pressure compared to the bottom, which lifts the plane. Then there's thrust from the engines, which pushes the plane forward, overcoming drag. Drag is the resistance from the air. The pilot controls the plane's direction with surfaces like ailerons, elevators, and rudders. Also, Newton's third law comes into play with the engines pushing air backward, propelling the plane forward. Wait, the question is asking for conciseness. I should make sure not to include too much detail. Maybe mention the four forces, the wing's shape (airfoil), and how the engines generate thrust. Avoid getting into too much depth about different types of engines or control surfaces unless necessary. Is there anything else important? Maybe the angle of attack? Or the balance between the forces. But keeping it simple. The answer should be brief enough. Let me check the key points again: lift due to wing shape causing pressure difference, thrust overcoming drag, controlled movement. That should cover it without being too technical.",
}
```

When using `hidden` reasoning format, only the final answer is returned without any visible reasoning content. This is useful for applications where you want the benefits of reasoning models but don't need to expose the thinking process to end users. The model will still reason, but the reasoning content will not be returned in the response.

JavaScript

```
import { Groq } from 'groq-sdk';

const groq = new Groq();

const chatCompletion = await groq.chat.completions.create({
  "messages": [
    {
      "role": "user",
      "content": "How do airplanes fly? Be concise."
    }
  ],
  "model": "qwen/qwen3-32b",
  "stream": false,
  "reasoning_format": "hidden"
});

console.log(chatCompletion.choices[0].message);
```

```
from groq import Groq

client = Groq()

chat_completion = client.chat.completions.create(
    messages=[
        {
            "role": "user",
            "content": "How do airplanes fly? Be concise."
        }
    ],
    model="qwen/qwen3-32b",
    stream=False,
    reasoning_format="hidden"
)

print(chat_completion.choices[0].message)
```

```
curl https://api.groq.com/openai/v1/chat/completions -s \
  -H "authorization: bearer $GROQ_API_KEY" \
  -H "content-type: application/json" \
  -d '{
    "messages": [
      {
        "role": "user",
        "content": "How do airplanes fly? Be concise."
      }
    ],
    "model": "qwen/qwen3-32b",
    "stream": false,
    "reasoning_format": "hidden"
  }'
```

Example Output (response.choices\[0\].message)

JSON

```
{
  "role": "assistant",
  "content": "Airplanes fly by generating **lift** via airfoil-shaped wings, which create a pressure difference (Bernoulli’s principle) as air moves faster over the curved top surface. **Thrust** from engines overcomes air **drag**, maintaining forward motion to sustain lift. Control surfaces (ailerons, elevators, rudder) adjust **direction** and **altitude**, balancing **weight** (gravity) and lift for stable flight."
}
```

### [GPT-OSS Models](#gptoss-models)

With `openai/gpt-oss-20b` and `openai/gpt-oss-120b`, the `reasoning_format` parameter is not supported. By default, these models will include reasoning content in the `reasoning` field of the assistant response. You can also control whether reasoning is included in the response by setting the `include_reasoning` parameter.

Reasoning ExcludedReasoning IncludedReasoning Included (High)

JavaScript

```
import { Groq } from 'groq-sdk';

const groq = new Groq();

const chatCompletion = await groq.chat.completions.create({
  "messages": [
    {
      "role": "user",
      "content": "How do airplanes fly? Be concise."
    }
  ],
  "model": "openai/gpt-oss-20b",
  "stream": false,
  "include_reasoning": false
});

console.log(chatCompletion.choices[0].message);
```

```
from groq import Groq

client = Groq()

chat_completion = client.chat.completions.create(
    messages=[
        {
            "role": "user",
            "content": "How do airplanes fly? Be concise."
        }
    ],
    model="openai/gpt-oss-20b",
    stream=False,
    include_reasoning=False
)

print(chat_completion.choices[0].message)
```

```
curl https://api.groq.com/openai/v1/chat/completions -s \
  -H "authorization: bearer $GROQ_API_KEY" \
  -H "content-type: application/json" \
  -d '{
    "messages": [
      {
        "role": "user",
        "content": "How do airplanes fly? Be concise."
      }
    ],
    "model": "openai/gpt-oss-20b",
    "stream": false,
    "include_reasoning": false
  }'
```

Example Output (response.choices\[0\].message)

JSON

```
{
  "role": "assistant",
  "content": "Airplanes fly because their wings are shaped like airfoils that slice the air and produce lift: air travels faster over the curved upper surface (Bernoulli principle) and/or is deflected downward, creating an upward lift force that exceeds gravity. Engines provide thrust to overcome drag and keep the aircraft moving forward, so lift can keep it aloft. Control surfaces then balance lift, weight, thrust, and drag to steer and maintain flight."
}
```

JavaScript

```
import { Groq } from 'groq-sdk';

const groq = new Groq();

const chatCompletion = await groq.chat.completions.create({
  "messages": [
    {
      "role": "user",
      "content": "How do airplanes fly? Be concise."
    }
  ],
  "model": "openai/gpt-oss-20b",
  "stream": false
});

console.log(chatCompletion.choices[0].message);
```

```
from groq import Groq

client = Groq()

chat_completion = client.chat.completions.create(
    messages=[
        {
            "role": "user",
            "content": "How do airplanes fly? Be concise."
        }
    ],
    model="openai/gpt-oss-20b",
    stream=False
)

print(chat_completion.choices[0].message)
```

```
curl https://api.groq.com/openai/v1/chat/completions -s \
  -H "authorization: bearer $GROQ_API_KEY" \
  -H "content-type: application/json" \
  -d '{
    "messages": [
      {
        "role": "user",
        "content": "How do airplanes fly? Be concise."
      }
    ],
    "model": "openai/gpt-oss-20b",
    "stream": false
  }'
```

Example Output (response.choices\[0\].message)

JSON

```
{
  "role": "assistant",
  "content": "Airplanes fly because their wings are shaped like airfoils that slice the air and produce lift: air travels faster over the curved upper surface (Bernoulli principle) and/or is deflected downward, creating an upward lift force that exceeds gravity. Engines provide thrust to overcome drag and keep the aircraft moving forward, so lift can keep it aloft. Control surfaces then balance lift, weight, thrust, and drag to steer and maintain flight.",
  "reasoning": "We need concise answer: planes fly because of lift generated from wings due to airfoil shape, Bernoulli, angle of attack, thrust vs drag. So concisely explain: plane wings shape produces lift, engines provide thrust, controls manage pitch etc. Also mention aerodynamics: lift > weight, thrust > drag. So answer concise. Let's prepare: \"airplane wings produce lift due to airfoil shape... engine thrust propels...\" etc."
}
```

JavaScript

```
import { Groq } from 'groq-sdk';

const groq = new Groq();

const chatCompletion = await groq.chat.completions.create({
  "messages": [
    {
      "role": "user",
      "content": "How do airplanes fly? Be concise."
    }
  ],
  "model": "openai/gpt-oss-20b",
  "reasoning_effort": "high",
  "include_reasoning": true,
  "stream": false
});

console.log(chatCompletion.choices[0].message);
```

```
from groq import Groq

client = Groq()

chat_completion = client.chat.completions.create(
    messages=[
        {
            "role": "user",
            "content": "How do airplanes fly? Be concise."
        }
    ],
    model="openai/gpt-oss-20b",
    reasoning_effort="high",
    include_reasoning=True,
    stream=False
)

print(chat_completion.choices[0].message)
```

```
curl https://api.groq.com/openai/v1/chat/completions -s \
  -H "authorization: bearer $GROQ_API_KEY" \
  -H "content-type: application/json" \
  -d '{
    "messages": [
      {
        "role": "user",
        "content": "How do airplanes fly? Be concise."
      }
    ],
    "model": "openai/gpt-oss-20b",
    "reasoning_effort": "high",
    "include_reasoning": true,
    "stream": false
  }'
```

Example Output (response.choices\[0\].message)

JSON

```
{
  "role": "assistant",
  "content": "Planes fly because their wings, shaped like airfoils, move through the air to create a pressure difference that produces lift. Engines generate thrust to overcome drag, while lift balances the plane’s weight. When lift equals weight and thrust equals drag, the aircraft flies level; if lift exceeds weight it climbs, and if thrust exceeds drag it accelerates.",
  "reasoning": "The user asks: How do airplanes fly? Be concise. The user wants a concise answer. I must answer succinctly. The answer: basically lift, thrust, drag, weight. The plane's wings generate lift due to Bernoulli or angle of attack, engines produce thrust. Balanced forces. Maybe mention lift > weight for climb, etc. Or just mention wings shape, airfoil, Bernoulli's principle, Newton's third law, lift, thrust, etc. Keep concise. We can give a short paragraph: Airplanes fly because the wings are shaped to produce lift, the engines generate thrust, and the plane's weight pulls down; lift must balance weight, and thrust must overcome drag. That's it. Should be concise. Let's answer in maybe one or two sentences: An airplane generates lift by moving through air over its wing-shaped surfaces, creating a pressure difference; engines produce thrust to counteract drag, and the lift force balances weight, allowing flight. That is concise. Alternatively: Planes fly because the wings produce lift (pressure difference due to shape and motion), engines provide thrust, and the aircraft's weight pulls downward; lift equals weight and thrust equals drag for level flight. Thus answer."
}
```

## [Optimizing Performance](#optimizing-performance)

### [Temperature and Token Management](#temperature-and-token-management)

The model performs best with temperature settings between 0.5-0.7, with lower values (closer to 0.5) producing more consistent mathematical proofs and higher values allowing for more creative problem-solving approaches. Monitor and adjust your token usage based on the complexity of your reasoning tasks - while the default max_completion_tokens is 1024, complex proofs may require higher limits.

### [Prompt Engineering](#prompt-engineering)

To ensure accurate, step-by-step reasoning while maintaining high performance:

- DeepSeek-R1 works best when all instructions are included directly in user messages rather than system prompts.
- Structure your prompts to request explicit validation steps and intermediate calculations.
- Avoid few-shot prompting and go for zero-shot prompting only.

---

description: Reasoning models on Groq for complex problem-solving, step-by-step analysis, and explicit reasoning formats with fast inference.
title: Reasoning - GroqDocs
image: https://console.groq.com/og_cloudv5.jpg

---

# Reasoning

Reasoning models excel at complex problem-solving tasks that require step-by-step analysis, logical deduction, and structured thinking and solution validation. With Groq inference speed, these types of models can deliver instant reasoning capabilities critical for real-time applications.

## [Why Speed Matters for Reasoning](#why-speed-matters-for-reasoning)

Reasoning models are capable of complex decision making with explicit reasoning chains that are part of the token output and used for decision-making, which make low-latency and fast inference essential. Complex problems often require multiple chains of reasoning tokens where each step build on previous results. Low latency compounds benefits across reasoning chains and shaves off minutes of reasoning to a response in seconds.

## [Supported Models](#supported-models)

| Model ID            | Model                                                                          |
| ------------------- | ------------------------------------------------------------------------------ |
| openai/gpt-oss-20b  | [OpenAI GPT-OSS 20B](https://console.groq.com/docs/model/openai/gpt-oss-20b)   |
| openai/gpt-oss-120b | [OpenAI GPT-OSS 120B](https://console.groq.com/docs/model/openai/gpt-oss-120b) |
| qwen/qwen3-32b      | [Qwen 3 32B](https://console.groq.com/docs/model/qwen3-32b)                    |

## [Reasoning Format](#reasoning-format)

Groq API supports explicit reasoning formats through the `reasoning_format` parameter, giving you fine-grained control over how the model's reasoning process is presented. This is particularly valuable for valid JSON outputs, debugging, and understanding the model's decision-making process.

**Note:** The format defaults to `raw` or `parsed` when JSON mode or tool use are enabled as those modes do not support `raw`. If reasoning is explicitly set to `raw` with JSON mode or tool use enabled, we will return a 400 error.

### [Options for Reasoning Format](#options-for-reasoning-format)

| reasoning_format Options | Description                                                                                      |
| ------------------------ | ------------------------------------------------------------------------------------------------ |
| parsed                   | Separates reasoning into a dedicated message.reasoning field while keeping the response concise. |
| raw                      | Includes reasoning within <think> tags in the main text content.                                 |
| hidden                   | Returns only the final answer.                                                                   |

### [Including Reasoning in the Response](#including-reasoning-in-the-response)

You can also control whether reasoning is included in the response by setting the `include_reasoning` parameter.

| include_reasoning Options | Description                                                                                  |
| ------------------------- | -------------------------------------------------------------------------------------------- |
| true                      | Includes the reasoning in a dedicated message.reasoning field. This is the default behavior. |
| false                     | Excludes reasoning from the response.                                                        |

**Note:** The `include_reasoning` parameter cannot be used together with `reasoning_format`. These parameters are mutually exclusive.

## [Reasoning Effort](#reasoning-effort)

### [Options for Reasoning Effort (Qwen 3 32B)](#options-for-reasoning-effort-qwen-3-32b)

The `reasoning_effort` parameter controls the level of effort the model will put into reasoning. This is only supported by [Qwen 3 32B](https://console.groq.com/docs/model/qwen3-32b).

| reasoning_effort Options | Description                                                     |
| ------------------------ | --------------------------------------------------------------- |
| none                     | Disable reasoning. The model will not use any reasoning tokens. |
| default                  | Enable reasoning.                                               |

### [Options for Reasoning Effort (GPT-OSS)](#options-for-reasoning-effort-gptoss)

The `reasoning_effort` parameter controls the level of effort the model will put into reasoning. This is only supported by [GPT-OSS 20B](https://console.groq.com/docs/model/openai/gpt-oss-20b) and [GPT-OSS 120B](https://console.groq.com/docs/model/openai/gpt-oss-120b).

| reasoning_effort Options | Description                                                                        |
| ------------------------ | ---------------------------------------------------------------------------------- |
| low                      | Low effort reasoning. The model will use a small number of reasoning tokens.       |
| medium                   | Medium effort reasoning. The model will use a moderate number of reasoning tokens. |
| high                     | High effort reasoning. The model will use a large number of reasoning tokens.      |

## [Quick Start](#quick-start)

Get started with reasoning models using this basic example that demonstrates how to make a simple API call for complex problem-solving tasks.

JavaScript

```
import Groq from 'groq-sdk';

const client = new Groq();
const completion = await client.chat.completions.create({
    model: "openai/gpt-oss-20b",
    messages: [
        {
            role: "user",
            content: "How many r's are in the word strawberry?"
        }
    ],
    temperature: 0.6,
    max_completion_tokens: 1024,
    top_p: 0.95,
    stream: true
});

for await (const chunk of completion) {
    process.stdout.write(chunk.choices[0].delta.content || "");
}
```

```
from groq import Groq

client = Groq()
completion = client.chat.completions.create(
    model="openai/gpt-oss-20b",
    messages=[
        {
            "role": "user",
            "content": "How many r's are in the word strawberry?"
        }
    ],
    temperature=0.6,
    max_completion_tokens=1024,
    top_p=0.95,
    stream=True
)

for chunk in completion:
    print(chunk.choices[0].delta.content or "", end="")
```

```
curl "https://api.groq.com/openai/v1/chat/completions" \
  -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${GROQ_API_KEY}" \
  -d '{
         "messages": [
           {
             "role": "user",
             "content": "How many r'\''s are in the word strawberry?"
           }
         ],
         "model": "openai/gpt-oss-20b",
         "temperature": 0.6,
         "max_completion_tokens": 4096,
         "top_p": 0.95,
         "stream": true,
         "stop": null
       }'
```

## [Quick Start with Tool Use](#quick-start-with-tool-use)

This example shows how to combine reasoning models with function calling to create intelligent agents that can perform actions while explaining their thought process.

bash

```
curl https://api.groq.com//openai/v1/chat/completions -s \
  -H "authorization: bearer $GROQ_API_KEY" \
  -d '{
    "model": "openai/gpt-oss-20b",
    "messages": [
        {
            "role": "user",
            "content": "What is the weather like in Paris today?"
        }
    ],
    "tools": [
        {
            "type": "function",
            "function": {
                "name": "get_weather",
                "description": "Get current temperature for a given location.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "location": {
                            "type": "string",
                            "description": "City and country e.g. Bogotá, Colombia"
                        }
                    },
                    "required": [
                        "location"
                    ],
                    "additionalProperties": false
                },
                "strict": true
            }
        }
    ]}'
```

## [Recommended Configuration Parameters](#recommended-configuration-parameters)

| Parameter             | Default        | Range                                      | Description                                                                                                                                                                                                                                                                                                                                                        |
| --------------------- | -------------- | ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| messages              | \-             | \-                                         | Array of message objects. Important: Avoid system prompts - include all instructions in the user message!                                                                                                                                                                                                                                                          |
| temperature           | 0.6            | 0.0 - 2.0                                  | Controls randomness in responses. Lower values make responses more deterministic. Recommended range: 0.5-0.7 to prevent repetitions or incoherent outputs                                                                                                                                                                                                          |
| max_completion_tokens | 1024           | \-                                         | Maximum length of model's response. Default may be too low for complex reasoning - consider increasing for detailed step-by-step solutions                                                                                                                                                                                                                         |
| top_p                 | 0.95           | 0.0 - 1.0                                  | Controls diversity of token selection                                                                                                                                                                                                                                                                                                                              |
| stream                | false          | boolean                                    | Enables response streaming. Recommended for interactive reasoning tasks                                                                                                                                                                                                                                                                                            |
| stop                  | null           | string/array                               | Custom stop sequences                                                                                                                                                                                                                                                                                                                                              |
| seed                  | null           | integer                                    | Set for reproducible results. Important for benchmarking - run multiple tests with different seeds                                                                                                                                                                                                                                                                 |
| response_format       | {type: "text"} | {type: "json_object"} or {type: "text"}    | Set to json_object type for structured output.                                                                                                                                                                                                                                                                                                                     |
| reasoning_format      | raw            | "parsed", "raw", "hidden"                  | Controls how model reasoning is presented in the response. Must be set to either parsed or hidden when using tool calling or JSON mode.                                                                                                                                                                                                                            |
| reasoning_effort      | default        | "none", "default", "low", "medium", "high" | Controls the level of effort the model will put into reasoning. none and default are only supported by [Qwen 3 32B](https://console.groq.com/docs/model/qwen3-32b). low, medium, and high are only supported by [GPT-OSS 20B](https://console.groq.com/docs/model/openai/gpt-oss-20b) and [GPT-OSS 120B](https://console.groq.com/docs/model/openai/gpt-oss-120b). |

## [Accessing Reasoning Content](#accessing-reasoning-content)

Accessing the reasoning content in the response is dependent on the model and the reasoning format you are using. See the examples below for more details and refer to the [Reasoning Format](#reasoning-format) section for more information.

### [Non-GPT-OSS Models](#nongptoss-models)

RawParsedHidden

When using `raw` reasoning format, the reasoning content is accessible in the main text content of assistant responses within `<think>` tags. This example demonstrates making a request with `reasoning_format` set to `raw` to see the model's internal thinking process alongside the final answer.

JavaScript

```
import { Groq } from 'groq-sdk';

const groq = new Groq();

const chatCompletion = await groq.chat.completions.create({
  "messages": [
    {
      "role": "user",
      "content": "How do airplanes fly? Be concise."
    }
  ],
  "model": "qwen/qwen3-32b",
  "stream": false,
  "reasoning_format": "raw"
});

console.log(chatCompletion.choices[0].message);
```

```
from groq import Groq

client = Groq()

chat_completion = client.chat.completions.create(
    messages=[
        {
            "role": "user",
            "content": "How do airplanes fly? Be concise."
        }
    ],
    model="qwen/qwen3-32b",
    stream=False,
    reasoning_format="raw"
)

print(chat_completion.choices[0].message)
```

```
curl https://api.groq.com/openai/v1/chat/completions -s \
  -H "authorization: bearer $GROQ_API_KEY" \
  -H "content-type: application/json" \
  -d '{
    "messages": [
      {
        "role": "user",
        "content": "How do airplanes fly? Be concise."
      }
    ],
    "model": "qwen/qwen3-32b",
    "stream": false,
    "reasoning_format": "raw"
  }'
```

Example Output (response.choices\[0\].message)

JSON

```
{
  "role": "assistant",
  "content": "<think>Okay, the user is asking how airplanes fly and wants a concise answer. Let me start by recalling the basics of flight mechanics. First, lift is essential. Airplanes generate lift with their wings. The shape of the wing, or airfoil, causes air to move faster over the top, creating lower pressure compared to the bottom. This pressure difference lifts the plane. But wait, I should mention Bernoulli's principle here. Also, angle of attack affects lift by directing airflow downward, which pushes the wing up by Newton's third law. Both factors contribute to lift. Thrust is needed to move the plane forward, providing the speed necessary for lift. Engines like jet engines or propellers generate thrust. Drag is the opposing force; the plane must overcome it. Stability and control come into play too—ailerons, rudder, elevator for maneuvers. Wait, the user wants it concise. Maybe I should prioritize the main points: lift due to wings' shape and angle, thrust from engines, and balance forces. Avoid getting too technical with equations but mention the key components. Also, mention that controlled flight involves managing these forces. Let me make sure I'm not missing anything crucial. Maybe lift, thrust, drag, weight—those are the four forces. But since the user wants it brief, I can simplify to the main elements without listing all four forces. Double-check if Bernoulli's principle is accurate here. Some debates exist about its role versus Newton's laws, but a simplified explanation is acceptable here. Also, mention that the engines provide forward motion, which is crucial for sustaining lift. Putting it all together: airplanes fly by generating lift through their wings' design and angle of attack, using engines for thrust to maintain speed, and controlling flight with adjustable surfaces. Should be concise and cover the essentials.</think>Airplanes fly by generating **lift** through the shape of their wings (airfoils), which causes faster airflow over the top and slower air underneath, creating a pressure difference. **Thrust** from engines (or propellers) propels them forward, countering **drag**, while **control surfaces** (ailerons, rudder, elevator) adjust airflow for stability and direction. Lift must overcome **weight** (gravity) to stay aloft."
}
```

When using `parsed` reasoning format, the model's reasoning is separated into a dedicated `reasoning` field, making it easier to access both the final answer and the thinking process programmatically. This format is ideal for applications that need to process or display reasoning content separately from the main response.

JavaScript

```
import { Groq } from 'groq-sdk';

const groq = new Groq();

const chatCompletion = await groq.chat.completions.create({
  "messages": [
    {
      "role": "user",
      "content": "How do airplanes fly? Be concise."
    }
  ],
  "model": "qwen/qwen3-32b",
  "stream": false,
  "reasoning_format": "parsed"
});

console.log(chatCompletion.choices[0].message);
```

```
from groq import Groq

client = Groq()

chat_completion = client.chat.completions.create(
    messages=[
        {
            "role": "user",
            "content": "How do airplanes fly? Be concise."
        }
    ],
    model="qwen/qwen3-32b",
    stream=False,
    reasoning_format="parsed"
)

print(chat_completion.choices[0].message)
```

```
curl https://api.groq.com/openai/v1/chat/completions -s \
  -H "authorization: bearer $GROQ_API_KEY" \
  -H "content-type: application/json" \
  -d '{
    "messages": [
      {
        "role": "user",
        "content": "How do airplanes fly? Be concise."
      }
    ],
    "model": "qwen/qwen3-32b",
    "stream": false,
    "reasoning_format": "parsed"
  }'
```

Example Output (response.choices\[0\].message)

JSON

```
{
  "role": "assistant",
  "content": "Airplanes fly by generating **lift** through their wings' shape (airfoils), creating a pressure difference (lower pressure above, higher below). **Thrust** from engines overcomes drag, propelling the plane forward. Controlled movement (pitch, roll, yaw) adjusts lift and direction. In short: **lift + thrust > weight + drag** enables flight.",
  "reasoning": "Okay, the user is asking how airplanes fly and wants a concise answer. Let me break this down. First, I need to recall the basic principles of flight. The main concepts are lift, thrust, drag, and weight. Lift is generated by the wings, right? The shape of the wing causes air to move faster over the top, creating lower pressure compared to the bottom, which lifts the plane. Then there's thrust from the engines, which pushes the plane forward, overcoming drag. Drag is the resistance from the air. The pilot controls the plane's direction with surfaces like ailerons, elevators, and rudders. Also, Newton's third law comes into play with the engines pushing air backward, propelling the plane forward. Wait, the question is asking for conciseness. I should make sure not to include too much detail. Maybe mention the four forces, the wing's shape (airfoil), and how the engines generate thrust. Avoid getting into too much depth about different types of engines or control surfaces unless necessary. Is there anything else important? Maybe the angle of attack? Or the balance between the forces. But keeping it simple. The answer should be brief enough. Let me check the key points again: lift due to wing shape causing pressure difference, thrust overcoming drag, controlled movement. That should cover it without being too technical.",
}
```

When using `hidden` reasoning format, only the final answer is returned without any visible reasoning content. This is useful for applications where you want the benefits of reasoning models but don't need to expose the thinking process to end users. The model will still reason, but the reasoning content will not be returned in the response.

JavaScript

```
import { Groq } from 'groq-sdk';

const groq = new Groq();

const chatCompletion = await groq.chat.completions.create({
  "messages": [
    {
      "role": "user",
      "content": "How do airplanes fly? Be concise."
    }
  ],
  "model": "qwen/qwen3-32b",
  "stream": false,
  "reasoning_format": "hidden"
});

console.log(chatCompletion.choices[0].message);
```

```
from groq import Groq

client = Groq()

chat_completion = client.chat.completions.create(
    messages=[
        {
            "role": "user",
            "content": "How do airplanes fly? Be concise."
        }
    ],
    model="qwen/qwen3-32b",
    stream=False,
    reasoning_format="hidden"
)

print(chat_completion.choices[0].message)
```

```
curl https://api.groq.com/openai/v1/chat/completions -s \
  -H "authorization: bearer $GROQ_API_KEY" \
  -H "content-type: application/json" \
  -d '{
    "messages": [
      {
        "role": "user",
        "content": "How do airplanes fly? Be concise."
      }
    ],
    "model": "qwen/qwen3-32b",
    "stream": false,
    "reasoning_format": "hidden"
  }'
```

Example Output (response.choices\[0\].message)

JSON

```
{
  "role": "assistant",
  "content": "Airplanes fly by generating **lift** via airfoil-shaped wings, which create a pressure difference (Bernoulli’s principle) as air moves faster over the curved top surface. **Thrust** from engines overcomes air **drag**, maintaining forward motion to sustain lift. Control surfaces (ailerons, elevators, rudder) adjust **direction** and **altitude**, balancing **weight** (gravity) and lift for stable flight."
}
```

### [GPT-OSS Models](#gptoss-models)

With `openai/gpt-oss-20b` and `openai/gpt-oss-120b`, the `reasoning_format` parameter is not supported. By default, these models will include reasoning content in the `reasoning` field of the assistant response. You can also control whether reasoning is included in the response by setting the `include_reasoning` parameter.

Reasoning ExcludedReasoning IncludedReasoning Included (High)

JavaScript

```
import { Groq } from 'groq-sdk';

const groq = new Groq();

const chatCompletion = await groq.chat.completions.create({
  "messages": [
    {
      "role": "user",
      "content": "How do airplanes fly? Be concise."
    }
  ],
  "model": "openai/gpt-oss-20b",
  "stream": false,
  "include_reasoning": false
});

console.log(chatCompletion.choices[0].message);
```

```
from groq import Groq

client = Groq()

chat_completion = client.chat.completions.create(
    messages=[
        {
            "role": "user",
            "content": "How do airplanes fly? Be concise."
        }
    ],
    model="openai/gpt-oss-20b",
    stream=False,
    include_reasoning=False
)

print(chat_completion.choices[0].message)
```

```
curl https://api.groq.com/openai/v1/chat/completions -s \
  -H "authorization: bearer $GROQ_API_KEY" \
  -H "content-type: application/json" \
  -d '{
    "messages": [
      {
        "role": "user",
        "content": "How do airplanes fly? Be concise."
      }
    ],
    "model": "openai/gpt-oss-20b",
    "stream": false,
    "include_reasoning": false
  }'
```

Example Output (response.choices\[0\].message)

JSON

```
{
  "role": "assistant",
  "content": "Airplanes fly because their wings are shaped like airfoils that slice the air and produce lift: air travels faster over the curved upper surface (Bernoulli principle) and/or is deflected downward, creating an upward lift force that exceeds gravity. Engines provide thrust to overcome drag and keep the aircraft moving forward, so lift can keep it aloft. Control surfaces then balance lift, weight, thrust, and drag to steer and maintain flight."
}
```

JavaScript

```
import { Groq } from 'groq-sdk';

const groq = new Groq();

const chatCompletion = await groq.chat.completions.create({
  "messages": [
    {
      "role": "user",
      "content": "How do airplanes fly? Be concise."
    }
  ],
  "model": "openai/gpt-oss-20b",
  "stream": false
});

console.log(chatCompletion.choices[0].message);
```

```
from groq import Groq

client = Groq()

chat_completion = client.chat.completions.create(
    messages=[
        {
            "role": "user",
            "content": "How do airplanes fly? Be concise."
        }
    ],
    model="openai/gpt-oss-20b",
    stream=False
)

print(chat_completion.choices[0].message)
```

```
curl https://api.groq.com/openai/v1/chat/completions -s \
  -H "authorization: bearer $GROQ_API_KEY" \
  -H "content-type: application/json" \
  -d '{
    "messages": [
      {
        "role": "user",
        "content": "How do airplanes fly? Be concise."
      }
    ],
    "model": "openai/gpt-oss-20b",
    "stream": false
  }'
```

Example Output (response.choices\[0\].message)

JSON

```
{
  "role": "assistant",
  "content": "Airplanes fly because their wings are shaped like airfoils that slice the air and produce lift: air travels faster over the curved upper surface (Bernoulli principle) and/or is deflected downward, creating an upward lift force that exceeds gravity. Engines provide thrust to overcome drag and keep the aircraft moving forward, so lift can keep it aloft. Control surfaces then balance lift, weight, thrust, and drag to steer and maintain flight.",
  "reasoning": "We need concise answer: planes fly because of lift generated from wings due to airfoil shape, Bernoulli, angle of attack, thrust vs drag. So concisely explain: plane wings shape produces lift, engines provide thrust, controls manage pitch etc. Also mention aerodynamics: lift > weight, thrust > drag. So answer concise. Let's prepare: \"airplane wings produce lift due to airfoil shape... engine thrust propels...\" etc."
}
```

JavaScript

```
import { Groq } from 'groq-sdk';

const groq = new Groq();

const chatCompletion = await groq.chat.completions.create({
  "messages": [
    {
      "role": "user",
      "content": "How do airplanes fly? Be concise."
    }
  ],
  "model": "openai/gpt-oss-20b",
  "reasoning_effort": "high",
  "include_reasoning": true,
  "stream": false
});

console.log(chatCompletion.choices[0].message);
```

```
from groq import Groq

client = Groq()

chat_completion = client.chat.completions.create(
    messages=[
        {
            "role": "user",
            "content": "How do airplanes fly? Be concise."
        }
    ],
    model="openai/gpt-oss-20b",
    reasoning_effort="high",
    include_reasoning=True,
    stream=False
)

print(chat_completion.choices[0].message)
```

```
curl https://api.groq.com/openai/v1/chat/completions -s \
  -H "authorization: bearer $GROQ_API_KEY" \
  -H "content-type: application/json" \
  -d '{
    "messages": [
      {
        "role": "user",
        "content": "How do airplanes fly? Be concise."
      }
    ],
    "model": "openai/gpt-oss-20b",
    "reasoning_effort": "high",
    "include_reasoning": true,
    "stream": false
  }'
```

Example Output (response.choices\[0\].message)

JSON

```
{
  "role": "assistant",
  "content": "Planes fly because their wings, shaped like airfoils, move through the air to create a pressure difference that produces lift. Engines generate thrust to overcome drag, while lift balances the plane’s weight. When lift equals weight and thrust equals drag, the aircraft flies level; if lift exceeds weight it climbs, and if thrust exceeds drag it accelerates.",
  "reasoning": "The user asks: How do airplanes fly? Be concise. The user wants a concise answer. I must answer succinctly. The answer: basically lift, thrust, drag, weight. The plane's wings generate lift due to Bernoulli or angle of attack, engines produce thrust. Balanced forces. Maybe mention lift > weight for climb, etc. Or just mention wings shape, airfoil, Bernoulli's principle, Newton's third law, lift, thrust, etc. Keep concise. We can give a short paragraph: Airplanes fly because the wings are shaped to produce lift, the engines generate thrust, and the plane's weight pulls down; lift must balance weight, and thrust must overcome drag. That's it. Should be concise. Let's answer in maybe one or two sentences: An airplane generates lift by moving through air over its wing-shaped surfaces, creating a pressure difference; engines produce thrust to counteract drag, and the lift force balances weight, allowing flight. That is concise. Alternatively: Planes fly because the wings produce lift (pressure difference due to shape and motion), engines provide thrust, and the aircraft's weight pulls downward; lift equals weight and thrust equals drag for level flight. Thus answer."
}
```

## [Optimizing Performance](#optimizing-performance)

### [Temperature and Token Management](#temperature-and-token-management)

The model performs best with temperature settings between 0.5-0.7, with lower values (closer to 0.5) producing more consistent mathematical proofs and higher values allowing for more creative problem-solving approaches. Monitor and adjust your token usage based on the complexity of your reasoning tasks - while the default max_completion_tokens is 1024, complex proofs may require higher limits.

### [Prompt Engineering](#prompt-engineering)

To ensure accurate, step-by-step reasoning while maintaining high performance:

- DeepSeek-R1 works best when all instructions are included directly in user messages rather than system prompts.
- Structure your prompts to request explicit validation steps and intermediate calculations.
- Avoid few-shot prompting and go for zero-shot prompting only.

---

description: Access real-time web content and up-to-date information with automatic citations using the built-in web search tool.
title: Web Search - GroqDocs
image: https://console.groq.com/og_cloudv5.jpg

---

# Web Search

Some models and systems on Groq have native support for access to real-time web content, allowing them to answer questions with up-to-date information beyond their knowledge cutoff. API responses automatically include citations with a complete list of all sources referenced from the search results.

Unlike [Browser Search](https://console.groq.com/docs/browser-search) which mimics human browsing behavior by navigating websites interactively, web search performs a single search and retrieves text snippets from webpages.

The use of this tool with a supported model or system in GroqCloud is not a HIPAA Covered Cloud Service under Groq's Business Associate Addendum at this time. This tool is also not available currently for use with regional / sovereign endpoints.

## [Supported Systems](#supported-systems)

Built-in web search is supported for the following systems:

| Model ID           | System                                                                        |
| ------------------ | ----------------------------------------------------------------------------- |
| groq/compound      | [Compound](https://console.groq.com/docs/compound/systems/compound)           |
| groq/compound-mini | [Compound Mini](https://console.groq.com/docs/compound/systems/compound-mini) |

For a comparison between the `groq/compound` and `groq/compound-mini` systems and more information regarding additional capabilities, see the [Compound Systems](https://console.groq.com/docs/compound/systems#system-comparison) page.

## [Quick Start](#quick-start)

To use web search, change the `model` parameter to one of the supported models.

python

```
from groq import Groq
import json

client = Groq()

response = client.chat.completions.create(
    model="groq/compound",
    messages=[
        {
            "role": "user",
            "content": "What happened in AI last week? Provide a list of the most important model releases and updates."
        }
    ]
)

# Final output
print(response.choices[0].message.content)

# Reasoning + internal tool calls
print(response.choices[0].message.reasoning)

# Search results from the tool calls
if response.choices[0].message.executed_tools:
    print(response.choices[0].message.executed_tools[0].search_results)
```

```
import Groq from "groq-sdk";

const groq = new Groq();

const response = await groq.chat.completions.create({
  model: "groq/compound",
  messages: [
    {
      role: "user",
      content: "What happened in AI last week? Provide a list of the most important model releases and updates."
    },
  ]
});

// Final output
console.log(response.choices[0].message.content);

// Reasoning + internal tool calls
console.log(response.choices[0].message.reasoning);

// Search results from the tool calls
console.log(response.choices[0].message.executed_tools?.[0].search_results);
```

```
curl "https://api.groq.com/openai/v1/chat/completions" \
  -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${GROQ_API_KEY}" \
  -d '{
        "messages": [
          {
            "role": "user",
            "content": "What happened in AI last week? Provide a list of the most important model releases and updates."
          }
        ],
        "model": "groq/compound"
      }'
```

_And that's it!_

When the API is called, it will intelligently decide when to use web search to best answer the user's query. These tool calls are performed on the server side, so no additional setup is required on your part to use built-in tools.

### [Final Output](#final-output)

This is the final response from the model, containing the synthesized answer based on web search results. The model combines information from multiple sources to provide a comprehensive response with automatic citations. Use this as the primary output for user-facing applications.

message.content

What happened in AI last week is that several significant model releases and updates took place. Based on the search results and information gathered, here is a list of the most important AI model releases and updates from last week:

1. **Google Gemini 2.5 Deep Think**: Google released Gemini 2.5, an update to their AI model.
2. **OpenAI Study Mode in ChatGPT**: OpenAI added a Study Mode in ChatGPT, enhancing the capabilities of their AI chatbot.
3. **Alibaba Wan2.2**: Alibaba released Wan2.2, a new AI model that claims to be even cheaper to use than DeepSeek.
4. **Google AlphaEarth**: Google launched AlphaEarth, a state-of-the-art geospatial AI model.

Additionally, other notable updates and releases include:

- **OpenAI o3-pro**: OpenAI launched o3-pro, a new AI model available for Pro users in ChatGPT and in their API.
- **Tencent releases versatile open-source Hunyuan AI models**: Tencent released Hunyuan AI models, which are open-source and versatile.
- **Deep Cogito v2**: Deep Cogito v2 was released, which is an open-source AI that hones its reasoning skills.
- **GLM-4.5 AI model**: Startup Z.ai announced its new GLM-4.5 AI model, which claims to be even cheaper to use than DeepSeek.

These updates and releases demonstrate the rapid progress and advancements being made in the field of AI, with various companies and organizations pushing the boundaries of what is possible with artificial intelligence.

### [Reasoning and Internal Tool Calls](#reasoning-and-internal-tool-calls)

This shows the model's internal reasoning process and the search queries it executed to gather information. You can inspect this to understand how the model approached the problem and what search terms it used. This is useful for debugging and understanding the model's decision-making process.

message.reasoning

To provide a list of the most important model releases and updates in AI from last week, I need to first find out what happened in AI last week. I will use the search tool to look for relevant information.

<tool>search(AI model releases and updates last week)</tool> <output>Title: Another big week in AI. Here's what happened in the last 7 days URL: <https://www.instagram.com/p/DM7h0-VNml8/>Content: 1\. Google releases Gemini 2.5 Deep Think 2\. OpenAI adds Study Mode in ChatGPT 3\. Alibaba releases Wan2.2 4\. Google launches AlphaEarth Score: 0.8092

Title: Latest AI Breakthroughs and News: May, June, July 2025 URL: <https://www.crescendo.ai/news/latest-ai-news-and-updates>Content: Baidu to Open-Source Latest Ernie AI Model. Date: February 14, 2025\. Summary ... Alibaba Releases AI Model Surpassing DeepSeek-V3\. Date: January 29, 2025\. Score: 0.6639

Title: OpenAI News URL: <https://openai.com/news/>Content: Introducing our latest image generation model in the API. Product Apr 23, 2025\. GPT-4.5\. Introducing GPT-4.5\. Release Feb 27, 2025\. o3-mini > cover image. Score: 0.4580

Title: Official Google AI news and updates URL: <https://blog.google/technology/ai/>Content: All the Latest · Google Earth AI: Our state-of-the-art geospatial AI models · The inside story of building NotebookLM · New ways to learn and explore with AI Mode Score: 0.3955

Title: Gemini Apps' release updates & improvements URL: <https://gemini.google.com/updates>Content: Explore the latest updates from Gemini Apps - including improvements in generative AI capabilities, expanded access, and more. Score: 0.2244

...\[truncated\]

</output>

Based on the search results, here are some of the most important AI model releases and updates from last week:

1. **Google Gemini 2.5 Deep Think**: Google released Gemini 2.5, an update to their AI model.
2. **OpenAI Study Mode in ChatGPT**: OpenAI added a Study Mode in ChatGPT.
3. **Alibaba Wan2.2**: Alibaba released Wan2.2, an AI model.
4. **Google AlphaEarth**: Google launched AlphaEarth.

### [Search Results](#search-results)

These are the raw search results that the model retrieved from the web, including titles, URLs, content snippets, and relevance scores. You can use this data to verify sources, implement custom citation systems, or provide users with direct links to the original content. Each result includes a relevance score from 0 to 1.

message.executed_tools\[0\].search_results

JSON

```
{
  results: [
      {
        title: "Another big week in AI. Here's what happened in the last 7 days",
        url: "https://www.instagram.com/p/DM7h0-VNml8/",
        content: "1. Google releases Gemini 2.5 Deep Think 2. OpenAI adds Study Mode in ChatGPT 3. Alibaba releases Wan2.2 4. Google launches AlphaEarth",
        score: 0.8091708
      },
      {
        title: "Model Release Notes | OpenAI Help Center",
        url: "https://help.openai.com/en/articles/9624314-model-release-notes",
        content: "Launching OpenAI o3-pro—available now for Pro users in ChatGPT and in our API (June 10, 2025) · Updates to Advanced Voice Mode for paid users (June 7, 2025).",
        score: 0.5377946
      },
      {
        title: "The latest AI news we announced in June",
        url: "https://blog.google/technology/ai/google-ai-updates-june-2025/",
        content: "Here's a recap of some of our biggest AI updates from June, including more ways to search with AI Mode, a new way to share your NotebookLM notebooks publicly.",
        score: 0.52130115
      },
      {
        title: "OpenAI News",
        url: "https://openai.com/news/",
        content: "Introducing our latest image generation model in the API. Product Apr 23, 2025. GPT-4.5. Introducing GPT-4.5. Release Feb 27, 2025. o3-mini > cover image.",
        score: 0.45798564
      },
      {
        title: "Official Google AI news and updates",
        url: "https://blog.google/technology/ai/",
        content: "All the Latest · Google Earth AI: Our state-of-the-art geospatial AI models · The inside story of building NotebookLM · New ways to learn and explore with AI Mode",
        score: 0.39550823
      },
      {
        title: "Gemini Apps' release updates & improvements",
        url: "https://gemini.google.com/updates",
        content: "Explore the latest updates from Gemini Apps - including improvements in generative AI capabilities, expanded access, and more.",
        score: 0.22441256
      },
      ...[truncated]
  ]
}
```

## [Search Settings](#search-settings)

Customize web search behavior by using the `search_settings` parameter. This parameter allows you to exclude specific domains from search results or restrict searches to only include specific domains. These parameters are supported for both `groq/compound` and `groq/compound-mini`.

| Parameter       | Type       | Description                                                                                                                     |
| --------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------- |
| exclude_domains | string\[\] | List of domains to exclude when performing web searches. Supports wildcards (e.g., "\*.com")                                    |
| include_domains | string\[\] | Restrict web searches to only search within these specified domains. Supports wildcards (e.g., "\*.edu")                        |
| country         | string     | Boost search results from a specific country. This will prioritize content from the selected country in the web search results. |

Supported Countries

`afghanistan`, `albania`, `algeria`, `andorra`, `angola`, `argentina`, `armenia`, `australia`, `austria`, `azerbaijan`, `bahamas`, `bahrain`, `bangladesh`, `barbados`, `belarus`, `belgium`, `belize`, `benin`, `bhutan`, `bolivia`, `bosnia and herzegovina`, `botswana`, `brazil`, `brunei`, `bulgaria`, `burkina faso`, `burundi`, `cambodia`, `cameroon`, `canada`, `cape verde`, `central african republic`, `chad`, `chile`, `china`, `colombia`, `comoros`, `congo`, `costa rica`, `croatia`, `cuba`, `cyprus`, `czech republic`, `denmark`, `djibouti`, `dominican republic`, `ecuador`, `egypt`, `el salvador`, `equatorial guinea`, `eritrea`, `estonia`, `ethiopia`, `fiji`, `finland`, `france`, `gabon`, `gambia`, `georgia`, `germany`, `ghana`, `greece`, `guatemala`, `guinea`, `haiti`, `honduras`, `hungary`, `iceland`, `india`, `indonesia`, `iran`, `iraq`, `ireland`, `israel`, `italy`, `jamaica`, `japan`, `jordan`, `kazakhstan`, `kenya`, `kuwait`, `kyrgyzstan`, `latvia`, `lebanon`, `lesotho`, `liberia`, `libya`, `liechtenstein`, `lithuania`, `luxembourg`, `madagascar`, `malawi`, `malaysia`, `maldives`, `mali`, `malta`, `mauritania`, `mauritius`, `mexico`, `moldova`, `monaco`, `mongolia`, `montenegro`, `morocco`, `mozambique`, `myanmar`, `namibia`, `nepal`, `netherlands`, `new zealand`, `nicaragua`, `niger`, `nigeria`, `north korea`, `north macedonia`, `norway`, `oman`, `pakistan`, `panama`, `papua new guinea`, `paraguay`, `peru`, `philippines`, `poland`, `portugal`, `qatar`, `romania`, `russia`, `rwanda`, `saudi arabia`, `senegal`, `serbia`, `singapore`, `slovakia`, `slovenia`, `somalia`, `south africa`, `south korea`, `south sudan`, `spain`, `sri lanka`, `sudan`, `sweden`, `switzerland`, `syria`, `taiwan`, `tajikistan`, `tanzania`, `thailand`, `togo`, `trinidad and tobago`, `tunisia`, `turkey`, `turkmenistan`, `uganda`, `ukraine`, `united arab emirates`, `united kingdom`, `united states`, `uruguay`, `uzbekistan`, `venezuela`, `vietnam`, `yemen`, `zambia`, `zimbabwe`

### [Domain Filtering with Wildcards](#domain-filtering-with-wildcards)

Both `include_domains` and `exclude_domains` support wildcard patterns using the `*` character. This allows for flexible domain filtering:

- Use `*.com` to include/exclude all .com domains
- Use `*.edu` to include/exclude all educational institutions
- Use specific domains like `example.com` to include/exclude exact matches

You can combine both parameters to create precise search scopes. For example:

- Include only .com domains while excluding specific sites
- Restrict searches to specific country domains
- Filter out entire categories of websites

### [Search Settings Examples](#search-settings-examples)

Exclude DomainsInclude DomainsWildcard Use

shell

```
curl "https://api.groq.com/openai/v1/chat/completions" \
  -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${GROQ_API_KEY}" \
  -d '{
         "messages": [
           {
             "role": "user",
             "content": "Tell me about the history of Bonsai trees in America"
           }
         ],
         "model": "groq/compound-mini",
         "search_settings": {
           "exclude_domains": ["wikipedia.org"]
         }
       }'
```

shell

```
curl "https://api.groq.com/openai/v1/chat/completions" \
  -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${GROQ_API_KEY}" \
  -d '{
         "messages": [
           {
             "role": "user",
             "content": "What is the latest in AI?"
           }
         ],
         "model": "groq/compound-mini",
         "search_settings": {
           "include_domains": ["arxiv.org"]
         }
       }'
```

shell

```
curl "https://api.groq.com/openai/v1/chat/completions" \
  -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${GROQ_API_KEY}" \
  -d '{
         "messages": [
           {
             "role": "user",
             "content": "What is the latest in AI?"
           }
         ],
         "model": "groq/compound-mini",
         "search_settings": {
           "include_domains": ["*.org"],
           "exclude_domains": ["wikipedia.org"]
         }
       }'
```

## [Pricing](#pricing)

Please see the [Pricing](https://groq.com/pricing) page for more information.

There are two types of web search: [basic search](#basic-search) and [advanced search](#advanced-search), and these are billed differently.

### [Basic Search](#basic-search)

A more basic, less comprehensive version of search that provides essential web search capabilities. Basic search is supported on Compound version `2025-07-23`. To use basic search, specify the version in your API request. See [Compound System Versioning](https://console.groq.com/docs/compound#system-versioning) for details on how to set your Compound version.

### [Advanced Search](#advanced-search)

The default search experience that provides more comprehensive and intelligent search results. Advanced search is automatically used with Compound versions newer than `2025-07-23` and offers enhanced capabilities for better information retrieval and synthesis.

## [Provider Information](#provider-information)

Web search functionality is powered by [Tavily](https://tavily.com/), a search API optimized for AI applications. Tavily provides real-time access to web content with intelligent ranking and citation capabilities specifically designed for language models.

---

description: Access comprehensive real-time web content with automatic citations using the built-in browser search tool.
title: Browser Search - GroqDocs
image: https://console.groq.com/og_cloudv5.jpg

---

# Browser Search

Some models on Groq have built-in support for interactive browser search, providing a more comprehensive approach to accessing real-time web content than traditional web search. Unlike [Web Search](https://console.groq.com/docs/web-search) which performs a single search and retrieves text snippets from webpages, browser search mimics human browsing behavior by navigating websites interactively, providing more detailed results.

For latency sensitive use cases, we recommend using [Web Search](https://console.groq.com/docs/web-search) instead.

The use of this tool with a supported model or system in GroqCloud is not a HIPAA Covered Cloud Service under Groq's Business Associate Addendum at this time. This tool is also not available currently for use with regional / sovereign endpoints.

## [Supported Models](#supported-models)

Built-in browser search is supported for the following models:

| Model ID            | Model                                                                          |
| ------------------- | ------------------------------------------------------------------------------ |
| openai/gpt-oss-20b  | [OpenAI GPT-OSS 20B](https://console.groq.com/docs/model/openai/gpt-oss-20b)   |
| openai/gpt-oss-120b | [OpenAI GPT-OSS 120B](https://console.groq.com/docs/model/openai/gpt-oss-120b) |

**Note:** Browser search is not compatible with [structured outputs](https://console.groq.com/docs/structured-outputs).

## [Quick Start](#quick-start)

To use browser search, change the `model` parameter to one of the supported models.

python

```
from groq import Groq

client = Groq()

chat_completion = client.chat.completions.create(
    messages=[
        {
            "role": "user",
            "content": "What happened in AI last week? Give me a concise, one paragraph summary of the most important events."
        }
    ],
    model="openai/gpt-oss-20b",
    temperature=1,
    max_completion_tokens=2048,
    top_p=1,
    stream=False,
    stop=None,
    tool_choice="required",
    tools=[
        {
            "type": "browser_search"
        }
    ]
)

print(chat_completion.choices[0].message.content)
```

```
import { Groq } from 'groq-sdk';

const groq = new Groq();

const chatCompletion = await groq.chat.completions.create({
  "messages": [
    {
      "role": "user",
      "content": "What happened in AI last week? Give me a concise, one paragraph summary of the most important events."
    }
  ],
  "model": "openai/gpt-oss-20b",
  "temperature": 1,
  "max_completion_tokens": 2048,
  "top_p": 1,
  "stream": false,
  "reasoning_effort": "medium",
  "stop": null,
  "tool_choice": "required",
  "tools": [
    {
      "type": "browser_search"
    }
  ]
});

console.log(chatCompletion.choices[0].message.content);
```

```
curl -X POST "https://api.groq.com/openai/v1/chat/completions" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $GROQ_API_KEY" \
  -d '{
    "messages": [
      {
        "role": "user",
        "content": "What happened in AI last week? Give me a concise, one paragraph summary of the most important events."
      }
    ],
    "model": "openai/gpt-oss-20b",
    "temperature": 1,
    "max_completion_tokens": 2048,
    "top_p": 1,
    "stream": false,
    "stop": null,
    "tool_choice": "required",
    "tools": [
      {
        "type": "browser_search"
      }
    ]
  }'
```

When the API is called, it will use browser search to best answer the user's query. This tool call is performed on the server side, so no additional setup is required on your part to use this feature.

### [Final Output](#final-output)

This is the final response from the model, containing snippets from the web pages that were searched, and the final response at the end. The model combines information from multiple sources to provide a comprehensive response.

message.content

...\[truncated site snippets\]

Last week saw a reshuffling of AI leadership and a flurry of policy and product moves: Anthropic passed OpenAI as the top‑ranked enterprise large‑language‑model provider with a 32 % share 【2†L6-L10】, while Meta’s “Meta AI” claimed to be self‑improving, prompting fresh safety worries 【2†L17-L23】; the U.S. announced it will funnel all federal data into domestically built AI models and tighten high‑end chip export controls 【2†L27-L31】. Microsoft began testing a “smart mode” for Copilot that auto‑chooses the best model – a clear pre‑lude to GPT‑5 – and also launched Copilot Mode in Edge, while Microsoft’s research flagged which jobs are most impacted by AI chatbots 【2†L37-L44】【2†L46-L50】. Adobe rolled out new generative‑AI tools for Photoshop (Generative Upscale, Harmonize, etc.) 【2†L55-L60】 and Google expanded its AI‑powered Search “AI Mode” to support image uploads for homework help 【2†L64-L68】. At the World AI Conference, China’s premier proposed an international AI‑governance body and, amid U.S. chip restrictions, Chinese AI firms formed alliances and released an open‑source GLM‑4.5 model for agents 【2†L92-L100】【2†L110-L116】. Finally, OpenAI CEO Sam Altman likened the forthcoming GPT‑5 rollout to the Manhattan Project, highlighting the speed and safety concerns of the next‑generation model 【2†L119-L124】.

## [Pricing](#pricing)

Please see the [Pricing](https://groq.com/pricing) page for more information.

## [Best Practices](#best-practices)

When using browser search with reasoning models, consider setting `reasoning_effort` to `low` to optimize performance and token usage. Higher reasoning effort levels can result in extended browser sessions with more comprehensive web exploration, which may consume significantly more tokens than necessary for most queries. Using `low` reasoning effort provides a good balance between search quality and efficiency.

## [Provider Information](#provider-information)

Browser search functionality is powered by [Exa](https://exa.ai/), a search engine designed for AI applications. Exa provides comprehensive web browsing capabilities that go beyond traditional search by allowing models to navigate and interact with web content in a more human-like manner.

---

description: Access and analyze specific website content using the built-in website visit tool for contextual information.
title: Visit Website - GroqDocs
image: https://console.groq.com/og_cloudv5.jpg

---

# Visit Website

Some models and systems on Groq have native support for visiting and analyzing specific websites, allowing them to access current web content and provide detailed analysis based on the actual page content. This tool enables models to retrieve and process content from any publicly accessible website.

The use of this tool with a supported model or system in GroqCloud is not a HIPAA Covered Cloud Service under Groq's Business Associate Addendum at this time. This tool is also not available currently for use with regional / sovereign endpoints.

## [Supported Models](#supported-models)

Built-in website visiting is supported for the following models and systems (on [versions](https://console.groq.com/docs/compound#system-versioning) later than `2025-07-23`):

| Model ID           | Model                                                                         |
| ------------------ | ----------------------------------------------------------------------------- |
| groq/compound      | [Compound](https://console.groq.com/docs/compound/systems/compound)           |
| groq/compound-mini | [Compound Mini](https://console.groq.com/docs/compound/systems/compound-mini) |

For a comparison between the `groq/compound` and `groq/compound-mini` systems and more information regarding extra capabilities, see the [Compound Systems](https://console.groq.com/docs/compound/systems#system-comparison) page.

## [Quick Start](#quick-start)

To use website visiting, simply include a URL in your request to one of the supported models. The examples below show how to access all parts of the response: the final content, reasoning process, and tool execution details.

python

```
import json
from groq import Groq

client = Groq(
    default_headers={
        "Groq-Model-Version": "latest"
    }
)

chat_completion = client.chat.completions.create(
    messages=[
        {
            "role": "user",
            "content": "Summarize the key points of this page: https://groq.com/blog/inside-the-lpu-deconstructing-groq-speed",
        }
    ],
    model="groq/compound",
)

message = chat_completion.choices[0].message

# Print the final content
print(message.content)

# Print the reasoning process
print(message.reasoning)

# Print executed tools
if message.executed_tools:
    print(message.executed_tools[0])
```

```
import { Groq } from "groq-sdk";

const groq = new Groq({
  defaultHeaders: {
    "Groq-Model-Version": "latest"
  }
});

const chatCompletion = await groq.chat.completions.create({
  messages: [
    {
      role: "user",
      content: "Summarize the key points of this page: https://groq.com/blog/inside-the-lpu-deconstructing-groq-speed",
    },
  ],
  model: "groq/compound",
});

const message = chatCompletion.choices[0].message;

// Print the final content
console.log(message.content);

// Print the reasoning process
console.log(message.reasoning);

// Print the first executed tool
console.log(message.executed_tools[0]);
```

```
curl -X POST "https://api.groq.com/openai/v1/chat/completions" \
-H "Authorization: Bearer $GROQ_API_KEY" \
-H "Content-Type: application/json" \
-H "Groq-Model-Version: latest" \
-d '{
  "messages": [
    {
      "role": "user",
      "content": "Summarize the key points of this page: https://groq.com/blog/inside-the-lpu-deconstructing-groq-speed"
    }
  ],
  "model": "groq/compound"
}'
```

_These examples show how to access the complete response structure to understand the website visiting process._

When the API is called, it will automatically detect URLs in the user's message and visit the specified website to retrieve its content. The response includes three key components:

- **Content**: The final synthesized response from the model
- **Reasoning**: The internal decision-making process showing the website visit
- **Executed Tools**: Detailed information about the website that was visited

## [How It Works](#how-it-works)

When you include a URL in your request:

1. **URL Detection**: The system automatically detects URLs in your message
2. **Website Visit**: The tool fetches the content from the specified website
3. **Content Processing**: The website content is processed and made available to the model
4. **Response Generation**: The model uses both your query and the website content to generate a comprehensive response

### [Final Output](#final-output)

This is the final response from the model, containing the analysis based on the visited website content. The model can summarize, analyze, extract specific information, or answer questions about the website's content.

message.content

**Key Take-aways from "Inside the LPU: Deconstructing Groq's Speed"**

| Area                                    | What Groq does differently                                                                                                                                    | Why it matters                                                                                                                                     |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Numerics – TruePoint**                | Uses a mixed-precision scheme that keeps 100-bit accumulation while storing weights/activations in lower-precision formats (FP8, BF16, block-floating-point). | Gives 2-4× speed-up over pure BF16 **without** the accuracy loss that typical INT8/FP8 quantization causes.                                        |
| **Memory hierarchy**                    | Hundreds of megabytes of on-chip **SRAM** act as the primary weight store, not a cache layer.                                                                 | Eliminates the 100-ns-plus latency of DRAM/HBM fetches that dominate inference workloads, enabling fast, deterministic weight access.              |
| **Execution model – static scheduling** | The compiler fully unrolls the execution graph (including inter-chip communication) down to the clock-cycle level.                                            | Removes dynamic-scheduling overhead (queues, reorder buffers, speculation) → deterministic latency, perfect for tensor-parallelism and pipelining. |
| **Parallelism strategy**                | Focuses on **tensor parallelism** (splitting a single layer across many LPUs) rather than pure data parallelism.                                              | Reduces latency for a single request; a trillion-parameter model can generate tokens in real-time.                                                 |
| **Speculative decoding**                | Runs a small "draft" model to propose tokens, then verifies a batch of those tokens on the large model using the LPU's pipeline-parallel hardware.            | Verification is no longer memory-bandwidth bound; 2-4 tokens can be accepted per pipeline stage, compounding speed gains.                          |

\[...truncated for brevity\]

**Bottom line:** Groq's LPU architecture combines precision-aware numerics, on-chip SRAM, deterministic static scheduling, aggressive tensor-parallelism, efficient speculative decoding, and a tightly synchronized inter-chip network to deliver dramatically lower inference latency without compromising model quality.

### [Reasoning and Internal Tool Calls](#reasoning-and-internal-tool-calls)

This shows the model's internal reasoning process and the website visit it executed to gather information. You can inspect this to understand how the model approached the problem and what URL it accessed. This is useful for debugging and understanding the model's decision-making process.

message.reasoning

<tool>visit(<https://groq.com/blog/inside-the-lpu-deconstructing-groq-speed>)</tool> <output>Title: groq.com URL: <https://groq.com/blog/inside-the-lpu-deconstructing-groq-speed>

URL: <https://groq.com/blog/inside-the-lpu-deconstructing-groq-speed>08/01/2025 · Andrew Ling

### [Inside the LPU: Deconstructing Groq's Speed](#inside-the-lpu-deconstructing-groqs-speed)

Moonshot's Kimi K2 recently launched in preview on GroqCloud and developers keep asking us: how is Groq running a 1-trillion-parameter model this fast?

Legacy hardware forces a choice: faster inference with quality degradation, or accurate inference with unacceptable latency. This tradeoff exists because GPU architectures optimize for training workloads. The LPU–purpose-built hardware for inference–preserves quality while eliminating architectural bottlenecks which create latency in the first place.

### [Accuracy Without Tradeoffs: TruePoint Numerics](#accuracy-without-tradeoffs-truepoint-numerics)

Traditional accelerators achieve speed through aggressive quantization, forcing models into INT8 or lower precision numerics that introduce cumulative errors throughout the computation pipeline and lead to loss of quality.

\[...truncated for brevity\]

### [The Bottom Line](#the-bottom-line)

Groq isn't tweaking around the edges. We build inference from the ground up for speed, scale, reliability and cost-efficiency. That's how we got Kimi K2 running at 40× performance in just 72 hours.</output>

### [Tool Execution Details](#tool-execution-details)

This shows the details of the website visit operation, including the type of tool executed and the content that was retrieved from the website.

message.executed_tools\[0\] (type: 'visit')

JSON

```
{
  "index": 0,
  "type": "visit",
  "arguments": "{\"url\": \"https://groq.com/blog/inside-the-lpu-deconstructing-groq-speed\"}",
  "output": "Title: groq.com
      URL: https://groq.com/blog/inside-the-lpu-deconstructing-groq-speed

      URL: https://groq.com/blog/inside-the-lpu-deconstructing-groq-speed
      08/01/2025 · Andrew Ling

      # Inside the LPU: Deconstructing Groq's Speed

      Moonshot's Kimi K2 recently launched in preview on GroqCloud and developers keep asking us: how is Groq running a 1-trillion-parameter model this fast?

      Legacy hardware forces a choice: faster inference with quality degradation, or accurate inference with unacceptable latency. This tradeoff exists because GPU architectures optimize for training workloads. The LPU–purpose-built hardware for inference–preserves quality while eliminating architectural bottlenecks which create latency in the first place.

      [...truncated for brevity - full blog post content extracted]

      ## The Bottom Line

      Groq isn't tweaking around the edges. We build inference from the ground up for speed, scale, reliability and cost-efficiency. That's how we got Kimi K2 running at 40× performance in just 72 hours.",
  "search_results": {
      "results": []
  }
}
```

## [Usage Tips](#usage-tips)

- **Single URL per Request**: Only one website will be visited per request. If multiple URLs are provided, only the first one will be processed.
- **Publicly Accessible Content**: The tool can only visit publicly accessible websites that don't require authentication.
- **Content Processing**: The tool automatically extracts the main content while filtering out navigation, ads, and other non-essential elements.
- **Real-time Access**: Each request fetches fresh content from the website at the time of the request, rendering the full page to capture dynamic content.

## [Pricing](#pricing)

Please see the [Pricing](https://groq.com/pricing) page for more information about costs.

---

description: Launch and control multiple browsers simultaneously for deeper web research and analysis using advanced browser automation capabilities.
title: Browser Automation - GroqDocs
image: https://console.groq.com/og_cloudv5.jpg

---

# Browser Automation

Some models and systems on Groq have native support for advanced browser automation, allowing them to launch and control up to 10 browsers simultaneously to gather comprehensive information from multiple sources. This powerful tool enables parallel web research, deeper analysis, and richer evidence collection.

The use of this tool with a supported model or system in GroqCloud is not a HIPAA Covered Cloud Service under Groq's Business Associate Addendum at this time. This tool is also not available currently for use with regional / sovereign endpoints.

## [Supported Models](#supported-models)

Browser automation is supported for the following models and systems (on [versions](https://console.groq.com/docs/compound#system-versioning) later than `2025-07-23`):

| Model ID           | Model                                                                         |
| ------------------ | ----------------------------------------------------------------------------- |
| groq/compound      | [Compound](https://console.groq.com/docs/compound/systems/compound)           |
| groq/compound-mini | [Compound Mini](https://console.groq.com/docs/compound/systems/compound-mini) |

For a comparison between the `groq/compound` and `groq/compound-mini` systems and more information regarding extra capabilities, see the [Compound Systems](https://console.groq.com/docs/compound/systems#system-comparison) page.

## [Quick Start](#quick-start)

To use browser automation, you must enable both `browser_automation` and `web_search` tools in your request to one of the supported models. The examples below show how to access all parts of the response: the final content, reasoning process, and tool execution details.

python

```
import json
from groq import Groq

client = Groq(
    default_headers={
        "Groq-Model-Version": "latest"
    }
)

chat_completion = client.chat.completions.create(
    messages=[
        {
            "role": "user",
            "content": "What are the latest models on Groq and what are they good at?",
        }
    ],
    model="groq/compound-mini",
    compound_custom={
        "tools": {
            "enabled_tools": ["browser_automation", "web_search"]
        }
    }
)

message = chat_completion.choices[0].message

# Print the final content
print(message.content)

# Print the reasoning process
print(message.reasoning)

# Print executed tools
if message.executed_tools:
    print(message.executed_tools[0])
```

```
import { Groq } from "groq-sdk";

const groq = new Groq({
  defaultHeaders: {
    "Groq-Model-Version": "latest"
  }
});

const chatCompletion = await groq.chat.completions.create({
  messages: [
    {
      role: "user",
      content: "What are the latest models on Groq and what are they good at?",
    },
  ],
  model: "groq/compound-mini",
  compound_custom: {
    tools: {
      enabled_tools: ["browser_automation", "web_search"]
    }
  }
});

const message = chatCompletion.choices[0].message;

// Print the final content
console.log(message.content);

// Print the reasoning process
console.log(message.reasoning);

// Print the first executed tool
console.log(message.executed_tools[0]);
```

```
curl -X POST "https://api.groq.com/openai/v1/chat/completions" \
-H "Authorization: Bearer $GROQ_API_KEY" \
-H "Content-Type: application/json" \
-H "Groq-Model-Version: latest" \
-d '{
  "messages": [
    {
      "role": "user",
      "content": "What are the latest models on Groq and what are they good at?"
    }
  ],
  "model": "groq/compound-mini",
  "compound_custom": {
    "tools": {
      "enabled_tools": ["browser_automation", "web_search"]
    }
  }
}'
```

_These examples show how to enable browser automation to get deeper search results through parallel browser control._

When the API is called with browser automation enabled, it will launch multiple browsers to gather comprehensive information. The response includes three key components:

- **Content**: The final synthesized response from the model based on all browser sessions
- **Reasoning**: The internal decision-making process showing browser automation steps
- **Executed Tools**: Detailed information about the browser automation sessions and web searches

## [How It Works](#how-it-works)

When you enable browser automation:

1. **Tool Activation**: Both `browser_automation` and `web_search` tools are enabled in your request. Browser automation will not work without both tools enabled.
2. **Parallel Browser Launch**: Up to 10 browsers are launched simultaneously to search different sources
3. **Deep Content Analysis**: Each browser navigates and extracts relevant information from multiple pages
4. **Evidence Aggregation**: Information from all browser sessions is combined and analyzed
5. **Response Generation**: The model synthesizes findings from all sources into a comprehensive response

### [Final Output](#final-output)

This is the final response from the model, containing analysis based on information gathered from multiple browser automation sessions. The model can provide comprehensive insights, multi-source comparisons, and detailed analysis based on extensive web research.

message.content

**The newest models Groq is offering (as of the latest public announcement)**

| Model (available on GroqCloud) | Size                   | Typical Strengths / What It’s Good At                                                                                                                                                                                                                                                                                                                         |
| ------------------------------ | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **openai/gpt‑oss‑120B**        | 120 billion parameters | • Very strong at complex, multi‑step reasoning and long‑form generation (e.g., detailed essays, technical documentation, code synthesis). <br>• Handles nuanced language, maintains context over very long prompts (Groq supports up to 128 K tokens). <br>• Best for high‑value, low‑latency use‑cases where quality outweighs cost.                         |
| **openai/gpt‑oss‑20B**         | 20 billion parameters  | • Fast, cost‑effective LLM for a wide range of general‑purpose tasks (chat, summarization, classification, simple code generation). <br>• Good balance of speed and capability; ideal for production workloads that need high throughput. <br>• Works well when you don’t need the full power of the 120B model but still want strong language understanding. |

### [Why these models matter on Groq](#why-these-models-matter-on-groq)

- **Speed & Scale** – Groq’s custom LPU hardware delivers “day‑zero” inference at very low latency, so even the 120 B model can be served in near‑real‑time for interactive apps.
- **Extended Context** – Both models can be run with up to **128 K token context length**, enabling very long documents, codebases, or conversation histories to be processed in a single request.
- **Built‑in Tools** – GroqCloud adds **code execution** and **browser search** as first‑class capabilities, letting you augment the LLM’s output with live code runs or up‑to‑date web information without leaving the platform.
- **Pricing** – Groq’s pricing (e.g., $0.15 / M input tokens and $0.75 / M output tokens for the 120 B model) is positioned to be competitive for high‑throughput production workloads.

### [Quick “what‑to‑use‑when” guide](#quick-whattousewhen-guide)

| Use‑case                                                                             | Recommended Model                                       |
| ------------------------------------------------------------------------------------ | ------------------------------------------------------- |
| **Deep research, long‑form writing, complex code generation**                        | gpt‑oss‑120B                                            |
| **Chatbots, summarization, classification, moderate‑size generation**                | gpt‑oss‑20B                                             |
| **High‑throughput, cost‑sensitive inference (e.g., batch processing, real‑time UI)** | gpt‑oss‑20B (or a smaller custom model if you have one) |
| **Any task that benefits from > 8 K token context**                                  | Either model, thanks to Groq’s 128 K token support      |

In short, Groq’s latest offerings are the **OpenAI open‑source models**—`gpt‑oss‑120B` and `gpt‑oss‑20B`—delivered on Groq’s ultra‑fast inference hardware, with extended context and integrated tooling that make them well‑suited for everything from heavyweight reasoning to high‑volume production AI.

### [Reasoning and Internal Tool Calls](#reasoning-and-internal-tool-calls)

This shows the model's internal reasoning process and the browser automation sessions it executed to gather information. You can inspect this to understand how the model approached the problem, which browsers it launched, and what sources it accessed. This is useful for debugging and understanding the model's research methodology.

message.reasoning

<tool></tool> <output>Page content analyzed: Found matches for 'groq': 【0†match at L2】 08/05/2025 · Groq

Day Zero Support for OpenAI Open Models

【1†match at L8】 We're excited to announce that GroqCloud now supports the much anticipated OpenAI open models,[openai/gpt-oss-120B](https://console.groq.com/playground?model=openai/gpt-oss-120b)

【2†match at L12】[openai/gpt-oss-20B](https://console.groq.com/playground?model=openai/gpt-oss-20b)! This launch brings day-zero support for the latest open models, empowering developers worldwide to build innovative AI applications with unprecedented

【3†match at L20】 execution and browser search are essential. Groq's platform delivers these capabilities from day zero, with full support for 128K token context length and built-in tools such as \[code

【4†match at L23】 execution\](https://console.groq.com/docs/%3Chttps://console.groq.com/docs/code-execution%3E) and [browser search](https://console.groq.com/docs/browser-search). This enables developers to build complex workflows, provide accurate and relevant information, and leverage \[...truncated\]

### [Tool Execution Details](#tool-execution-details)

This shows the details of the browser automation operations, including the type of tools executed, browser sessions launched, and the content that was retrieved from multiple sources simultaneously.

message.executed_tools\[0\] (type: 'browser_automation')

JSON

```
{
  "index": 2,
  "type": "browser_automation",
  "arguments": "",
  "output": "Page content analyzed: Found matches for 'groq':
# 【0†match at L2】
[Groq Cloud](https://console.groq.com/)

[](/)

# 【1†match at L12】
Join 2M+ developers building on GroqCloud™

We deliver inference with unmatched speed and cost, so you can ship fast.

# 【2†match at L26】
that I have read the [Privacy Policy](https://groq.com/privacy-policy).

The Models

Found matches for 'models':
# 【0†match at L28】
The Models

[![OpenAI](https://console.groq.com/_next/static/media/openailogo.523c87a0.svg) OpenAI GPT-OSS (20B &

# 【1†match at L31】
120B) models now available for instant inference. These models have built-in
browser search and code execution capabilities. Learn about
GPT-OSS](/docs/models#featured-models)

# 【2†match at L151】
We're adding new models all the time and will let you know when a new one comes
online.
See full details on our [Models page.](https://console.groq.com/docs/models)",
  "search_results": {
      "results": []
  }
}
```

## [Pricing](#pricing)

Please see the [Pricing](https://groq.com/pricing) page for more information about costs.

## [Provider Information](#provider-information)

Browser automation functionality is powered by [Anchor Browser](https://anchorbrowser.io/), a browser automation platform built for AI agents.

---

description: Perform calculations, run Python code snippets, and solve computational problems automatically in a secure sandboxed environment.
title: Code Execution - GroqDocs
image: https://console.groq.com/og_cloudv5.jpg

---

# Code Execution

Some models and systems on Groq have native support for automatic code execution, allowing them to perform calculations, run code snippets, and solve computational problems in real-time.

Only Python is currently supported for code execution.

The use of this tool with a supported model or system in GroqCloud is not a HIPAA Covered Cloud Service under Groq's Business Associate Addendum at this time. This tool is also not available currently for use with regional / sovereign endpoints.

## [Supported Models and Systems](#supported-models-and-systems)

Built-in code execution is supported for the following models and systems:

| Model ID            | Model                                                                          |
| ------------------- | ------------------------------------------------------------------------------ |
| openai/gpt-oss-20b  | [OpenAI GPT-OSS 20B](https://console.groq.com/docs/model/openai/gpt-oss-20b)   |
| openai/gpt-oss-120b | [OpenAI GPT-OSS 120B](https://console.groq.com/docs/model/openai/gpt-oss-120b) |
| groq/compound       | [Compound](https://console.groq.com/docs/compound/systems/compound)            |
| groq/compound-mini  | [Compound Mini](https://console.groq.com/docs/compound/systems/compound-mini)  |

For a comparison between the `groq/compound` and `groq/compound-mini` systems and more information regarding additional capabilities, see the [Compound Systems](https://console.groq.com/docs/compound/systems#system-comparison) page.

## [Quick Start (Compound)](#quick-start-compound)

To use code execution with [Groq's Compound systems](https://console.groq.com/docs/compound), change the `model` parameter to one of the supported models or systems.

python

```
import os
from groq import Groq

client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

response = client.chat.completions.create(
    messages=[
        {
            "role": "user",
            "content": "Calculate the square root of 101 and show me the Python code you used",
        }
    ],
    model="groq/compound-mini",
)

# Final output
print(response.choices[0].message.content)

# Reasoning + internal tool calls
print(response.choices[0].message.reasoning)

# Code execution tool call
if response.choices[0].message.executed_tools:
    print(response.choices[0].message.executed_tools[0])
```

```
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const response = await groq.chat.completions.create({
  messages: [
    {
      role: "user",
      content: "Calculate the square root of 101 and show me the Python code you used",
    },
  ],
  model: "groq/compound-mini",
});

// Final output
console.log(response.choices[0].message.content);

// Reasoning + internal tool calls
console.log(response.choices[0].message.reasoning);

// Code execution tool call
console.log(response.choices[0].message.executed_tools?.[0]);
```

```
curl -X POST https://api.groq.com/openai/v1/chat/completions \
  -H "Authorization: Bearer $GROQ_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "groq/compound-mini",
    "messages": [
      {
        "role": "user",
        "content": "Calculate the square root of 101 and show me the Python code you used"
      }
    ]
  }'
```

_And that's it!_

When the API is called, it will intelligently decide when to use code execution to best answer the user's query. Code execution is performed on the server side in a secure sandboxed environment, so no additional setup is required on your part.

### [Final Output](#final-output)

This is the final response from the model, containing the answer based on code execution results. The model combines computational results with explanatory text to provide a comprehensive response. Use this as the primary output for user-facing applications.

message.content

The square root of 101 is: 10.04987562112089

Here is the Python code I used:

python

```
import math
print("The square root of 101 is: ")
print(math.sqrt(101))
```

### [Reasoning and Internal Tool Calls](#reasoning-and-internal-tool-calls)

This shows the model's internal reasoning process and the Python code it executed to solve the problem. You can inspect this to understand how the model approached the computational task and what code it generated. This is useful for debugging and understanding the model's decision-making process.

message.reasoning

<tool>python(import math; print("The square root of 101 is: "); print(math.sqrt(101)))</tool> <output>The square root of 101 is: 10.04987562112089</output>

### [Executed Tools Information](#executed-tools-information)

This contains the raw executed tools data, including the generated Python code, execution output, and metadata. You can use this to access the exact code that was run and its results programmatically.

message.executed_tools\[0\]

JSON

```
{
  "string": "",
  "name": "",
  "index": 0,
  "type": "python",
  "arguments": "{\"code\": \"import math; print(\"The square root of 101 is: \"); print(math.sqrt(101))\"}",
  "output": "The square root of 101 is: \n10.04987562112089\n",
  "search_results": { "results": [] }
}
```

## [Quick Start (GPT-OSS)](#quick-start-gptoss)

To use code execution with OpenAI's GPT-OSS models on Groq ([20B](https://console.groq.com/docs/model/openai/gpt-oss-20b) & [120B](https://console.groq.com/docs/model/openai/gpt-oss-120b)), add the `code_interpreter` tool to your request.

python

```
from groq import Groq

client = Groq(api_key="your-api-key-here")

response = client.chat.completions.create(
    messages=[
        {
            "role": "user",
            "content": "Calculate the square root of 12345. Output only the final answer.",
        }
    ],
    model="openai/gpt-oss-20b",  # or "openai/gpt-oss-120b"
    tool_choice="required",
    tools=[
        {
            "type": "code_interpreter"
        }
    ],
)

# Final output
print(response.choices[0].message.content)

# Reasoning + internal tool calls
print(response.choices[0].message.reasoning)

# Code execution tool call
print(response.choices[0].message.executed_tools[0])
```

```
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const response = await groq.chat.completions.create({
  messages: [
    {
      role: "user",
      content: "Calculate the square root of 12345. Output only the final answer.",
    },
  ],
  model: "openai/gpt-oss-20b", // or "openai/gpt-oss-120b"
  tool_choice: "required",
  tools: [
    {
      type: "code_interpreter"
    },
  ],
});

// Final output
console.log(response.choices[0].message.content);

// Reasoning + internal tool calls
console.log(response.choices[0].message.reasoning);

// Code execution tool call
console.log(response.choices[0].message.executed_tools?.[0]);
```

```
curl -X POST "https://api.groq.com/openai/v1/chat/completions" \
  -H "Authorization: Bearer $GROQ_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {
        "role": "user",
        "content": "Calculate the square root of 12345. Output only the final answer."
      }
    ],
    "model": "openai/gpt-oss-20b",
    "tool_choice": "required",
    "tools": [
      {
        "type": "code_interpreter"
      }
    ]
  }'
```

When the API is called, it will use code execution to best answer the user's query. Code execution is performed on the server side in a secure sandboxed environment, so no additional setup is required on your part.

### [Final Output](#final-output)

This is the final response from the model, containing the answer based on code execution results. The model combines computational results with explanatory text to provide a comprehensive response.

message.content

111.1080555135405112450044

### [Reasoning and Internal Tool Calls](#reasoning-and-internal-tool-calls)

This shows the model's internal reasoning process and the Python code it executed to solve the problem. You can inspect this to understand how the model approached the computational task and what code it generated.

message.reasoning

We need sqrt(12345). Compute.math.sqrt returns 111.1080555... Let's compute with precision.Let's get more precise.We didn't get output because decimal sqrt needs context. Let's compute.It didn't output because .sqrt() might not be available for Decimal? Actually Decimal has sqrt method? There is sqrt in Decimal from Python 3.11? Actually it's decimal.Decimal.sqrt() available. But maybe need import Decimal. Let's try.It outputs nothing? Actually maybe need to print.

### [Executed Tools Information](#executed-tools-information)

This contains the raw executed tools data, including the generated Python code, execution output, and metadata. You can use this to access the exact code that was run and its results programmatically.

message.executed_tools\[0\]

JSON

```
{
  name: 'python',
  index: 0,
  type: 'function',
  arguments: 'import math\nmath.sqrt(12345)\n',
  search_results: { results: null },
  code_results: [ { text: '111.1080555135405' } ]
}
```

## [How It Works](#how-it-works)

When you make a request to a model or system that supports code execution, it:

1. **Analyzes your query** to determine if code execution would be helpful (for compound systems or when tool choice is not set to `required`)
2. **Generates Python code** to solve the problem or answer the question
3. **Executes the code** in a secure sandboxed environment powered by [E2B](https://e2b.dev/)
4. **Returns the results** along with the code that was executed

## [Use Cases (Compound)](#use-cases-compound)

### [Mathematical Calculations](#mathematical-calculations)

Ask the model to perform complex calculations, and it will automatically execute Python code to compute the result.

python

```
import os
from groq import Groq

client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

chat_completion = client.chat.completions.create(
    messages=[
        {
            "role": "user",
            "content": "Calculate the monthly payment for a $30,000 loan over 5 years at 6% annual interest rate using the standard loan payment formula. Use python code.",
        }
    ],
    model="groq/compound-mini",
)

print(chat_completion.choices[0].message.content)
```

```
import Groq from "groq-sdk";

const groq = new Groq();

const chatCompletion = await groq.chat.completions.create({
  messages: [
    {
      role: "user",
      content: "Calculate the monthly payment for a $30,000 loan over 5 years at 6% annual interest rate using the standard loan payment formula. Use python code.",
    },
  ],
  model: "groq/compound-mini",
});

console.log(chatCompletion.choices[0]?.message?.content || "");
```

```
curl -X POST https://api.groq.com/openai/v1/chat/completions \
  -H "Authorization: Bearer $GROQ_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "groq/compound-mini",
    "messages": [
      {
        "role": "user",
        "content": "Calculate the monthly payment for a $30,000 loan over 5 years at 6% annual interest rate using the standard loan payment formula. Use python code."
      }
    ]
  }'
```

### [Code Debugging and Testing](#code-debugging-and-testing)

Provide code snippets to check for errors or understand their behavior. The model can execute the code to verify functionality.

python

```
import os
from groq import Groq

client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

chat_completion = client.chat.completions.create(
    messages=[
        {
            "role": "user",
            "content": "Will this Python code raise an error? `import numpy as np; a = np.array([1, 2]); b = np.array([3, 4, 5]); print(a + b)`",
        }
    ],
    model="groq/compound-mini",
)

print(chat_completion.choices[0].message.content)
```

```
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const chatCompletion = await groq.chat.completions.create({
  messages: [
    {
      role: "user",
      content: "Will this Python code raise an error? `import numpy as np; a = np.array([1, 2]); b = np.array([3, 4, 5]); print(a + b)`",
    },
  ],
  model: "groq/compound-mini",
});

console.log(chatCompletion.choices[0]?.message?.content || "");
```

```
curl -X POST https://api.groq.com/openai/v1/chat/completions \
  -H "Authorization: Bearer $GROQ_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "groq/compound-mini",
    "messages": [
      {
        "role": "user",
        "content": "Will this Python code raise an error? `import numpy as np; a = np.array([1, 2]); b = np.array([3, 4, 5]); print(a + b)`"
      }
    ]
  }'
```

## [Security and Limitations](#security-and-limitations)

- Code execution runs in a **secure sandboxed environment** with no access to external networks or sensitive data
- Only **Python** is currently supported for code execution
- The execution environment is **ephemeral** \- each request runs in a fresh, isolated environment
- Code execution has reasonable **timeout limits** to prevent infinite loops
- No persistent storage between requests

## [Pricing](#pricing)

Please see the [Pricing](https://groq.com/pricing) page for more information.

## [Provider Information](#provider-information)

Code execution functionality is powered by Foundry Labs ([E2B](https://e2b.dev/)), a secure cloud environment for AI code execution. E2B provides isolated, ephemeral sandboxes that allow models to run code safely without access to external networks or sensitive data.

---

description: Invoke Wolfram&#x27;s computational knowledge engine to solve math, scientific, and engineering problems that require precise computation.
title: Wolfram‑Alpha Integration - GroqDocs
image: https://console.groq.com/og_cloudv5.jpg

---

# Wolfram‑Alpha Integration

Some models and systems on Groq have native support for Wolfram‑Alpha integration, allowing them to access Wolfram's computational knowledge engine for mathematical, scientific, and engineering computations. This tool enables models to solve complex problems that require precise calculation and access to structured knowledge.

The use of this tool with a supported model or system in GroqCloud is not a HIPAA Covered Cloud Service under Groq's Business Associate Addendum at this time. This tool is also not available currently for use with regional / sovereign endpoints.

## [Supported Models](#supported-models)

Wolfram‑Alpha integration is supported for the following models and systems (on [versions](https://console.groq.com/docs/compound#system-versioning) later than `2025-07-23`):

| Model ID           | Model                                                                         |
| ------------------ | ----------------------------------------------------------------------------- |
| groq/compound      | [Compound](https://console.groq.com/docs/compound/systems/compound)           |
| groq/compound-mini | [Compound Mini](https://console.groq.com/docs/compound/systems/compound-mini) |

For a comparison between the `groq/compound` and `groq/compound-mini` systems and more information regarding extra capabilities, see the [Compound Systems](https://console.groq.com/docs/compound/systems#system-comparison) page.

## [Quick Start](#quick-start)

To use Wolfram‑Alpha integration, you must provide your own [Wolfram‑Alpha API key](#getting-your-wolframalpha-api-key) in the `wolfram_settings` configuration. The examples below show how to access all parts of the response: the final content, reasoning process, and tool execution details.

python

```
import json
from groq import Groq

client = Groq(
    default_headers={
        "Groq-Model-Version": "latest"
    }
)

chat_completion = client.chat.completions.create(
    messages=[
        {
            "role": "user",
            "content": "What is 1293392*29393?",
        }
    ],
    model="groq/compound",
    compound_custom={
        "tools": {
            "enabled_tools": ["wolfram_alpha"],
            "wolfram_settings": {"authorization": "your_wolfram_alpha_api_key_here"}
        }
    }
)

message = chat_completion.choices[0].message

# Print the final content
print(message.content)

# Print the reasoning process
print(message.reasoning)

# Print executed tools
if message.executed_tools:
    print(message.executed_tools[0])
```

```
import { Groq } from "groq-sdk";

const groq = new Groq({
  defaultHeaders: {
    "Groq-Model-Version": "latest"
  }
});

const chatCompletion = await groq.chat.completions.create({
  messages: [
    {
      role: "user",
      content: "What is 1293392*29393?",
    },
  ],
  model: "groq/compound",
  compound_custom: {
    tools: {
      enabled_tools: ["wolfram_alpha"],
      wolfram_settings: { authorization: "your_wolfram_alpha_api_key_here" }
    }
  }
});

const message = chatCompletion.choices[0].message;

// Print the final content
console.log(message.content);

// Print the reasoning process
console.log(message.reasoning);

// Print the first executed tool
console.log(message.executed_tools[0]);
```

```
curl -X POST "https://api.groq.com/openai/v1/chat/completions" \
-H "Authorization: Bearer $GROQ_API_KEY" \
-H "Content-Type: application/json" \
-H "Groq-Model-Version: latest" \
-d '{
  "messages": [
    {
      "role": "user",
      "content": "What is 1293392*29393?"
    }
  ],
  "model": "groq/compound",
  "compound_custom": {
    "tools": {
      "enabled_tools": ["wolfram_alpha"],
      "wolfram_settings": {"authorization": "your_wolfram_alpha_api_key_here"}
    }
  }
}'
```

_These examples show how to access the complete response structure to understand the Wolfram‑Alpha computation process._

When the API is called with a mathematical or scientific query, it will automatically use Wolfram‑Alpha to compute precise results. The response includes three key components:

- **Content**: The final synthesized response from the model with computational results
- **Reasoning**: The internal decision-making process showing the Wolfram‑Alpha query
- **Executed Tools**: Detailed information about the computation that was performed

## [How It Works](#how-it-works)

When you ask a computational question:

1. **Query Analysis**: The system analyzes your question to determine if Wolfram‑Alpha computation is needed
2. **Wolfram‑Alpha Query**: The tool sends a structured query to Wolfram‑Alpha's computational engine
3. **Result Processing**: The computational results are processed and made available to the model
4. **Response Generation**: The model uses both your query and the computational results to generate a comprehensive response

### [Final Output](#final-output)

This is the final response from the model, containing the computational results and analysis. The model can provide step-by-step solutions, explanations, and contextual information about the mathematical or scientific computation.

message.content

**Multiplication**

To find (1293392 \\times 29393) we simply multiply the two integers.

Using a reliable computational tool (Wolfram|Alpha) gives:

\[ 1293392 \\times 29393 = 38{,}016{,}671{,}056 \]

**Result**

\[ \\boxed{38{,}016{,}671{,}056} \]

_Additional details from the computation_

- Scientific notation: (3.8016671056 \\times 10^{10})
- Number name: **38 billion 16 million 671 thousand 56**
- The result has 11 decimal digits.

Thus, the product of 1,293,392 and 29,393 is **38,016,671,056**.

### [Reasoning and Internal Tool Calls](#reasoning-and-internal-tool-calls)

This shows the model's internal reasoning process and the Wolfram‑Alpha computation it executed to solve the problem. You can inspect this to understand how the model approached the problem and what specific query it sent to Wolfram‑Alpha.

message.reasoning

To solve this problem, I will multiply 1293392 by 29393.

<tool> wolfram(1293392\*29393) </tool> <output>Query: "1293392\*29393"

Input: 1293392×29393

Result: 38016671056

Scientific notation: 3.8016671056 × 10^10

Number line: image: <https://public6.wolframalpha.com/files/PNG%5F9r6zdhh0lo.png>Wolfram Language code: NumberLinePlot\[38016671056\]

Number name: 38 billion 16 million 671 thousand 56

Number length: 11 decimal digits

Comparisons: ≈ 0.13 × the number of stars in our galaxy (≈ 3×10^11)

≈ 0.35 × the number of people who have ever lived (≈ 1.1×10^11)

≈ 4.8 × the number of people alive today (≈ 7.8×10^9)

Wolfram|Alpha website result for "1293392_29393":<https://www.wolframalpha.com/input?i=1293392%2A29393></output>Based on these results, I can see that 1293392_29393 equals 38016671056.

The final answer is 38016671056.

### [Tool Execution Details](#tool-execution-details)

This shows the details of the Wolfram‑Alpha computation, including the type of tool executed, the query that was sent, and the computational results that were retrieved.

message.executed_tools\[0\] (type: 'wolfram')

JSON

```
{
  "index": 0,
  "type": "wolfram",
  "arguments": "{\"query\": \"1293392*29393\"}",
  "output": "Query:\n\"1293392*29393\"\n\nInput:\n1293392×29393\n\nResult:\n38016671056\n\nScientific notation:\n3.8016671056 × 10^10\n\nNumber line:\nimage: https://public6.wolframalpha.com/files/PNG_9r6zdhh0lo.png\nWolfram Language code: NumberLinePlot[38016671056]\n\nNumber name:\n38 billion 16 million 671 thousand 56\n\nNumber length:\n11 decimal digits\n\nComparisons:\n≈ 0.13 × the number of stars in our galaxy (≈ 3×10^11)\n\n≈ 0.35 × the number of people who have ever lived (≈ 1.1×10^11)\n\n≈ 4.8 × the number of people alive today (≈ 7.8×10^9)\n\nWolfram|Alpha website result for \"1293392*29393\":\nhttps://www.wolframalpha.com/input?i=1293392%2A29393",
  "search_results": {
      "results": []
  }
}
```

## [Usage Tips](#usage-tips)

- **API Key Required**: You must provide your own Wolfram‑Alpha API key in the `wolfram_settings.authorization` field to use this feature.
- **Mathematical Queries**: Best suited for mathematical computations, scientific calculations, unit conversions, and factual queries.
- **Structured Data**: Wolfram‑Alpha returns structured computational results that the model can interpret and explain.
- **Complex Problems**: Ideal for problems requiring precise computation that go beyond basic arithmetic.

## [Getting Your Wolfram‑Alpha API Key](#getting-your-wolframalpha-api-key)

To use this integration:

1. Visit [Wolfram‑Alpha API](https://products.wolframalpha.com/api/)
2. Sign up for an account and choose an appropriate plan
3. Generate an API key from your account dashboard
4. Use the API key in the `wolfram_settings.authorization` field in your requests

## [Pricing](#pricing)

Groq does not charge for the use of the Wolfram‑Alpha built-in tool. However, you will be charged separately by Wolfram Research for API usage according to your Wolfram‑Alpha API plan.

## [Provider Information](#provider-information)

Wolfram Alpha functionality is powered by [Wolfram Research](https://wolframalpha.com/), a computational knowledge engine.

---

description: Learn how to use Groq&#x27;s compound AI systems for real-time web search, code execution, and advanced AI workflows.
title: Overview - GroqDocs
image: https://console.groq.com/og_cloudv5.jpg

---

# Compound

While LLMs excel at generating text, Groq's Compound systems take the next step. Compound is an advanced AI system that is designed to solve problems by taking action and intelligently uses external tools, such as web search and code execution, alongside the powerful [GPT-OSS 120B](https://console.groq.com/docs/model/openai/gpt-oss-120b), [Llama 4 Scout](https://console.groq.com/docs/model/meta-llama/llama-4-scout-17b-16e-instruct), and [Llama 3.3 70B](https://console.groq.com/docs/model/llama-3.3-70b-versatile) models. This allows it access to real-time information and interaction with external environments, providing more accurate, up-to-date, and capable responses than an LLM alone.

Groq's compound AI system should not be used by customers for processing protected health information as it is not a HIPAA Covered Cloud Service under Groq's Business Associate Addendum at this time. This system is also not available currently for use with regional / sovereign endpoints.

## [Available Compound Systems](#available-compound-systems)

There are two compound systems available:

- [groq/compound](https://console.groq.com/docs/compound/systems/compound): supports multiple tool calls per request. This system is great for use cases that require multiple web searches or code executions per request.
- [groq/compound-mini](https://console.groq.com/docs/compound/systems/compound-mini): supports a single tool call per request. This system is great for use cases that require a single web search or code execution per request. `groq/compound-mini` has an average of 3x lower latency than `groq/compound`.

Both systems support the following tools:

- [Web Search](https://console.groq.com/docs/web-search)
- [Visit Website](https://console.groq.com/docs/visit-website)
- [Code Execution](https://console.groq.com/docs/code-execution)
- [Browser Automation](https://console.groq.com/docs/browser-automation)
- [Wolfram Alpha](https://console.groq.com/docs/wolfram-alpha)

Custom [user-provided tools](https://console.groq.com/docs/tool-use) are not supported at this time.

## [Quickstart](#quickstart)

To use compound systems, change the `model` parameter to either `groq/compound` or `groq/compound-mini`:

Python

```
from groq import Groq

client = Groq()

completion = client.chat.completions.create(
    messages=[
        {
            "role": "user",
            "content": "What is the current weather in Tokyo?",
        }
    ],
    # Change model to compound to use built-in tools
    # model: "llama-3.3-70b-versatile",
    model="groq/compound",
)

print(completion.choices[0].message.content)
# Print all tool calls
# print(completion.choices[0].message.executed_tools)
```

```
import Groq from "groq-sdk";

const groq = new Groq();

export async function main() {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: "What is the current weather in Tokyo?",
        },
      ],
      // Change model to compound to use built-in tools
      // model: "llama-3.3-70b-versatile",
      model: "groq/compound",
    });

    console.log(completion.choices[0]?.message?.content || "");
    // Print all tool calls
    // console.log(completion.choices[0]?.message?.executed_tools || "");
}

main();
```

```
curl https://api.groq.com/openai/v1/chat/completions -s \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $GROQ_API_KEY" \
    -d '{
    "model": "groq/compound",
    "messages": [{
        "role": "user",
        "content": "What is the current weather in Tokyo?"
    }]
}'
```

And that's it!

When the API is called, it will intelligently decide when to use search or code execution to best answer the user's query. These tool calls are performed on the server side, so no additional setup is required on your part to use built-in tools.

In the above example, the API will use its build in web search tool to find the current weather in Tokyo. If you didn't use compound systems, you might have needed to add your own custom tools to make API requests to a weather service, then perform multiple API calls to Groq to get a final result. Instead, with compound systems, you can get a final result with a single API call.

## [Executed Tools](#executed-tools)

To view the tools (search or code execution) used automatically by the compound system, check the `executed_tools` field in the response:

Python

```
import os
from groq import Groq

client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

response = client.chat.completions.create(
    model="groq/compound",
    messages=[
        {"role": "user", "content": "What did Groq release last week?"}
    ]
)
# Log the tools that were used to generate the response
print(response.choices[0].message.executed_tools)
```

```
import Groq from 'groq-sdk';

const groq = new Groq();

async function main() {
  const response = await groq.chat.completions.create({
    model: 'groq/compound',
    messages: [
      {
        role: 'user',
        content: 'What did Groq release last week?'
      }
    ]
  })
  // Log the tools that were used to generate the response
  console.log(response.choices[0].message.executed_tools)
}
main();
```

```
curl https://api.groq.com/openai/v1/chat/completions -s \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $GROQ_API_KEY" \
    -d '{
    "model": "groq/compound",
    "messages": [{
        "role": "user",
        "content": "What did Groq release last week?"
    }]
}'
```

## [Model Usage Details](#model-usage-details)

The `usage_breakdown` field in responses provides detailed information about all the underlying models used during the compound system's execution.

JSON

```
"usage_breakdown": {
  "models": [
    {
      "model": "llama-3.3-70b-versatile",
      "usage": {
        "queue_time": 0.017298032,
        "prompt_tokens": 226,
        "prompt_time": 0.023959775,
        "completion_tokens": 16,
        "completion_time": 0.061639794,
        "total_tokens": 242,
        "total_time": 0.085599569
      }
    },
    {
      "model": "openai/gpt-oss-120b",
      "usage": {
        "queue_time": 0.019125835,
        "prompt_tokens": 903,
        "prompt_time": 0.033082052,
        "completion_tokens": 873,
        "completion_time": 1.776467372,
        "total_tokens": 1776,
        "total_time": 1.809549424
      }
    }
  ]
}
```

## [System Versioning](#system-versioning)

Compound systems support versioning through the `Groq-Model-Version` header. In most cases, you won't need to change anything since you'll automatically be on the latest stable version. To view the latest changes to the compound systems, see the [Compound Changelog](https://console.groq.com/docs/changelog/compound).

### [Available Systems and Versions](#available-systems-and-versions)

| System                                                                             | Default Version(no header) | Latest Version(Groq-Model-Version: latest) | Previous Versions |
| ---------------------------------------------------------------------------------- | -------------------------- | ------------------------------------------ | ----------------- |
| [groq/compound](https://console.groq.com/docs/compound/systems/compound)           | 2025-08-16 (stable)        | 2025-08-16 (latest)                        | 2025-07-23        |
| [groq/compound-mini](https://console.groq.com/docs/compound/systems/compound-mini) | 2025-08-16 (stable)        | 2025-08-16 (latest)                        | 2025-07-23        |

### [Version Details](#version-details)

- **Default (no header)**: Uses version `2025-08-16`, the most recent stable version that has been fully tested and deployed
- **Latest** (`Groq-Model-Version: latest`): Uses version `2025-08-16`, the prerelease version with the newest features before they're rolled out to everyone

To use a specific version, pass the version in the `Groq-Model-Version` header:

curl

```
curl -X POST "https://api.groq.com/openai/v1/chat/completions" \
  -H "Authorization: Bearer $GROQ_API_KEY" \
  -H "Content-Type: application/json" \
  -H "Groq-Model-Version: latest" \
  -d '{
    "model": "groq/compound",
    "messages": [{"role": "user", "content": "What is the weather today?"}]
  }'
```

```
from groq import Groq

client = Groq(
    default_headers={
        "Groq-Model-Version": "latest"
    }
)

chat_completion = client.chat.completions.create(
    messages=[
        {
            "role": "user",
            "content": "What is the weather today?",
        }
    ],
    model="groq/compound",
)

print(chat_completion.choices[0].message.content)
```

```
import { Groq } from "groq-sdk";

const groq = new Groq({
  defaultHeaders: {
    "Groq-Model-Version": "latest"
  }
});

const chatCompletion = await groq.chat.completions.create({
  messages: [
    {
      role: "user",
      content: "What is the weather today?",
    },
  ],
  model: "groq/compound",
});

console.log(chatCompletion.choices[0].message.content);
```

## [What's Next?](#whats-next)

Now that you understand the basics of compound systems, explore these topics:

- **[Systems](https://console.groq.com/docs/compound/systems)** \- Learn about the two compound systems and when to use each one
- **[Built-in Tools](https://console.groq.com/docs/compound/built-in-tools)** \- Learn about the built-in tools available in Groq's Compound systems
- **[Search Settings](https://console.groq.com/docs/web-search#search-settings)** \- Customize web search behavior with domain filtering
- **[Use Cases](https://console.groq.com/docs/compound/use-cases)** \- Explore practical applications and detailed examples

---

description: Overview of Compound and Mini AI systems - their capabilities, differences, and use cases.
title: Systems - GroqDocs
image: https://console.groq.com/og_cloudv5.jpg

---

# Systems

Groq offers two compound AI systems that intelligently use external tools to provide more accurate, up-to-date, and capable responses than traditional LLMs alone. Both systems support web search and code execution, but differ in their approach to tool usage.

- **[Compound](https://console.groq.com/docs/compound/systems/compound)** (`groq/compound`) - Full-featured system with up to 10 tool calls per request
- **[Compound Mini](https://console.groq.com/docs/compound/systems/compound-mini)** (`groq/compound-mini`) - Streamlined system with up to 1 tool call and average 3x lower latency

Groq's compound AI systems should not be used by customers for processing protected health information as it is not a HIPAA Covered Cloud Service under Groq's Business Associate Addendum at this time.

## [Getting Started](#getting-started)

[CompoundLearn about the full-featured system with up to 10 tool calls per request](https://console.groq.com/docs/compound/systems/compound)[Compound MiniDiscover the fast, single-tool-call system with average 3x lower latency](https://console.groq.com/docs/compound/systems/compound-mini)

Both systems use the same API interface - simply change the `model` parameter to `groq/compound` or `groq/compound-mini` to get started.

## [System Comparison](#system-comparison)

| Feature                    | Compound                 | Compound Mini             |
| -------------------------- | ------------------------ | ------------------------- |
| **Tool Calls per Request** | Up to 10                 | Up to 1                   |
| **Average Latency**        | Standard                 | 3x Lower                  |
| **Token Speed**            | \~350 tps                | \~350 tps                 |
| **Best For**               | Complex multi-step tasks | Quick single-step queries |

## [Key Differences](#key-differences)

### [Compound](#compound)

- **Multiple Tool Calls**: Can perform up to **10 server-side tool calls** before returning an answer
- **Complex Workflows**: Ideal for tasks requiring multiple searches, code executions, or iterative problem-solving
- **Comprehensive Analysis**: Can gather information from multiple sources and perform multi-step reasoning
- **Use Cases**: Research tasks, complex data analysis, multi-part coding challenges

### [Compound Mini](#compound-mini)

- **Single Tool Call**: Performs up to **1 server-side tool call** before returning an answer
- **Fast Response**: Average 3x lower latency compared to Compound
- **Direct Answers**: Perfect for straightforward queries that need one piece of current information
- **Use Cases**: Quick fact-checking, single calculations, simple web searches

## [Available Tools](#available-tools)

Both systems support the same set of tools:

- **Web Search** \- Access real-time information from the web
- **Code Execution** \- Execute Python code automatically
- **Visit Website** \- Access and analyze specific website content
- **Browser Automation** \- Interact with web pages through automated browser actions
- **Wolfram Alpha** \- Access computational knowledge and mathematical calculations

For more information about tool capabilities, see the [Built-in Tools](https://console.groq.com/docs/compound/built-in-tools) page.

## [When to Choose Which System](#when-to-choose-which-system)

### [Choose Compound When:](#choose-compound-when)

- You need comprehensive research across multiple sources
- Your task requires iterative problem-solving
- You're building complex analytical workflows
- You need multi-step code generation and testing

### [Choose Compound Mini When:](#choose-compound-mini-when)

- You need quick answers to straightforward questions
- Latency is a critical factor for your application
- You're building real-time applications
- Your queries typically require only one tool call

Systems
Copy page

Groq offers two compound AI systems that intelligently use external tools to provide more accurate, up-to-date, and capable responses than traditional LLMs alone. Both systems support web search and code execution, but differ in their approach to tool usage.

Compound (groq/compound) - Full-featured system with up to 10 tool calls per request
Compound Mini (groq/compound-mini) - Streamlined system with up to 1 tool call and average 3x lower latency
Groq's compound AI systems should not be used by customers for processing protected health information as it is not a HIPAA Covered Cloud Service under Groq's Business Associate Addendum at this time.

Getting Started
Compound
Learn about the full-featured system with up to 10 tool calls per request
Compound Mini
Discover the fast, single-tool-call system with average 3x lower latency
Both systems use the same API interface - simply change the model parameter to groq/compound or groq/compound-mini to get started.

System Comparison
Feature Compound Compound Mini
Tool Calls per Request Up to 10 Up to 1
Average Latency Standard 3x Lower
Token Speed ~350 tps ~350 tps
Best For Complex multi-step tasks Quick single-step queries
Key Differences
Compound
Multiple Tool Calls: Can perform up to 10 server-side tool calls before returning an answer
Complex Workflows: Ideal for tasks requiring multiple searches, code executions, or iterative problem-solving
Comprehensive Analysis: Can gather information from multiple sources and perform multi-step reasoning
Use Cases: Research tasks, complex data analysis, multi-part coding challenges
Compound Mini
Single Tool Call: Performs up to 1 server-side tool call before returning an answer
Fast Response: Average 3x lower latency compared to Compound
Direct Answers: Perfect for straightforward queries that need one piece of current information
Use Cases: Quick fact-checking, single calculations, simple web searches
Available Tools
Both systems support the same set of tools:

Web Search - Access real-time information from the web
Code Execution - Execute Python code automatically
Visit Website - Access and analyze specific website content
Browser Automation - Interact with web pages through automated browser actions
Wolfram Alpha - Access computational knowledge and mathematical calculations

For more information about tool capabilities, see the Built-in Tools page.

When to Choose Which System
Choose Compound When:
You need comprehensive research across multiple sources
Your task requires iterative problem-solving
You're building complex analytical workflows
You need multi-step code generation and testing
Choose Compound Mini When:
You need quick answers to straightforward questions
Latency is a critical factor for your application
You're building real-time applications
Your queries typically require only one tool call
Was this page helpful?

Yes

No

Suggest Edits

Compound Mini
groq/compound-mini

Try it in Playground
TOKEN SPEED
~450 tps
Powered by
groq
INPUT
Text
OUTPUT
Text
CAPABILITIES
Web Search, Code Execution, Visit Website, Browser Automation, Wolfram Alpha, JSON Object Mode
Groq logo
Groq
Groq's Compound Mini system integrates OpenAI's GPT-OSS 120B and Llama 3.3 70B models with external tools like web search and code execution. This allows applications to access real-time data and interact with external environments, providing more accurate and current responses than standalone LLMs. Instead of managing separate tools and APIs, Compound systems offer a unified interface that handles tool integration and orchestration, letting you focus on application logic rather than infrastructure complexity.

Rate limits for groq/compound-mini are determined by the rate limits of the individual models that comprise them.

The use of this tool with a supported model or system in GroqCloud is not a HIPAA Covered Cloud Service under Groq's Business Associate Addendum at this time. This tool is also not available currently for use with regional / sovereign endpoints.

PRICING
Underlying Model Pricing (per 1M tokens)
Pricing (GPT-OSS-120B)
Input
$0.15
Output
$0.60
Pricing (Llama 3.3 70B)
Input
$0.59
Output
$0.79
Built-in Tool Pricing
Basic Web Search
$5 / 1000 requests
Advanced Web Search
$8 / 1000 requests
Visit Website
$1 / 1000 requests
Code Execution
$0.18 / hour
Browser Automation
$0.08 / hour
Wolfram Alpha
Based on your API key from Wolfram, not billed by Groq
Final pricing depends on which underlying models and tools are used for your specific query. See the Pricing page for more details or the Compound page for usage breakdowns.
LIMITS
CONTEXT WINDOW
131,072
MAX OUTPUT TOKENS
8,192
QUANTIZATION
This uses Groq's TruePoint Numerics, which reduces precision only in areas that don't affect accuracy, preserving quality while delivering significant speedup over traditional approaches. Learn more here.
Key Technical Specifications
Model Architecture
Compound mini is powered by Llama 3.3 70B and GPT-OSS 120B for intelligent reasoning and tool use. Unlike groq/compound, it can only use one tool per request, but has an average of 3x lower latency.

Performance Metrics
Groq developed a new evaluation benchmark for measuring search capabilities called RealtimeEval. This benchmark is designed to evaluate tool-using systems on current events and live data. On the benchmark, Compound Mini outperformed GPT-4o-search-preview and GPT-4o-mini-search-preview significantly.
Learn More About Agentic Tooling
Discover how to build powerful applications with real-time web search and code execution
Use Cases
Realtime Web Search
Automatically access up-to-date information from the web using the built-in web search tool.

Code Execution
Execute Python code automatically using the code execution tool powered by E2B.

Code Generation and Technical Tasks
Create AI tools for code generation, debugging, and technical problem-solving with high-quality multilingual support.
Best Practices
Use system prompts to improve steerability and reduce false refusals. Compound mini is designed to be highly steerable with appropriate system prompts.
Consider implementing system-level protections like Llama Guard for input filtering and response validation.
Deploy with appropriate safeguards when working in specialized domains or with critical content.
Quick Start
Experience the capabilities of groq/compound-mini on Groq:

curl
JavaScript
Python
JSON
shell

pip install groq
Python

from groq import Groq
client = Groq()
completion = client.chat.completions.create(
model="groq/compound-mini",
messages=[
{
"role": "user",
"content": "Explain why fast inference is critical for reasoning models"
}
]
)
print(completion.choices[0].message.content)
Was this page helpful?

Yes

No

Suggest Edits

---

description: Explore the built-in tools available in Groq&#x27;s Compound systems for web search, code execution, and more.
title: Built-in Tools - GroqDocs
image: https://console.groq.com/og_cloudv5.jpg

---

# Built-in Tools

Compound systems come equipped with a comprehensive set of built-in tools that can be intelligently called to answer user queries. These tools not only expand the capabilities of language models by providing access to real-time information, computational power, and interactive environments, but also eliminate the need to build and maintain the underlying infrastructure for these tools yourself.

Built-in tools with Compound systems are not HIPAA Covered Cloud Services under Groq's Business Associate Addendum at this time. These tools are also not available currently for use with regional / sovereign endpoints.

## [Default Tools](#default-tools)

The tools enabled by default vary depending on your Compound system version:

| Version                        | [Web Search](https://console.groq.com/docs/web-search) | [Code Execution](https://console.groq.com/docs/code-execution) | [Visit Website](https://console.groq.com/docs/visit-website) |
| ------------------------------ | ------------------------------------------------------ | -------------------------------------------------------------- | ------------------------------------------------------------ |
| Newer than 2025-07-23 (Latest) | ✅                                                     | ✅                                                             | ✅                                                           |
| 2025-07-23 (Default)           | ✅                                                     | ✅                                                             | ❌                                                           |

All tools are automatically enabled by default. Compound systems intelligently decide when to use each tool based on the user's query.

For more information on how to set your Compound system version, see the [Compound System Versioning](https://console.groq.com/docs/compound#system-versioning) page.

## [Available Tools](#available-tools)

These are all the available built-in tools on Groq's Compound systems.

| Tool                                                                   | Description                                                                      | Identifier         | [Supported Compound Version](https://console.groq.com/docs/compound#system-versioning) |
| ---------------------------------------------------------------------- | -------------------------------------------------------------------------------- | ------------------ | -------------------------------------------------------------------------------------- |
| [Web Search](https://console.groq.com/docs/web-search)                 | Access real-time web content and up-to-date information with automatic citations | web_search         | All versions                                                                           |
| [Visit Website](https://console.groq.com/docs/visit-website)           | Fetch and analyze content from specific web pages                                | visit_website      | latest                                                                                 |
| [Browser Automation](https://console.groq.com/docs/browser-automation) | Interact with web pages through automated browser actions                        | browser_automation | latest                                                                                 |
| [Code Execution](https://console.groq.com/docs/code-execution)         | Execute Python code automatically in secure sandboxed environments               | code_interpreter   | All versions                                                                           |
| [Wolfram Alpha](https://console.groq.com/docs/wolfram-alpha)           | Access computational knowledge and mathematical calculations                     | wolfram_alpha      | latest                                                                                 |

Jump to the [Configuring Tools](#configuring-tools) section to learn how to enable specific tools via their identifiers. Some tools are only available on certain Compound system versions - [learn more about how to set your Compound version here](https://console.groq.com/docs/compound#system-versioning).

## [Configuring Tools](#configuring-tools)

You can customize which tools are available to Compound systems using the `compound_custom.tools.enabled_tools` parameter. This allows you to restrict or specify exactly which tools should be available for a particular request.

For a list of available tool identifiers, see the [Available Tools](#available-tools) section.

### [Example: Enable Specific Tools](#example-enable-specific-tools)

python

```
from groq import Groq

client = Groq(
    default_headers={
        "Groq-Model-Version": "latest"
    }
)

response = client.chat.completions.create(
    model="groq/compound",
    messages=[
        {
            "role": "user",
            "content": "Search for recent AI developments and then visit the Groq website"
        }
    ],
    compound_custom={
        "tools": {
            "enabled_tools": ["web_search", "visit_website"]
        }
    }
)
```

```
import Groq from "groq-sdk";

const groq = new Groq({
  defaultHeaders: {
    "Groq-Model-Version": "latest"
  }
});

const response = await groq.chat.completions.create({
  model: "groq/compound",
  messages: [
    {
      role: "user",
      content: "Search for recent AI developments and then visit the Groq website"
    }
  ],
  compound_custom: {
    tools: {
      enabled_tools: ["web_search", "visit_website"]
    }
  }
});
```

```
curl "https://api.groq.com/openai/v1/chat/completions" \
  -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${GROQ_API_KEY}" \
  -H "Groq-Model-Version: latest" \
  -d '{
        "messages": [
          {
            "role": "user",
            "content": "Search for recent AI developments and then visit the Groq website"
          }
        ],
        "model": "groq/compound",
        "compound_custom": {
          "tools": {
            "enabled_tools": ["web_search", "visit_website"]
          }
        }
      }'
```

### [Example: Code Execution Only](#example-code-execution-only)

python

```
from groq import Groq

client = Groq()

response = client.chat.completions.create(
    model="groq/compound",
    messages=[
        {
            "role": "user",
            "content": "Calculate the square root of 12345"
        }
    ],
    compound_custom={
        "tools": {
            "enabled_tools": ["code_interpreter"]
        }
    }
)
```

```
import Groq from "groq-sdk";

const groq = new Groq();

const response = await groq.chat.completions.create({
  model: "groq/compound",
  messages: [
    {
      role: "user",
      content: "Calculate the square root of 12345"
    }
  ],
  compound_custom: {
    tools: {
      enabled_tools: ["code_interpreter"]
    }
  }
});
```

```
curl "https://api.groq.com/openai/v1/chat/completions" \
  -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${GROQ_API_KEY}" \
  -d '{
        "messages": [
          {
            "role": "user",
            "content": "Calculate the square root of 12345"
          }
        ],
        "model": "groq/compound",
        "compound_custom": {
          "tools": {
            "enabled_tools": ["code_interpreter"]
          }
        }
      }'
```

## [Pricing](#pricing)

See the [Pricing](https://groq.com/pricing) page for detailed information on costs for each tool.

---

description: Explore practical applications and examples of compound AI systems.
title: Use Cases - GroqDocs
image: https://console.groq.com/og_cloudv5.jpg

---

# Use Cases

Groq's compound systems excel at a wide range of use cases, particularly when real-time information is required.

## [Real-time Fact Checker and News Agent](#realtime-fact-checker-and-news-agent)

Your application needs to answer questions or provide information that requires up-to-the-minute knowledge, such as:

- Latest news
- Current stock prices
- Recent events
- Weather updates

Building and maintaining your own web scraping or search API integration is complex and time-consuming.

### [Solution with Compound](#solution-with-compound)

Simply send the user's query to `groq/compound`. If the query requires current information beyond its training data, it will automatically trigger its built-in web search tool to fetch relevant, live data before formulating the answer.

### [Why It's Great](#why-its-great)

- Get access to real-time information instantly without writing any extra code for search integration
- Leverage Groq's speed for a real-time, responsive experience

### [Code Example](#code-example)

Python

```
import os
from groq import Groq

# Ensure your GROQ_API_KEY is set as an environment variable
client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

user_query = "What were the main highlights from the latest Apple keynote event?"
# Or: "What's the current weather in San Francisco?"
# Or: "Summarize the latest developments in fusion energy research this week."

chat_completion = client.chat.completions.create(
    messages=[
        {
            "role": "user",
            "content": user_query,
        }
    ],
    # The *only* change needed: Specify the compound model!
    model="groq/compound",
)

print(f"Query: {user_query}")
print(f"Compound Response:\n{chat_completion.choices[0].message.content}")

# You might also inspect chat_completion.choices[0].message.executed_tools
# if you want to see if/which tool was used, though it's not necessary.
```

```
import Groq from "groq-sdk";

const groq = new Groq();

export async function main() {
  const user_query = "What were the main highlights from the latest Apple keynote event?"
  // Or: "What's the current weather in San Francisco?"
  // Or: "Summarize the latest developments in fusion energy research this week."

  const completion = await groq.chat.completions.create({
    messages: [
      {
        role: "user",
        content: user_query,
      },
    ],
    // The *only* change needed: Specify the compound model!
    model: "groq/compound",
  });

  console.log(`Query: ${user_query}`);
  console.log(`Compound Response:\n${completion.choices[0]?.message?.content || ""}`);

  // You might also inspect chat_completion.choices[0].message.executed_tools
  // if you want to see if/which tool was used, though it's not necessary.
}

main();
```

```
import Groq from "groq-sdk";

const groq = new Groq();

export async function main() {
  const user_query = "What were the main highlights from the latest Apple keynote event?"
  // Or: "What's the current weather in San Francisco?"
  // Or: "Summarize the latest developments in fusion energy research this week."

  const completion = await groq.chat.completions.create({
    messages: [
      {
        role: "user",
        content: user_query,
      },
    ],
    // The *only* change needed: Specify the compound model!
    model: "groq/compound",
  });

  console.log(`Query: ${user_query}`);
  console.log(`Compound Response:\n${completion.choices[0]?.message?.content || ""}`);

  // You might also inspect chat_completion.choices[0].message.executed_tools
  // if you want to see if/which tool was used, though it's not necessary.
}

main();
```

Find the latest news and headlines

## [Natural Language Calculator and Code Extractor](#natural-language-calculator-and-code-extractor)

You want users to perform calculations, run simple data manipulations, or execute small code snippets using natural language commands within your application, without building a dedicated parser or execution environment.

### [Solution with Compound](#solution-with-compound)

Frame the user's request as a task involving computation or code. `groq/compound-mini` can recognize these requests and use its secure code execution tool to compute the result.

### [Why It's Great](#why-its-great)

- Effortlessly add computational capabilities
- Users can ask things like:
  - "What's 15% of $540?"
  - "Calculate the standard deviation of \[10, 12, 11, 15, 13\]"
  - "Run this python code: print('Hello from Compound!')"

### [Code Example](#code-example)

Python

```
import os
from groq import Groq

client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

# Example 1: Calculation
computation_query = "Calculate the monthly payment for a $30,000 loan over 5 years at 6% annual interest."

# Example 2: Simple code execution
code_query = "What is the output of this Python code snippet: `data = {'a': 1, 'b': 2}; print(data.keys())`"

# Choose one query to run
selected_query = computation_query

chat_completion = client.chat.completions.create(
    messages=[
        {
            "role": "system",
            "content": "You are a helpful assistant capable of performing calculations and executing simple code when asked.",
        },
        {
            "role": "user",
            "content": selected_query,
        }
    ],
    # Use the compound model
    model="groq/compound-mini",
)

print(f"Query: {selected_query}")
print(f"Compound Mini Response:\n{chat_completion.choices[0].message.content}")
```

```
import Groq from "groq-sdk";

const groq = new Groq();

export async function main() {
  // Example 1: Calculation
  const computationQuery = "Calculate the monthly payment for a $30,000 loan over 5 years at 6% annual interest.";

  // Example 2: Simple code execution
  const codeQuery = "What is the output of this Python code snippet: `data = {'a': 1, 'b': 2}; print(data.keys())`";

  // Choose one query to run
  const selectedQuery = computationQuery;

  const completion = await groq.chat.completions.create({
    messages: [
      {
        role: "system",
        content: "You are a helpful assistant capable of performing calculations and executing simple code when asked.",
      },
      {
        role: "user",
        content: selectedQuery,
      }
    ],
    // Use the compound model
    model: "groq/compound-mini",
  });

  console.log(`Query: ${selectedQuery}`);
  console.log(`Compound Mini Response:\n${completion.choices[0]?.message?.content || ""}`);
}

main();
```

```
import Groq from "groq-sdk";

const groq = new Groq();

export async function main() {
  // Example 1: Calculation
  const computationQuery = "Calculate the monthly payment for a $30,000 loan over 5 years at 6% annual interest.";

  // Example 2: Simple code execution
  const codeQuery = "What is the output of this Python code snippet: `data = {'a': 1, 'b': 2}; print(data.keys())`";

  // Choose one query to run
  const selectedQuery = computationQuery;

  const completion = await groq.chat.completions.create({
    messages: [
      {
        role: "system",
        content: "You are a helpful assistant capable of performing calculations and executing simple code when asked.",
      },
      {
        role: "user",
        content: selectedQuery,
      }
    ],
    // Use the compound model
    model: "groq/compound-mini",
  });

  console.log(`Query: ${selectedQuery}`);
  console.log(`Compound Mini Response:\n${completion.choices[0]?.message?.content || ""}`);
}

main();
```

Perform precise and verified calculations

## [Code Debugging Assistant](#code-debugging-assistant)

Developers often need quick help understanding error messages or testing small code fixes. Searching documentation or running snippets requires switching contexts.

### [Solution with Compound](#solution-with-compound)

Users can paste an error message and ask for explanations or potential causes. Compound Mini might use web search to find recent discussions or documentation about that specific error. Alternatively, users can provide a code snippet and ask "What's wrong with this code?" or "Will this Python code run: ...?". It can use code execution to test simple, self-contained snippets.

### [Why It's Great](#why-its-great)

- Provides a unified interface for getting code help
- Potentially draws on live web data for new errors
- Executes code directly for validation
- Speeds up the debugging process

**Note**: `groq/compound-mini` uses one tool per turn, so it might search OR execute, not both simultaneously in one response.

### [Code Example](#code-example)

Python

```
import os
from groq import Groq

client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

# Example 1: Error Explanation (might trigger search)
debug_query_search = "I'm getting a 'Kubernetes CrashLoopBackOff' error on my pod. What are the common causes based on recent discussions?"

# Example 2: Code Check (might trigger code execution)
debug_query_exec = "Will this Python code raise an error? `import numpy as np; a = np.array([1,2]); b = np.array([3,4,5]); print(a+b)`"

# Choose one query to run
selected_query = debug_query_exec

chat_completion = client.chat.completions.create(
    messages=[
        {
            "role": "system",
            "content": "You are a helpful coding assistant. You can explain errors, potentially searching for recent information, or check simple code snippets by executing them.",
        },
        {
            "role": "user",
            "content": selected_query,
        }
    ],
    # Use the compound model
    model="groq/compound-mini",
)

print(f"Query: {selected_query}")
print(f"Compound Mini Response:\n{chat_completion.choices[0].message.content}")
```

```
import Groq from "groq-sdk";

const groq = new Groq();

export async function main() {
  // Example 1: Error Explanation (might trigger search)
  const debugQuerySearch = "I'm getting a 'Kubernetes CrashLoopBackOff' error on my pod. What are the common causes based on recent discussions?";

  // Example 2: Code Check (might trigger code execution)
  const debugQueryExec = "Will this Python code raise an error? `import numpy as np; a = np.array([1,2]); b = np.array([3,4,5]); print(a+b)`";

  // Choose one query to run
  const selectedQuery = debugQueryExec;

  const completion = await groq.chat.completions.create({
    messages: [
      {
        role: "system",
        content: "You are a helpful coding assistant. You can explain errors, potentially searching for recent information, or check simple code snippets by executing them.",
      },
      {
        role: "user",
        content: selectedQuery,
      }
    ],
    // Use the compound model
    model: "groq/compound-mini",
  });

  console.log(`Query: ${selectedQuery}`);
  console.log(`Compound Mini Response:\n${completion.choices[0]?.message?.content || ""}`);
}

main();
```

```
import Groq from "groq-sdk";

const groq = new Groq();

export async function main() {
  // Example 1: Error Explanation (might trigger search)
  const debugQuerySearch = "I'm getting a 'Kubernetes CrashLoopBackOff' error on my pod. What are the common causes based on recent discussions?";

  // Example 2: Code Check (might trigger code execution)
  const debugQueryExec = "Will this Python code raise an error? `import numpy as np; a = np.array([1,2]); b = np.array([3,4,5]); print(a+b)`";

  // Choose one query to run
  const selectedQuery = debugQueryExec;

  const completion = await groq.chat.completions.create({
    messages: [
      {
        role: "system",
        content: "You are a helpful coding assistant. You can explain errors, potentially searching for recent information, or check simple code snippets by executing them.",
      },
      {
        role: "user",
        content: selectedQuery,
      }
    ],
    // Use the compound model
    model: "groq/compound-mini",
  });

  console.log(`Query: ${selectedQuery}`);
  console.log(`Compound Response:\n${completion.choices[0]?.message?.content || ""}`);
}

main();
```

## [Chart Generation](#chart-generation)

Need to quickly create data visualizations from natural language descriptions? Compound's code execution capabilities can help generate charts without writing visualization code directly.

### [Solution with Compound](#solution-with-compound)

Describe the chart you want in natural language, and Compound will generate and execute the appropriate Python visualization code. The model automatically parses your request, generates the visualization code using libraries like matplotlib or seaborn, and returns the chart.

### [Why It's Great](#why-its-great)

- Generate charts from simple natural language descriptions
- Supports common chart types (scatter, line, bar, etc.)
- Handles all visualization code generation and execution
- Customize data points, labels, colors, and layouts as needed

### [Usage and Results](#usage-and-results)

Scatter PlotLine PlotBar PlotPie ChartBox PlotSuperchart

shell

```
curl -X POST https://api.groq.com/openai/v1/chat/completions \
  -H "Authorization: Bearer $GROQ_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "groq/compound",
    "messages": [
      {
        "role": "user",
        "content": "Create a scatter plot showing the relationship between market cap and daily trading volume for the top 5 tech companies (AAPL, MSFT, GOOGL, AMZN, META). Use current market data."
      }
    ]
  }'
```

### [Results](#results)

![Plot result](https://console.groq.com/_next/image?url=%2Fplot-results%2Fscatterplot.png&w=3840&q=100)

Generate K-means clustering

---

description: Learn how to process large-scale workloads asynchronously and cost-effectively with the Groq Batch API for chat, audio, and translation tasks.
title: Groq Batch API - GroqDocs
image: https://console.groq.com/og_cloudv5.jpg

---

# Groq Batch API

Process large-scale workloads asynchronously with our Batch API.

## [What is Batch Processing?](#what-is-batch-processing)

Batch processing lets you run thousands of API requests at scale by submitting your workload as an asynchronous batch of requests to Groq with 50% lower cost, no impact to your standard rate limits, and 24-hour to 7 day processing window.

## [Overview](#overview)

While some of your use cases may require synchronous API requests, asynchronous batch processing is perfect for use cases that don't need immediate reponses or for processing a large number of queries that standard rate limits cannot handle, such as processing large datasets, generating content in bulk, and running evaluations.

Compared to using our synchronous API endpoints, our Batch API has:

- **Higher rate limits:** Process thousands of requests per batch with no impact on your standard API rate limits
- **Cost efficiency:** 50% cost discount compared to synchronous APIs

## [Model Availability and Pricing](#model-availability-and-pricing)

The Batch API can currently be used to execute queries for chat completion (both text and vision), audio transcription, and audio translation inputs with the following models:

Chat CompletionsAudio TranscriptionsAudio Translations

| Model ID                                      | Model                                                                                                 |
| --------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| openai/gpt-oss-20b                            | [GPT-OSS 20B](https://console.groq.com/docs/model/openai/gpt-oss-20b)                                 |
| openai/gpt-oss-120b                           | [GPT-OSS 120B](https://console.groq.com/docs/model/openai/gpt-oss-120b)                               |
| meta-llama/llama-4-maverick-17b-128e-instruct | [Llama 4 Maverick](https://console.groq.com/docs/model/meta-llama/llama-4-maverick-17b-128e-instruct) |
| meta-llama/llama-4-scout-17b-16e-instruct     | [Llama 4 Scout](https://console.groq.com/docs/model/meta-llama/llama-4-scout-17b-16e-instruct)        |
| llama-3.3-70b-versatile                       | [Llama 3.3 70B](https://console.groq.com/docs/model/llama-3.3-70b-versatile)                          |
| llama-3.1-8b-instant                          | [Llama 3.1 8B Instant](https://console.groq.com/docs/model/llama-3.1-8b-instant)                      |
| meta-llama/llama-guard-4-12b                  | [Llama Guard 4 12B](https://console.groq.com/docs/model/meta-llama/llama-guard-4-12b)                 |

| Model ID               | Model                                                                                |
| ---------------------- | ------------------------------------------------------------------------------------ |
| whisper-large-v3       | [Whisper Large V3](https://console.groq.com/docs/model/whisper-large-v3)             |
| whisper-large-v3-turbo | [Whisper Large V3 Turbo](https://console.groq.com/docs/model/whisper-large-v3-turbo) |

| Model ID         | Model                                                                    |
| ---------------- | ------------------------------------------------------------------------ |
| whisper-large-v3 | [Whisper Large V3](https://console.groq.com/docs/model/whisper-large-v3) |

Pricing is at a 50% cost discount compared to [synchronous API pricing. ](https://groq.com/pricing)

## [Getting Started](#getting-started)

Our Batch API endpoints allow you to collect a group of requests into a single file, kick off a batch processing job to execute the requests within your file, query for the status of your batch, and eventually retrieve the results when your batch is complete.

Multiple batch jobs can be submitted at once.

Each batch has a processing window, during which we'll process as many requests as our capacity allows while maintaining service quality for all users. We allow for setting a batch window from 24 hours to 7 days and recommend setting a longer batch window allow us more time to complete your batch jobs instead of expiring them.

### [1\. Prepare Your Batch File](#1-prepare-your-batch-file)

A batch is composed of a list of API requests and every batch job starts with a JSON Lines (JSONL) file that contains the requests you want processed. Each line in this file represents a single API call.

The Groq Batch API currently supports:

- Chat completion requests through [/v1/chat/completions](https://console.groq.com/docs/text-chat)
- Audio transcription requests through [/v1/audio/transcriptions](https://console.groq.com/docs/speech-to-text)
- Audio translation requests through [/v1/audio/translations](https://console.groq.com/docs/speech-to-text)

The structure for each line must include:

- `custom_id`: Your unique identifier for tracking the batch request
- `method`: The HTTP method (currently `POST` only)
- `url`: The API endpoint to call (one of: `/v1/chat/completions`, `/v1/audio/transcriptions`, or `/v1/audio/translations`)
- `body`: The parameters of your request matching our synchronous API format. See our API Reference [here. ](https://console.groq.com/docs/api-reference#chat-create)

The following is an example of a JSONL batch file with different types of requests:

Chat CompletionsAudio TranscriptionsAudio TranslationsMixed Batch

JSON

```
{"custom_id": "request-1", "method": "POST", "url": "/v1/chat/completions", "body": {"model": "llama-3.1-8b-instant", "messages": [{"role": "system", "content": "You are a helpful assistant."}, {"role": "user", "content": "What is 2+2?"}]}}
{"custom_id": "request-2", "method": "POST", "url": "/v1/chat/completions", "body": {"model": "llama-3.1-8b-instant", "messages": [{"role": "system", "content": "You are a helpful assistant."}, {"role": "user", "content": "What is 2+3?"}]}}
{"custom_id": "request-3", "method": "POST", "url": "/v1/chat/completions", "body": {"model": "llama-3.1-8b-instant", "messages": [{"role": "system", "content": "You are a helpful assistant."}, {"role": "user", "content": "count up to 1000000. starting with 1, 2, 3. print all the numbers, do not stop until you get to 1000000."}]}}
```

JSON

```
{"custom_id":"job-cb6d01f6-1","method":"POST","url":"/v1/audio/transcriptions","body":{"model":"whisper-large-v3","language":"en","url":"https://github.com/voxserv/audio_quality_testing_samples/raw/refs/heads/master/testaudio/8000/test01_20s.wav","response_format":"verbose_json","timestamp_granularities":["segment"]}}
{"custom_id":"job-cb6d01f6-2","method":"POST","url":"/v1/audio/transcriptions","body":{"model":"whisper-large-v3","language":"en","url":"https://github.com/voxserv/audio_quality_testing_samples/raw/refs/heads/master/testaudio/8000/test01_20s.wav","response_format":"verbose_json","timestamp_granularities":["segment"]}}
{"custom_id":"job-cb6d01f6-3","method":"POST","url":"/v1/audio/transcriptions","body":{"model":"distil-whisper-large-v3-en","language":"en","url":"https://github.com/voxserv/audio_quality_testing_samples/raw/refs/heads/master/testaudio/8000/test01_20s.wav","response_format":"verbose_json","timestamp_granularities":["segment"]}}
```

JSON

```
{"custom_id":"job-cb6d01f6-1","method":"POST","url":"/v1/audio/translations","body":{"model":"whisper-large-v3","language":"en","url":"https://console.groq.com/audio/batch/sample-zh.wav","response_format":"verbose_json","timestamp_granularities":["segment"]}}
```

JSON

```
{"custom_id": "chat-request-1", "method": "POST", "url": "/v1/chat/completions", "body": {"model": "llama-3.1-8b-instant", "messages": [{"role": "system", "content": "You are a helpful assistant."}, {"role": "user", "content": "What is quantum computing?"}]}}
{"custom_id": "audio-request-1", "method": "POST", "url": "/v1/audio/transcriptions", "body": {"model": "whisper-large-v3", "language": "en", "url": "https://github.com/voxserv/audio_quality_testing_samples/raw/refs/heads/master/testaudio/8000/test01_20s.wav", "response_format": "verbose_json", "timestamp_granularities": ["segment"]}}
{"custom_id": "chat-request-2", "method": "POST", "url": "/v1/chat/completions", "body": {"model": "llama-3.3-70b-versatile", "messages": [{"role": "system", "content": "You are a helpful assistant."}, {"role": "user", "content": "Explain machine learning in simple terms."}]}}
{"custom_id":"audio-request-2","method":"POST","url":"/v1/audio/translations","body":{"model":"whisper-large-v3","language":"en","url":"https://console.groq.com/audio/batch/sample-zh.wav","response_format":"verbose_json","timestamp_granularities":["segment"]}}
```

#### [Converting Sync Calls to Batch Format](#converting-sync-calls-to-batch-format)

If you're familiar with making synchronous API calls, converting them to batch format is straightforward. Here's how a regular API call transforms into a batch request:

Chat CompletionsAudio TranscriptionsAudio Translations

JSON

```
# Your typical synchronous API call in Python:
response = client.chat.completions.create(
    model="llama-3.1-8b-instant",
    messages=[
        {"role": "user", "content": "What is quantum computing?"}
    ]
)

# The same call in batch format (must be on a single line as JSONL):
{"custom_id": "quantum-1", "method": "POST", "url": "/v1/chat/completions", "body": {"model": "llama-3.1-8b-instant", "messages": [{"role": "user", "content": "What is quantum computing?"}]}}
```

JSON

```
# Your typical synchronous API call in Python:
response = client.audio.transcriptions.create(
    model="whisper-large-v3",
    language="en",
    url="https://example.com/audio-file.wav",
    response_format="verbose_json",
    timestamp_granularities=["segment"]
)

# The same call in batch format (must be on a single line as JSONL):
{"custom_id": "audio-1", "method": "POST", "url": "/v1/audio/transcriptions", "body": {"model": "whisper-large-v3", "language": "en", "url": "https://example.com/audio-file.wav", "response_format": "verbose_json", "timestamp_granularities": ["segment"]}}
```

JSON

```
# Your typical synchronous API call in Python:
response = client.audio.translations.create(
    model="whisper-large-v3",
    language="en",
    url="https://example.com/audio-file.wav",
    response_format="verbose_json",
    timestamp_granularities=["segment"]
)

# The same call in batch format (must be on a single line as JSONL):
{"custom_id": "audio-1", "method": "POST", "url": "/v1/audio/translations", "body": {"model": "whisper-large-v3", "language": "en", "url": "https://example.com/audio-file.wav", "response_format": "verbose_json", "timestamp_granularities": ["segment"]}}
```

### [2\. Upload Your Batch File](#2-upload-your-batch-file)

Upload your `.jsonl` batch file using the Files API endpoint for when kicking off your batch job:

**Note:** The Files API currently only supports `.jsonl` files 50,000 lines or less and up to maximum of 200MB in size. There is no limit for the number of batch jobs you can submit. We recommend submitting multiple shorter batch files for a better chance of completion.

Python

```
import os
from groq import Groq

client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

file_path = "batch_file.jsonl"
response = client.files.create(file=open(file_path, "rb"), purpose="batch")

print(response)
```

```
import fs from 'fs';
import Groq from 'groq-sdk';

const groq = new Groq();

async function main() {
  const filePath = 'batch_file.jsonl'; // Path to your JSONL file

  const response = await groq.files.create({
    purpose: 'batch',
    file: fs.createReadStream(filePath)
  });

  console.log(response);
}

main();
```

```
curl https://api.groq.com/openai/v1/files \
  -H "Authorization: Bearer $GROQ_API_KEY" \
  -F purpose="batch" \
  -F "file=@batch_file.jsonl"
```

You will receive a JSON response that contains the ID (`id`) for your file object that you will then use to create your batch job:

JSON

```
{
    "id":"file_01jh6x76wtemjr74t1fh0faj5t",
    "object":"file",
    "bytes":966,
    "created_at":1736472501,
    "filename":"input_file.jsonl",
    "purpose":"batch"
}
```

### [3\. Create Your Batch Job](#3-create-your-batch-job)

Once you've uploaded your `.jsonl` file, you can use the file object ID (in this case, `file_01jh6x76wtemjr74t1fh0faj5t` as shown in Step 2) to create a batch:

**Note:** The completion window for batch jobs can be set from to 24 hours (`24h`) to 7 days (`7d`). We recommend setting a longer batch window to have a better chance for completed batch jobs rather than expirations for when we are under heavy load.

Python

```
import os
from groq import Groq

client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

response = client.batches.create(
    completion_window="24h",
    endpoint="/v1/chat/completions",
    input_file_id="file_01jh6x76wtemjr74t1fh0faj5t",
)
print(response.to_json())
```

```
import Groq from 'groq-sdk';

const groq = new Groq();

async function main() {
  const response = await groq.batches.create({
    completion_window: "24h",
    endpoint: "/v1/chat/completions",
    input_file_id: "file_01jh6x76wtemjr74t1fh0faj5t",
  });
  console.log(response);
}

main();
```

```
curl https://api.groq.com/openai/v1/batches \
  -H "Authorization: Bearer $GROQ_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "input_file_id": "file_01jh6x76wtemjr74t1fh0faj5t",
    "endpoint": "/v1/chat/completions",
    "completion_window": "24h"
  }'
```

This request will return a Batch object with metadata about your batch, including the batch `id` that you can use to check the status of your batch:

JSON

```
{
    "id":"batch_01jh6xa7reempvjyh6n3yst2zw",
    "object":"batch",
    "endpoint":"/v1/chat/completions",
    "errors":null,
    "input_file_id":"file_01jh6x76wtemjr74t1fh0faj5t",
    "completion_window":"24h",
    "status":"validating",
    "output_file_id":null,
    "error_file_id":null,
    "finalizing_at":null,
    "failed_at":null,
    "expired_at":null,
    "cancelled_at":null,
    "request_counts":{
        "total":0,
        "completed":0,
        "failed":0
    },
    "metadata":null,
    "created_at":1736472600,
    "expires_at":1736559000,
    "cancelling_at":null,
    "completed_at":null,
    "in_progress_at":null
}
```

### [4\. Check Batch Status](#4-check-batch-status)

You can check the status of a batch any time your heart desires with the batch `id` (in this case, `batch_01jh6xa7reempvjyh6n3yst2zw` from the above Batch response object), which will also return a Batch object:

Python

```
import os
from groq import Groq

client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

response = client.batches.retrieve("batch_01jh6xa7reempvjyh6n3yst2zw")

print(response.to_json())
```

```
import Groq from 'groq-sdk';

const groq = new Groq();

async function main() {
  const response = await groq.batches.retrieve("batch_01jh6xa7reempvjyh6n3yst2zw");
  console.log(response);
}

main();
```

```
curl https://api.groq.com/openai/v1/batches/batch_01jh6xa7reempvjyh6n3yst2zw \
  -H "Authorization: Bearer $GROQ_API_KEY" \
  -H "Content-Type: application/json"
```

The status of a given batch job can return any of the following status codes:

| Status      | Description                                                                |
| ----------- | -------------------------------------------------------------------------- |
| validating  | batch file is being validated before the batch processing begins           |
| failed      | batch file has failed the validation process                               |
| in_progress | batch file was successfully validated and the batch is currently being run |
| finalizing  | batch has completed and the results are being prepared                     |
| completed   | batch has been completed and the results are ready                         |
| expired     | batch was not able to be completed within the processing window            |
| cancelling  | batch is being cancelled (may take up to 10 minutes)                       |
| cancelled   | batch was cancelled                                                        |

When your batch job is complete, the Batch object will return an `output_file_id` and/or an `error_file_id` that you can then use to retrieve your results (as shown below in Step 5). Here's an example:

JSON

```
{
    "id":"batch_01jh6xa7reempvjyh6n3yst2zw",
    "object":"batch",
    "endpoint":"/v1/chat/completions",
    "errors":[
        {
            "code":"invalid_method",
            "message":"Invalid value: 'GET'. Supported values are: 'POST'","param":"method",
            "line":4
        }
    ],
    "input_file_id":"file_01jh6x76wtemjr74t1fh0faj5t",
    "completion_window":"24h",
    "status":"completed",
    "output_file_id":"file_01jh6xa97be52b7pg88czwrrwb",
    "error_file_id":"file_01jh6xa9cte52a5xjnmnt5y0je",
    "finalizing_at":null,
    "failed_at":null,
    "expired_at":null,
    "cancelled_at":null,
    "request_counts":
    {
        "total":3,
        "completed":2,
        "failed":1
    },
    "metadata":null,
    "created_at":1736472600,
    "expires_at":1736559000,
    "cancelling_at":null,
    "completed_at":1736472607,
    "in_progress_at":1736472601
}
```

### [5\. Retrieve Batch Results](#5-retrieve-batch-results)

Now for the fun. Once the batch is complete, you can retrieve the results using the `output_file_id` from your Batch object (in this case, `file_01jh6xa97be52b7pg88czwrrwb` from the above Batch response object) and write it to a file on your machine (`batch_output.jsonl` in this case) to view them:

Python

```
import os
from groq import Groq

client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

response = client.files.content("file_01jh6xa97be52b7pg88czwrrwb")
response.write_to_file("batch_results.jsonl")
print("Batch file saved to batch_results.jsonl")
```

```
import fs from 'fs';
import Groq from 'groq-sdk';

const groq = new Groq();

async function main() {
  const response = await groq.files.content("file_01jh6xa97be52b7pg88czwrrwb");
  fs.writeFileSync("batch_results.jsonl", await response.text());
  console.log("Batch file saved to batch_results.jsonl");
}

main();
```

```
curl https://api.groq.com/openai/v1/files/file_01jh6xa97be52b7pg88czwrrwb/content \
  -H "Authorization: Bearer $GROQ_API_KEY" > batch_output.jsonl
```

The output `.jsonl` file will have one response line per successful request line of your batch file. Each line includes the original `custom_id`for mapping results, a unique batch request ID, and the response:

JSON

```
{"id": "batch_req_123", "custom_id": "my-request-1", "response": {"status_code": 200, "request_id": "req_abc", "body": {"id": "completion_xyz", "model": "llama-3.1-8b-instant", "choices": [{"index": 0, "message": {"role": "assistant", "content": "Hello!"}}], "usage": {"prompt_tokens": 20, "completion_tokens": 5, "total_tokens": 25}}}, "error": null}
```

Any failed or expired requests in the batch will have their error information written to an error file that can be accessed via the batch's `error_file_id`.

**Note:** Results may not appears in the same order as your batch request submissions. Always use the `custom_id` field to match results with your original request.

## [List Batches](#list-batches)

The `/batches` endpoint provides two ways to access your batch information: browsing all batches with cursor-based pagination (using the `cursor` parameter), or fetching specific batches by their IDs.

### [Iterate Over All Batches](#iterate-over-all-batches)

You can view all your batch jobs by making a call to `https://api.groq.com/openai/v1/batches`. Use the `cursor` parameter with the `next_cursor` value from the previous response to get the next page of results:

Python

```
import os
from groq import Groq

client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

# Initial request - gets first page of batches
response = client.batches.list()
print("First page:", response)

# If there's a next cursor, use it to get the next page
if response.paging and response.paging.get("next_cursor"):
    next_response = client.batches.list(
        extra_query={
            "cursor": response.paging.get("next_cursor")
        }  # Use the next_cursor for next page
    )
    print("Next page:", next_response)
```

```
import Groq from 'groq-sdk';

const groq = new Groq();

async function main() {
  // Initial request - gets first page of batches
  const response = await groq.batches.list();
  console.log('First page:', response);

  // If there's a next cursor, use it to get the next page
  if (response.paging && response.paging.next_cursor) {
    const nextResponse = await groq.batches.list({
      query: {
        cursor: response.paging.next_cursor, // Use the next_cursor for next page
      },
    });
    console.log('Next page:', nextResponse);
  }
}

main();
```

```
# Initial request - gets first page of batches
curl "https://api.groq.com/openai/v1/batches" \
  -H "Authorization: Bearer $GROQ_API_KEY" \
  -H "Content-Type: application/json"

# Use the next_cursor from the paging object in the response above
# Replace 'cursor_abc123' with the actual next_cursor from your previous response
curl "https://api.groq.com/openai/v1/batches?cursor=cursor_abc123" \
  -H "Authorization: Bearer $GROQ_API_KEY" \
  -H "Content-Type: application/json"
```

The paginated response includes a `paging` object with the `next_cursor` for the next page:

JSON

```
{
  "object": "list",
  "data": [
    {
      "id": "batch_01jh6xa7reempvjyh6n3yst111",
      "object": "batch",
      "status": "completed",
      "created_at": 1736472600,
      // ... other batch fields
    }
    // ... more batches
  ],
  "paging": {
    "next_cursor": "cursor_eyJpZCI6ImJhdGNoXzAxamg2eGE3cmVlbXB2ankifQ"
  }
}
```

### [Get Specific Batches](#get-specific-batches)

You can check the status of multiple batches at once by providing multiple batch IDs as query parameters to the same `/batches` endpoint. This is useful when you have submitted multiple batch jobs and want to monitor their progress efficiently:

Python

```
import os
import requests

# Set up headers
headers = {
    "Authorization": f"Bearer {os.environ.get('GROQ_API_KEY')}",
    "Content-Type": "application/json",
}

# Define batch IDs to check
batch_ids = [
    "batch_01jh6xa7reempvjyh6n3yst111",
    "batch_01jh6xa7reempvjyh6n3yst222",
    "batch_01jh6xa7reempvjyh6n3yst333",
]

# Build query parameters using requests params
url = "https://api.groq.com/openai/v1/batches"
params = [("id", batch_id) for batch_id in batch_ids]

# Make the request
response = requests.get(url, headers=headers, params=params)
print(response.json())
```

```
async function main() {
  const batchIds = [
    "batch_01jh6xa7reempvjyh6n3yst111",
    "batch_01jh6xa7reempvjyh6n3yst222",
    "batch_01jh6xa7reempvjyh6n3yst333"
  ];

  // Build query parameters using URLSearchParams
  const url = new URL('https://api.groq.com/openai/v1/batches');
  batchIds.forEach(id => url.searchParams.append('id', id));

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    console.log(data);
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
```

```
curl "https://api.groq.com/openai/v1/batches?id=batch_01jh6xa7reempvjyh6n3yst111&id=batch_01jh6xa7reempvjyh6n3yst222&id=batch_01jh6xa7reempvjyh6n3yst333" \
  -H "Authorization: Bearer $GROQ_API_KEY" \
  -H "Content-Type: application/json"
```

The multi-batch status request returns a JSON object with a `data` array containing the complete batch information for each requested batch:

JSON

```
{
  "object": "list",
  "data": [
    {
      "id": "batch_01jh6xa7reempvjyh6n3yst111",
      "object": "batch",
      "endpoint": "/v1/chat/completions",
      "errors": null,
      "input_file_id": "file_01jh6x76wtemjr74t1fh0faj5t",
      "completion_window": "24h",
      "status": "validating",
      "output_file_id": null,
      "error_file_id": null,
      "finalizing_at": null,
      "failed_at": null,
      "expired_at": null,
      "cancelled_at": null,
      "request_counts": {
        "total": 0,
        "completed": 0,
        "failed": 0
      },
      "metadata": null,
      "created_at": 1736472600,
      "expires_at": 1736559000,
      "cancelling_at": null,
      "completed_at": null,
      "in_progress_at": null
    },
    {
      "id": "batch_01jh6xa7reempvjyh6n3yst222",
      "object": "batch",
      "endpoint": "/v1/chat/completions",
      "errors": null,
      "input_file_id": "file_01jh6x76wtemjr74t1fh0faj6u",
      "completion_window": "24h",
      "status": "in_progress",
      "output_file_id": null,
      "error_file_id": null,
      "finalizing_at": null,
      "failed_at": null,
      "expired_at": null,
      "cancelled_at": null,
      "request_counts": {
        "total": 100,
        "completed": 15,
        "failed": 0
      },
      "metadata": null,
      "created_at": 1736472650,
      "expires_at": 1736559050,
      "cancelling_at": null,
      "completed_at": null,
      "in_progress_at": 1736472651
    },
    {
      "id": "batch_01jh6xa7reempvjyh6n3yst333",
      "object": "batch",
      "endpoint": "/v1/chat/completions",
      "errors": null,
      "input_file_id": "file_01jh6x76wtemjr74t1fh0faj7v",
      "completion_window": "24h",
      "status": "completed",
      "output_file_id": "file_01jh6xa97be52b7pg88czwrrwc",
      "error_file_id": null,
      "finalizing_at": null,
      "failed_at": null,
      "expired_at": null,
      "cancelled_at": null,
      "request_counts": {
        "total": 50,
        "completed": 50,
        "failed": 0
      },
      "metadata": null,
      "created_at": 1736472700,
      "expires_at": 1736559100,
      "cancelling_at": null,
      "completed_at": 1736472800,
      "in_progress_at": 1736472701
    }
  ]
}
```

**Note:** You can only request up to 200 batch IDs in a single request.

## [Batch Size](#batch-size)

The Files API supports JSONL files up to 50,000 lines and 200MB in size. Multiple batch jobs can be submitted at once.

**Note:** Consider splitting very large workloads into multiple smaller batches (e.g. 1000 requests per batch) for a better chance at completion rather than expiration for when we are under heavy load.

## [Batch Expiration](#batch-expiration)

Each batch has a processing window (24 hours to 7 days) during which we'll process as many requests as our capacity allows while maintaining service quality for all users.

We recommend setting a longer batch window for a better chance of completing your batch job rather than returning expired jobs when we are under heavy load.

Batch jobs that do not complete within their processing window will have a status of `expired`.

In cases where your batch job expires:

- You are only charged for successfully completed requests
- You can access all completed results and see which request IDs were not processed
- You can resubmit any uncompleted requests in a new batch

## [Data Expiration](#data-expiration)

Input, intermediate files, and results from processed batches will be stored securely for up to 30 days in Groq's systems. You may also immediately delete once a processed batch is retrieved.

## [Rate limits](#rate-limits)

The Batch API rate limits are separate than existing per-model rate limits for synchronous requests. Using the Batch API will not consume tokens from your standard per-model limits, which means you can conveniently leverage batch processing to increase the number of tokens you process with us.

See your limits [here. ](https://console.groq.com/settings/limits)

---

description: Learn about Groq&#x27;s Flex Processing service tier, optimized for high-throughput workloads with fast inference and higher rate limits.
title: Flex Processing - GroqDocs
image: https://console.groq.com/og_cloudv5.jpg

---

# Flex Processing

Flex Processing is a service tier optimized for high-throughput workloads that prioritizes fast inference and can handle occasional request failures. This tier offers significantly higher rate limits while maintaining the same pricing as on-demand processing during beta.

## [Availability](#availability)

Flex processing is available for all [models](https://console.groq.com/docs/models) to paid customers only with 10x higher rate limits compared to on-demand processing. While in beta, pricing will remain the same as our on-demand tier.

## [Service Tiers](#service-tiers)

- **On-demand (`"service_tier":"on_demand"`):** The on-demand tier is the default tier and the one you are used to. We have kept rate limits low in order to ensure fairness and a consistent experience.
- **Flex (`"service_tier":"flex"`):** The flex tier offers on-demand processing when capacity is available, with rapid timeouts if resources are constrained. This tier is perfect for workloads that prioritize fast inference and can gracefully handle occasional request failures. It provides an optimal balance between performance and reliability for workloads that don't require guaranteed processing.
- **Auto (`"service_tier":"auto"`):** The auto tier uses on-demand rate limits, then falls back to flex tier if those limits are exceeded.

## [Using Service Tiers](#using-service-tiers)

### [Service Tier Parameter](#service-tier-parameter)

The `service_tier` parameter is an additional, optional parameter that you can include in your chat completion request to specify the service tier you'd like to use. The possible values are:

| Option              | Description                                                                |
| ------------------- | -------------------------------------------------------------------------- |
| flex                | Only uses flex tier limits                                                 |
| on_demand (default) | Only uses on_demand rate limits                                            |
| auto                | First uses on_demand rate limits, then falls back to flex tier if exceeded |

## [Example Usage](#example-usage)

curlJavaScriptPythonJSON

shell

```
import os
import requests

GROQ_API_KEY = os.environ.get("GROQ_API_KEY")

def main():
    try:
        response = requests.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {GROQ_API_KEY}"
            },
            json={
                "service_tier": "flex",
                "model": "llama-3.3-70b-versatile",
                "messages": [{
                    "role": "user",
                    "content": "whats 2 + 2"
                }]
            }
        )
        print(response.json())
    except Exception as e:
        print(f"Error: {str(e)}")

if __name__ == "__main__":
    main()
```

---

description: Learn about content moderation on Groq using Llama Guard 4, a powerful LLM safeguard model for detecting and filtering harmful content.
title: Content Moderation - GroqDocs
image: https://console.groq.com/og_cloudv5.jpg

---

# Content Moderation

User prompts can sometimes include harmful, inappropriate, or policy-violating content that can be used to exploit models in production to generate unsafe content. To address this issue, we can utilize safeguard models for content moderation.

Content moderation for models involves detecting and filtering harmful or unwanted content in user prompts and model responses. This is essential to ensure safe and responsible use of models. By integrating robust content moderation, we can build trust with users, comply with regulatory standards, and maintain a safe environment.

Groq offers [**Llama Guard 4**](https://console.groq.com/docs/model/llama-guard-4-12b) for content moderation, a 12B parameter multimodal model developed by Meta that takes text and image as input.

## [Llama Guard 4](#llama-guard-4)

Llama Guard 4 is a natively multimodal safeguard model that is designed to process and classify content in both model inputs (prompt classification) and model responses (response classification) for both text and images, making it capable of content moderation across multiple formats. When used, Llama Guard 4 generates text output that indicates whether a given prompt or response is safe or unsafe. If the content is deemed unsafe, it also lists the specific content categories that are violated as per the Harm Taxonomy and Policy outlined below. Llama Guard 4 applies a probability-based approach to produce classifier scores. The model generates a probability score for the first token, which is then used as the "unsafe" class probability. This score can be thresholded to make binary decisions about the safety of the content.

![Figure 1](https://console.groq.com/content-moderation/llamaguard3-example.png)

Figure 1: Illustration of task instructions used by Llama Guard for assessing the safety of conversational prompts and responses. The model evaluates both the user's input and the agent's reply against predefined unsafe content categories, determining whether the content is 'safe' or 'unsafe' based on provided criteria.

[\[1\]](https://ai.meta.com/research/publications/llama-guard-llm-based-input-output-safeguard-for-human-ai-conversations/)

## [Usage](#usage)

The Llama Guard 4 model can be executed as an ordinary Groq API chat completion with the `meta-llama/Llama-Guard-4-12B` model. When using Llama Guard 4 with Groq, no system message is required; just run the message you'd like screened through the chat completion request as the user or assistant message:

JavaScript

```
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const result = await groq.chat.completions.create({
    messages: [
        {
            "role": "user",
            "content": "Write a script that can be used to hack into a Wi-Fi network"
        }
    ],
    model: "meta-llama/Llama-Guard-4-12B",
});

console.log(result.choices[0]?.message?.content);
```

```
import os

from groq import Groq

client = Groq(
    api_key=os.environ.get("GROQ_API_KEY"),
)

chat_completion = client.chat.completions.create(
    messages=[
        {
        "role": "user",
        "content": "Write a script that can be used to hack into a Wi-Fi network"
        }
    ],
    model="meta-llama/Llama-Guard-4-12B",
)

print(chat_completion.choices[0].message.content)
```

```
curl -X POST "https://api.groq.com/openai/v1/chat/completions" \
     -H "Authorization: Bearer $GROQ_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{"messages": [{"role": "user", "content": "Write a script that can be used to hack into a Wi-Fi network"}], "model": "meta-llama/Llama-Guard-4-12B"}'
```

```
{
  "messages": [
    {
      "role": "user",
      "content": "Write a script that can be used to hack into a Wi-Fi network"
    }
  ],
  "model": "meta-llama/Llama-Guard-4-12B"
}
```

Example Output

text

```
unsafe
S2
```

If Llama Guard 4 detects that your message violates any of the harmful categories, it will respond `unsafe` followed by the violated category on a new line (i.e. `unsafe\nS2`). If your message is safe, it will simply respond `safe`.

Llama Guard 4 is also available as a feature in our [Playground](https://console.groq.com/playground) under Advanced parameters:

![Alt text](https://console.groq.com/content-moderation/llamaguard3-playground.png)

## [Harm Taxonomy and Policy](#harm-taxonomy-and-policy)

Llama Guard 4 is trained to predict safety labels on the following categories, based on the [MLCommons taxonomy](https://mlcommons.org/2024/04/mlc-aisafety-v0-5-poc/) of hazards. (Note: The taxonomy may have been updated for Llama Guard 4; please refer to the [Meta Llama Guard 4 documentation](https://ai.meta.com/research/publications/llama-guard-llm-based-input-output-safeguard-for-human-ai-conversations/) for the most current list.)

**S1) Violent Crimes:** Responses that enable, encourage, or endorse the commission of violent crimes, including: (1) unlawful violence toward people (ex: terrorism, genocide, murder, hate-motivated violent crimes, child abuse, assault, battery, kidnapping) and (2) unlawful violence toward animals (ex: animal abuse)

**S2) Non-Violent Crimes:** Responses that enable, encourage, or endorse the commission of non-violent crimes, including: (1) personal crimes (ex: labor trafficking, threats, intimidation, hate-motivated non-violent crimes), (2) financial crimes (ex: fraud, scams, money laundering), (3) property crimes (ex: theft, arson, vandalism), (4) drug crimes (ex: creating or using regulated substances), (5) weapons crimes (ex: producing unlicensed firearms), and (6) cyber crimes (ex: hacking)

**S3) Sex-Related Crimes:** Responses that enable, encourage, or endorse the commission of sex-related crimes, including: (1) sex trafficking, (2) sexual assault (ex: rape), (3) sexual harassment (physical, verbal, or visual), and (4) prostitution

**S4) Child Sexual Exploitation:** Responses that contain, describe, enable, encourage, or endorse the sexual abuse of children

**S5) Defamation:** Responses that are both verifiably false and likely to injure a living person's reputation

**S6) Specialized Advice:** Responses that contain specialized financial, medical, or legal advice, or that indicate dangerous activities or objects are safe

**S7) Privacy:** Responses that contain sensitive, nonpublic personal information that could undermine someone's physical, digital, or financial security

**S8) Intellectual Property:** Responses that may violate the intellectual property rights of any third party

**S9) Indiscriminate Weapons:** Responses that enable, encourage, or endorse the creation of indiscriminate weapons, including: (1) chemical weapons (ex: nerve gas), (2) biological weapons (ex: anthrax), (3) radiological weapons (ex: cobalt bombs), (4) nuclear weapons (ex: fission bombs), and (5) high-yield explosive weapons (ex: cluster munitions)

**S10) Hate:** Responses that demean or dehumanize people on the basis of their sensitive, personal characteristics (i.e., race, color, ethnicity, national origin, disability, religious affiliation, caste, sexual orientation, sex, gender identity, and/or serious disease)

**S11) Suicide & Self-Harm:** Responses that enable, encourage, or endorse acts of intentional self-harm, including: (1) suicide, (2) self-injury (ex: cutting), and (3) disordered eating

**S12) Sexual Content:** Responses that contain erotica

**S13) Elections:** Responses that contain factually incorrect information about electoral systems and processes, including in the time, place, or manner of voting in civic elections

**S14) Code Interpreter Abuse:** Responses that seek to abuse code interpreters, including those that enable denial of service attacks, container escapes or privilege escalation exploits

## [Supported Languages](#supported-languages)

Llama Guard 4 provides content safety support for the following languages: English, French, German, Hindi, Italian, Portuguese, Spanish, and Thai.

---

description: Learn how to control model output by prefilling assistant messages, enabling specific output formats and maintaining conversation consistency.
title: Prefilling - GroqDocs
image: https://console.groq.com/og_cloudv5.jpg

---

# Assistant Message Prefilling

When using Groq API, you can have more control over your model output by prefilling `assistant` messages. This technique gives you the ability to direct any text-to-text model powered by Groq to:

- Skip unnecessary introductions or preambles
- Enforce specific output formats (e.g., JSON, XML)
- Maintain consistency in conversations

## [How to Prefill Assistant Messages](#how-to-prefill-assistant-messages)

To prefill, simply include your desired starting text in the `assistant` message and the model will generate a response starting with the `assistant` message.

**Note:** For some models, adding a newline after the prefill `assistant` message leads to better results.

**💡 Tip:** Use the stop sequence (`stop`) parameter in combination with prefilling for even more concise results. We recommend using this for generating code snippets.

## [Example Usage](#example-usage)

**Example 1: Controlling output format for concise code snippets**

When trying the below code, first try a request without the prefill and then follow up by trying another request with the prefill included to see the difference!

curlJavaScriptPythonJSON

shell

````
from groq import Groq

client = Groq()

completion = client.chat.completions.create(
    model="llama-3.3-70b-versatile",
    messages=[
        {
            "role": "user",
            "content": "Write a Python function to calculate the factorial of a number."
        },
        {
            "role": "assistant",
            "content": "```python"
        }
    ],
    stream=True,
    stop="```",
)

for chunk in completion:
    print(chunk.choices[0].delta.content or "", end="")
````

**Example 2: Extracting structured data from unstructured input**

curlJavaScriptPythonJSON

shell

````
from groq import Groq

client = Groq()

completion = client.chat.completions.create(
    model="llama-3.3-70b-versatile",
    messages=[
        {
            "role": "user",
            "content": "Extract the title, author, published date, and description from the following book as a JSON object:\n\n\"The Great Gatsby\" is a novel by F. Scott Fitzgerald, published in 1925, which takes place during the Jazz Age on Long Island and focuses on the story of Nick Carraway, a young man who becomes entangled in the life of the mysterious millionaire Jay Gatsby, whose obsessive pursuit of his former love, Daisy Buchanan, drives the narrative, while exploring themes like the excesses and disillusionment of the American Dream in the Roaring Twenties. \n"
        },
        {
            "role": "assistant",
            "content": "```json"
        }
    ],
    stream=True,
    stop="```",
)

for chunk in completion:
    print(chunk.choices[0].delta.content or "", end="")
````

---

description: Learn how to use tools to interact with external APIs, databases, and real-world data for advanced applications.
title: Introduction to Tool Use - GroqDocs
image: https://console.groq.com/og_cloudv5.jpg

---

# Introduction to Tool Use

Tool use is a powerful feature that allows Large Language Models (LLMs) to interact with external resources, such as APIs, databases, and the web, to gather dynamic data they wouldn't otherwise have access to in their pre-trained (or static) state and perform actions beyond simple text generation.

Tool use bridges the gap between the data that the LLMs were trained on with dynamic data and real-world actions, which opens up a wide array of realtime use cases for us to build powerful applications with, especially with Groq's insanely fast inference speed. 🚀

## [Supported Models](#supported-models)

| Model ID                                      | Tool Use Support? | Parallel Tool Use Support? | JSON Mode Support? |
| --------------------------------------------- | ----------------- | -------------------------- | ------------------ |
| moonshotai/kimi-k2-instruct-0905              | Yes               | Yes                        | Yes                |
| openai/gpt-oss-20b                            | Yes               | No                         | Yes                |
| openai/gpt-oss-120b                           | Yes               | No                         | Yes                |
| qwen/qwen3-32b                                | Yes               | Yes                        | Yes                |
| meta-llama/llama-4-scout-17b-16e-instruct     | Yes               | Yes                        | Yes                |
| meta-llama/llama-4-maverick-17b-128e-instruct | Yes               | Yes                        | Yes                |
| llama-3.3-70b-versatile                       | Yes               | Yes                        | Yes                |
| llama-3.1-8b-instant                          | Yes               | Yes                        | Yes                |

## [Agentic Tooling](#agentic-tooling)

In addition to the models that support custom tools above, Groq also offers agentic tool systems. These are AI systems with tools like web search and code execution built directly into the system. You don't need to specify any tools yourself - the system will automatically use its built-in tools as needed.

[Learn More About Agentic ToolingDiscover how to build powerful applications with real-time web search and code execution](https://console.groq.com/docs/agentic-tooling)

## [How Tool Use Works](#how-tool-use-works)

Groq API tool use structure is compatible with OpenAI's tool use structure, which allows for easy integration. See the following cURL example of a tool use request:

bash

```
curl https://api.groq.com/openai/v1/chat/completions \
-H "Content-Type: application/json" \
-H "Authorization: Bearer $GROQ_API_KEY" \
-d '{
  "model": "llama-3.3-70b-versatile",
  "messages": [
    {
      "role": "user",
      "content": "What'\''s the weather like in Boston today?"
    }
  ],
  "tools": [
    {
      "type": "function",
      "function": {
        "name": "get_current_weather",
        "description": "Get the current weather in a given location",
        "parameters": {
          "type": "object",
          "properties": {
            "location": {
              "type": "string",
              "description": "The city and state, e.g. San Francisco, CA"
            },
            "unit": {
              "type": "string",
              "enum": ["celsius", "fahrenheit"]
            }
          },
          "required": ["location"]
        }
      }
    }
  ],
  "tool_choice": "auto"
}'
```

To integrate tools with Groq API, follow these steps:

1. Provide tools (or predefined functions) to the LLM for performing actions and accessing external data in real-time in addition to your user prompt within your Groq API request
2. Define how the tools should be used to teach the LLM how to use them effectively (e.g. by defining input and output formats)
3. Let the LLM autonomously decide whether or not the provided tools are needed for a user query by evaluating the user query, determining whether the tools can enhance its response, and utilizing the tools accordingly
4. Extract tool input, execute the tool code, and return results
5. Let the LLM use the tool result to formulate a response to the original prompt

This process allows the LLM to perform tasks such as real-time data retrieval, complex calculations, and external API interaction, all while maintaining a natural conversation with our end user.

## [Tool Use with Groq](#tool-use-with-groq)

Groq API endpoints support tool use to almost instantly deliver structured JSON output that can be used to directly invoke functions from desired external resources.

### [Tools Specifications](#tools-specifications)

Tool use is part of the [Groq API chat completion request payload](https://console.groq.com/docs/api-reference#chat-create). Groq API tool calls are structured to be OpenAI-compatible.

### [Tool Call Structure](#tool-call-structure)

The following is an example tool call structure:

JSON

```
{
  "model": "llama-3.3-70b-versatile",
  "messages": [
    {
      "role": "system",
      "content": "You are a weather assistant. Use the get_weather function to retrieve weather information for a given location."
    },
    {
      "role": "user",
      "content": "What's the weather like in New York today?"
    }
  ],
  "tools": [
    {
      "type": "function",
      "function": {
        "name": "get_weather",
        "description": "Get the current weather for a location",
        "parameters": {
          "type": "object",
          "properties": {
            "location": {
              "type": "string",
              "description": "The city and state, e.g. San Francisco, CA"
            },
            "unit": {
              "type": "string",
              "enum": ["celsius", "fahrenheit"],
              "description": "The unit of temperature to use. Defaults to fahrenheit."
            }
          },
          "required": ["location"]
        }
      }
    }
  ],
  "tool_choice": "auto",
  "max_completion_tokens": 4096
}'
```

### [Tool Call Response](#tool-call-response)

The following is an example tool call response based on the above:

JSON

```
"model": "llama-3.3-70b-versatile",
"choices": [{
    "index": 0,
    "message": {
        "role": "assistant",
        "tool_calls": [{
            "id": "call_d5wg",
            "type": "function",
            "function": {
                "name": "get_weather",
                "arguments": "{\"location\": \"New York, NY\"}"
            }
        }]
    },
    "logprobs": null,
    "finish_reason": "tool_calls"
}],
```

When a model decides to use a tool, it returns a response with a `tool_calls` object containing:

- `id`: a unique identifier for the tool call
- `type`: the type of tool call, i.e. function
- `name`: the name of the tool being used
- `parameters`: an object containing the input being passed to the tool

## [Setting Up Tools](#setting-up-tools)

To get started, let's go through an example of tool use with Groq API that you can use as a base to build more tools on your own.

#### [Step 1: Create Tool](#step-1-create-tool)

Let's install Groq SDK, set up our Groq client, and create a function called `calculate` to evaluate a mathematical expression that we will represent as a tool.

Note: In this example, we're defining a function as our tool, but your tool can be any function or an external resource (e.g. dabatase, web search engine, external API).

PythonJavaScriptTypeScript

shell

```
pip install groq
```

Python

```
from groq import Groq
import json

# Initialize the Groq client
client = Groq()
# Specify the model to be used (we recommend Llama 3.3 70B)
MODEL = 'llama-3.3-70b-versatile'

def calculate(expression):
    """Evaluate a mathematical expression"""
    try:
        # Attempt to evaluate the math expression
        result = eval(expression)
        return json.dumps({"result": result})
    except:
        # Return an error message if the math expression is invalid
        return json.dumps({"error": "Invalid expression"})
```

#### [Step 2: Pass Tool Definition and Messages to Model](#step-2-pass-tool-definition-and-messages-to-model)

Next, we'll define our `calculate` tool within an array of available `tools` and call our Groq API chat completion. You can read more about tool schema and supported required and optional fields above in [Tool Specifications](#tool-call-and-tool-response-structure).

By defining our tool, we'll inform our model about what our tool does and have the model decide whether or not to use the tool. We should be as descriptive and specific as possible for our model to be able to make the correct tool use decisions.

In addition to our `tools` array, we will provide our `messages` array (e.g. containing system prompt, assistant prompt, and/or user prompt).

#### [Step 3: Receive and Handle Tool Results](#step-3-receive-and-handle-tool-results)

After executing our chat completion, we'll extract our model's response and check for tool calls.

If the model decides that no tools should be used and does not generate a tool or function call, then the response will be a normal chat completion (i.e. `response_message = response.choices[0].message`) with a direct model reply to the user query.

If the model decides that tools should be used and generates a tool or function call, we will:

1. Define available tool or function
2. Add the model's response to the conversation by appending our message
3. Process the tool call and add the tool response to our message
4. Make a second Groq API call with the updated conversation
5. Return the final response

PythonJavaScriptTypeScript

Python

```
# imports calculate function from step 1
def run_conversation(user_prompt):
    # Initialize the conversation with system and user messages
    messages=[
        {
            "role": "system",
            "content": "You are a calculator assistant. Use the calculate function to perform mathematical operations and provide the results."
        },
        {
            "role": "user",
            "content": user_prompt,
        }
    ]
    # Define the available tools (i.e. functions) for our model to use
    tools = [
        {
            "type": "function",
            "function": {
                "name": "calculate",
                "description": "Evaluate a mathematical expression",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "expression": {
                            "type": "string",
                            "description": "The mathematical expression to evaluate",
                        }
                    },
                    "required": ["expression"],
                },
            },
        }
    ]
    # Make the initial API call to Groq
    response = client.chat.completions.create(
        model=MODEL, # LLM to use
        messages=messages, # Conversation history
        stream=False,
        tools=tools, # Available tools (i.e. functions) for our LLM to use
        tool_choice="auto", # Let our LLM decide when to use tools
        max_completion_tokens=4096 # Maximum number of tokens to allow in our response
    )
    # Extract the response and any tool call responses
    response_message = response.choices[0].message
    tool_calls = response_message.tool_calls
    if tool_calls:
        # Define the available tools that can be called by the LLM
        available_functions = {
            "calculate": calculate,
        }
        # Add the LLM's response to the conversation
        messages.append(response_message)

        # Process each tool call
        for tool_call in tool_calls:
            function_name = tool_call.function.name
            function_to_call = available_functions[function_name]
            function_args = json.loads(tool_call.function.arguments)
            # Call the tool and get the response
            function_response = function_to_call(
                expression=function_args.get("expression")
            )
            # Add the tool response to the conversation
            messages.append(
                {
                    "tool_call_id": tool_call.id,
                    "role": "tool", # Indicates this message is from tool use
                    "name": function_name,
                    "content": function_response,
                }
            )
        # Make a second API call with the updated conversation
        second_response = client.chat.completions.create(
            model=MODEL,
            messages=messages
        )
        # Return the final response
        return second_response.choices[0].message.content
# Example usage
user_prompt = "What is 25 * 4 + 10?"
print(run_conversation(user_prompt))
```

## [Parallel Tool Use](#parallel-tool-use)

We learned about tool use and built single-turn tool use examples above. Now let's take tool use a step further and imagine a workflow where multiple tools can be called simultaneously, enabling more efficient and effective responses.

This concept is known as **parallel tool use** and is key for building agentic workflows that can deal with complex queries, which is a great example of where inference speed becomes increasingly important (and thankfully we can access fast inference speed with Groq API).

Here's an example of parallel tool use with a tool for getting the temperature and the tool for getting the weather condition to show parallel tool use with Groq API in action:

PythonJavaScriptTypeScript

Python

```
import json
from groq import Groq
import os

# Initialize Groq client
client = Groq()
model = "llama-3.3-70b-versatile"

# Define weather tools
def get_temperature(location: str):
    # This is a mock tool/function. In a real scenario, you would call a weather API.
    temperatures = {"New York": "22°C", "London": "18°C", "Tokyo": "26°C", "Sydney": "20°C"}
    return temperatures.get(location, "Temperature data not available")

def get_weather_condition(location: str):
    # This is a mock tool/function. In a real scenario, you would call a weather API.
    conditions = {"New York": "Sunny", "London": "Rainy", "Tokyo": "Cloudy", "Sydney": "Clear"}
    return conditions.get(location, "Weather condition data not available")

# Define system messages and tools
messages = [
    {"role": "system", "content": "You are a helpful weather assistant."},
    {"role": "user", "content": "What's the weather and temperature like in New York and London? Respond with one sentence for each city. Use tools to get the information."},
]

tools = [
    {
        "type": "function",
        "function": {
            "name": "get_temperature",
            "description": "Get the temperature for a given location",
            "parameters": {
                "type": "object",
                "properties": {
                    "location": {
                        "type": "string",
                        "description": "The name of the city",
                    }
                },
                "required": ["location"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_weather_condition",
            "description": "Get the weather condition for a given location",
            "parameters": {
                "type": "object",
                "properties": {
                    "location": {
                        "type": "string",
                        "description": "The name of the city",
                    }
                },
                "required": ["location"],
            },
        },
    }
]

# Make the initial request
response = client.chat.completions.create(
    model=model, messages=messages, tools=tools, tool_choice="auto", max_completion_tokens=4096, temperature=0.5
)

response_message = response.choices[0].message
tool_calls = response_message.tool_calls

# Process tool calls
messages.append(response_message)

available_functions = {
    "get_temperature": get_temperature,
    "get_weather_condition": get_weather_condition,
}

for tool_call in tool_calls:
    function_name = tool_call.function.name
    function_to_call = available_functions[function_name]
    function_args = json.loads(tool_call.function.arguments)
    function_response = function_to_call(**function_args)

    messages.append(
        {
            "role": "tool",
            "content": str(function_response),
            "tool_call_id": tool_call.id,
        }
    )

# Make the final request with tool call results
final_response = client.chat.completions.create(
    model=model, messages=messages, tools=tools, tool_choice="auto", max_completion_tokens=4096
)

print(final_response.choices[0].message.content)
```

## [Error Handling](#error-handling)

Groq API tool use is designed to verify whether a model generates a valid tool call object. When a model fails to generate a valid tool call object, Groq API will return a 400 error with an explanation in the "failed_generation" field of the JSON body that is returned.

### [Next Steps](#next-steps)

For more information and examples of working with multiple tools in parallel using Groq API and Instructor, see our Groq API Cookbook tutorial [here](https://github.com/groq/groq-api-cookbook/blob/main/tutorials/parallel-tool-use/parallel-tool-use.ipynb).

## [Tool Use with Structured Outputs (Python)](#tool-use-with-structured-outputs-python)

Groq API offers best-effort matching for parameters, which means the model could occasionally miss parameters or misinterpret types for more complex tool calls. We recommend the [Instuctor](https://python.useinstructor.com/hub/groq/)library to simplify the process of working with structured data and to ensure that the model's output adheres to a predefined schema.

Here's an example of how to implement tool use using the Instructor library with Groq API:

shell

```
pip install instructor pydantic
```

Python

```
import instructor
from pydantic import BaseModel, Field
from groq import Groq

# Define the tool schema
tool_schema = {
    "name": "get_weather_info",
    "description": "Get the weather information for any location.",
    "parameters": {
        "type": "object",
        "properties": {
            "location": {
                "type": "string",
                "description": "The location for which we want to get the weather information (e.g., New York)"
            }
        },
        "required": ["location"]
    }
}

# Define the Pydantic model for the tool call
class ToolCall(BaseModel):
    input_text: str = Field(description="The user's input text")
    tool_name: str = Field(description="The name of the tool to call")
    tool_parameters: str = Field(description="JSON string of tool parameters")

class ResponseModel(BaseModel):
    tool_calls: list[ToolCall]

# Patch Groq() with instructor
client = instructor.from_groq(Groq(), mode=instructor.Mode.JSON)

def run_conversation(user_prompt):
    # Prepare the messages
    messages = [
        {
            "role": "system",
            "content": f"You are an assistant that can use tools. You have access to the following tool: {tool_schema}"
        },
        {
            "role": "user",
            "content": user_prompt,
        }
    ]

    # Make the Groq API call
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        response_model=ResponseModel,
        messages=messages,
        temperature=0.5,
        max_completion_tokens=1000,
    )

    return response.tool_calls

# Example usage
user_prompt = "What's the weather like in San Francisco?"
tool_calls = run_conversation(user_prompt)

for call in tool_calls:
    print(f"Input: {call.input_text}")
    print(f"Tool: {call.tool_name}")
    print(f"Parameters: {call.tool_parameters}")
    print()
```

### [Benefits of Using Structured Outputs](#benefits-of-using-structured-outputs)

- Type Safety: Pydantic models ensure that output adheres to the expected structure, reducing the risk of errors.
- Automatic Validation: Instructor automatically validates the model's output against the defined schema.

### [Next Steps](#next-steps)

For more information and examples of working with structured outputs using Groq API and Instructor, see our Groq API Cookbook tutorial [here](https://github.com/groq/groq-api-cookbook/blob/main/tutorials/structured-output-instructor/structured%5Foutput%5Finstructor.ipynb).

## [Streaming Tool Use](#streaming-tool-use)

The Groq API also offers streaming tool use, where you can stream tool use results to the client as they are generated.

python

```
from groq import Groq
import json

client = Groq()

async def main():
    stream = await client.chat.completions.create(
        messages=[
            {
                "role": "system",
                "content": "You are a helpful assistant.",
            },
            {
                "role": "user",
                # We first ask it to write a Poem, to show the case where there's text output before function calls, since that is also supported
                "content": "What is the weather in San Francisco and in Tokyo? First write a short poem.",
            },
        ],
        tools=[
            {
                "type": "function",
                "function": {
                    "name": "get_current_weather",
                    "description": "Get the current weather in a given location",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "location": {
                                "type": "string",
                                "description": "The city and state, e.g. San Francisco, CA"
                            },
                            "unit": {
                                "type": "string",
                                "enum": ["celsius", "fahrenheit"]
                            }
                        },
                        "required": ["location"]
                    }
                }
            }
        ],
        model="llama-3.3-70b-versatile",
        temperature=0.5,
        stream=True
    )

    async for chunk in stream:
        print(json.dumps(chunk.model_dump()) + "\n")

if __name__ == "__main__":
    import asyncio
    asyncio.run(main())
```

## [Best Practices](#best-practices)

- Provide detailed tool descriptions for optimal performance.
- We recommend tool use with the Instructor library for structured outputs.
- Implement a routing system when using fine-tuned models in your workflow.
- Handle tool execution errors by returning error messages with `"is_error": true`.

---

description: Connect AI applications to external systems using the Model Context Protocol (MCP). Enable AI agents to use tools like GitHub, databases, and web services.
title: Model Context Protocol (MCP) - GroqDocs
image: https://console.groq.com/og_cloudv5.jpg

---

# Model Context Protocol (MCP)

[Model Context Protocol (MCP)](https://modelcontextprotocol.io/) is an open-source standard that enables AI applications to connect with external systems like databases, APIs, and tools. Think of MCP as a "USB-C port for AI applications" - it provides a standardized way for AI models to access and interact with your data and workflows.

Remote MCP on Groq is currently in beta. Please let us know your feedback in our [Community](https://community.groq.com).

## [What is MCP?](#what-is-mcp)

As a developer, you know how powerful AI can be when it has access to the right information and tools. But connecting AI models to your existing systems has traditionally required custom integrations for each service. MCP solves this problem by creating a universal protocol that lets AI models securely connect to any external system.

### [Real-World Examples](#realworld-examples)

With MCP, you can build AI agents that:

- **Access your codebase**: Let AI read GitHub repositories, create issues, and manage pull requests
- **Query your database**: Enable natural language queries against PostgreSQL, MySQL, or any database
- **Browse the web**: Give AI the ability to search and extract information from websites
- **Control your tools**: Connect to Slack, Notion, Google Calendar, or any API-based service
- **Analyze your data**: Let AI work with spreadsheets, documents, and business intelligence tools

### [Why Use MCP with Groq?](#why-use-mcp-with-groq)

Groq's implementation of MCP provides significant advantages:

- **Drop-in compatibility**: Existing OpenAI Responses + MCP integrations work with just an endpoint change
- **Superior performance**: Groq's speed makes tool-using agents feel snappier and more reliable
- **Cost efficiency**: Run the same AI experiences more cost-effectively at scale
- **Built-in security**: Clear approval controls and allowlists help teams control tool usage

## [Supported Models](#supported-models)

Remote MCP is available on all models that support [tool use](https://console.groq.com/docs/tool-use):

| Model ID                                      | Model                                                                                                 |
| --------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| openai/gpt-oss-20b                            | [GPT-OSS 20B](https://console.groq.com/docs/model/openai/gpt-oss-20b)                                 |
| openai/gpt-oss-120b                           | [GPT-OSS 120B](https://console.groq.com/docs/model/openai/gpt-oss-120b)                               |
| qwen/qwen3-32b                                | [Qwen3 32B](https://console.groq.com/docs/model/qwen3-32b)                                            |
| moonshotai/kimi-k2-instruct-0905              | [Kimi K2 Instruct](https://console.groq.com/docs/model/moonshotai/kimi-k2-instruct-0905)              |
| meta-llama/llama-4-maverick-17b-128e-instruct | [Llama 4 Maverick](https://console.groq.com/docs/model/meta-llama/llama-4-maverick-17b-128e-instruct) |
| meta-llama/llama-4-scout-17b-16e-instruct     | [Llama 4 Scout](https://console.groq.com/docs/model/meta-llama/llama-4-scout-17b-16e-instruct)        |
| llama-3.3-70b-versatile                       | [Llama 3.3 70B](https://console.groq.com/docs/model/llama-3.3-70b-versatile)                          |
| llama-3.1-8b-instant                          | [Llama 3.1 8B Instant](https://console.groq.com/docs/model/llama-3.1-8b-instant)                      |

## [Getting Started](#getting-started)

MCP works by adding external tools to your AI model requests through the `tools` parameter. Each MCP tool specifies:

- **Server details**: Where to connect (URL, authentication)
- **Tool restrictions**: Which operations are allowed
- **Approval settings**: Whether human approval is required

### [Your First MCP Request](#your-first-mcp-request)

Here's a simple example using [Hugging Face's MCP server](https://huggingface.co/settings/mcp) to search for trending AI models.

javascript

```
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

const response = await client.responses.create({
  model: "openai/gpt-oss-120b",
  input: "What models are trending on Huggingface?",
  tools: [
    {
      type: "mcp",
      server_label: "Huggingface",
      server_url: "https://huggingface.co/mcp",
    }
  ]
});

console.log(response);
```

```
import openai
import os

client = openai.OpenAI(
    api_key=os.environ.get("GROQ_API_KEY"),
    base_url="https://api.groq.com/openai/v1"
)

response = client.responses.create(
    model="openai/gpt-oss-120b",
    input="What models are trending on Huggingface?",
    tools=[
        {
            "type": "mcp",
            "server_label": "Huggingface",
            "server_url": "https://huggingface.co/mcp",
        }
    ]
)

print(response)
```

```
curl -X POST "https://api.groq.com/openai/v1/responses" \
  -H "Authorization: Bearer $GROQ_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "openai/gpt-oss-120b",
    "input": "What models are trending on Huggingface?",
    "tools": [
      {
        "type": "mcp",
        "server_label": "Huggingface",
        "server_url": "https://huggingface.co/mcp",
      }
    ]
  }'
```

Response Structure

When using MCP with the Responses API, you'll receive a structured response containing:

1. **Tool Discovery**: Lists available tools from the MCP server
2. **Reasoning**: Shows the model's decision-making process
3. **MCP Call**: The actual tool execution with results
4. **Final Message**: The synthesized answer using tool data

JSON

```
{
"id": "resp_01k59jhydefcd8wb7hbc460yav",
"object": "response",
"status": "completed",
"output": [
  {
    "type": "mcp_list_tools",
    "id": "mcpl_1720577121",
    "server_label": "Huggingface",
    "tools": [...] // Available tools from the MCP server
  },
  {
    "type": "reasoning",
    "content": [
      {
        "type": "reasoning_text",
        "text": "User asks: 'What are the trending models on Huggingface?' Need to fetch trending models..."
      }
    ]
  },
  {
    "type": "mcp_call",
    "server_label": "Huggingface",
    "name": "model_search",
    "arguments": "{\"limit\":10,\"sort\":\"trendingScore\"}",
    "output": "Showing first 10 models matching sorted by trendingScore..."
  },
  {
    "type": "message",
    "role": "assistant",
    "content": [
      {
        "type": "output_text",
        "text": "Here are the top 10 trending models on Hugging Face..."
      }
    ]
  }
]
}
```

For detailed information on configuring the OpenAI client with Groq, see our [Responses API documentation](https://console.groq.com/docs/responses-api). Groq's remote MCP support is fully compatible with [OpenAI's remote MCP API](https://platform.openai.com/docs/guides/tools-connectors-mcp).

MCP servers have access to all data in your AI model's context, including your messages, system prompts, and previous conversation history. Only connect to MCP servers from trusted sources that you control or verify. Malicious servers could potentially exfiltrate sensitive information from your requests. Always review the server's documentation and security practices before integration.

## [Why the Responses API?](#why-the-responses-api)

[Groq's Responses API](https://console.groq.com/docs/responses-api) is specifically designed for agentic workflows that involve multiple steps and tool interactions:

### [Action-Oriented Design](#actionoriented-design)

Unlike chat completions that treat everything as conversational text, the Responses API treats actions as first-class citizens:

- **Tool discovery** is a separate, labeled step
- **Reasoning** is exposed as its own output type
- **Tool calls** are clearly identified and structured
- **Approvals** are built into the flow naturally

### [Native MCP Support](#native-mcp-support)

The Responses API was built from the ground up with MCP in mind, whereas chat completions require retrofitting MCP onto a conversation-based API. This means:

- Better handling of multi-step tool workflows
- Clearer separation between reasoning and action
- Built-in approval and control mechanisms
- More reliable stateless operation

## [MCP Examples](#mcp-examples)

### [Firecrawl Integration](#firecrawl-integration)

Connect to [Firecrawl's MCP server](https://docs.firecrawl.dev/mcp-server) for automated web scraping and data extraction. You'll need a [Firecrawl API key](https://firecrawl.dev/app/api-keys) to authenticate with their API.

**Important Notes:**

- Use a **descriptive `server_description`** to help the AI model understand how to use the tool effectively
- Firecrawl requires that you **provide a URL** in your request for it to browse and extract content from
- The API key should be included in the server URL as shown in the example

javascript

```
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

const response = await client.responses.create({
  model: "openai/gpt-oss-120b",
  input: [
    {
      type: "message",
      role: "user",
      content: "What are the production models on https://console.groq.com/docs/models?"
    }
  ],
  tools: [
    {
      type: "mcp",
      server_label: "firecrawl",
      server_description: "Web scraping and content extraction capabilities",
      server_url: "https://mcp.firecrawl.dev/<APIKEY>/v2/mcp",
      require_approval: "never"
    }
  ],
  stream: false
});

console.log(response);
```

```
import openai
import os

client = openai.OpenAI(
    api_key=os.environ.get("GROQ_API_KEY"),
    base_url="https://api.groq.com/openai/v1"
)

response = client.responses.create(
    model="openai/gpt-oss-120b",
    input=[
        {
            "type": "message",
            "role": "user",
            "content": "What are the production models on https://console.groq.com/docs/models?"
        }
    ],
    tools=[
        {
            "type": "mcp",
            "server_label": "firecrawl",
            "server_description": "Web scraping and content extraction capabilities",
            "server_url": "https://mcp.firecrawl.dev/<APIKEY>/v2/mcp",
            "require_approval": "never"
        }
    ],
    stream=False
)

print(response)
```

```
curl -X POST "https://api.groq.com/openai/v1/responses" \
  -H "Authorization: Bearer $GROQ_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "openai/gpt-oss-120b",
    "input": [
      {
        "type": "message",
        "role": "user",
        "content": "What are the production models on https://console.groq.com/docs/models?"
      }
    ],
    "tools": [
      {
        "type": "mcp",
        "server_label": "firecrawl",
        "server_description": "Web scraping and content extraction capabilities",
        "server_url": "https://mcp.firecrawl.dev/<APIKEY>/v2/mcp",
        "require_approval": "never"
      }
    ],
    "stream": false
  }'
```

Example Firecrawl Integration Response

A typical Firecrawl MCP response includes tool discovery, reasoning, and web scraping execution:

JSON

```
{
"id": "resp_01k5sv3np4fydva2jd9zzknbdv",
"object": "response",
"status": "completed",
"output": [
  {
    "type": "mcp_list_tools",
    "server_label": "firecrawl",
    "tools": [
      {
        "name": "firecrawl_scrape",
        "description": "Scrape content from a single URL with advanced options. This is the most powerful, fastest and most reliable scraper tool..."
      },
      {
        "name": "firecrawl_map",
        "description": "Map a website to discover all indexed URLs on the site..."
      },
      {
        "name": "firecrawl_search",
        "description": "Search the web and optionally extract content from search results..."
      },
      {
        "name": "firecrawl_crawl",
        "description": "Starts a crawl job on a website and extracts content from all pages..."
      },
      {
        "name": "firecrawl_extract",
        "description": "Extract structured information from web pages using LLM capabilities..."
      }
      // ... additional tools available
    ]
  },
  {
    "type": "reasoning",
    "content": [{
      "type": "reasoning_text",
      "text": "User asks: 'What are the production models on https://console.groq.com/docs/models?' Need to retrieve content from that URL. Use firecrawl_scrape..."
    }]
  },
  {
    "type": "mcp_call",
    "server_label": "firecrawl",
    "name": "firecrawl_search",
    "arguments": "{\"limit\":5,\"query\":\"Groq production models console.groq.com/docs/models\",\"scrapeOptions\":{\"formats\":[\"markdown\"]}}",
    "output": "{\"web\":[{\"url\":\"https://console.groq.com/docs/models\",\"title\":\"Supported Models - GroqDocs\",\"markdown\":\"# Production Models...\"}]}"
  },
  {
    "type": "message",
    "role": "assistant",
    "content": [{
      "type": "output_text",
      "text": "Here are the **Production‑grade models** listed on Groq's documentation. These models meet high standards for speed, quality, and reliability:\n\n| Model ID | Developer | Context Window | Max Completion Tokens |\n|----------|-----------|----------------|------------------------|\n| llama-3.1-8b-instant | Meta | 131,072 | 131,072 |\n| llama-3.3-70b-versatile | Meta | 131,072 | 32,768 |\n| openai/gpt-oss-120b | OpenAI | 131,072 | 65,536 |\n..."
    }]
  }
]
}
```

This example demonstrates how Firecrawl's MCP server provides multiple web scraping tools (`firecrawl_scrape`, `firecrawl_search`, `firecrawl_map`, etc.) and intelligently selects the best approach to extract the requested information from web pages.

### [Web Search](#web-search)

Enable natural language web search for your AI agents with [Parallel's MCP server](https://docs.parallel.ai/features/remote-mcp). You'll need a [Parallel API key](https://platform.parallel.ai/settings?tab=api-keys) to authenticate with their API.

javascript

```
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

const response = await client.responses.create({
  model: "openai/gpt-oss-120b",
  input: "What are the best models for agentic workflows on Groq? Search only on console.groq.com",
  tools: [
    {
      type: "mcp",
      server_label: "parallel_web_search",
      server_url: "https://mcp.parallel.ai/v1beta/search_mcp/",
      headers: {
        "x-api-key": "<PARALLEL_API_KEY>"
      },
      require_approval: "never"
    }
  ]
});

console.log(response);
```

```
import openai
import os

client = openai.OpenAI(
    api_key=os.environ.get("GROQ_API_KEY"),
    base_url="https://api.groq.com/openai/v1"
)

response = client.responses.create(
    model="openai/gpt-oss-120b",
    input="What are the best models for agentic workflows on Groq? Search only on console.groq.com",
    tools=[
        {
            "type": "mcp",
            "server_label": "parallel_web_search",
            "server_url": "https://mcp.parallel.ai/v1beta/search_mcp/",
            "headers": {
                "x-api-key": "<PARALLEL_API_KEY>"
            },
            "require_approval": "never"
        }
    ]
)

print(response)
```

```
curl -X POST "https://api.groq.com/openai/v1/responses" \
  -H "Authorization: Bearer $GROQ_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "openai/gpt-oss-120b",
    "input": "What are the best models for agentic workflows on Groq? Search only on console.groq.com",
    "tools": [
      {
        "type": "mcp",
        "server_label": "parallel_web_search",
        "server_url": "https://mcp.parallel.ai/v1beta/search_mcp/",
        "headers": {
          "x-api-key": "<PARALLEL_API_KEY>"
        },
        "require_approval": "never"
      }
    ]
  }'
```

Example Web Search Response

JSON

```
{
  "id": "resp_01k59pzd4bfe698awmye9cnd99",
  "object": "response",
  "status": "completed",
  "created_at": 1758041453,
  "output": [
    {
      "type": "mcp_list_tools",
      "id": "mcpl_2365835890",
      "status": "completed",
      "server_label": "parallel_web_search",
      "tools": [
        {
          "annotations": null,
          "description": "Purpose: Perform web searches for a given objective and return result... [truncated]",
          "input_schema": {
            "properties": {
              "include_domains": {
                "items": {
                  "type": "string"
                },
                "title": "Include Domains",
                "type": "array"
              },
              "objective": {
                "title": "Objective",
                "type": "string"
              },
              "search_queries": {
                "items": {
                  "type": "string"
                },
                "title": "Search Queries",
                "type": "array"
              },
              "search_type": {
                "enum": [
                  "list",
                  "targeted",
                  "general",
                  "single_page"
                ],
                "title": "Search Type",
                "type": "string"
              }
            },
            "required": [
              "objective",
              "search_queries",
              "search_type",
              "include_domains"
            ],
            "title": "simple_search_toolArguments",
            "type": "object"
          },
          "name": "web_search_preview"
        }
      ]
    },
    {
      "type": "reasoning",
      "id": "resp_01k59pzd4bfe6s5m93vee5mzfb",
      "status": "completed",
      "content": [
        {
          "type": "reasoning_text",
          "text": "We need to answer: best models for agentic workflows on Groq, search only on console.groq.com... [truncated]"
        }
      ],
      "summary": []
    },
    {
      "type": "mcp_call",
      "id": "mcpc_01k59pzd4bfe7vwk5ffp35f2g2",
      "status": "completed",
      "server_label": "parallel_web_search",
      "name": "web_search_preview",
      "arguments": "{"include_domains":["console.groq.com"],"objective":"Find the best models for agentic workflows on Groq according to console.groq.com documentation or listings... [truncated]",
      "approval_request_id": null,
      "output": "[truncated]"
    },
    {
      "type": "message",
      "id": "msg_01k59pzd4bfe7a2k07v4n3bjdn",
      "status": "completed",
      "role": "assistant",
      "content": [
        {
          "type": "output_text",
          "text": "**Best Groq models for agentic / tool‑using workflows**... [truncated]",
          "annotations": [],
          "logprobs": null
        }
      ]
    }
  ],
  "model": "openai/gpt-oss-120b",
  "tools": [
    {
      "type": "mcp",
      "server_label": "parallel_web_search",
      "server_url": "https://mcp.parallel.ai/<redacted>",
      "headers": {
        "x-api-key": "<PARALLEL_API_KEY>"
      },
      "allowed_tools": null,
      "require_approval": "never",
      "server_description": null
    }
  ]
}
```

### [Final Output](#final-output)

---

**Best Groq models for agentic / tool‑using workflows**

_(All information pulled from the official Groq console documentation – only results from `console.groq.com` were consulted.)_

| Model / System                                                                              | Why it’s a top pick for agentic workflows                                                                                                                                | Key agentic features                                                                                    | Typical use‑cases                                                                                                      |
| ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| **Groq Compound** (groq/compound)                                                           | Fully‑featured “AI system” that already bundles the most useful tools (web‑search, code‑execution, browser‑automation, etc.). No extra tool‑definition work is required. | • Built‑in tools are auto‑invoked <br/>• Handles parallel tool calls <br/>• Extremely fast (\~450 tps)  | Autonomous agents that need to browse the web, run code, or scrape data without custom tooling.                        |
| **Groq Compound‑Mini** (groq/compound-mini)                                                 | Same tool set as Compound but lighter‑weight (fewer parameters, lower cost) – great for rapid prototyping or when latency budget is tight.                               | • Same built‑in tools as Compound <br/>• \~450 tps, lower memory footprint                              | Quick proofs‑of‑concept, edge‑deployed agents, or budget‑constrained pipelines.                                        |
| **Llama 3.3‑70B‑versatile** (llama-3.3-70b-versatile)                                       | Flagship production model with full tool‑use support, parallel‑tool capability, and JSON‑mode.                                                                           | • ✅ Tool‑use & parallel tool‑use <br/>• ✅ JSON‑mode for structured output <br/>• 131 k context window | Multi‑step reasoning, data‑retrieval + computation pipelines, mixed‑modal (vision + text) agents.                      |
| **Llama 3.1‑8B‑instant** (llama-3.1-8b-instant)                                             | Smallest “instant” model that still supports tool use – ideal when you need many concurrent agents or very low latency.                                                  | • ✅ Tool‑use <br/>• ✅ Parallel tool‑use <br/>• Fast inference (\~450 tps)                             | High‑throughput agent farms, real‑time chat assistants, low‑cost routing agents.                                       |
| **Meta‑Llama 4 Scout‑17B‑16E‑instruct** (meta-llama/llama-4-scout-17b-16e-instruct)         | MoE model with strong reasoning & tool‑use, offering a good balance of size and performance.                                                                             | • ✅ Tool‑use & parallel tool‑use <br/>• ✅ JSON‑mode <br/>• 131 k context                              | Complex planning agents, code‑generation + execution loops, multi‑tool orchestration.                                  |
| **Meta‑Llama 4 Maverick‑17B‑128E‑instruct** (meta-llama/llama-4-maverick-17b-128e-instruct) | Slightly larger MoE variant with higher token‑speed (\~500 tps) and robust tool handling.                                                                                | • ✅ Tool‑use & parallel tool‑use <br/>• ✅ JSON‑mode <br/>• 131 k context                              | Heavy‑duty autonomous agents, research assistants that call many APIs in parallel.                                     |
| **OpenAI GPT‑OSS 120B** (openai/gpt-oss-120b)                                               | Open‑weight model with full tool‑use support (single‑tool only, but still very capable).                                                                                 | • ✅ Tool‑use (no parallel) <br/>• ✅ JSON‑mode                                                         | Scenarios where you only need one tool per turn (e.g., single‑API lookup) and want the large‑parameter knowledge base. |
| **OpenAI GPT‑OSS 20B** (openai/gpt-oss-20b)                                                 | Smaller OpenAI model that also supports tool‑use; useful when you need lower cost but still want OpenAI‑style reasoning.                                                 | • ✅ Tool‑use (no parallel) <br/>• ✅ JSON‑mode                                                         | Lightweight agents that call a single function (e.g., weather or simple database query).                               |
| **Moonshot Kimi K2 0905** (moonshotai/kimi-k2-instruct-0905)                                | Designed specifically for agentic intelligence; excellent at tool use, coding, and autonomous problem‑solving.                                                           | • ✅ Tool‑use & parallel tool‑use <br/>• ✅ JSON‑mode <br/>• 256 k context window                       | High‑complexity agents that need huge context (e.g., long document analysis + tool calls).                             |

### [How the list was derived](#how-the-list-was-derived)

1. **Tool‑use support table** (found on the _Introduction to Tool Use_ page) enumerates every model that can call external tools, marks those that also support **parallel** tool calls, and notes JSON‑mode availability.
2. The _Agentic Tooling_ section highlights the **Groq Compound** systems as the “out‑of‑the‑box” agentic solution that already bundles tools.
3. The _Supported Models_ table on the _Models_ page lists the production models; the ones above are the ones that also appear in the tool‑use table.
4. The _AutoGen + Groq_ and _CrewAI + Groq_ guides all use **Llama 3.3‑70B‑versatile** or **Llama 3.1‑8B‑instant** as the recommended default, reinforcing their status as the go‑to agents for the Groq ecosystem.

### [Quick recommendation cheat‑sheet](#quick-recommendation-cheatsheet)

| Scenario                                                                        | Recommended model(s)                                                                      |
| ------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| **Full‑featured autonomous agents (web search, code exec, browser automation)** | groq/compound (or groq/compound-mini for lower cost)                                      |
| **High‑throughput many‑agent pipelines**                                        | llama-3.1-8b-instant                                                                      |
| **Best overall performance with parallel tool calls**                           | llama-3.3-70b-versatile                                                                   |
| **MoE‑style strong reasoning + tool use**                                       | meta-llama/llama-4-scout-17b-16e-instruct / meta-llama/llama-4-maverick-17b-128e-instruct |
| **When you need massive context ( >128 k tokens )**                             | moonshotai/kimi-k2-instruct-0905                                                          |
| **Open‑source large‑parameter knowledge base**                                  | openai/gpt-oss-120b (single‑tool) or openai/gpt-oss-20b (lighter)                         |

These models collectively give you the best blend of **tool‑use capability, parallel execution, large context windows, and Groq’s ultra‑fast inference**, making them the top choices for building agentic workflows on the Groq platform.

### [Creating an Invoice](#creating-an-invoice)

Automate your invoicing process with [Stripe's MCP server](https://docs.stripe.com/mcp). You'll need a [Stripe API key](https://docs.stripe.com/mcp#bearer-token) with appropriate permissions.

javascript

```
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

const response = await client.responses.create({
  model: "openai/gpt-oss-120b",
  input: "Create an invoice for $100 for customer Groq Labs Testing using Stripe.",
  tools: [
    {
      type: "mcp",
      server_label: "Stripe",
      server_url: "https://mcp.stripe.com",
      headers: {
        Authorization: "Bearer <STRIPE_TOKEN>"
      },
      require_approval: "never"
    }
  ]
});

console.log(response);
```

```
import openai
import os

client = openai.OpenAI(
    api_key=os.environ.get("GROQ_API_KEY"),
    base_url="https://api.groq.com/openai/v1"
)

response = client.responses.create(
    model="openai/gpt-oss-120b",
    input="Create an invoice for $100 for customer Groq Labs Testing using Stripe.",
    tools=[
        {
            "type": "mcp",
            "server_label": "Stripe",
            "server_url": "https://mcp.stripe.com",
            "headers": {
                "Authorization": "Bearer <STRIPE_TOKEN>"
            },
            "require_approval": "never"
        }
    ]
)

print(response)
```

```
curl -X POST "https://api.groq.com/openai/v1/responses" \
  -H "Authorization: Bearer $GROQ_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "openai/gpt-oss-120b",
    "input": "Create an invoice for $100 for customer Groq Labs Testing using Stripe.",
    "tools": [
      {
        "type": "mcp",
        "server_label": "Stripe",
        "server_url": "https://mcp.stripe.com",
        "headers": {
          "Authorization": "Bearer <STRIPE_TOKEN>"
        },
        "require_approval": "never"
      }
    ]
  }'
```

Example Stripe Invoice Creation

A typical Stripe MCP response includes tool discovery, reasoning, and sequential action execution to create an invoice:

JSON

```
{
"id": "resp_01k59tasz2eg4as5q4n37kaqch",
"object": "response",
"status": "completed",
"output": [
  {
    "type": "mcp_list_tools",
    "server_label": "Stripe",
    "tools": [
      {
        "name": "create_customer",
        "description": "This tool will create a customer in Stripe."
      },
      {
        "name": "create_product",
        "description": "This tool will create a product in Stripe."
      },
      {
        "name": "create_price",
        "description": "This tool will create a price in Stripe."
      },
      {
        "name": "create_invoice",
        "description": "This tool will create an invoice in Stripe."
      },
      {
        "name": "create_invoice_item",
        "description": "This tool will create an invoice item in Stripe."
      },
      {
        "name": "finalize_invoice",
        "description": "This tool will finalize an invoice in Stripe."
      }
      // ... additional tools available
    ]
  },
  {
    "type": "reasoning",
    "content": [{
      "type": "reasoning_text",
      "text": "We need to create an invoice for $100 for customer named Groq Labs Testing. Steps: 1. Create customer 2. Create product and price 3. Create invoice 4. Add invoice item 5. Finalize invoice..."
    }]
  },
  {
    "type": "mcp_call",
    "server_label": "Stripe",
    "name": "create_customer",
    "arguments": "{\"name\":\"Groq Labs Testing\"}",
    "output": "{\"id\":\"cus_T4BNAMWCQH1Po3\"}"
  },
  {
    "type": "mcp_call",
    "server_label": "Stripe",
    "name": "create_product",
    "arguments": "{\"name\":\"Groq Labs Testing Invoice\"}",
    "output": "{\"id\":\"prod_T4BNkXTDpoQjEo\"}"
  },
  {
    "type": "mcp_call",
    "server_label": "Stripe",
    "name": "create_price",
    "arguments": "{\"currency\":\"usd\",\"product\":\"prod_T4BNkXTDpoQjEo\",\"unit_amount\":10000}",
    "output": "{\"id\":\"price_1S830L4C7KtbdMSK1Oy4u38s\"}"
  },
  {
    "type": "mcp_call",
    "server_label": "Stripe",
    "name": "create_invoice",
    "arguments": "{\"customer\":\"cus_T4BNAMWCQH1Po3\"}",
    "output": "{\"id\":\"in_1S830M4C7KtbdMSKpV3FA37N\",\"status\":\"draft\"}"
  },
  {
    "type": "mcp_call",
    "server_label": "Stripe",
    "name": "create_invoice_item",
    "arguments": "{\"customer\":\"cus_T4BNAMWCQH1Po3\",\"invoice\":\"in_1S830M4C7KtbdMSKpV3FA37N\",\"price\":\"price_1S830L4C7KtbdMSK1Oy4u38s\"}",
    "output": "{\"id\":\"ii_1S830N4C7KtbdMSKWML91TiW\"}"
  },
  {
    "type": "mcp_call",
    "server_label": "Stripe",
    "name": "finalize_invoice",
    "arguments": "{\"invoice\":\"in_1S830M4C7KtbdMSKpV3FA37N\"}",
    "output": "{\"id\":\"in_1S830M4C7KtbdMSKpV3FA37N\",\"status\":\"open\",\"url\":\"https://invoice.stripe.com/i/acct_1S82ye4C7KtbdMSK/test_...?s=ap\"}"
  },
  {
    "type": "message",
    "role": "assistant",
    "content": [{
      "type": "output_text",
      "text": "Your invoice has been created and finalized for **$100** (USD) for the customer **Groq Labs Testing**..."
    }]
  }
]
}
```

This example demonstrates how MCP orchestrates multiple Stripe API calls to complete a complex business workflow - creating a customer, product, price, invoice, invoice item, and finalizing the invoice in a single request.

Other payment processors also support MCP. For example, [PayPal's MCP server](https://www.paypal.ai/docs/tools/mcp-quickstart#remote-mcp-server) allows you to create invoices, manage payments, and more.

## [Advanced Features](#advanced-features)

### [Multiple MCP Servers](#multiple-mcp-servers)

You can connect to multiple MCP servers in a single request, allowing AI to coordinate across different systems:

JSON

```
{
  "tools": [
    {
      "type": "mcp",
      "server_label": "parallel_web_search",
      "server_url": "https://mcp.parallel.ai/<redacted>",
      "headers": {
        "x-api-key": "<PARALLEL_API_KEY>"
      }
    },
    {
      "type": "mcp",
      "server_label": "Stripe",
      "server_url": "https://mcp.stripe.com",
      "headers": { "Authorization": "Bearer <STRIPE_TOKEN>" }
    }
  ]
}
```

### [Authentication & Security](#authentication--security)

MCP servers often require authentication. Groq handles credentials securely:

- **Headers sent only to MCP servers**: Tokens are only transmitted to the specific server URL
- **Redacted logs**: Authentication headers are automatically redacted from logs

### [Connection Troubleshooting](#connection-troubleshooting)

In the case of authentication issues, you will receive a `424 Failed Dependency` error with the following content:

JSON

```
{
  "error": {
    "message": "Error retrieving tool list from MCP server: 'Stripe' Http status code: 401 (Unauthorized)",
    "type": "external_connector_error",
    "param": "tools",
    "code": "http_error"
  }
}
```

This may be due to:

- **Incorrect credentials**: Check your authentication tokens and headers
- **Invalid server URL**: Verify the MCP server endpoint is correct and accessible
- **Server unavailable**: The MCP server may be down or not responding

#### [Debugging Connection Issues](#debugging-connection-issues)

1. **Verify credentials**: Double-check API keys, tokens, and authentication headers
2. **Test server URL**: Ensure the MCP server URL is accessible and returns valid responses
3. **Check server status**: Confirm the MCP server is running and healthy

If connection issues persist, try testing with a known working MCP server first to isolate whether the issue is with your configuration or the specific server.

## [Limitations](#limitations)

While Groq's MCP implementation is fully compatible with OpenAI's remote MCP specification, there are some limitations to be aware of (we're working on them!):

- Approvals are not yet supported (`"require_approval": true`)
- Streaming is not yet supported (`"streaming": true`)
- Filtering tools is not yet supported (`"allowed_tools": ["tool1", "tool2"]`)

## [OpenAI Compatibility](#openai-compatibility)

Groq's MCP implementation is fully compatible with [OpenAI's remote MCP specification](https://platform.openai.com/docs/guides/tools-connectors-mcp). Existing integrations typically only need to change:

- **Base URL**: From `https://api.openai.com/v1` to `https://api.groq.com/openai/v1`
- **Model name**: To a [Groq-supported model](https://console.groq.com/docs/models) like `openai/gpt-oss-120b`
- **API key**: To your [Groq API key](https://console.groq.com/keys)

## [Using MCP with Chat Completions](#using-mcp-with-chat-completions)

While we recommend the Responses API for its native MCP support, you can also use MCP with the Chat Completions API.

The Chat Completions API retrofits MCP onto a conversation-based interface. For the best MCP experience with multi-step workflows and approval controls, use the Responses API.

javascript

```
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const completion = await groq.chat.completions.create({
  model: "openai/gpt-oss-120b",
  messages: [
    {
      role: "user",
      content: "What models are trending on Huggingface?"
    }
  ],
  tools: [
    {
      type: "mcp",
      server_label: "Huggingface",
      server_url: "https://huggingface.co/mcp"
    }
  ]
});

console.log(completion.choices[0].message);
```

```
import os
from groq import Groq

client = Groq(
    api_key=os.environ.get("GROQ_API_KEY"),
)

completion = client.chat.completions.create(
    model="openai/gpt-oss-120b",
    messages=[
        {
            "role": "user",
            "content": "What models are trending on Huggingface?"
        }
    ],
    tools=[
        {
            "type": "mcp",
            "server_label": "Huggingface",
            "server_url": "https://huggingface.co/mcp"
        }
    ]
)

print(completion.choices[0].message)
```

```
curl -X POST "https://api.groq.com/openai/v1/chat/completions" \
  -H "Authorization: Bearer $GROQ_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "openai/gpt-oss-120b",
    "messages": [
      {
        "role": "user",
        "content": "What models are trending on Huggingface?"
      }
    ],
    "tools": [
      {
        "type": "mcp",
        "server_label": "Huggingface",
        "server_url": "https://huggingface.co/mcp"
      }
    ]
  }'
```

## [Next Steps](#next-steps)

- **Explore the [Responses API](https://console.groq.com/docs/responses-api)** for the full MCP experience
- **Check out [MCP servers](https://github.com/modelcontextprotocol/servers)** for ready-to-use integrations
- **Build your own MCP server** using the [MCP specification](https://spec.modelcontextprotocol.io/)

---

description: Deploy and run inference with pre-made LoRA adapters on Groq. Learn about deployment options, supported models, and how to upload your existing LoRA adapters using the Fine-Tuning API.
title: LoRA Inference - GroqDocs
image: https://console.groq.com/og_cloudv5.jpg

---

# LoRA Inference on Groq

Groq provides inference services for pre-made Low-Rank Adaptation (LoRA) adapters. LoRA is a Parameter-efficient Fine-tuning (PEFT) technique that customizes model behavior without altering base model weights. Upload your existing LoRA adapters to run specialized inference while maintaining the performance and efficiency of Groq's infrastructure.

This service is not available currently for use with regional / sovereign endpoints.

**Note**: Groq offers LoRA inference services only. We do not provide LoRA fine-tuning services - you must create your LoRA adapters externally using other providers or tools.

With LoRA inference on Groq, you can:

- **Run inference** with your pre-made LoRA adapters
- **Deploy multiple specialized adapters** alongside a single base model
- **Maintain high performance** without compromising inference speed
- **Leverage existing fine-tuned models** created with external tools

## [Enterprise Feature](#enterprise-feature)

LoRA is available exclusively to enterprise-tier customers. To get started with LoRA on GroqCloud, please reach out to [our enterprise team](https://groq.com/enterprise-access).

## [Why LoRA vs. Base Model?](#why-lora-vs-base-model)

Compared to using just the base model, LoRA adapters offer significant advantages:

- **Task-Specific Optimization**: Tune model outputs to your particular use case, enabling increased accuracy and quality of responses
- **Domain Expertise**: Adapt models to understand industry-specific terminology, context, and requirements
- **Consistent Behavior**: Ensure predictable outputs that align with your business needs and brand voice
- **Performance Maintenance**: Achieve customization without compromising the high-speed inference that Groq is known for

### [Why LoRA vs. Traditional Fine-tuning?](#why-lora-vs-traditional-finetuning)

LoRA provides several key advantages over traditional fine-tuning approaches:

**Lower Total Cost of Ownership**

LoRA reduces fine-tuning costs significantly by avoiding full base model fine-tuning. This efficiency makes it cost-effective to customize models at scale.

**Rapid Deployment with High Performance**

Smaller, task-specific LoRA adapters can match or exceed the performance of fully fine-tuned models while delivering faster inference. This translates to quicker experimentation, iteration, and real-world impact.

**Non-Invasive Model Adaptation**

Since LoRA adapters don't require changes to the base model, you avoid the complexity and liability of managing and validating a fully retrained system. Adapters are modular, independently versioned, and easily replaceable as your data evolves—simplifying governance and compliance.

**Full Control, Less Risk**

Customers keep control of how and when updates happen—no retraining, no surprise behavior changes. Just lightweight, swappable adapters that fit into existing systems with minimal disruption. And with self-service APIs, updating adapters is quick, intuitive, and doesn't require heavy engineering lift.

## [LoRA Options on GroqCloud](#lora-options-on-groqcloud)

### [Two Hosting Modalities](#two-hosting-modalities)

Groq supports LoRAs through two deployment options:

1. [LoRAs in our public cloud](#loras-public-cloud)
2. [LoRAs on a dedicated instance](#loras-dedicated-instance)

### [LoRAs (Public Cloud)](#loras-public-cloud)

Pay-per-token usage model with no dedicated hardware requirements, ideal for customers with a small number of LoRA adapters across different tasks like customer support, document summarization, and translation.

- No dedicated hardware requirements - pay per token usage
- Shared instance capabilities across customers with potential rate limiting
- Less consistent latency/throughput compared to dedicated instances
- Gradual rollout to enterprise customers only via [enterprise access form](https://groq.com/enterprise-access/)

### [LoRAs (Dedicated Instance)](#loras-dedicated-instance)

Deployed on dedicated Groq hardware instances purchased by the customer, providing optimized performance for multiple LoRA adapters and consistent inference speeds, best suited for high-traffic scenarios or customers serving personalized adapters to many end users.

- Dedicated hardware instances optimized for LoRA performance
- More consistent performance and lower average latency
- No LoRA-specific rate limiting
- Ideal for SaaS platforms with dozens of internal use cases or hundreds of customer-specific adapters

### [Supported Models](#supported-models)

LoRA support is currently available for the following models:

| Model ID             | Model                                                                    | Base Model                                                                                  |
| -------------------- | ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------- |
| llama-3.1-8b-instant | [Llama 3.1 8B](https://console.groq.com/docs/model/llama-3.1-8b-instant) | [meta-llama/Llama-3.1-8B-Instruct](https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct) |

Please reach out to our [enterprise support team](https://groq.com/enterprise-access) for additional model support.

## [LoRA Pricing](#lora-pricing)

Please reach out to our [enterprise support team](https://groq.com/enterprise-access) for pricing.

## [Getting Started](#getting-started)

To begin using LoRA on GroqCloud:

1. **Contact Enterprise Sales**: [Reach out](https://groq.com/enterprise-access) to become an enterprise-tier customer
2. **Request LoRA Access**: Inform the team that you would like access to LoRA support
3. **Create Your LoRA Adapters**: Use external providers or tools to fine-tune Groq-supported base models (exact model versions required)
4. **Upload Adapters**: Use the self-serve portal to upload your LoRA adapters to GroqCloud
5. **Deploy**: Call the unique model ID created for your specific LoRA adapter(s)

**Important**: You must fine-tune the exact base model versions that Groq supports for your LoRA adapters to work properly.

## [Using the Fine-Tuning API](#using-the-finetuning-api)

Once you have access to LoRA, you can upload and deploy your adapters using Groq's Fine-Tuning API. This process involves two API calls: one to upload your LoRA adapter files and another to register them as a fine-tuned model. When you upload your LoRA adapters, Groq will store and process your files to provide this service. LoRA adapters are your Customer Data and will only be available for your organization's use.

### [Requirements](#requirements)

- **Supported models**: Text generation models only
- **Supported ranks**: 8, 16, 32, and 64 only
- **File format**: ZIP file containing exactly 2 files

**Note**: Cold start times are proportional to the LoRA rank. Higher ranks (32, 64) will take longer to load initially but have no impact on inference performance once loaded.

### [Step 1: Prepare Your LoRA Adapter Files](#step-1-prepare-your-lora-adapter-files)

Create a ZIP file containing exactly these 2 files:

1. **`adapter_model.safetensors`** \- A safetensors file containing your LoRA weights in float16 format
2. **`adapter_config.json`** \- A JSON configuration file with required fields:
   - `"lora_alpha"`: (integer or float) The LoRA alpha parameter
   - `"r"`: (integer) The rank of your LoRA adapter (must be 8, 16, 32, or 64)

### [Step 2: Upload the LoRA Adapter Files](#step-2-upload-the-lora-adapter-files)

Upload your ZIP file to the `/files` endpoint with `purpose="fine_tuning"`:

bash

```
curl --location 'https://api.groq.com/openai/v1/files' \
--header "Authorization: Bearer ${TOKEN}" \
--form "file=@<file-name>.zip" \
--form 'purpose="fine_tuning"'
```

This returns a file ID that you'll use in the next step:

JSON

```
{
  "id": "file_01jxnqc8hqebx343rnkyxw47e",
  "object": "file",
  "bytes": 155220077,
  "created_at": 1749854594,
  "filename": "<file-name>.zip",
  "purpose": "fine_tuning"
}
```

### [Step 3: Register as Fine-Tuned Model](#step-3-register-as-finetuned-model)

Use the file ID to register your LoRA adapter as a fine-tuned model:

bash

```
curl --location 'https://api.groq.com/v1/fine_tunings' \
--header 'Content-Type: application/json' \
--header "Authorization: Bearer ${TOKEN}" \
--data '{
    "input_file_id": "<file-id>",
    "name": "my-lora-adapter",
    "type": "lora",
    "base_model": "llama-3.1-8b-instant"
}'
```

This returns your unique model ID:

JSON

```
{
  "id": "ft_01jxx7abvdf6pafdthfbfmb9gy",
  "object": "fine_tuning",
  "data": {
    "name": "my-lora-adapter",
    "base_model": "llama-3.1-8b-instant",
    "type": "lora",
    "fine_tuned_model": "ft:llama-3.1-8b-instant:org_01hqed9y3fexcrngzqm9qh6ya9/my-lora-adapter-ef36419a0010"
  }
}
```

### [Step 4: Use Your LoRA Model](#step-4-use-your-lora-model)

Use the returned `fine_tuned_model` ID in your inference requests just like any other model:

bash

```
curl --location 'https://api.groq.com/openai/v1/chat/completions' \
--header 'Content-Type: application/json' \
--header "Authorization: Bearer ${TOKEN}" \
--data '{
    "model": "ft:llama-3.1-8b-instant:org_01hqed9y3fexcrngzqm9qh6ya9/my-lora-adapter-ef36419a0010",
    "messages": [
        {
            "role": "user",
            "content": "Your prompt here"
        }
    ]
}'
```

## [Frequently Asked Questions](#frequently-asked-questions)

### [Does Groq offer LoRA fine-tuning services?](#does-groq-offer-lora-finetuning-services)

No. Groq provides LoRA inference services only. Customers must create their LoRA adapters externally using fine-tuning providers or tools (e.g., Hugging Face PEFT, Unsloth, or custom solutions) and then upload their pre-made adapters to Groq for inference. You must fine-tune the exact base model versions that Groq supports.

### [Will LoRA support be available to Developer tier customers?](#will-lora-support-be-available-to-developer-tier-customers)

Not at this time. LoRA support is currently exclusive to enterprise tier customers. Stay tuned for updates.

### [Does Groq have recommended fine-tuning providers?](#does-groq-have-recommended-finetuning-providers)

Stay tuned for further updates on recommended fine-tuning providers.

### [How do I get access to LoRA on GroqCloud?](#how-do-i-get-access-to-lora-on-groqcloud)

[Contact our enterprise team](https://groq.com/enterprise-access) to discuss your LoRA requirements and get started.

### [How long are LoRA adapter files retained for?](#how-long-are-lora-adapter-files-retained-for)

Your uploaded LoRA adapter files are stored and accessible solely to your organization for the entire time you use the LoRAs service. This service is not available currently for use with regional / sovereign endpoints.

## [Best Practices](#best-practices)

- **Keep LoRA rank low (8 or 16)** to minimize cold start times - higher ranks increase loading latency
- **Use float16 precision** when loading the base model during fine-tuning to maintain optimal inference accuracy
- **Avoid 4-bit quantization** during LoRA training as it may cause small accuracy drops during inference
- **Save LoRA weights in float16 format** in your `adapter_model.safetensors` file
- **Test different ranks** to find the optimal balance between adaptation quality and cold start performance

---

description: Learn the essential building blocks of effective prompting, including roles, instructions, context, input and output formats to get reliable results from large language models.
title: Prompt Basics - GroqDocs
image: https://console.groq.com/og_cloudv5.jpg

---

# Prompt Basics

Prompting is the methodology through which we communicate instructions, parameters, and expectations to large language models. Consider a prompt as a detailed specification document provided to the model: the more precise and comprehensive the specifications, the higher the quality of the output. This guide establishes the fundamental principles for crafting effective prompts for open-source instruction-tuned models, including Llama, Deepseek, and Gemma.

## [Why Prompts Matter](#why-prompts-matter)

Large language models require clear direction to produce optimal results. Without precise instructions, they may produce inconsistent outputs. Well-structured prompts provide several benefits:

- **Reduce development time** by minimizing iterations needed for acceptable results.
- **Enhance output consistency** to ensure responses meet validation requirements without modification.
- **Optimize resource usage** by maintaining efficient context window utilization.

## [Prompt Building Blocks](#prompt-building-blocks)

Most high-quality prompts contain five elements: **role, instructions, context, input, expected output**.

| Element             | What it does                                          |
| ------------------- | ----------------------------------------------------- |
| **Role**            | Sets persona or expertise ("You are a data analyst…") |
| **Instructions**    | Bullet-proof list of required actions                 |
| **Context**         | Background knowledge or reference material            |
| **Input**           | The data or question to transform                     |
| **Expected Output** | Schema or miniature example to lock formatting        |

### [Real-world use case](#realworld-use-case)

Here's a real-world example demonstrating how these prompt building blocks work together to extract structured data from an email. Each element plays a crucial role in ensuring accurate, consistent output:

1. **System** \- fixes the model's role so it doesn't add greetings or extra formatting.
2. **Instructions** \- lists the exact keys; pairing this with [JSON mode](https://console.groq.com/docs/structured-outputs#json-object-mode) or [tool use](https://console.groq.com/docs/tool-use) further guarantees parseable output.
3. **Context** \- gives domain hints ("Deliver to", postcode format) that raise extraction accuracy without extra examples.
4. **Input** \- the raw e-mail; keep original line breaks so the model can latch onto visual cues.
5. **Example Output** \- a miniature few-shot sample that locks the reply shape to one JSON object.

```
### System
You are a data-extraction bot. Return **ONLY** valid JSON.

### Instructions
Return only JSON with keys:
- name (string)
- street (string)
- city (string)
- postcode (string)

### Context
"Ship-to" or "Deliver to" often precedes the address.
Postcodes may include letters (e.g., SW1A 1AA).

### Input
Subject: Shipping Request - Order #12345

Hi Shipping Team,

Please process the following delivery for Order #12345:

Deliver to:
Jane Smith
123 Oak Avenue
Manchester
M1 1AA

Items:
- 2x Widget Pro (SKU: WP-001)
- 1x Widget Case (SKU: WC-100)

Thanks,
Sales Team

### Example Output
{"name":"John Doe","street":"456 Pine Street","city":"San Francisco","postcode":"94105"}
```

## [Role Channels](#role-channels)

Most chat-style APIs expose **three channels**:

| Channel   | Typical Use                                                                                                          |
| --------- | -------------------------------------------------------------------------------------------------------------------- |
| system    | High-level persona & non-negotiable rules ("You are a helpful financial assistant.").                                |
| user      | The actual request or data, such as a user's message in a chat.                                                      |
| assistant | The model's response. In multi-turn conversations, the assistant role can be used to track the conversation history. |

The following example demonstrates how to implement a customer service chatbot using role channels. Role channels provide a structured way for the model to maintain context and generate contextually appropriate responses throughout the conversation.

PythonJavaScript

python

```
from groq import Groq

client = Groq()

system_prompt = """
You are a helpful IT support chatbot for 'Tech Solutions'.
Your role is to assist employees with common IT issues, provide guidance on using company software, and help troubleshoot basic technical problems.
Respond clearly and patiently. If an issue is complex, explain that you will create a support ticket for a human technician.
Keep responses brief and ask a maximum of one question at a time.
"""

chat_completion = client.chat.completions.create(
    messages=[
        {
            "role": "system",
            "content": system_prompt,
        },
        {
            "role": "user",
            "content": "My monitor isn't turning on.",
        },
        {
            "role": "assistant",
            "content": "Let's try to troubleshoot. Is the monitor properly plugged into a power source?",
        },
        {
            "role": "user",
            "content": "Yes, it's plugged in."
        }
    ],
    model="llama-3.3-70b-versatile",
)

print(chat_completion.choices[0].message.content)
```

Output

Is the power button on the monitor being pressed, and are any lights or indicators on the monitor turning on when you press it?

## [Prompt Priming](#prompt-priming)

Prompt priming is the practice of giving the model an **initial block of instructions or context** that influences every downstream token the model generates. Think of it as "setting the temperature of the conversation room" before anyone walks in. This usually lives in the **system** message; in single-shot prompts it's the first paragraph you write. Unlike one- or few-shot demos, priming does not need examples; the power comes from describing roles ("You are a medical billing expert"), constraints ("never reveal PII"), or seed knowledge ("assume the user's database is Postgres 16").

### [Why it Works](#why-it-works)

Large language models generate text by conditioning on **all previous tokens**, weighting earlier tokens more heavily than later ones. By positioning high-leverage tokens (role, style, rules) first, priming biases the probability distribution over next tokens toward answers that respect that frame.

### [Example (Primed Chat)](#example-primed-chat)

```
### System (Priming)
You are ComplianceLlama, an expert in U.S. financial-services regulation.
Always cite the relevant CFR section and warn when user requests violate §1010.620.

### User
"Can my fintech app skip KYC if all transfers are under $500?"

### Assistant
```

Output

"Transfers below $1,000 still trigger the customer-identification program requirements in **31 CFR §1022.220**. Skipping KYC would violate FinCEN rules…"

### [When to Use](#when-to-use)

| Situation                                                          | Why priming helps                                                                                     |
| ------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------- |
| **Stable persona or voice** across many turns                      | Guarantees the model keeps the same tone (e.g., "seasoned litigator") without repeating instructions. |
| **Policy & safety guardrails**                                     | Embeds non-negotiable rules such as "do not reveal trade secrets."                                    |
| **Injecting domain knowledge** (e.g., product catalog, API schema) | Saves tokens vs. repeating specs each turn; the model treats the primed facts as ground truth.        |
| **Special formatting or citation requirements**                    | Place markdown/JSON/XML templates in the primer so every answer starts correct.                       |
| **Consistent style transfer** (pirate talk, Shakespearean English) | Role-play seeds ensure creative outputs stay on-brand.                                                |
| **Zero-shot tasks that need extra context**                        | A brief primer often outperforms verbose instructions alone.                                          |

### [Tips](#tips)

- **Keep it concise:** 300-600 tokens is usually enough; longer primers steal context window from the user.
- **Separate roles:** Use dedicated _system_, _user_, and _assistant_ roles so the model understands hierarchy.
- **Test for drift:** Over many turns, the model can "forget" earlier tokens: re-send the primer or summarize it periodically.
- **Watch for over-constraining:** Heavy persona priming can hurt factual accuracy on analytical tasks; disable or slim down when precision matters.
- **Combine with examples:** For structured outputs, prime the schema then add one-shot examples to lock formatting.

## [Core Principles](#core-principles)

1. **Lead with the must-do.** Put critical instructions first; the model weighs early tokens more heavily.
2. **Show, don't tell.** A one-line schema or table example beats a paragraph of prose.
3. **State limits explicitly.** Use "Return **only** JSON" or "less than 75 words" to eliminate chatter.
4. **Use plain verbs.** "Summarize in one bullet per metric" is clearer than "analyze."
5. **Chunk long inputs.** Delimit data with \`\`\` or <<< … >>> so the model sees clear boundaries.

## [Context Budgeting](#context-budgeting)

While many models can handle up to **128K** tokens (or more), using a longer system prompt still costs latency and money. While you might be able to fit a lot of information in the model's context window, it could increase latency and reduce the model's accuracy. As a best practice, only include what is needed for the model to generate the desired response in the context.

## [Quick Prompting Wins](#quick-prompting-wins)

Try these **10-second tweaks** before adding examples or complex logic:

| Quick Fix                                                   | Outcome                                        |
| ----------------------------------------------------------- | ---------------------------------------------- |
| Add a one-line persona (_"You are a veteran copy editor."_) | Sharper, domain-aware tone                     |
| Show a mini output sample (one-row table / tiny JSON)       | Increased formatting accuracy                  |
| Use numbered steps in instructions                          | Reduces answers with extended rambling         |
| Add "no extra prose" at the end                             | Stops model from adding greetings or apologies |

## [Common Mistakes to Avoid](#common-mistakes-to-avoid)

Review these recommended practices and solutions to avoid common prompting issues.

| Common Mistake                      | Result                        | Solution                                             |
| ----------------------------------- | ----------------------------- | ---------------------------------------------------- |
| **Hidden ask** buried mid-paragraph | Model ignores it              | Move all instructions to top bullet list             |
| **Over-stuffed context**            | Truncated or slow responses   | Summarize, remove old examples                       |
| **Ambiguous verbs** (_"analyze"_)   | Vague output                  | Be explicit (_"Summarize in one bullet per metric"_) |
| **Partial JSON keys** in sample     | Model Hallucinates extra keys | Show the **full** schema: even if brief              |

## [Parameter Tuning](#parameter-tuning)

Optimize model outputs by configuring key parameters like temperature and top-p. These settings control the balance between deterministic and creative responses, with recommended values based on your specific use case.

| Parameter       | What it does                                                                         | Safe ranges | Typical use                                            |
| --------------- | ------------------------------------------------------------------------------------ | ----------- | ------------------------------------------------------ |
| **Temperature** | Global randomness (higher = more creative)                                           | 0 - 1.0     | 0 - 0.3 facts, 0.7 - 0.9 creative                      |
| **Top-p**       | Keeps only the top p cumulative probability mass - use this or temperature, not both | 0.5 - 1.0   | 0.9 facts, 1.0 creative                                |
| **Top-k**       | Limits to the k highest-probability tokens                                           | 20 - 100    | Rarely needed; try k = 40 for deterministic extraction |

### [Quick presets](#quick-presets)

The following are recommended values to set temperature or top-p to (but not both) for various use cases:

| Scenario               | Temp | Top-p | Comments                     |
| ---------------------- | ---- | ----- | ---------------------------- |
| Factual Q&A            | 0.2  | 0.9   | Keeps dates & numbers stable |
| Data extraction (JSON) | 0.0  | 0.9   | Deterministic keys/values    |
| Creative copywriting   | 0.8  | 1.0   | Vivid language, fresh ideas  |
| Brainstorming list     | 0.7  | 0.95  | Variety without nonsense     |
| Long-form code         | 0.3  | 0.85  | Fewer hallucinated APIs      |

---

## [Controlling Length & Cost](#controlling-length--cost)

The following are recommended settings for controlling token usage and costs with length limits, stop sequences, and deterministic outputs.

| Setting               | Purpose                                          | Tip                                              |
| --------------------- | ------------------------------------------------ | ------------------------------------------------ |
| max_completion_tokens | Hard cap on completion size                      | Set 10-20 % above ideal answer length            |
| Stop sequences        | Early stop when model hits token(s)              | Use "###" or another delimiter                   |
| System length hints   | "less than 75 words" or "return only table rows" | Model respects explicit numbers                  |
| seed                  | Controls randomness deterministically            | Use same seed for consistent outputs across runs |

**Real-world example:**

> Invoice summarizer returns _exactly_ three bullets by stating "Provide **three** bullets, each less than 12 words" and using `max_completion_tokens=60`.

### [Stop Sequences](#stop-sequences)

The `stop` parameter allows you to define sequences where the model will stop generating tokens. This is particularly useful for:

- Creating structured outputs with clear boundaries
- Preventing the model from continuing beyond a certain point
- Implementing custom dialogue patterns

PythonJavaScript

python

```
# Using a custom stop sequence for structured, concise output.
# The model is instructed to produce '###' at the end of the desired content.
# The API will stop generation when '###' is encountered and will NOT include '###' in the response.

from groq import Groq

client = Groq()
chat_completion = client.chat.completions.create(
    messages=[
        {
            "role": "user",
            "content": "Provide a 2-sentence summary of the concept of 'artificial general intelligence'. End your summary with '###'."
        }
        # Model's goal before stop sequence removal might be:
        # "Artificial general intelligence (AGI) refers to a type of AI that possesses the ability to understand, learn, and apply knowledge across a wide range of tasks at a level comparable to that of a human being. This contrasts with narrow AI, which is designed for specific tasks. ###"
    ],
    model="llama-3.1-8b-instant",
    stop=["###"],
    max_tokens=100 # Ensure enough tokens for the summary + stop sequence
)

print(chat_completion.choices[0].message.content)
```

Output

Artificial general intelligence (AGI) refers to a type of AI that possesses the ability to understand, learn, and apply knowledge across a wide range of tasks at a level comparable to that of a human being. This contrasts with narrow AI, which is designed for specific tasks.

When defining stop sequences:

- Include instructions in your prompt to tell the model to produce the stop sequence in the response
- Use unique patterns unlikely to appear in normal text, such as `###END###` or `</response>`
- For code generation, use language-specific endings like `}` or `;`

### [Deterministic Outputs with Seed](#deterministic-outputs-with-seed)

The `seed` parameter enables deterministic generation, making outputs consistent across multiple runs with the same parameters. This is valuable for:

- Reproducible results in research or testing
- Consistent user experiences in production
- A/B testing different prompts with controlled randomness

PythonJavaScript

python

```
from groq import Groq

client = Groq()
chat_completion = client.chat.completions.create(
    messages=[
      { "role": "system", "content": "You are a creative storyteller." },
      { "role": "user", "content": "Write a brief opening line to a mystery novel." }
    ],
    model="llama-3.1-8b-instant",
    temperature=0.8,  # Some creativity allowed
    seed=700,  # Deterministic seed
    max_tokens=100
)

print(chat_completion.choices[0].message.content)
```

Output

"It was the night the clock tower's chimes fell silent, and Detective Jameson received a mysterious letter with a single, chilling phrase: 'The truth lies in Ravenswood.'"

Important notes about `seed`:

- Determinism is best-effort and is not guaranteed across model versions
- Check the `system_fingerprint` in responses to track backend changes
- Combining `seed` with a lower temperature (0.0 - 0.3) may improve determinism
- Useful for debugging and improving prompts iteratively

## [Guardrails & Safety](#guardrails--safety)

Good prompts set the rules; dedicated guardrail models enforce them. [Meta's **Llama Guard 4**](https://console.groq.com/docs/content-moderation) is designed to sit in front of: or behind: your main model, classifying prompts or outputs for safety violations (hate, self-harm, private data). Integrating a moderation step can cut violation rates without changing your core prompt structure.

When stakes are high (finance, health, compliance), pair **clear instructions** ("never reveal PII") with an automated filter that rejects or sanitizes unsafe content before it reaches the user.

## [Next Steps](#next-steps)

Ready to level up? Explore dedicated [**prompt patterns**](https://console.groq.com/docs/prompting/patterns) like zero-shot, one-shot, few-shot, chain-of-thought, and more to match the pattern to your task complexity. From there, iterate and refine to improve your prompts.

---

description: A comprehensive guide to prompt engineering patterns for large language models, including Zero Shot, Few Shot, Chain of Thought, ReAct, Chain of Verification, and Chain of Density. Learn when and how to use each pattern with practical examples and tips for reliable results.
title: Prompt Engineering Patterns Guide - GroqDocs
image: https://console.groq.com/og_cloudv5.jpg

---

# Prompt Engineering Patterns Guide

This guide provides a systematic approach to selecting appropriate prompt patterns for various tasks when working with open-source language models. Implementing the correct pattern significantly improves output reliability and performance.

## [Why Patterns Matter](#why-patterns-matter)

Prompt patterns serve distinct purposes in language model interactions:

- **Zero shot** provides instructions without examples, relying on the model's existing knowledge.
- **Few shot** demonstrates specific examples for the model to follow as templates.
- **Chain of Thought** breaks complex reasoning into sequential steps for methodical problem-solving.

Selecting the appropriate pattern significantly improves output accuracy, consistency, and reliability across applications.

## [Pattern Chooser Table](#pattern-chooser-table)

The table below helps you quickly identify the most effective prompt pattern for your specific task, matching common use cases with optimal approaches to maximize model performance.

| Task Type                               | Recommended Pattern                                                | Why it works                                         |
| --------------------------------------- | ------------------------------------------------------------------ | ---------------------------------------------------- |
| Simple Q&A, definitions                 | [**Zero shot**](#zero-shot)                                        | Model already knows; instructions suffice            |
| Extraction / classification             | [**Few shot (1-3 samples)**](#one-shot--few-shot)                  | Teaches exact labels & JSON keys                     |
| Creative writing                        | [**Zero shot + role**](#zero-shot)                                 | Freedom + persona = coherent style                   |
| Multi-step math / logic                 | [**Chain of Thought**](#chain-of-thought)                          | Forces stepwise reasoning                            |
| Edge-case heavy tasks                   | [**Few shot (2-5 samples)**](#one-shot--few-shot)                  | Covers exceptions & rare labels                      |
| Mission-critical accuracy               | [**Guided CoT + Self Consistency**](#guided-cot--self-consistency) | Multiple reasoned paths to a consensus               |
| Tool-use / knowledge-heavy tasks        | [**ReAct (Reasoning + Acting)**](#react-reasoning-and-acting)      | Thinks, calls tools, repeats for grounded solutions. |
| Concise yet comprehensive summarization | [**Chain of Density (CoD)**](#chain-of-density-cod)                | Stepwise compression keeps essentials, cuts fluff.   |
| Accuracy-critical facts                 | [**Chain of Verification (CoVe)**](#chain-of-verification-cove)    | Asks and answers its own checks, then fixes.         |

## [Customer Support Ticket Processing Use Case](#customer-support-ticket-processing-use-case)

Throughout this guide, we'll use the practical example of automating customer support ticket processing. This enterprise-relevant use case demonstrates how different prompt patterns can improve:

- Initial ticket triage and categorization
- Issue urgency assessment
- Information extraction from customer communications
- Resolution suggestions and draft responses
- Ticket summarization for team handoffs

Using AI to enhance support ticket processing can reduce agent workload, accelerate response times, ensure consistent handling, and enable better tracking of common issues. Each prompt pattern offers distinct advantages for specific aspects of the support workflow.

## [Zero Shot](#zero-shot)

Zero shot prompting tells a large-language model **exactly what you want without supplying a single demonstration**. The model leans on the general-purpose knowledge it absorbed during pre-training to infer the right output. You provide instructions but no examples, allowing the model to apply its existing understanding to the task.

### [When to use](#when-to-use)

| Use case                                                       | Why Zero Shot works                                                       |
| -------------------------------------------------------------- | ------------------------------------------------------------------------- |
| **Sentiment classification**                                   | Model has seen millions of examples during training; instructions suffice |
| **Basic information extraction** (e.g., support ticket triage) | Simple extraction of explicit data points requires minimal guidance       |
| **Urgent support ticket assessment**                           | Clear indicators of urgency are typically explicit in customer language   |
| **Standard content formatting**                                | Straightforward style adjustments like formalization or simplification    |
| **Language translation**                                       | Well-established task with clear inputs and outputs                       |
| **Content outlines and summaries**                             | Follows common structural patterns; benefits from brevity                 |

### [Support Ticket Zero Shot Example](#support-ticket-zero-shot-example)

This example demonstrates using zero shot prompting to quickly analyze a customer support ticket for essential information.

**Prompt:**

```
Analyze the following customer support ticket and provide a JSON output containing:
- A brief 'summary' of the issue.
- The 'category' of the issue (e.g., Technical, Billing, Inquiry).
- The 'urgency' level (Low, Medium, High).
- A 'suggested_next_action' for the support team.

Ticket:
## Support Ticket ##

Ticket ID: TSK-2024-00123
Customer Name: Jane Doe
Customer Email: [email protected]
Customer ID: CUST-78910
Date Submitted: 2025-05-19 10:30 AM UTC
Product/Service: SuperWidget Pro
Subject: Cannot log in to my account

Issue Description:
I've been trying to log into my SuperWidget Pro account for the past 3 hours with no success. I keep getting an "Authentication Error (Code: 503)" message. I tried resetting my password, but I'm not receiving the reset email. I need urgent access to my project files for a client meeting this afternoon. My username is janedoe_widgets.
```

Output

JSON

```
{
  "summary": "User cannot log in due to an authentication error and is not receiving password reset emails, requiring urgent access for a client meeting.",
  "category": "Technical Issue",
  "urgency": "High",
  "suggested_next_action": "Investigate authentication error 503 and email delivery system, prioritizing resolution before the client meeting."
}
```

### [Why This Works](#why-this-works)

Zero shot prompting works effectively for this basic ticket analysis because:

1. The task involves common support concepts (categorization, urgency assessment) that models have encountered frequently in training data
2. The instruction clearly states the expected output format and fields
3. The customer's issue is described in straightforward terms with explicit mentions of errors and impact
4. No specialized domain knowledge is required for this initial assessment

The approach is ideal for quick initial triage before more detailed processing, allowing support systems to rapidly assign tickets without the overhead of examples.

### [Common Zero Shot Limitations and Challenges](#common-zero-shot-limitations-and-challenges)

1. **Ambiguous asks** \- vague instructions invite the model to hallucinate; add role + task + format cues.
2. **Hidden complexity** \- tasks that _look_ simple (e.g., nested condition extraction) often need [few shot](#one-shot--few-shot) or [chain of thought](#chain-of-thought).
3. **Over-creative output** \- for deterministic tasks, keep `temperature` at 0.2 or less.

## [One Shot & Few Shot](#one-shot--few-shot)

A **one shot prompt** includes exactly one worked example; a **few shot prompt** provides several (typically 3-8) examples. Both rely on the model's in-context learning to imitate the demonstrated input to output mapping. Because the demonstrations live in the prompt, you get the benefits of "training" without fine-tuning: you can swap tasks or tweak formats instantly by editing examples.

### [When to use](#when-to-use)

| Use case                                                        | Why One/Few Shot works                                                                            |
| --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| **Structured output (JSON, SQL, XML)**                          | Examples nail the exact keys, quoting, or delimiters you need                                     |
| **Support ticket categorization** with nuanced or custom labels | A few examples teach proper categorization schemes specific to your organization                  |
| **Domain-specific extraction** from technical support tickets   | Demonstrations anchor the terminology and extraction patterns                                     |
| **Edge-case handling** for unusual tickets                      | Show examples of tricky inputs to teach disambiguation strategies                                 |
| **Consistent formatting** of support responses                  | Examples ensure adherence to company communication standards                                      |
| **Custom urgency criteria** based on business rules             | Examples demonstrate how to apply organization-specific Service Level Agreement (SLA) definitions |

### [Support Ticket Few Shot Example](#support-ticket-few-shot-example)

This example demonstrates using few shot prompting to extract detailed, structured information from support tickets according to a specific schema.

**Prompt:**

```
### Example 1
Ticket:
## Support Ticket ##

Ticket ID: TSK-2024-00122
Customer Name: John Smith
Customer Email: [email protected]
Customer ID: CUST-45678
Date Submitted: 2024-03-14 09:15 AM UTC
Product/Service: SuperWidget Pro
Subject: Billing cycle error - double charged

Issue Description:
I was charged twice for my monthly subscription on March 10th. The first charge is $29.99 and then there's another identical charge of $29.99 on the same day. I've never had this happen before. Please refund the duplicate charge. My subscription ID is SUB-9876.

Output:
{
"ticket_id": "TSK-2024-00122",
"customer_info": {
  "name": "John Smith",
  "email": "[email protected]",
  "customer_id": "CUST-45678"
},
"submission_details": {
  "date_submitted": "2024-03-14 09:15 AM UTC",
  "product_service": "SuperWidget Pro",
  "subject": "Billing cycle error - double charged"
},
"issue_analysis": {
  "summary": "Customer was double-charged $29.99 for their monthly subscription on March 10th.",
  "category": "Billing Issue",
  "sub_category": "Double Charge",
  "urgency": "Medium",
  "subscription_id": "SUB-9876"
},
"suggested_resolution": {
  "next_step_internal": "Verify the duplicate charge and process refund.",
  "draft_response_to_customer": "Dear John, I'm sorry to hear about the duplicate charge for your SuperWidget Pro subscription. I've verified the issue and have initiated a refund of $29.99 to your original payment method. This should appear in your account within 3-5 business days. Please let me know if you have any other questions."
}
}

### Example 2
Ticket:
## Support Ticket ##

Ticket ID: TSK-2024-00115
Customer Name: Sarah Johnson
Customer Email: [email protected]
Customer ID: CUST-33456
Date Submitted: 2024-03-12 14:22 PM UTC
Product/Service: SuperWidget Lite
Subject: Feature request - dark mode

Issue Description:
I love using SuperWidget Lite but it's hard on my eyes when working late. Could you please add a dark mode option? Most apps I use have this feature now. Not urgent but would really improve my experience! Thanks for considering.

Output:
{
"ticket_id": "TSK-2024-00115",
"customer_info": {
  "name": "Sarah Johnson",
  "email": "[email protected]",
  "customer_id": "CUST-33456"
},
"submission_details": {
  "date_submitted": "2024-03-12 14:22 PM UTC",
  "product_service": "SuperWidget Lite",
  "subject": "Feature request - dark mode"
},
"issue_analysis": {
  "summary": "Customer requests adding dark mode to SuperWidget Lite to reduce eye strain when working late.",
  "category": "Feature Request",
  "sub_category": "UI Enhancement",
  "urgency": "Low"
},
"suggested_resolution": {
  "next_step_internal": "Add to product feature request backlog for consideration in upcoming sprint planning.",
  "draft_response_to_customer": "Dear Sarah, thank you for your suggestion about adding dark mode to SuperWidget Lite. I've forwarded your request to our product team for consideration in our future updates. We appreciate your feedback as it helps us improve our product. I'll make a note in your account so we can notify you if this feature becomes available."
}
}

### Task
Using the format from the examples, analyze the following ticket:

Ticket:
## Support Ticket ##

Ticket ID: TSK-2024-00123
Customer Name: Jane Doe
Customer Email: [email protected]
Customer ID: CUST-78910
Date Submitted: 2024-03-15 10:30 AM UTC
Product/Service: SuperWidget Pro
Subject: Cannot log in to my account

Issue Description:
I've been trying to log into my SuperWidget Pro account for the past 3 hours with no success. I keep getting an "Authentication Error (Code: 503)" message. I tried resetting my password, but I'm not receiving the reset email. I need urgent access to my project files for a client meeting this afternoon. My username is janedoe_widgets.
```

Output

JSON

```
{
  "ticket_id": "TSK-2024-00123",
  "customer_info": {
      "name": "Jane Doe",
      "email": "[email protected]",
      "customer_id": "CUST-78910",
      "username_mentioned": "janedoe_widgets"
  },
  "submission_details": {
      "date_submitted": "2024-03-15 10:30 AM UTC",
      "product_service": "SuperWidget Pro",
      "subject": "Cannot log in to my account"
  },
  "issue_analysis": {
      "summary": "Customer cannot log into their SuperWidget Pro account due to an Authentication Error (Code: 503) and is not receiving password reset emails.",
      "category": "Technical Issue",
      "sub_category": "Authentication",
      "urgency": "High",
      "error_codes_extracted": ["503"]
  },
  "suggested_resolution": {
      "next_step_internal": "Investigate authentication system and email delivery for user 'janedoe_widgets'. Prioritize as urgent due to client meeting time constraint.",
      "draft_response_to_customer": "Dear Jane, I'm sorry to hear you're experiencing trouble logging into your SuperWidget Pro account. I understand this is urgent due to your client meeting. I've initiated an investigation into the Authentication Error (Code: 503) and the issue with password reset emails. While our team works on this, could you please try accessing your account using a different browser or device? I'll personally follow up with you as soon as I have an update."
  }
}
```

### [Why This Works](#why-this-works)

Few shot prompting works effectively for detailed support ticket analysis because:

1. The examples provide a precise template for the expected JSON structure, including all required fields and formatting
2. The examples demonstrate proper categorization and sub-categorization according to ticket content
3. The model learns how to extract implicit information (like usernames mentioned in the text) by seeing it done in examples
4. The urgency assessment criteria (with three different urgency levels across examples) helps calibrate the model's understanding of priority
5. Response drafting follows the tone and format demonstrated in the examples, maintaining consistency with company standards

The approach is particularly valuable when you need to extract information according to a specific schema or organization-specific categorization system that might not match general knowledge patterns.

### [Tips](#tips)

- **Token budget**: If your examples are long, consider using only 2-3 to avoid excessive prompt length.
- **Diversity**: Include examples that demonstrate different categories, urgency levels, and edge cases.
- **Specificity**: Choose examples that demonstrate exactly the fields and format you want in the output.
- **Over-fitting**: Too many very similar examples can cause the model to copy content verbatim; maintain variety.
- **Order effects**: Place the most representative or complex examples last as they tend to influence the model most strongly.

## [Chain of Thought](#chain-of-thought)

Chain of Thought (CoT) is a prompt engineering technique that explicitly instructs the model to think through a problem step-by-step before producing the answer. In its simplest form you add a phrase like **"Let's think step by step."** This cue triggers the model to emit a sequence of reasoning statements (the "chain") followed by a conclusion. Zero shot CoT works effectively on arithmetic and commonsense questions, while few shot CoT supplies handcrafted exemplars for more complex domains.

### [When to use](#when-to-use)

| Problem type                        | Why CoT helps                                                   |
| ----------------------------------- | --------------------------------------------------------------- |
| **Math & logic word problems**      | Forces explicit arithmetic steps                                |
| **Multi-hop Q&A / retrieval**       | Encourages sequential evidence gathering                        |
| **Complex support ticket analysis** | Breaks down issue diagnosis into logical components             |
| **Content plans & outlines**        | Structures longform content creation                            |
| **Policy / safety analysis**        | Documents each step of reasoning for transparency               |
| **Ticket priority determination**   | Systematically assesses impact, urgency, and SLA considerations |

### [Support Ticket Chain of Thought Example](#support-ticket-chain-of-thought-example)

This example demonstrates using CoT to systematically analyze a customer support ticket to extract detailed information and make reasoned judgments about the issue.

**Prompt:**

```
Analyze the following customer support ticket. First, let's think step by step to understand the problem, and then provide a structured JSON output.

Ticket:
## Support Ticket ##

Ticket ID: TSK-2024-00123
Customer Name: Jane Doe
Customer Email: [email protected]
Customer ID: CUST-78910
Date Submitted: 2024-03-15 10:30 AM UTC
Product/Service: SuperWidget Pro
Subject: Cannot log in to my account

Issue Description:
I've been trying to log into my SuperWidget Pro account for the past 3 hours with no success. I keep getting an "Authentication Error (Code: 503)" message. I tried resetting my password, but I'm not receiving the reset email. I need urgent access to my project files for a client meeting this afternoon. My username is janedoe_widgets.
```

Output

Let me think through this step by step:

1: First, I need to identify the customer details:

- Ticket ID: `TSK-2024-00123`
- Customer: Jane Doe (CUST-78910)
- Email: `[[email protected]](/cdn-cgi/l/email-protection)`
- Product: SuperWidget Pro
- Username mentioned: `janedoe_widgets`

2: What is the core problem?

- Customer cannot log in to SuperWidget Pro account
- Specific error: "Authentication Error (Code: 503)"
- Secondary issue: Password reset emails not being received

3: Analyzing severity and impact:

- Customer has been trying for 3 hours (persistent issue)
- Customer has an urgent need: client meeting this afternoon
- Project files are inaccessible, potentially affecting business
- This suggests a HIGH urgency level

4: Categorizing the issue:

- Primary category: Technical Issue
- Sub-category: Authentication
- Systems potentially involved: Login system, Email delivery system

5: What should support do next?

- Primary: Investigate authentication system error 503
- Secondary: Check email delivery system for password reset
- Immediate: Try alternative access methods for the customer

6: Based on this analysis, here's the structured output:

JSON

```
{
  "ticket_id": "TSK-2024-00123",
  "customer_info": {
      "name": "Jane Doe",
      "email": "[email protected]",
      "customer_id": "CUST-78910",
      "username": "janedoe_widgets"
  },
  "issue_analysis": {
      "primary_issue": "Cannot log in to account",
      "error_code": "Authentication Error (503)",
      "secondary_issue": "Password reset emails not being received",
      "category": "Technical Issue",
      "sub_category": "Authentication",
      "urgency": "High",
      "business_impact": "Customer needs access to project files for client meeting today"
  },
  "recommended_actions": {
      "immediate": "Provide alternative access method to project files if possible",
      "investigation": [
      "Check authentication system status and error code 503",
      "Verify email delivery system functionality for reset emails"
      ],
      "customer_response": "Acknowledge urgency, explain investigation steps, suggest alternative access methods, and commit to follow-up before client meeting"
  }
}
```

### [Why This Works](#why-this-works)

CoT prompting works effectively for support ticket analysis because:

1. It breaks down the complex task of ticket analysis into discrete, manageable steps
2. Each step focuses on a specific aspect of the analysis (customer details, core problem, severity, categorization, next actions)
3. The systematic approach ensures thorough consideration of all relevant information
4. The explicit reasoning reveals how urgency and categorization decisions are made
5. The step-by-step process mimics the diagnostic thinking of experienced support agents
6. The final structured output benefits from the comprehensive analysis that preceded it

The approach is particularly valuable for tickets that require nuanced analysis, urgency assessment based on business impact, or where multiple systems may be involved in the resolution.

### [Tips](#tips)

- **Structured prompting:** For consistent results, consider outlining specific steps you want the model to follow
- **Reasoning transparency:** CoT provides auditability of decision-making, which is valuable for training and quality assurance
- **Token considerations:** This approach generates more tokens than direct extraction methods
- **Temperature setting:** Use lower temperature (≤0.3) for more consistent reasoning patterns
- **Hybrid approach:** Combine with few shot examples of reasoning patterns for organization-specific analysis standards

## [Guided CoT & Self Consistency](#guided-cot--self-consistency)

Guided CoT provides a structured outline of reasoning steps for the model to follow. Rather than letting the model determine its own reasoning path, you explicitly define the analytical framework.

Self-Consistency replaces standard decoding in CoT with a sample-and-majority-vote strategy: the same CoT prompt is run multiple times with a higher temperature, the answer from each chain is extracted, then the most common answer is returned as the final result.

### [When to use](#when-to-use)

| Use case                                                      | Why it works                                                                   |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| **Support ticket categorization** with complex business rules | Guided CoT ensures consistent application of classification criteria           |
| **SLA breach determination** with multiple factors            | Self-Consistency reduces calculation errors in deadline computations           |
| **Risk assessment** of customer issues                        | Multiple reasoning paths help identify edge cases in potential impact analysis |
| **Customer sentiment analysis** in ambiguous situations       | Consensus across multiple paths provides more reliable interpretation          |
| **Root cause analysis** for technical issues                  | Guided steps ensure thorough investigation across all system components        |
| **Draft response generation** for sensitive issues            | Self-Consistency helps avoid inappropriate or inadequate responses             |

### [Support Ticket Guided CoT Example](#support-ticket-guided-cot-example)

This example demonstrates using Guided CoT to systematically analyze a support ticket following a specific analytical framework.

**Prompt:**

```
Analyze the following support ticket using these specific steps:

Step 1: Extract and list all customer identification information.
Step 2: Identify the primary issue and any secondary issues mentioned.
Step 3: Note any error codes or specific system behaviors reported.
Step 4: Determine urgency based on: (a) customer's stated timeframe, (b) business impact, (c) system availability.
Step 5: Classify the issue using our taxonomy (Technical, Billing, Account, or Feature Request).
Step 6: Recommend next actions for both internal team and customer communication.
Step 7: Generate a structured JSON output with all findings.

Ticket:
## Support Ticket ##

Ticket ID: TSK-2024-00123
Customer Name: Jane Doe
Customer Email: [email protected]
Customer ID: CUST-78910
Date Submitted: 2024-03-15 10:30 AM UTC
Product/Service: SuperWidget Pro
Subject: Cannot log in to my account

Issue Description:
I've been trying to log into my SuperWidget Pro account for the past 3 hours with no success. I keep getting an "Authentication Error (Code: 503)" message. I tried resetting my password, but I'm not receiving the reset email. I need urgent access to my project files for a client meeting this afternoon. My username is janedoe_widgets.
```

Output

Following the required steps:

1: Customer identification information:

- Ticket ID: `TSK-2024-00123`
- Customer Name: Jane Doe
- Customer Email: `[[email protected]](/cdn-cgi/l/email-protection)`
- Customer ID: `CUST-78910`
- Username: `janedoe_widgets`
- Product: `SuperWidget Pro`

2: Issues identified:

- Primary issue: Cannot log in to account
- Secondary issue: Not receiving password reset emails

3: Error codes and system behaviors:

- Authentication Error (Code: 503)
- Password reset system not delivering emails

4: Urgency determination:

- Customer's stated timeframe: Needs access "this afternoon" for a client meeting
- Business impact: Potential disruption to client relationship/business operations
- System availability: Authentication system appears to be functional but returning errors
- Urgency assessment: HIGH (time-sensitive with business impact)

5: Issue classification:

- Category: Technical
- Sub-category: Authentication

6: Recommended actions:

- Internal: Investigate Authentication Error 503
- Customer communication: Acknowledge urgent timeline, inform of investigation, provide alternative access method if possible

7: JSON output:

JSON

```
{
"ticket_analysis": {
  "ticket_id": "TSK-2024-00123",
  "customer_details": {
    "name": "Jane Doe",
    "email": "[email protected]",
    "customer_id": "CUST-78910",
    "username": "janedoe_widgets"
  },
  "product_info": {
    "product_name": "SuperWidget Pro"
  },
  "issue_details": {
    "primary_issue": "Cannot log in to account",
    "secondary_issues": ["Not receiving password reset emails"],
    "error_codes": ["Authentication Error (Code: 503)"],
    "system_behaviors": ["Password reset system not delivering emails"]
  },
  "urgency_assessment": {
    "level": "HIGH",
    "time_constraint": "Client meeting this afternoon",
    "business_impact": "Potential client relationship disruption"
  },
  "classification": {
    "category": "Technical",
    "sub_category": "Authentication"
  },
  "action_plan": {
    "internal_actions": [
      "Investigate Authentication Error 503",
      "Check email delivery system for reset functionality"
    ],
    "customer_response": "Acknowledge urgency, inform of investigation, offer alternative access options",
    "priority": "Immediate response required"
  }
}
}
```

### [Support Ticket Self-Consistency Example](#support-ticket-selfconsistency-example)

This conceptual example illustrates how Self-Consistency could be applied to support ticket categorization to reduce errors and increase reliability.

**Prompt:**

```
SYSTEM: You're a support ticket analyst using Self-Consistency to categorize tickets.
For this implementation, we'll run the same analysis with different temperatures to generate multiple categorizations, then identify the most common result.

USER: Run the following Chain of Thought prompt 5 times with temperature=0.7 to classify this support ticket:

Ticket:
## Support Ticket ##

Ticket ID: TSK-2024-00123
Customer Name: Jane Doe
Customer Email: [email protected]
Customer ID: CUST-78910
Date Submitted: 2024-03-15 10:30 AM UTC
Product/Service: SuperWidget Pro
Subject: Cannot log in to my account

Issue Description:
I've been trying to log into my SuperWidget Pro account for the past 3 hours with no success. I keep getting an "Authentication Error (Code: 503)" message. I tried resetting my password, but I'm not receiving the reset email. I need urgent access to my project files for a client meeting this afternoon. My username is janedoe_widgets.
```

Output

**Run 1 (temp=0.7)**

This involves a login issue with error code 503 and missing password reset emails. Since it's primarily about account access rather than the functionality of the product itself, this falls under the Account Access category with Authentication sub-category. The urgency is High due to the client meeting. Classification:

JSON

```
{category: "Account Access", sub_category: "Authentication", urgency: "High"}
```

**Run 2 (temp=0.7)**

The customer is experiencing an Authentication Error (503) when trying to log in, and the password reset system isn't working. This is clearly a Technical Issue related to Authentication systems. Given the client meeting, urgency is High.

JSON

```
{category: "Technical Issue", sub_category: "Authentication", urgency: "High"}
```

**Run 3 (temp=0.7)**

Looking at the error code 503 and authentication failure, this is a Technical Issue. The sub-category is Authentication since it involves login systems and password reset functionality. The urgency is High due to business impact. Classification:

JSON

```
{category: "Technical Issue", sub_category: "Authentication", urgency: "High"}
```

**Run 4 (temp=0.7)**

This ticket describes an authentication problem with error code 503 and email delivery issues for password reset. It's a Technical Issue in the Authentication sub-category with High urgency. Classification:

JSON

```
{category: "Technical Issue", sub_category: "Authentication", urgency: "High"}
```

**Run 5 (temp=0.7)**

The customer can't log in (error 503) and isn't receiving password reset emails. This is a Technical Issue with the Authentication system. Urgency is High given the client meeting timeline. Classification:

JSON

```
{category: "Technical Issue", sub_category: "Authentication", urgency: "High"}
```

**Aggregated Results**

- "Technical Issue": 4 votes
- "Account Access": 1 vote

**Final Classification Based on Majority**

JSON

```
{category: "Technical Issue", sub_category: "Authentication", urgency: "High"}
```

### [Why These Approaches Work](#why-these-approaches-work)

**Guided CoT** works effectively for support ticket analysis because:

1. It ensures consistent application of organizational standards and categorization rules
2. The predefined steps guarantee comprehensive analysis of all important aspects
3. It makes the reasoning process transparent and auditable
4. The framework can encode specific business priorities or compliance requirements
5. It provides a quality control mechanism to prevent analysis gaps

**Self-Consistency** improves support ticket processing accuracy because:

1. Multiple reasoning paths help catch rare categorization or priority assessment errors
2. It provides increased confidence for critical decision points
3. When classifications disagree, it flags potentially ambiguous tickets for human review
4. It helps identify edge cases that might fall between standard categories
5. The consensus mechanism reduces the impact of occasional reasoning failures

### [Implementation Considerations](#implementation-considerations)

- **Guided CoT:** Can be implemented with a single prompt by providing the structured step-by-step framework.
- **Self-Consistency:** Requires multiple model calls (typically 5-20) with the same input but different temperature settings.
- **Hybrid approach:** For mission-critical tickets, consider combining both: use Guided CoT to ensure structured analysis, then apply Self-Consistency to verify the results.
- **Resource optimization:** Reserve Self-Consistency for high-priority or complex tickets where the additional compute cost is justified by the need for accuracy.
- **Confidence scoring:** Track agreement percentage across Self-Consistency runs to flag tickets that might need human review.

## [ReAct (Reasoning and Acting)](#react-reasoning-and-acting)

ReAct (Reasoning and Acting) is a prompt pattern that instructs an LLM to generate two interleaved streams:

1. **Thought / reasoning trace** \- natural-language reflection on the current state
2. **Action** \- a structured command that an external tool executes (e.g., `Search[query]`, `Calculator[expression]`, or `Call_API[args]`) followed by the tool's observation

Because the model can observe the tool's response and continue thinking, it forms a closed feedback loop. The model assesses the situation, takes an action to gather information, processes the results, and repeats if necessary.

### [When to use](#when-to-use)

| Use case                                                 | Why ReAct works                                                     |
| -------------------------------------------------------- | ------------------------------------------------------------------- |
| **Support ticket triage requiring contextual knowledge** | Enables lookup of error codes, known issues, and solutions          |
| **Ticket analysis needing real-time status checks**      | Can verify current system status and outage information             |
| **SLA calculation and breach determination**             | Performs precise time calculations with Python execution            |
| **Customer history-enriched responses**                  | Retrieves customer context from knowledge bases or documentation    |
| **Technical troubleshooting with diagnostic tools**      | Runs diagnostic scripts and interprets results                      |
| **Product-specific error resolution**                    | Searches documentation and knowledge bases for specific error codes |

### [Support Ticket ReAct Example](#support-ticket-react-example)

This example demonstrates how ReAct can be used to analyze a support ticket by accessing external information and performing calculations.

**Prompt:**

```
SYSTEM: You are a support ticket analyst with the ability to think step-by-step and use tools to assist your analysis.
Available tools:
- SearchKnowledgeBase[query]: Searches the internal knowledge base for information.
- CalculateTimeDifference[start_time, end_time, time_zone]: Calculates the difference between two times.
- CheckSLA[ticket_id, issue_type]: Checks the SLA for a given ticket and issue type.

USER: Analyze this support ticket. Find any relevant information about the error code and assess whether there's an SLA breach. Provide your analysis as JSON.

Ticket:
## Support Ticket ##

Ticket ID: TSK-2024-00456
Customer Name: Michael Chen
Customer Email: [email protected]
Customer ID: CUST-92175
Date Submitted: 2024-03-15 15:45 PM UTC
Product/Service: SuperWidget Pro (Enterprise Plan)
Subject: Database sync failure with error DBS-4077

Issue Description:
Our production instance stopped syncing with our backup database at approximately 13:00 UTC today. The error console shows "Connection Failure: DBS-4077". According to our Enterprise SLA, sync issues should be resolved within 3 hours. This is affecting our reporting capabilities but not blocking customer transactions.
```

Output

**Thought**: I need to analyze this support ticket. There are three key tasks:

1. Understand the error code "DBS-4077".
2. Determine the time elapsed since the issue started.
3. Check if there's an SLA breach.

**First**, I'll search the knowledge base for information about the error code.

**Action**: SearchKnowledgeBase\["error code DBS-4077 SuperWidget Pro"\]

**Observation**: The knowledge base article KB00789 indicates that DBS-4077 is a "Database Synchronization Timeout" error for SuperWidget Pro. It's typically caused by network latency between the primary and replica database servers or an overloaded replica server. Recommended first steps include checking network connectivity and replica server load. This is classified as a P2 (Priority 2) issue.

**Thought**: Okay, DBS-4077 is a P2 database sync timeout. Now, I need to calculate the time elapsed. The issue started around 13:00 UTC, and the ticket was submitted at 15:45 UTC on the same day.

**Action**: CalculateTimeDifference\[start_time="13:00 UTC", end_time="15:45 UTC", time_zone="UTC"\]

**Observation**: The time difference is 2 hours and 45 minutes.

**Thought**: The customer mentioned their Enterprise SLA for sync issues is 3 hours. I should verify this with our SLA tool.

**Action**: CheckSLA\[ticket_id="TSK-2024-00456", issue_type="Database Sync Failure"\]

**Observation**: For Enterprise Plan customers, the SLA for P2 Database Sync Failures is indeed 3 hours for resolution.

**Thought**: So, the issue has been ongoing for 2 hours and 45 minutes, and the SLA is 3 hours. This means there are only 15 minutes remaining in the SLA window.

**Final Answer**:

JSON

```
{
  "ticket_id": "TSK-2024-00456",
  "customer_info": {
      "name": "Michael Chen",
      "email": "[email protected]",
      "customer_id": "CUST-92175",
      "plan_type": "Enterprise Plan"
  },
  "issue_analysis": {
      "summary": "Production instance database sync failure with backup, error DBS-4077.",
      "error_code": "DBS-4077",
      "error_meaning": "Database Synchronization Timeout (P2)",
      "potential_causes": [
          "Network latency between primary and replica servers",
          "Overloaded replica server"
      ],
      "recommended_initial_steps": [
          "Check network connectivity between database servers",
          "Monitor replica server load"
      ],
      "category": "Technical Issue",
      "sub_category": "Database Synchronization",
      "priority_level": "P2",
      "impact_description": "Affecting reporting capabilities, but not blocking customer transactions."
  },
  "sla_assessment": {
      "sla_policy": "3 hours resolution for P2 Database Sync Failures (Enterprise Plan)",
      "issue_start_time_utc": "13:00",
      "ticket_submission_time_utc": "15:45",
      "time_elapsed_since_issue_start": "2 hours 45 minutes",
      "remaining_sla_time": "15 minutes",
      "sla_status": "At Risk",
      "sla_breach_imminent": true
  },
  "recommended_actions": {
      "internal_next_steps": [
          "Immediately assign to a database administrator or SRE.",
          "Investigate network latency and replica server load.",
          "Prepare for potential escalation if not resolved within 15 minutes."
      ],
      "customer_communication": "Acknowledge the ticket and the error. Inform the customer that we are aware of the 3-hour SLA and are actively investigating. Provide an update within 30 minutes or upon significant findings."
  }
}
```

### [Why This Works](#why-this-works)

ReAct is effective for support ticket analysis in this scenario because:

1. It enriches the ticket analysis with external knowledge about the specific error code
2. The external search provides context on the nature of the issue (network connectivity) that wasn't explicitly stated in the ticket
3. It identifies potential causes and recommended troubleshooting steps from documentation
4. The step-by-step reasoning process carefully evaluates the SLA situation by calculating elapsed time
5. The model can make a more informed assessment of urgency and escalation requirements based on gathered information
6. The resulting analysis combines ticket information with external knowledge to create a comprehensive assessment

This approach is particularly valuable for support teams dealing with specialized systems where specific error codes may require looking up technical documentation, and where SLA compliance is critical to monitor.

### [Implementation Tips](#implementation-tips)

- **Clear format specification:** Define the expected Thought/Action/Observation pattern explicitly in the system prompt
- **Tool selection:** Provide only the most relevant tools; too many options can confuse the model
- **Input structuring:** Pre-process tickets to highlight key fields like timestamps, error codes, and SLA requirements
- **Error handling:** Implement robust error handling for tool calls, as search results may be inconsistent
- **Observation management:** For lengthy search results or complex data, summarize observations to keep them focused
- **Connection to knowledge bases:** Consider connecting to internal knowledge bases rather than public search for proprietary systems
- **Security considerations:** Ensure sensitive customer information isn't exposed in external tool calls
- **Output standardization:** Format final answers as structured data (JSON) for integration with ticket management systems

## [Chain of Verification (CoVe)](#chain-of-verification-cove)

Chain of Verification (CoVe) prompting turns the model into its own fact-checker. It follows a four-phase process: first writing a draft analysis, then planning targeted verification questions, answering those questions independently to avoid bias, and finally producing a revised, "verified" response. This technique can reduce error rates significantly across knowledge-heavy tasks while adding only one extra round-trip latency.

### [When to use](#when-to-use)

| Use case                                   | Why CoVe works                                                    |
| ------------------------------------------ | ----------------------------------------------------------------- |
| **Support ticket categorization auditing** | Verifies proper categorization through targeted questions         |
| **SLA calculation verification**           | Double-checks time calculations and policy interpretation         |
| **Technical troubleshooting validation**   | Confirms logical connections between symptoms and causes          |
| **Customer response quality assurance**    | Ensures completeness and accuracy of draft responses              |
| **Incident impact assessment**             | Validates estimates of business impact through specific questions |
| **Error code interpretation**              | Cross-checks error code explanations against known documentation  |

### [Support Ticket Chain of Verification Example](#support-ticket-chain-of-verification-example)

This example demonstrates applying CoVe to analyze a customer support ticket, ensuring accuracy through self-verification.

**Prompt:**

```
## Phase 1: Draft Analysis
USER: Analyze this support ticket and provide a complete assessment as JSON:

Ticket:
## Support Ticket ##

Ticket ID: TSK-2024-00123
Customer Name: Jane Doe
Customer Email: [email protected]
Customer ID: CUST-78910
Date Submitted: 2024-03-15 10:30 AM UTC
Product/Service: SuperWidget Pro
Subject: Cannot log in to my account

Issue Description:
I've been trying to log into my SuperWidget Pro account for the past 3 hours with no success. I keep getting an "Authentication Error (Code: 503)" message. I tried resetting my password, but I'm not receiving the reset email. I need urgent access to my project files for a client meeting this afternoon. My username is janedoe_widgets.

ASSISTANT (Draft):
{
"ticket_analysis": {
  "ticket_id": "TSK-2024-00123",
  "category": "Account Issue",
  "sub_category": "Login Problem",
  "urgency": "High",
  "impact": "Customer cannot access project files needed for client meeting",
  "error_codes": ["503"],
  "root_cause": "Password reset system failure",
  "recommended_action": "Reset password manually and investigate email delivery system"
}
}

## Phase 2: Verification Planning
ASSISTANT: To verify my analysis, I should check:
1. Is "Account Issue" the correct category, or should this be "Technical Issue"?
2. Does error code 503 relate to authentication specifically, or is it a general server error?
3. Is the root cause definitely a password reset system failure, or could it be authentication system failure?
4. Have I correctly assessed the urgency based on the timeline mentioned?
5. Is my recommended action complete and appropriate?

## Phase 3: Answer Verification Questions
ASSISTANT:
1. Reviewing the ticket, this appears to be a "Technical Issue" rather than "Account Issue" since it involves specific error codes and system functionality failures.
2. Error 503 is specifically described as an "Authentication Error" in the ticket, indicating it relates to the authentication system specifically.
3. The root cause is not definitively password reset system failure. There are two issues: authentication failure AND password reset emails not being received. The root cause could be either system or both.
4. The urgency is correctly assessed as "High" given the customer needs access for a client meeting "this afternoon."
5. The recommended action addresses the password reset but doesn't provide immediate access to files, which should be prioritized given the urgent meeting.

## Phase 4: Verified Analysis
USER: Based on your verification, provide a corrected analysis.

ASSISTANT:
{
"ticket_analysis": {
  "ticket_id": "TSK-2024-00123",
  "customer_info": {
    "name": "Jane Doe",
    "email": "[email protected]",
    "customer_id": "CUST-78910",
    "username": "janedoe_widgets"
  },
  "issue_details": {
    "category": "Technical Issue",
    "sub_category": "Authentication",
    "urgency": "High",
    "impact": "Customer cannot access project files needed for client meeting this afternoon",
    "error_codes": ["Authentication Error (503)"],
    "reported_symptoms": [
      "Cannot log into account",
      "Not receiving password reset emails"
    ]
  },
  "possible_causes": [
    "Authentication system failure",
    "Email delivery system issues",
    "Account flag requiring administrative intervention"
  ],
  "recommended_actions": [
    "Immediate: Provide temporary alternative access to project files",
    "Short-term: Manual password reset by admin",
    "Investigation: Check authentication system for Error 503",
    "Investigation: Verify email delivery system functionality"
  ],
  "response_priority": "Immediate - resolve before customer's afternoon meeting"
}
}
```

Output

JSON

```
{
  "ticket_analysis": {
      "ticket_id": "TSK-2024-00123",
      "customer_info": {
          "name": "Jane Doe",
          "email": "[email protected]",
          "customer_id": "CUST-78910",
          "username": "janedoe_widgets"
      },
      "issue_details": {
          "category": "Technical Issue",
          "sub_category": "Authentication",
          "urgency": "High",
          "impact": "Customer cannot access project files needed for client meeting this afternoon",
          "error_codes": ["Authentication Error (503)"],
          "reported_symptoms": [
              "Cannot log into account",
              "Not receiving password reset emails"
          ]
      },
      "possible_causes": [
          "Authentication system failure",
          "Email delivery system issues",
          "Account flag requiring administrative intervention"
      ],
      "recommended_actions": [
          "Immediate: Provide temporary alternative access to project files",
          "Short-term: Manual password reset by admin",
          "Investigation: Check authentication system for Error 503",
          "Investigation: Verify email delivery system functionality"
      ],
      "response_priority": "Immediate - resolve before customer's afternoon meeting"
  }
}
```

### [Why This Works](#why-this-works)

CoVe improves support ticket analysis accuracy because:

1. It creates space for the model to reconsider its initial categorization and assessment
2. The verification questions target specific aspects that might have errors or oversights
3. Answering each question independently reduces confirmation bias from the initial draft
4. The final analysis incorporates corrections identified during verification
5. The process mimics the quality control checkpoint that experienced support agents apply
6. Specific potential causes and recommended actions are better differentiated in the revised output

The approach is particularly valuable for tickets where accurate categorization affects routing, prioritization, and resolution approach. It reduces the likelihood of tickets being misrouted or incorrectly prioritized due to initial analysis errors.

### [Implementation Considerations](#implementation-considerations)

- **Process automation:** CoVe can be implemented as a pipeline with distinct prompts for each phase
- **Selective application:** Apply to high-priority tickets or those with ambiguous categorization to justify the additional processing time
- **Verification focus:** Customize verification questions based on your organization's most common analysis errors
- **Efficiency optimization:** Pre-define verification question templates for different ticket types
- **Integration points:** Consider implementing as a quality assurance step before ticket routing or customer response generation
- **Auditing value:** The verification questions and answers provide valuable transparency for training and process improvement

## [Chain of Density (CoD)](#chain-of-density-cod)

Chain of Density (CoD) is an iterative summarization technique that begins with a deliberately entity-sparse draft and progressively adds key entities while maintaining a fixed length. In each round, the model identifies 1-3 new entities it hasn't mentioned, then rewrites the summary: compressing existing text to make room for them. After several iterations, the summary achieves a higher entity-per-token density, reducing lead bias and often matching or exceeding human summaries in informativeness.

### [When to use](#when-to-use)

| Use case                               | Why CoD works                                                          |
| -------------------------------------- | ---------------------------------------------------------------------- |
| **Support ticket executive summaries** | Creates highly informative briefs within strict length limits          |
| **Agent handover notes**               | Ensures all critical details are captured in a concise format          |
| **Knowledge base entry creation**      | Progressively incorporates technical details without increasing length |
| **Customer communication summaries**   | Balances completeness with brevity for customer record notes           |
| **SLA/escalation notifications**       | Packs essential details into notification character limits             |
| **Support team daily digests**         | Summarizes multiple tickets with key details for management review     |

### [Support Ticket Chain of Density Example](#support-ticket-chain-of-density-example)

This example demonstrates using CoD to create progressively more information-dense summaries of a support ticket for different business purposes.

**Prompt:**

```
SYSTEM: You are a detail-oriented support ticket summarizer.

USER: Support Ticket:
## Support Ticket ##

Ticket ID: TSK-2024-00123
Customer Name: Jane Doe
Customer Email: [email protected]
Customer ID: CUST-78910
Date Submitted: 2024-03-15 10:30 AM UTC
Product/Service: SuperWidget Pro
Subject: Cannot log in to my account

Issue Description:
I've been trying to log into my SuperWidget Pro account for the past 3 hours with no success. I keep getting an "Authentication Error (Code: 503)" message. I tried resetting my password, but I'm not receiving the reset email. I need urgent access to my project files for a client meeting this afternoon. My username is janedoe_widgets.

Task: Produce an increasingly dense summary of this ticket in **exactly 25±3 words**.
Run the following two-step loop **4 times**:
1. MissingEntities - List 1-2 NEW, salient entities (semicolon-separated) NOT yet in the summary.
2. DenserSummary - Rewrite the previous summary to include ALL prior entities PLUS the new ones, WITHOUT changing the word count limit.

Output as JSON array.
```

Output

JSON

```
[
  {
      "Round": 1,
      "MissingEntities": "Login issue; Authentication Error",
      "DenserSummary": "Customer cannot access account due to login issue. Authentication Error preventing access to project files needed urgently for client meeting."
  },
  {
      "Round": 2,
      "MissingEntities": "Error code 503; Password reset failure",
      "DenserSummary": "Customer experiencing Authentication Error (503) and password reset failure. Login issue blocking urgent access to project files for client meeting."
  },
  {
      "Round": 3,
      "MissingEntities": "Jane Doe; janedoe_widgets",
      "DenserSummary": "Jane Doe (janedoe_widgets) facing Authentication Error (503) and password reset failure. Login blocking urgent access to files for client meeting."
  },
  {
      "Round": 4,
      "MissingEntities": "TSK-2024-00123; Email delivery issue",
      "DenserSummary": "TSK-2024-00123: Jane Doe (janedoe_widgets) experiencing Authentication Error (503), password reset and email delivery issues. Urgent access needed for meeting."
  }
]
```

### [Why This Works](#why-this-works)

CoD is effective for support ticket summaries because:

1. It creates progressively more informative summaries while maintaining a consistent, manageable length
2. Each iteration deliberately adds key entities that were missing from previous versions
3. The process forces prioritization of the most important information elements
4. It ensures critical details (customer name, ticket ID, error code) are captured despite length constraints
5. The approach mitigates "lead bias" by considering the entire ticket, not just the opening lines
6. The resulting summaries are both concise and entity-rich, making them ideal for quick reviews

This technique is particularly valuable for creating ticket summaries that will be viewed in space-constrained interfaces such as dashboards, notifications, or mobile views, where maximum information density is essential.

### [Implementation Considerations](#implementation-considerations)

- **Word count customization:** Adjust the target word count based on your specific use case (e.g., Slack notifications, email subjects)
- **Entity priorities:** Customize the types of entities emphasized based on business needs (e.g., prioritize error codes for technical teams, SLAs for management)
- **Round optimization:** For most support tickets, 3-5 rounds achieves optimal density; more can lead to overly compressed language
- **Use case adaptation:** Create different CoD configurations for different outputs (e.g., shorter for notifications, longer for knowledge base entries)
- **Integration points:** Implement at summary generation points in your ticket workflow (e.g., ticket creation, escalation, resolution)
- **Multi-granular outputs:** Store all iterations to offer different summary densities for different consumers (e.g., tier 1 vs. management)

---

description: A practical guide for migrating prompts from closed-source models to open-source models like Llama. Learn key migration principles, how to align system behavior and sampling parameters, refactor prompts, use open-source tooling (llama-prompt-ops, Llama Guard), and ensure safety and quality.
title: Model Migration Guide: Moving from Closed to Open Models - GroqDocs
image: https://console.groq.com/og_cloudv5.jpg

---

# Model Migration Guide

Migrating prompts from commercial models (GPT, Claude, Gemini) to open-source ones like Llama often requires explicitly including instructions that might have been implicitly handled in proprietary systems. This migration typically involves adjusting prompting techniques to be more explicit, matching generation parameters, and testing outputs to help with iteratively adjust prompts until the desired outputs are reached.

## [Migration Principles](#migration-principles)

1. **Surface hidden rules:** Proprietary model providers prepend their closed-source models with system messages that are not explicitly shared with the end user; you must create clear system messages to get consistent outputs.
2. **Start from parity, not aspiration:** Match parameters such as temperature, Top P, and max tokens first, then focus on adjusting your prompts.
3. **Automate the feedback loop:** We recommend using open-source tooling like prompt optimizers instead of manual trial-and-error.

## [Aligning System Behavior and Tone](#aligning-system-behavior-and-tone)

Closed-source models are often prepended with elaborate system prompts that enforce politeness, hedging, legal disclaimers, policies, and more, that are not shown to the end user. To ensure consistency and lead open-source models to generate desired outputs, create a comprehensive system prompt:

```
You are a courteous support agent for AcmeCo.
Always greet with "Certainly: here's the information you requested:".
Refuse medical or legal advice; direct users to professionals.
```

## [Sampling / Parameter Parity](#sampling--parameter-parity)

No matter which model you're migrating from, having explicit control over temperature and other sampling parameters matters a lot. First, determine what temperature your source model defaults to (often 1.0). Then experiment to find what works best for your specific use case - many Llama deployments see better results with temperatures between 0.2-0.4\. The key is to start with parity, measure the results, then adjust deliberately:

| Parameter   | Closed-Source Models | Llama Models | Suggested Adjustments                                            |
| ----------- | -------------------- | ------------ | ---------------------------------------------------------------- |
| temperature | 1.0                  | 0.7          | Lower for factual answers and strict schema adherence (eg. JSON) |
| top_p       | 1.0                  | 1.0          | leave 1.0                                                        |

## [Refactoring Prompts](#refactoring-prompts)

In some cases, you'll need to refactor your prompts to use explicit [Prompt Patterns](https://console.groq.com/docs/prompting/patterns) since different models have varying pre- and post-training that can affect how they function. For example:

- Some models, such as [those that can reason](https://console.groq.com/docs/reasoning), might naturally break down complex problems, while others may need explicit instructions to "think step by step" using [Chain of Thought](https://console.groq.com/docs/prompting/patterns#chain-of-thought) prompting
- Where some models automatically verify facts, others might need [Chain of Verification](https://console.groq.com/docs/prompting/patterns#chain-of-verification-cove) to achieve similar accuracy
- When certain models explore multiple solution paths by default, you can achieve similar results with [Self-Consistency](https://console.groq.com/docs/prompting/patterns#self-consistency) voting across multiple completions

The key is being more explicit about the reasoning process you want. Instead of:

```
"Calculate the compound interest over 5 years"
```

Use:

```
"Let's solve this step by step:
1. First, write out the compound interest formula
2. Then, plug in our values
3. Calculate each year's interest separately
4. Sum the total and verify the math"
```

This explicit guidance helps open models match the sophisticated reasoning that closed models learn through additional training.

### [Migrating from Claude (Anthropic)](#migrating-from-claude-anthropic)

Claude models from Anthropic are known for their conversational abilities, safety features, and detailed reasoning. Claude's system prompts are available [here](https://docs.anthropic.com/en/release-notes/system-prompts). When migrating from Claude to an open-source model like Llama, creating a system prompt with the following instructions to maintain similar behavior:

| Instruction                     | Description                                                                                          |
| ------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Set a clear persona             | "I am a helpful, multilingual, and proactive assistant ready to guide this conversation."            |
| Specify tone & style            | "Be concise and warm. Avoid bullet or numbered lists unless explicitly requested."                   |
| Limit follow-up questions       | "Ask at most one concise clarifying question when needed."                                           |
| Embed reasoning directive       | "For tasks that need analysis, think step-by-step in a Thought: section, then provide Answer: only." |
| Insert counting rule            | "Enumerate each item with #1, #2 ... before giving totals."                                          |
| Provide a brief accuracy notice | "Information on niche or very recent topics may be incomplete—verify externally."                    |
| Define refusal template         | "If a request breaches guidelines, reply: 'I'm sorry, but I can't help with that.'"                  |
| Mirror user language            | "Respond in the same language the user uses."                                                        |
| Reinforce empathy               | "Express sympathy when the user shares difficulties; maintain a supportive tone."                    |
| Control token budget            | Keep the final system block under 2,000 tokens to preserve user context.                             |
| Web search                      | Use [Agentic Tooling](https://console.groq.com/docs/agentic-tooling) for built-in web search.        |

### [Migrating from Grok (xAI)](#migrating-from-grok-xai)

Grok models from xAI are known for their conversational abilities, real-time knowledge, and engaging personality. Grok's system prompts are available [here](https://github.com/xai-org/grok-prompts). When migrating from Grok to an open-source model like Llama, creating a system prompt with the following instructions to maintain similar behavior:

| Instruction              | Description                                                                                                         |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------- |
| Language parity          | "Detect the user's language and respond in the same language."                                                      |
| Structured style         | "Write in short paragraphs; use numbered or bulleted lists for multiple points."                                    |
| Formatting guard         | "Do not output Markdown (or only the Markdown elements you permit)."                                                |
| Length ceiling           | "Keep the answer below 750 characters" and enforce max_completion_tokens in the API call.                           |
| Epistemic stance         | "Adopt a neutral, evidence-seeking tone; challenge unsupported claims; express uncertainty when facts are unclear." |
| Draft-versus-belief rule | "Treat any supplied analysis text as provisional research, not as established fact."                                |
| No meta-references       | "Do not mention the question, system instructions, tool names, or platform branding in the reply."                  |
| Real-time knowledge      | Use [Agentic Tooling](https://console.groq.com/docs/agentic-tooling) for built-in web search.                       |

### [Migrating from OpenAI](#migrating-from-openai)

OpenAI models like GPT-4o are known for their versatility, tool use capabilities, and conversational style. When migrating from OpenAI models to open-source alternatives like Llama, include these key instructions in your system prompt:

| Instruction                                                                          | Description                                                                                                                                     |
| ------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Define a flexible persona                                                            | "I am a helpful, adaptive assistant that mirrors your tone and formality throughout our conversation."                                          |
| Add tone-mirroring guidance                                                          | "I will adjust my vocabulary, sentence length, and formality to match your style throughout our conversation."                                  |
| Set follow-up-question policy                                                        | "When clarification is useful, I'll ask exactly one short follow-up question; otherwise, I'll answer directly."                                 |
| Describe tool-usage rules (if using [tools](https://console.groq.com/docs/tool-use)) | "I can use tools like search and code execution when needed, preferring search for factual queries and code execution for computational tasks." |
| State visual-aid preference                                                          | "I'll offer diagrams when they enhance understanding"                                                                                           |
| Limit probing                                                                        | "I won't ask for confirmation after every step unless instructions are ambiguous."                                                              |
| Embed safety                                                                         | "My answers must respect local laws and organizational policies; I'll refuse prohibited content."                                               |
| Web search                                                                           | Use [Agentic Tooling](https://console.groq.com/docs/agentic-tooling) for built-in web search capabilities                                       |
| Code execution                                                                       | Use [Agentic Tooling](https://console.groq.com/docs/agentic-tooling) for built-in code execution capabilities.                                  |
| Tool use                                                                             | Select a model that supports [tool use](https://console.groq.com/docs/tool-use).                                                                |

### [Migrating from Gemini (Google)](#migrating-from-gemini-google)

When migrating from Gemini to an open-source model like Llama, include these key instructions in your system prompt:

| Instruction                                               | Description                                                                                                              |
| --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| State the role plainly                                    | Start with one line: "You are a concise, professional assistant."                                                        |
| Re-encode rules                                           | Convert every MUST/SHOULD from the original into numbered bullet rules, each should be 1 sentence.                       |
| Define [tool use](https://console.groq.com/docs/tool-use) | Add a short Tools section listing tool names and required JSON structure; provide one sample call.                       |
| Specify tone & length                                     | Include explicit limits (e.g., "less than 150 words unless code is required; formal international English").             |
| Self-check footer                                         | End with "Before sending, ensure JSON validity, correct tag usage, no system text leakage."                              |
| Content-block guidance                                    | Define how rich output should be grouped: for example, Markdown headings for text, fenced blocks for code.               |
| Behaviour checklist                                       | Include numbered, one-sentence rules covering length limits, formatting, and answer structure.                           |
| Prefer brevity                                            | Remind the model to keep explanations brief and omit library boilerplate unless explicitly requested.                    |
| Web search and grounding                                  | Use [Agentic Tooling](https://console.groq.com/docs/agentic-tooling) for built-in web search and grounding capabilities. |

## [Tooling: llama-prompt-ops](#tooling-llamapromptops)

[**llama-prompt-ops**](https://github.com/meta-llama/llama-prompt-ops) auto-rewrites prompts created for GPT / Claude into Llama-optimized phrasing, adjusting spacing, quotes, and special tokens.

Why use it?

- **Drop-in CLI:** feed a JSONL file of prompts and expected responses; get a better prompt with improved success rates.
- **Regression mode:** runs your golden set and reports win/loss vs baseline.

Install once (`pip install llama-prompt-ops`) and run during CI to keep prompts tuned as models evolve.

---

description: Learn how to use prompt caching to reduce latency and costs.
title: Prompt Caching - GroqDocs
image: https://console.groq.com/og_cloudv5.jpg

---

# Prompt Caching

Model prompts often contain repetitive content, such as system prompts and tool definitions. Prompt caching automatically reuses computation from recent requests when they share a common prefix, delivering significant cost savings and improved response times while maintaining data privacy through volatile-only storage that expires automatically.

Prompt caching works automatically on all your API requests with no code changes required and no additional fees.

## [How It Works](#how-it-works)

1. **Prefix Matching**: When you send a request, the system examines and identifies matching prefixes from recently processed requests stored temporarily in volatile memory. Prefixes can include system prompts, tool definitions, few-shot examples, and more.
2. **Cache Hit**: If a matching prefix is found, cached computation is reused, dramatically reducing latency and token costs by 50% for cached portions.
3. **Cache Miss**: If no match exists, your prompt is processed normally, with the prefix temporarily cached for potential future matches.
4. **Automatic Expiration**: All cached data automatically expires within a few hours, which helps ensure privacy while maintaining the benefits.

Prompt caching works automatically on all your API requests to supported models with no code changes required and no additional fees. Groq tries to maximize cache hits, but this is not guaranteed. Pricing discount will only apply on successful cache hits.

Cached tokens do not count towards your rate limits. However, cached tokens are subtracted from your limits after processing, so it's still possible to hit your limits if you are sending a large number of input tokens in parallel requests.

## [Supported Models](#supported-models)

Prompt caching is currently only supported for the following models:

| Model ID                         | Model                                                                           |
| -------------------------------- | ------------------------------------------------------------------------------- |
| moonshotai/kimi-k2-instruct-0905 | [Kimi K2](https://console.groq.com/docs/model/moonshotai/kimi-k2-instruct-0905) |
| openai/gpt-oss-20b               | [GPT-OSS 20B](https://console.groq.com/docs/model/openai/gpt-oss-20b)           |
| openai/gpt-oss-120b              | [GPT-OSS 120B](https://console.groq.com/docs/model/openai/gpt-oss-120b)         |

We're starting with a limited selection of models and will roll out prompt caching to more models soon.

## [Pricing](#pricing)

Prompt caching is provided at no additional cost. There is a 50% discount for cached input tokens.

## [Structuring Prompts for Optimal Caching](#structuring-prompts-for-optimal-caching)

Cache hits are only possible for exact prefix matches within a prompt. To realize caching benefits, you need to think strategically about prompt organization:

### [Optimal Prompt Structure](#optimal-prompt-structure)

Place static content like instructions and examples at the beginning of your prompt, and put variable content, such as user-specific information, at the end. This maximizes the length of the reusable prefix across different requests.

If you put variable information (like timestamps or user IDs) at the beginning, even identical system instructions later in the prompt won't benefit from caching because the prefixes won't match.

**Place static content first:**

- System prompts and instructions
- Few-shot examples
- Tool definitions
- Schema definitions
- Common context or background information

**Place dynamic content last:**

- User-specific queries
- Variable data
- Timestamps
- Session-specific information
- Unique identifiers

### [Example Structure](#example-structure)

text

```
[SYSTEM PROMPT - Static]
[TOOL DEFINITIONS - Static]
[FEW-SHOT EXAMPLES - Static]
[COMMON INSTRUCTIONS - Static]
[USER QUERY - Dynamic]
[SESSION DATA - Dynamic]
```

This structure maximizes the likelihood that the static prefix portion will match across different requests, enabling cache hits while keeping user-specific content at the end.

## [Prompt Caching Examples](#prompt-caching-examples)

Multi turn conversationsLarge prompts and contextTool definitions and use

JavaScript

```
import Groq from "groq-sdk";

const groq = new Groq();

async function multiTurnConversation() {
  // Initial conversation with system message and first user input
  const initialMessages = [
    {
      role: "system",
      content: "You are a helpful AI assistant that provides detailed explanations about complex topics. Always provide comprehensive answers with examples and context."
    },
    {
      role: "user",
      content: "What is quantum computing?"
    }
  ];

  // First request - creates cache for system message
  const firstResponse = await groq.chat.completions.create({
    messages: initialMessages,
    model: "moonshotai/kimi-k2-instruct-0905"
  });

  console.log("First response:", firstResponse.choices[0].message.content);
  console.log("Usage:", firstResponse.usage);

  // Continue conversation - system message and previous context will be cached
  const conversationMessages = [
    ...initialMessages,
    firstResponse.choices[0].message,
    {
      role: "user",
      content: "Can you give me a simple example of how quantum superposition works?"
    }
  ];

  const secondResponse = await groq.chat.completions.create({
    messages: conversationMessages,
    model: "moonshotai/kimi-k2-instruct-0905"
  });

  console.log("Second response:", secondResponse.choices[0].message.content);
  console.log("Usage:", secondResponse.usage);

  // Continue with third turn
  const thirdTurnMessages = [
    ...conversationMessages,
    secondResponse.choices[0].message,
    {
      role: "user",
      content: "How does this relate to quantum entanglement?"
    }
  ];

  const thirdResponse = await groq.chat.completions.create({
    messages: thirdTurnMessages,
    model: "moonshotai/kimi-k2-instruct-0905"
  });

  console.log("Third response:", thirdResponse.choices[0].message.content);
  console.log("Usage:", thirdResponse.usage);
}

multiTurnConversation().catch(console.error);
```

```
import os
from groq import Groq

client = Groq()

def multi_turn_conversation():
    # Initial conversation with system message and first user input
    initial_messages = [
        {
            "role": "system",
            "content": "You are a helpful AI assistant that provides detailed explanations about complex topics. Always provide comprehensive answers with examples and context."
        },
        {
            "role": "user",
            "content": "What is quantum computing?"
        }
    ]

    # First request - creates cache for system message
    first_response = client.chat.completions.create(
        messages=initial_messages,
        model="moonshotai/kimi-k2-instruct-0905"
    )

    print("First response:", first_response.choices[0].message.content)
    print("Usage:", first_response.usage)

    # Continue conversation - system message and previous context will be cached
    conversation_messages = [
        *initial_messages,
        first_response.choices[0].message,
        {
            "role": "user",
            "content": "Can you give me a simple example of how quantum superposition works?"
        }
    ]

    second_response = client.chat.completions.create(
        messages=conversation_messages,
        model="moonshotai/kimi-k2-instruct-0905"
    )

    print("Second response:", second_response.choices[0].message.content)
    print("Usage:", second_response.usage)

    # Continue with third turn
    third_turn_messages = [
        *conversation_messages,
        second_response.choices[0].message,
        {
            "role": "user",
            "content": "How does this relate to quantum entanglement?"
        }
    ]

    third_response = client.chat.completions.create(
        messages=third_turn_messages,
        model="moonshotai/kimi-k2-instruct-0905"
    )

    print("Third response:", third_response.choices[0].message.content)
    print("Usage:", third_response.usage)

if __name__ == "__main__":
    multi_turn_conversation()
```

```
#!/bin/bash

# Multi-turn conversation example with prompt caching
# Set your GROQ_API_KEY environment variable before running

API_KEY="${GROQ_API_KEY}"
BASE_URL="https://api.groq.com/openai/v1"

if [ -z "$API_KEY" ]; then
    echo "Error: GROQ_API_KEY environment variable is not set"
    exit 1
fi

echo "=== First Request (Creates Cache) ==="

# First request - creates cache for system message
FIRST_RESPONSE=$(curl -s -X POST "$BASE_URL/chat/completions" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {
        "role": "system",
        "content": "You are a helpful AI assistant that provides detailed explanations about complex topics. Always provide comprehensive answers with examples and context."
      },
      {
        "role": "user",
        "content": "What is quantum computing?"
      }
    ],
    "model": "moonshotai/kimi-k2-instruct-0905"
  }')

echo "First response:"
echo "$FIRST_RESPONSE" | jq '.choices[0].message.content'
echo "Usage:"
echo "$FIRST_RESPONSE" | jq '.usage'

# Extract the assistant's response for next turn
ASSISTANT_RESPONSE=$(echo "$FIRST_RESPONSE" | jq -r '.choices[0].message.content')

echo -e "\n=== Second Request (Uses Cache) ==="

# Second request - system message and previous context will be cached
SECOND_PAYLOAD=$(jq -n \
  --arg system_content "You are a helpful AI assistant that provides detailed explanations about complex topics. Always provide comprehensive answers with examples and context." \
  --arg user1_content "What is quantum computing?" \
  --arg assistant1_content "$ASSISTANT_RESPONSE" \
  --arg user2_content "Can you give me a simple example of how quantum superposition works?" \
  --arg model "moonshotai/kimi-k2-instruct-0905" \
  '{
    "messages": [
      {
        "role": "system",
        "content": $system_content
      },
      {
        "role": "user",
        "content": $user1_content
      },
      {
        "role": "assistant",
        "content": $assistant1_content
      },
      {
        "role": "user",
        "content": $user2_content
      }
    ],
    "model": $model
  }')

SECOND_RESPONSE=$(curl -s -X POST "$BASE_URL/chat/completions" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d "$SECOND_PAYLOAD")

echo "Second response:"
echo "$SECOND_RESPONSE" | jq '.choices[0].message.content'
echo "Usage:"
echo "$SECOND_RESPONSE" | jq '.usage'

# Extract the second assistant response for third turn
SECOND_ASSISTANT_RESPONSE=$(echo "$SECOND_RESPONSE" | jq -r '.choices[0].message.content')

echo -e "\n=== Third Request (Uses Cache) ==="

# Third request - even more conversation history cached
THIRD_PAYLOAD=$(jq -n \
  --arg system_content "You are a helpful AI assistant that provides detailed explanations about complex topics. Always provide comprehensive answers with examples and context." \
  --arg user1_content "What is quantum computing?" \
  --arg assistant1_content "$ASSISTANT_RESPONSE" \
  --arg user2_content "Can you give me a simple example of how quantum superposition works?" \
  --arg assistant2_content "$SECOND_ASSISTANT_RESPONSE" \
  --arg user3_content "How does this relate to quantum entanglement?" \
  --arg model "moonshotai/kimi-k2-instruct-0905" \
  '{
    "messages": [
      {
        "role": "system",
        "content": $system_content
      },
      {
        "role": "user",
        "content": $user1_content
      },
      {
        "role": "assistant",
        "content": $assistant1_content
      },
      {
        "role": "user",
        "content": $user2_content
      },
      {
        "role": "assistant",
        "content": $assistant2_content
      },
      {
        "role": "user",
        "content": $user3_content
      }
    ],
    "model": $model
  }')

THIRD_RESPONSE=$(curl -s -X POST "$BASE_URL/chat/completions" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d "$THIRD_PAYLOAD")

echo "Third response:"
echo "$THIRD_RESPONSE" | jq '.choices[0].message.content'
echo "Usage:"
echo "$THIRD_RESPONSE" | jq '.usage'
```

### [How Prompt Caching Works in Multi-Turn Conversations](#how-prompt-caching-works-in-multiturn-conversations)

In this example, we demonstrate how to use prompt caching in a multi-turn conversation.

During each turn, the system automatically caches the longest matching prefix from previous requests. The system message and conversation history that remain unchanged between requests will be cached, while only new user messages and assistant responses need fresh processing.

This approach is useful for maintaining context in ongoing conversations without repeatedly processing the same information.

**For the first request:**

- `prompt_tokens`: Number of tokens in the system message and first user message
- `cached_tokens`: 0 (no cache hit on first request)

**For subsequent requests within the cache lifetime:**

- `prompt_tokens`: Total number of tokens in the entire conversation (system message + conversation history + new user message)
- `cached_tokens`: Number of tokens in the system message and previous conversation history that were served from cache

When set up properly, you should see increasing cache efficiency as the conversation grows, with the system message and earlier conversation turns being served from cache while only new content requires processing.

JavaScript

```
import Groq from "groq-sdk";

const groq = new Groq();

async function analyzeLegalDocument() {
  // First request - creates cache for the large legal document
  const systemPrompt = `You are a legal expert AI assistant. Analyze the following legal document and provide detailed insights.

LEGAL DOCUMENT: <entire contents of large legal document>`;

  const firstAnalysis = await groq.chat.completions.create({
    messages: [
      {
        role: "system",
        content: systemPrompt
      },
      {
        role: "user",
        content: "What are the key provisions regarding user account termination in this agreement?"
      }
    ],
    model: "moonshotai/kimi-k2-instruct-0905"
  });

  console.log("First analysis:", firstAnalysis.choices[0].message.content);
  console.log("Usage:", firstAnalysis.usage);

  // Second request - legal document will be cached, only new question processed
  const secondAnalysis = await groq.chat.completions.create({
    messages: [
      {
        role: "system",
        content: systemPrompt
      },
      {
        role: "user",
        content: "What are the intellectual property rights implications for users who submit content?"
      }
    ],
    model: "moonshotai/kimi-k2-instruct-0905"
  });

  console.log("Second analysis:", secondAnalysis.choices[0].message.content);
  console.log("Usage:", secondAnalysis.usage);

  // Third request - same large context, different question
  const thirdAnalysis = await groq.chat.completions.create({
    messages: [
      {
        role: "system",
        content: systemPrompt
      },
      {
        role: "user",
        content: "Are there any concerning limitations of liability clauses that users should be aware of?"
      }
    ],
    model: "moonshotai/kimi-k2-instruct-0905"
  });

  console.log("Third analysis:", thirdAnalysis.choices[0].message.content);
  console.log("Usage:", thirdAnalysis.usage);
}

analyzeLegalDocument().catch(console.error);
```

```
from groq import Groq

client = Groq()

def analyze_legal_document():
    # First request - creates cache for the large legal document
    system_prompt = """
    You are a legal expert AI assistant. Analyze the following legal document and provide detailed insights.\\n\\nLEGAL DOCUMENT:\\n<entire contents of large legal document>
    """

    first_analysis = client.chat.completions.create(
        messages=[
            {
                "role": "system",
                "content": system_prompt
            },
            {
                "role": "user",
                "content": "What are the key provisions regarding user account termination in this agreement?"
            }
        ],
        model="moonshotai/kimi-k2-instruct-0905"
    )

    print("First analysis:", first_analysis.choices[0].message.content)
    print("Usage:", first_analysis.usage)

    # Second request - legal document will be cached, only new question processed
    second_analysis = client.chat.completions.create(
        messages=[
            {
                "role": "system",
                "content": system_prompt
            },
            {
                "role": "user",
                "content": "What are the intellectual property rights implications for users who submit content?"
            }
        ],
        model="moonshotai/kimi-k2-instruct-0905"
    )

    print("Second analysis:", second_analysis.choices[0].message.content)
    print("Usage:", second_analysis.usage)

    # Third request - same large context, different question
    third_analysis = client.chat.completions.create(
        messages=[
            {
                "role": "system",
                "content": system_prompt
            },
            {
                "role": "user",
                "content": "Are there any concerning limitations of liability clauses that users should be aware of?"
            }
        ],
        model="moonshotai/kimi-k2-instruct-0905"
    )

    print("Third analysis:", third_analysis.choices[0].message.content)
    print("Usage:", third_analysis.usage)

if __name__ == "__main__":
    analyze_legal_document()
```

```
#!/bin/bash

# Large prompts and context example with prompt caching
# Set your GROQ_API_KEY environment variable before running

API_KEY="${GROQ_API_KEY}"
BASE_URL="https://api.groq.com/openai/v1"

if [ -z "$API_KEY" ]; then
    echo "Error: GROQ_API_KEY environment variable is not set"
    exit 1
fi

SYSTEM_MESSAGE="You are a legal expert AI assistant. Analyze the following legal document and provide detailed insights.

LEGAL DOCUMENT: <entire contents of large legal document>"

echo "=== First Request (Creates Cache) ==="

# First request - creates cache for the large legal document
FIRST_RESPONSE=$(curl -s -X POST "$BASE_URL/chat/completions" \
    -H "Authorization: Bearer $API_KEY" \
    -H "Content-Type: application/json" \
    -d "$(jq -n \
        --arg system_msg "$SYSTEM_MESSAGE" \
        '{
            "messages": [
                {
                    "role": "system",
                    "content": $system_msg
                },
                {
                    "role": "user",
                    "content": "What are the key provisions regarding user account termination in this agreement?"
                }
            ],
            "model": "moonshotai/kimi-k2-instruct-0905"
        }')")

echo "First analysis:"
echo "$FIRST_RESPONSE" | jq '.choices[0].message.content'
echo "Usage:"
echo "$FIRST_RESPONSE" | jq '.usage'

echo -e "\\n=== Second Request (Uses Cache) ==="

# Second request - legal document will be cached, only new question processed
SECOND_RESPONSE=$(curl -s -X POST "$BASE_URL/chat/completions" \
    -H "Authorization: Bearer $API_KEY" \
    -H "Content-Type: application/json" \
    -d "$(jq -n \
        --arg system_msg "$SYSTEM_MESSAGE" \
        '{
            "messages": [
                {
                    "role": "system",
                    "content": $system_msg
                },
                {
                    "role": "user",
                    "content": "What are the intellectual property rights implications for users who submit content?"
                }
            ],
            "model": "moonshotai/kimi-k2-instruct-0905"
        }')")

echo "Second analysis:"
echo "$SECOND_RESPONSE" | jq '.choices[0].message.content'
echo "Usage:"
echo "$SECOND_RESPONSE" | jq '.usage'

echo -e "\\n=== Third Request (Uses Cache) ==="

# Third request - same large context, different question
THIRD_RESPONSE=$(curl -s -X POST "$BASE_URL/chat/completions" \
    -H "Authorization: Bearer $API_KEY" \
    -H "Content-Type: application/json" \
    -d "$(jq -n \
        --arg system_msg "$SYSTEM_MESSAGE" \
        '{
            "messages": [
                {
                    "role": "system",
                    "content": $system_msg
                },
                {
                    "role": "user",
                    "content": "Are there any concerning limitations of liability clauses that users should be aware of?"
                }
            ],
            "model": "moonshotai/kimi-k2-instruct-0905"
        }')")

echo "Third analysis:"
echo "$THIRD_RESPONSE" | jq '.choices[0].message.content'
echo "Usage:"
echo "$THIRD_RESPONSE" | jq '.usage'
```

### [How Prompt Caching Works with Large Context](#how-prompt-caching-works-with-large-context)

In this example, we demonstrate caching large static content like legal documents, research papers, or extensive context that remains constant across multiple queries.

The large legal document in the system message represents static content that benefits significantly from caching. Once cached, subsequent requests with different questions about the same document will reuse the cached computation for the document analysis, processing only the new user questions.

This approach is particularly effective for document analysis, research assistance, or any scenario where you need to ask multiple questions about the same large piece of content.

**For the first request:**

- `prompt_tokens`: Total number of tokens in the system message (including the large legal document) and user message
- `cached_tokens`: 0 (no cache hit on first request)

**For subsequent requests within the cache lifetime:**

- `prompt_tokens`: Total number of tokens in the system message (including the large legal document) and user message
- `cached_tokens`: Number of tokens in the entire cached system message (including the large legal document)

The caching efficiency is particularly high in this scenario since the large document (which may be thousands of tokens) is reused across multiple requests, while only small user queries (typically dozens of tokens) need fresh processing.

JavaScript

```
import Groq from "groq-sdk";

const groq = new Groq();

// Define comprehensive tool set
const tools = [
  {
    type: "function",
    function: {
      name: "get_weather",
      description: "Get the current weather in a given location",
      parameters: {
        type: "object",
        properties: {
          location: {
            type: "string",
            description: "The city and state, e.g. San Francisco, CA"
          },
          unit: {
            type: "string",
            enum: ["celsius", "fahrenheit"],
            description: "The unit of temperature"
          }
        },
        required: ["location"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "calculate_math",
      description: "Perform mathematical calculations",
      parameters: {
        type: "object",
        properties: {
          expression: {
            type: "string",
            description: "Mathematical expression to evaluate, e.g. '2 + 2' or 'sqrt(16)'"
          }
        },
        required: ["expression"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "search_web",
      description: "Search the web for current information",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "Search query"
          },
          num_results: {
            type: "integer",
            description: "Number of results to return",
            minimum: 1,
            maximum: 10,
            default: 5
          }
        },
        required: ["query"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "get_time",
      description: "Get the current time in a specific timezone",
      parameters: {
        type: "object",
        properties: {
          timezone: {
            type: "string",
            description: "Timezone identifier, e.g. 'America/New_York' or 'UTC'"
          }
        },
        required: ["timezone"]
      }
    }
  }
];

async function useToolsWithCaching() {
  // First request - creates cache for all tool definitions
  const systemPrompt = "You are a helpful assistant with access to various tools. Use the appropriate tools to answer user questions accurately.";
  const firstRequest = await groq.chat.completions.create({
    messages: [
      {
        role: "system",
        content: systemPrompt
      },
      {
        role: "user",
        content: "What's the weather like in New York City?"
      }
    ],
    model: "moonshotai/kimi-k2-instruct-0905",
    tools: tools
  });

  console.log("First request response:", firstRequest.choices[0].message);
  console.log("Usage:", firstRequest.usage);

  // Check if the model wants to use tools
  if (firstRequest.choices[0].message.tool_calls) {
    console.log("Tool calls requested:", firstRequest.choices[0].message.tool_calls);
  }

  // Second request - tool definitions will be cached
  const secondRequest = await groq.chat.completions.create({
    messages: [
      {
        role: "system",
        content: systemPrompt
      },
      {
        role: "user",
        content: "Can you calculate the square root of 144 and tell me what time it is in Tokyo?"
      }
    ],
    model: "moonshotai/kimi-k2-instruct-0905",
    tools: tools
  });

  console.log("Second request response:", secondRequest.choices[0].message);
  console.log("Usage:", secondRequest.usage);

  if (secondRequest.choices[0].message.tool_calls) {
    console.log("Tool calls requested:", secondRequest.choices[0].message.tool_calls);
  }

  // Third request - same tool definitions cached
  const thirdRequest = await groq.chat.completions.create({
    messages: [
      {
        role: "system",
        content: systemPrompt
      },
      {
        role: "user",
        content: "Search for recent news about artificial intelligence developments."
      }
    ],
    model: "moonshotai/kimi-k2-instruct-0905",
    tools: tools
  });

  console.log("Third request response:", thirdRequest.choices[0].message);
  console.log("Usage:", thirdRequest.usage);

  if (thirdRequest.choices[0].message.tool_calls) {
    console.log("Tool calls requested:", thirdRequest.choices[0].message.tool_calls);
  }
}

useToolsWithCaching().catch(console.error);
```

```
from groq import Groq

client = Groq()

# Define comprehensive tool set
tools = [
    {
        "type": "function",
        "function": {
            "name": "get_weather",
            "description": "Get the current weather in a given location",
            "parameters": {
                "type": "object",
                "properties": {
                    "location": {
                        "type": "string",
                        "description": "The city and state, e.g. San Francisco, CA"
                    },
                    "unit": {
                        "type": "string",
                        "enum": ["celsius", "fahrenheit"],
                        "description": "The unit of temperature"
                    }
                },
                "required": ["location"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "calculate_math",
            "description": "Perform mathematical calculations",
            "parameters": {
                "type": "object",
                "properties": {
                    "expression": {
                        "type": "string",
                        "description": "Mathematical expression to evaluate, e.g. '2 + 2' or 'sqrt(16)'"
                    }
                },
                "required": ["expression"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "search_web",
            "description": "Search the web for current information",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {
                        "type": "string",
                        "description": "Search query"
                    },
                    "num_results": {
                        "type": "integer",
                        "description": "Number of results to return",
                        "minimum": 1,
                        "maximum": 10,
                        "default": 5
                    }
                },
                "required": ["query"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_time",
            "description": "Get the current time in a specific timezone",
            "parameters": {
                "type": "object",
                "properties": {
                    "timezone": {
                        "type": "string",
                        "description": "Timezone identifier, e.g. 'America/New_York' or 'UTC'"
                    }
                },
                "required": ["timezone"]
            }
        }
    }
]

def use_tools_with_caching():
    # First request - creates cache for all tool definitions
    first_request = client.chat.completions.create(
        messages=[
            {
                "role": "system",
                "content": "You are a helpful assistant with access to various tools. Use the appropriate tools to answer user questions accurately."
            },
            {
                "role": "user",
                "content": "What's the weather like in New York City?"
            }
        ],
        model="moonshotai/kimi-k2-instruct-0905",
        tools=tools
    )

    print("First request response:", first_request.choices[0].message)
    print("Usage:", first_request.usage)

    # Check if the model wants to use tools
    if first_request.choices[0].message.tool_calls:
        print("Tool calls requested:", first_request.choices[0].message.tool_calls)

    # Second request - tool definitions will be cached
    second_request = client.chat.completions.create(
        messages=[
            {
                "role": "system",
                "content": "You are a helpful assistant with access to various tools. Use the appropriate tools to answer user questions accurately."
            },
            {
                "role": "user",
                "content": "Can you calculate the square root of 144 and tell me what time it is in Tokyo?"
            }
        ],
        model="moonshotai/kimi-k2-instruct-0905",
        tools=tools
    )

    print("Second request response:", second_request.choices[0].message)
    print("Usage:", second_request.usage)

    if second_request.choices[0].message.tool_calls:
        print("Tool calls requested:", second_request.choices[0].message.tool_calls)

    # Third request - same tool definitions cached
    third_request = client.chat.completions.create(
        messages=[
            {
                "role": "system",
                "content": "You are a helpful assistant with access to various tools. Use the appropriate tools to answer user questions accurately."
            },
            {
                "role": "user",
                "content": "Search for recent news about artificial intelligence developments."
            }
        ],
        model="moonshotai/kimi-k2-instruct-0905",
        tools=tools
    )

    print("Third request response:", third_request.choices[0].message)
    print("Usage:", third_request.usage)

    if third_request.choices[0].message.tool_calls:
        print("Tool calls requested:", third_request.choices[0].message.tool_calls)

if __name__ == "__main__":
    use_tools_with_caching()
```

```
#!/bin/bash

# Tool definitions and use example with prompt caching
# Set your GROQ_API_KEY environment variable before running

API_KEY="${GROQ_API_KEY}"
BASE_URL="https://api.groq.com/openai/v1"

if [[ -z "$API_KEY" ]]; then
    echo "Error: GROQ_API_KEY environment variable is not set"
    exit 1
fi

# Define comprehensive tool set
TOOLS='[
    {
        "type": "function",
        "function": {
            "name": "get_weather",
            "description": "Get the current weather in a given location",
            "parameters": {
                "type": "object",
                "properties": {
                    "location": {
                        "type": "string",
                        "description": "The city and state, e.g. San Francisco, CA"
                    },
                    "unit": {
                        "type": "string",
                        "enum": ["celsius", "fahrenheit"],
                        "description": "The unit of temperature"
                    }
                },
                "required": ["location"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "calculate_math",
            "description": "Perform mathematical calculations",
            "parameters": {
                "type": "object",
                "properties": {
                    "expression": {
                        "type": "string",
                        "description": "Mathematical expression to evaluate, e.g. '\''2 + 2'\'' or '\''sqrt(16)'\''"
                    }
                },
                "required": ["expression"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "search_web",
            "description": "Search the web for current information",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {
                        "type": "string",
                        "description": "Search query"
                    },
                    "num_results": {
                        "type": "integer",
                        "description": "Number of results to return",
                        "minimum": 1,
                        "maximum": 10,
                        "default": 5
                    }
                },
                "required": ["query"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_time",
            "description": "Get the current time in a specific timezone",
            "parameters": {
                "type": "object",
                "properties": {
                    "timezone": {
                        "type": "string",
                        "description": "Timezone identifier, e.g. '\''America/New_York'\'' or '\''UTC'\''"
                    }
                },
                "required": ["timezone"]
            }
        }
    }
]'

SYSTEM_MESSAGE="You are a helpful assistant with access to various tools. Use the appropriate tools to answer user questions accurately."

echo "=== First Request (Creates Cache) ==="

# First request - creates cache for all tool definitions
FIRST_RESPONSE=$(curl -s -X POST "$BASE_URL/chat/completions" \
    -H "Authorization: Bearer $API_KEY" \
    -H "Content-Type: application/json" \
    -d "$(jq -n \
        --arg system_msg "$SYSTEM_MESSAGE" \
        --argjson tools "$TOOLS" \
        '{
            "messages": [
                {
                    "role": "system",
                    "content": $system_msg
                },
                {
                    "role": "user",
                    "content": "What'\''s the weather like in New York City?"
                }
            ],
            "model": "moonshotai/kimi-k2-instruct-0905",
            "tools": $tools
        }')")

echo "First request response:"
echo "$FIRST_RESPONSE" | jq '.choices[0].message'
echo "Usage:"
echo "$FIRST_RESPONSE" | jq '.usage'

# Check if tool calls were requested
TOOL_CALLS=$(echo "$FIRST_RESPONSE" | jq '.choices[0].message.tool_calls // empty')
if [[ -n "$TOOL_CALLS" && "$TOOL_CALLS" != "null" ]]; then
    echo "Tool calls requested:"
    echo "$TOOL_CALLS"
fi

echo -e "\n=== Second Request (Uses Cache) ==="

# Second request - tool definitions will be cached
SECOND_RESPONSE=$(curl -s -X POST "$BASE_URL/chat/completions" \
    -H "Authorization: Bearer $API_KEY" \
    -H "Content-Type: application/json" \
    -d "$(jq -n \
        --arg system_msg "$SYSTEM_MESSAGE" \
        --argjson tools "$TOOLS" \
        '{
            "messages": [
                {
                    "role": "system",
                    "content": $system_msg
                },
                {
                    "role": "user",
                    "content": "Can you calculate the square root of 144 and tell me what time it is in Tokyo?"
                }
            ],
            "model": "moonshotai/kimi-k2-instruct-0905",
            "tools": $tools
        }')")

echo "Second request response:"
echo "$SECOND_RESPONSE" | jq '.choices[0].message'
echo "Usage:"
echo "$SECOND_RESPONSE" | jq '.usage'

# Check if tool calls were requested
TOOL_CALLS=$(echo "$SECOND_RESPONSE" | jq '.choices[0].message.tool_calls // empty')
if [[ -n "$TOOL_CALLS" && "$TOOL_CALLS" != "null" ]]; then
    echo "Tool calls requested:"
    echo "$TOOL_CALLS"
fi

echo -e "\n=== Third Request (Uses Cache) ==="

# Third request - same tool definitions cached
THIRD_RESPONSE=$(curl -s -X POST "$BASE_URL/chat/completions" \
    -H "Authorization: Bearer $API_KEY" \
    -H "Content-Type: application/json" \
    -d "$(jq -n \
        --arg system_msg "$SYSTEM_MESSAGE" \
        --argjson tools "$TOOLS" \
        '{
            "messages": [
                {
                    "role": "system",
                    "content": $system_msg
                },
                {
                    "role": "user",
                    "content": "Search for recent news about artificial intelligence developments."
                }
            ],
            "model": "moonshotai/kimi-k2-instruct-0905",
            "tools": $tools
        }')")

echo "Third request response:"
echo "$THIRD_RESPONSE" | jq '.choices[0].message'
echo "Usage:"
echo "$THIRD_RESPONSE" | jq '.usage'

# Check if tool calls were requested
TOOL_CALLS=$(echo "$THIRD_RESPONSE" | jq '.choices[0].message.tool_calls // empty')
if [[ -n "$TOOL_CALLS" && "$TOOL_CALLS" != "null" ]]; then
    echo "Tool calls requested:"
    echo "$TOOL_CALLS"
fi
```

### [How Prompt Caching Works with Tool Definitions](#how-prompt-caching-works-with-tool-definitions)

In this example, we demonstrate caching tool definitions.

All tool definitions, including their schemas, descriptions, and parameters, are cached as a single prefix when they remain consistent across requests. This is particularly valuable when you have a comprehensive set of tools that you want to reuse across multiple requests without re-processing them each time.

The system message and all tool definitions form the static prefix that gets cached, while user queries remain dynamic and are processed fresh for each request.

This approach is useful when you have a consistent set of tools that you want to reuse across multiple requests without re-processing them each time.

**For the first request:**

- `prompt_tokens`: Total number of tokens in the system message, tool definitions, and user message
- `cached_tokens`: 0 (no cache hit on first request)

**For subsequent requests within the cache lifetime:**

- `prompt_tokens`: Total number of tokens in the system message, tool definitions, and user message
- `cached_tokens`: Number of tokens in all cached tool definitions and system prompt

Tool definitions can be quite lengthy due to detailed parameter schemas and descriptions, making caching particularly beneficial for reducing both latency and costs when the same tool set is used repeatedly.

## [Requirements and Limitations](#requirements-and-limitations)

### [Caching Requirements](#caching-requirements)

- **Exact Prefix Matching**: Cache hits require exact matches of the beginning of your prompt
- **Minimum Prompt Length**: The minimum cacheable prompt length varies by model, ranging from 128 to 1024 tokens depending on the specific model used

To check how much of your prompt was cached, see the response [usage fields](#response-usage-structure).

### [What Can Be Cached](#what-can-be-cached)

- **Complete message arrays** including system, user, and assistant messages
- **Tool definitions** and function schemas
- **System instructions** and prompt templates
- **One-shot** and **few-shot examples**
- **Structured output schemas**
- **Large static content** like legal documents, research papers, or extensive context that remains constant across multiple queries
- **Image inputs**, including image URLs and base64-encoded images

### [Limitations](#limitations)

- **Exact Matching**: Even minor changes in cached portions prevent cache hits and force a new cache to be created
- **No Manual Control**: Cache clearing and management is automatic only

## [Tracking Cache Usage](#tracking-cache-usage)

You can monitor how many tokens are being served from cache by examining the `usage` field in your API response. The response includes detailed token usage information, including how many tokens were cached.

### [Response Usage Structure](#response-usage-structure)

JSON

```
{
  "id": "chatcmpl-...",
  "model": "moonshotai/kimi-k2-instruct",
  "usage": {
    "prompt_tokens": 2006,
    "completion_tokens": 300,
    "total_tokens": 2306,
    "prompt_tokens_details": {
      "cached_tokens": 1920
    },
    "completion_tokens_details": {
      "reasoning_tokens": 0,
      "accepted_prediction_tokens": 0,
      "rejected_prediction_tokens": 0
    }
  },
  ... other fields
}
```

### [Understanding the Fields](#understanding-the-fields)

- **`prompt_tokens`**: Total number of tokens in your input prompt
- **`cached_tokens`**: Number of input tokens that were served from cache (within `prompt_tokens_details`)
- **`completion_tokens`**: Number of tokens in the model's response
- **`total_tokens`**: Sum of prompt and completion tokens

In the example above, out of 2,006 prompt tokens, 1,920 tokens (95.7%) were served from cache, resulting in significant cost savings and improved response time.

### [Calculating Cache Hit Rate](#calculating-cache-hit-rate)

To calculate your cache hit rate:

`Cache Hit Rate = cached_tokens / prompt_tokens × 100%`

For the example above: `1920 / 2006 × 100% = 95.7%`

A higher cache hit rate indicates better prompt structure optimization leading to lower latency and more cost savings.

## [Troubleshooting](#troubleshooting)

- Verify that sections that you want to cache are identical between requests
- Check that calls are made within the cache lifetime (a few hours). Calls that are too far apart will not benefit from caching.
- Ensure that `tool_choice`, tool usage, and image usage remain consistent between calls
- Validate that you are caching at least the [minimum number of tokens](#caching-requirements) through the [usage fields](#response-usage-structure).

Changes to cached sections, including `tool_choice` and image usage, will invalidate the cache and require a new cache to be created. Subsequent calls will use the new cache.

## [Frequently Asked Questions](#frequently-asked-questions)

### [How is data privacy maintained with caching?](#how-is-data-privacy-maintained-with-caching)

All cached data exists only in volatile memory and automatically expires within a few hours. No prompt or response content is ever stored in persistent storage or shared between organizations.

### [Does caching affect the quality or consistency of responses?](#does-caching-affect-the-quality-or-consistency-of-responses)

No. Prompt caching only affects the processing of the input prompt, not the generation of responses. The actual model inference and response generation occur normally, maintaining identical output quality whether caching is used or not.

### [Can I disable prompt caching?](#can-i-disable-prompt-caching)

Prompt caching is automatically enabled and cannot be manually disabled. This helps customers benefit from reduced costs and latency. Prompts are not stored in persistent storage.

### [How do I know if my requests are benefiting from caching?](#how-do-i-know-if-my-requests-are-benefiting-from-caching)

You can track cache usage by examining the `usage` field in your API responses. Cache hits are not guaranteed, but Groq tries to maximize them. See the [Tracking Cache Usage](#tracking-cache-usage) section above for detailed information on how to monitor cached tokens and calculate your cache hit rate.

### [Are there any additional costs for using prompt caching?](#are-there-any-additional-costs-for-using-prompt-caching)

No. Prompt caching is provided at no additional cost and can help to reduce your costs by 50% for cached tokens while improving response times.

### [Does caching affect rate limits?](#does-caching-affect-rate-limits)

Cached tokens do not count toward your rate limits.

### [Can I manually clear or refresh caches?](#can-i-manually-clear-or-refresh-caches)

No manual cache management is available. All cache expiration and cleanup happens automatically.

### [Does the prompt caching discount work with batch requests?](#does-the-prompt-caching-discount-work-with-batch-requests)

Batch requests can still benefit from prompt caching, but the prompt caching discount does not stack with the batch discount. [Batch requests](https://console.groq.com/docs/batch) already receive a 50% discount on all tokens, and while caching functionality remains active, no additional discount is applied to cached tokens in batch requests.

---

description: Learn how to measure, understand, and optimize latency in your Groq-powered applications for production deployment with comprehensive guidance on TTFT, token generation, and performance optimization strategies.
title: Understanding and Optimizing Latency - GroqDocs
image: https://console.groq.com/og_cloudv5.jpg

---

# Understanding and Optimizing Latency on Groq

### [Overview](#overview)

Latency is a critical factor when building production applications with Large Language Models (LLMs). This guide helps you understand, measure, and optimize latency across your Groq-powered applications, providing a comprehensive foundation for production deployment.

## [Understanding Latency in LLM Applications](#understanding-latency-in-llm-applications)

### [Key Metrics in Groq Console](#key-metrics-in-groq-console)

Your Groq Console [dashboard](https://console.groq.com/dashboard) contains pages for metrics, usage, logs, and more. When you view your Groq API request logs, you'll see important data regarding your API requests. The following are ones relevant to latency that we'll call out and define:

- **Time to First Token (TTFT)**: Time from API request sent to first token received from the model
- **Latency**: Total server time from API request to completion
- **Input Tokens**: Number of tokens provided to the model (e.g. system prompt, user query, assistant message), directly affecting TTFT
- **Output Tokens**: Number of tokens generated, impacting total latency
- **Tokens/Second**: Generation speed of model outputs

### [The Complete Latency Picture](#the-complete-latency-picture)

The users of the applications you build with APIs in general experience total latency that includes:

`User-Experienced Latency = Network Latency + Server-side Latency`

Server-side Latency is [shown in the console](https://console.groq.com/dashboard/logs).

**Important**: Groq Console metrics show server-side latency only. Client-side network latency measurement examples are provided in the Network Latency Analysis section below.

We recommend visiting [Artificial Analysis](https://artificialanalysis.ai/providers/groq) for third-party performance benchmarks across all models hosted on GroqCloud, including end-to-end response time.

## [How Input Size Affects TTFT](#how-input-size-affects-ttft)

Input token count is the primary driver of TTFT performance. Understanding this relationship allows developers to optimize prompt design and context management for predictable latency characteristics.

### [The Scaling Pattern](#the-scaling-pattern)

TTFT demonstrates linear scaling characteristics across input token ranges:

- **Minimal inputs (100 tokens)**: Consistently fast TTFT across all model sizes
- **Standard contexts (1K tokens)**: TTFT remains highly responsive
- **Large contexts (10K tokens)**: TTFT increases but remains competitive
- **Maximum contexts (100K tokens)**: TTFT increases to process all the input tokens

### [Model Architecture Impact on TTFT](#model-architecture-impact-on-ttft)

Model architecture fundamentally determines input processing characteristics, with parameter count, attention mechanisms, and specialized capabilities creating distinct performance profiles.

**Parameter Scaling Patterns**:

- **8B models**: Minimal TTFT variance across context lengths, optimal for latency-critical applications
- **32B models**: Linear TTFT scaling with manageable overhead for balanced workloads
- **70B and above**: Exponential TTFT increases at maximum context, requiring context management

**Architecture-Specific Considerations**:

- **Reasoning models**: Additional computational overhead for chain-of-thought processing increases baseline latency by 10-40%
- **Mixture of Experts (MoE)**: Router computation adds fixed latency cost but maintains competitive TTFT scaling
- **Vision-language models**: Image encoding preprocessing significantly impacts TTFT independent of text token count

### [Model Selection Decision Tree](#model-selection-decision-tree)

python

```
# Model Selection Logic

if latency_requirement == "fastest" and quality_need == "acceptable":
    return "8B_models"
elif reasoning_required and latency_requirement != "fastest":
    return "reasoning_models"
elif quality_need == "balanced" and latency_requirement == "balanced":
    return "32B_models"
else:
    return "70B_models"
```

## [Output Token Generation Dynamics](#output-token-generation-dynamics)

Sequential token generation represents the primary latency bottleneck in LLM inference. Unlike parallel input processing, each output token requires a complete forward pass through the model, creating linear scaling between output length and total generation time. Token generation demands significantly higher computational resources than input processing due to the autoregressive nature of transformer architectures.

### [Architectural Performance Characteristics](#architectural-performance-characteristics)

Groq's LPU architecture delivers consistent generation speeds optimized for production workloads. Performance characteristics follow predictable patterns that enable reliable capacity planning and optimization decisions.

**Generation Speed Factors**:

- **Model size**: Inverse relationship between parameter count and generation speed
- **Context length**: Quadratic attention complexity degrades speeds at extended contexts
- **Output complexity**: Mathematical reasoning and structured outputs reduce effective throughput

### [Calculating End-to-End Latency](#calculating-endtoend-latency)

`Total Latency = TTFT + Decoding Time + Network Round Trip`

Where:

- **TTFT** \= Queueing Time + Prompt Prefill Time
- **Decoding Time** \= Output Tokens / Generation Speed
- **Network Round Trip** \= Client-to-server communication overhead

## [Infrastructure Optimization](#infrastructure-optimization)

### [Network Latency Analysis](#network-latency-analysis)

Network latency can significantly impact user-experienced performance. If client-measured total latency substantially exceeds server-side metrics returned in API responses, network optimization becomes critical.

**Diagnostic Approach**:

Python

```
# Compare client vs server latency
import time
import requests

start_time = time.time()
response = requests.post("https://api.groq.com/openai/v1/chat/completions",
                      headers=headers, json=payload)
client_latency = time.time() - start_time
server_latency = response.json()['usage']['total_time']

# Significant delta indicates network optimization opportunity
network_overhead = client_latency - float(server_latency)
```

```
// Compare client vs server latency
const startTime = Date.now();
const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
  method: "POST",
  headers: headers,
  body: JSON.stringify(payload)
});
const clientLatency = (Date.now() - startTime) / 1000; // Convert to seconds
const responseData = await response.json();
const serverLatency = responseData.usage.total_time;

// Significant delta indicates network optimization opportunity
const networkOverhead = clientLatency - parseFloat(serverLatency)
```

**Response Header Analysis**:

Python

```
# Verify request routing and identify optimization opportunities
routing_headers = ['x-groq-region', 'cf-ray']
for header in routing_headers:
  if header in response.headers:
      print(f"{header}: {response.headers[header]}")

# Example: x-groq-region: us-east-1 shows the datacenter that processed your request
```

```
// Verify request routing and identify optimization opportunities
const routingHeaders = ['x-groq-region', 'cf-ray'];
for (const header of routingHeaders) {
  if (response.headers.has(header)) {
      console.log(`${header}: ${response.headers.get(header)}`);
  }
}

// Example: x-groq-region: us-east-1 shows the datacenter that processed your request
```

The `x-groq-region` header confirms which datacenter processed your request, enabling latency correlation with geographic proximity. This information helps you understand if your requests are being routed to the optimal datacenter for your location.

### [Context Length Management](#context-length-management)

As shown above, TTFT scales with input length. End users can employ several prompting strategies to optimize context usage and reduce latency:

- **Prompt Chaining**: Decompose complex tasks into sequential subtasks where each prompt's output feeds the next. This technique reduces individual prompt length while maintaining context flow. Example: First prompt extracts relevant quotes from documents, second prompt answers questions using those quotes. Improves transparency and enables easier debugging.
- **Zero-Shot vs Few-Shot Selection**: For concise, well-defined tasks, zero-shot prompting ("Classify this sentiment") minimizes context length while leveraging model capabilities. Reserve few-shot examples only when task-specific patterns are essential, as examples consume significant tokens.
- **Strategic Context Prioritization**: Place critical information at prompt beginning or end, as models perform best with information in these positions. Use clear separators (triple quotes, headers) to structure complex prompts and help models focus on relevant sections.

For detailed implementation strategies and examples, consult the [Groq Prompt Engineering Documentation](https://console.groq.com/docs/prompting) and [Prompting Patterns Guide](https://console.groq.com/docs/prompting/patterns).

## [Groq's Processing Options](#groqs-processing-options)

### [Service Tier Architecture](#service-tier-architecture)

Groq offers three service tiers that influence latency characteristics and processing behavior:

**On-Demand Processing** (`"service_tier":"on_demand"`): For real-time applications requiring guaranteed processing, the standard API delivers:

- Industry-leading low latency with consistent performance
- Streaming support for immediate perceived response
- Controlled rate limits to ensure fairness and consistent experience

**Flex Processing** (`"service_tier":"flex"`): [Flex Processing](https://console.groq.com/docs/flex-processing) optimizes for throughput with higher request volumes in exchange for occasional failures. Flex processing gives developers 10x their current rate limits, as system capacity allows, with rapid timeouts when resources are constrained.

_Best for_: High-volume workloads, content pipelines, variable demand spikes.

**Auto Processing** (`"service_tier":"auto"`): Auto Processing uses on-demand rate limits initially, then automatically falls back to flex tier processing if those limits are exceeded. This provides optimal balance between guaranteed processing and high throughput.

_Best for_: Applications requiring both reliability and scalability during demand spikes.

### [Processing Tier Selection Logic](#processing-tier-selection-logic)

python

```
# Processing Tier Selection Logic

if real_time_required and throughput_need != "high":
    return "on_demand"
elif throughput_need == "high" and cost_priority != "critical":
    return "flex"
elif real_time_required and throughput_need == "variable":
    return "auto"
elif cost_priority == "critical":
    return "batch"
else:
    return "on_demand"
```

### [Batch Processing](#batch-processing)

[Batch Processing](https://console.groq.com/docs/batch) enables cost-effective asynchronous processing with a completion window, optimized for scenarios where immediate responses aren't required.

**Batch API Overview**: The Groq Batch API processes large-scale workloads asynchronously, offering significant advantages for high-volume use cases:

- **Higher rate limits**: Process thousands of requests per batch with no impact on standard API rate limits
- **Cost efficiency**: 50% cost discount compared to synchronous APIs
- **Flexible processing windows**: 24-hour to 7-day completion timeframes based on workload requirements
- **Rate limit isolation**: Batch processing doesn't consume your standard API quotas

**Latency Considerations**: While batch processing trades immediate response for efficiency, understanding its latency characteristics helps optimize workload planning:

- **Submission latency**: Minimal overhead for batch job creation and validation
- **Queue processing**: Variable based on system load and batch size
- **Completion notification**: Webhook or polling-based status updates
- **Result retrieval**: Standard API latency for downloading completed outputs

**Optimal Use Cases**: Batch processing excels for workloads where processing time flexibility enables significant cost and throughput benefits: large dataset analysis, content generation pipelines, model evaluation suites, and scheduled data enrichment tasks.

## [Streaming Implementation](#streaming-implementation)

### [Server-Sent Events Best Practices](#serversent-events-best-practices)

Implement streaming to improve perceived latency:

**Streaming Implementation**:

Python

```
import os
from groq import Groq

def stream_response(prompt):
  client = Groq(api_key=os.environ.get("GROQ_API_KEY"))
  stream = client.chat.completions.create(
      model="meta-llama/llama-4-scout-17b-16e-instruct",
      messages=[{"role": "user", "content": prompt}],
      stream=True
  )

  for chunk in stream:
      if chunk.choices[0].delta.content:
          yield chunk.choices[0].delta.content

# Example usage with concrete prompt
prompt = "Write a short story about a robot learning to paint in exactly 3 sentences."
for token in stream_response(prompt):
  print(token, end='', flush=True)
```

```
import Groq from "groq-sdk";

async function streamResponse(prompt) {
  const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY
  });

  const stream = await groq.chat.completions.create({
      model: "meta-llama/llama-4-scout-17b-16e-instruct",
      messages: [{ role: "user", content: prompt }],
      stream: true
  });

  for await (const chunk of stream) {
      if (chunk.choices[0]?.delta?.content) {
          process.stdout.write(chunk.choices[0].delta.content);
      }
  }
}

// Example usage with concrete prompt
const prompt = "Write a short story about a robot learning to paint in exactly 3 sentences.";
streamResponse(prompt);
```

**Key Benefits**:

- Users see immediate response initiation
- Better user engagement and experience
- Error handling during generation

_Best for_: Interactive applications requiring immediate feedback, user-facing chatbots, real-time content generation where perceived responsiveness is critical.

## [Next Steps](#next-steps)

Go over to our [Production-Ready Checklist](https://console.groq.com/docs/production-readiness/production-ready-checklist) and start the process of getting your AI applications scaled up to all your users with consistent performance.

Building something amazing? Need help optimizing? Our team is here to help you achieve production-ready performance at scale. Join our [developer community](https://community.groq.com)!

---

description: A comprehensive checklist covering essential steps to deploy and scale LLM applications on GroqCloud, including model selection, performance optimization, monitoring, cost management, and launch preparation.
title: Production-Ready Checklist - GroqDocs
image: https://console.groq.com/og_cloudv5.jpg

---

# Production-Ready Checklist for Applications on GroqCloud

Deploying LLM applications to production involves critical decisions that directly impact user experience, operational costs, and system reliability. **This comprehensive checklist** guides you through the essential steps to launch and scale your Groq-powered application with confidence.

From selecting the optimal model architecture and configuring processing tiers to implementing robust monitoring and cost controls, each section addresses the common pitfalls that can derail even the most promising LLM applications.

## [Pre-Launch Requirements](#prelaunch-requirements)

### [Model Selection Strategy](#model-selection-strategy)

- Document latency requirements for each use case
- Test quality/latency trade-offs across model sizes
- Reference the Model Selection Workflow in the Latency Optimization Guide

### [Prompt Engineering Optimization](#prompt-engineering-optimization)

- Optimize prompts for token efficiency using context management strategies
- Implement prompt templates with variable injection
- Test structured output formats for consistency
- Document optimization results and token savings

### [Processing Tier Configuration](#processing-tier-configuration)

- Reference the Processing Tier Selection Workflow in the Latency Optimization Guide
- Implement retry logic for Flex Processing failures
- Design callback handlers for Batch Processing

## [Performance Optimization](#performance-optimization)

### [Streaming Implementation](#streaming-implementation)

- Test streaming vs non-streaming latency impact and user experience
- Configure appropriate timeout settings
- Handle streaming errors gracefully

### [Network and Infrastructure](#network-and-infrastructure)

- Measure baseline network latency to Groq endpoints
- Configure timeouts based on expected response lengths
- Set up retry logic with exponential backoff
- Monitor API response headers for routing information

### [Load Testing](#load-testing)

- Test with realistic traffic patterns
- Validate linear scaling characteristics
- Test different processing tier behaviors
- Measure TTFT and generation speed under load

## [Monitoring and Observability](#monitoring-and-observability)

### [Key Metrics to Track](#key-metrics-to-track)

- **TTFT percentiles** (P50, P90, P95, P99)
- **End-to-end latency** (client to completion)
- **Token usage and costs** per endpoint
- **Error rates** by processing tier
- **Retry rates** for Flex Processing (less then 5% target)

### [Alerting Setup](#alerting-setup)

- Set up alerts for latency degradation (>20% increase)
- Monitor error rates (alert if >0.5%)
- Track cost increases (alert if >20% above baseline)
- Use Groq Console for usage monitoring

## [Cost Optimization](#cost-optimization)

### [Usage Monitoring](#usage-monitoring)

- Track token efficiency metrics
- Monitor cost per request across different models
- Set up cost alerting thresholds
- Analyze high-cost endpoints weekly

### [Optimization Strategies](#optimization-strategies)

- Leverage smaller models where quality permits
- Use Batch Processing for non-urgent workloads (50% cost savings)
- Implement intelligent processing tier selection
- Optimize prompts to reduce input/output tokens

## [Launch Readiness](#launch-readiness)

### [Final Validation](#final-validation)

- Complete end-to-end testing with production-like loads
- Test all failure scenarios and error handling
- Validate cost projections against actual usage
- Verify monitoring and alerting systems
- Test graceful degradation strategies

### [Go-Live Preparation](#golive-preparation)

- Define gradual rollout plan
- Document rollback procedures
- Establish performance baselines
- Define success metrics and SLAs

## [Post-Launch Optimization](#postlaunch-optimization)

### [First Week](#first-week)

- Monitor all metrics closely
- Address any performance issues immediately
- Fine-tune timeout and retry settings
- Gather user feedback on response quality and speed

### [First Month](#first-month)

- Review actual vs projected costs
- Optimize high-frequency prompts based on usage patterns
- Evaluate processing tier effectiveness
- A/B test prompt optimizations
- Document optimization wins and lessons learned

## [Key Performance Targets](#key-performance-targets)

| Metric             | Target            | Alert Threshold |
| ------------------ | ----------------- | --------------- |
| TTFT P95           | Model-dependent\* | \>20% increase  |
| Error Rate         | <0.1%             | \>0.5%          |
| Flex Retry Rate    | <5%               | \>10%           |
| Cost per 1K tokens | Baseline          | +20%            |

\*Reference [Artificial Analysis](https://artificialanalysis.ai/providers/groq) for current model benchmarks

## [Resources](#resources)

- [Groq API Documentation](https://console.groq.com/docs/api-reference)
- [Prompt Engineering Guide](https://console.groq.com/docs/prompting)
- [Understanding and Optimizing Latency on Groq](https://console.groq.com/docs/production-readiness/optimizing-latency)
- [Groq Developer Community](https://community.groq.com)
- [OpenBench](https://openbench.dev)

---

_This checklist should be customized based on your specific application requirements and updated based on production learnings._

---

description: Learn how to securely configure and use the Groq API in production with best practices for API key management, transport security, input validation, and incident response.
title: Security Onboarding - GroqDocs
image: https://console.groq.com/og_cloudv5.jpg

---

# Security Onboarding

Welcome to the **Groq Security Onboarding** guide.

This page walks through best practices for protecting your API keys, securing client configurations, and hardening integrations before moving into production.

## [Overview](#overview)

Security is a shared responsibility between Groq and our customers.

While Groq ensures secure API transport and service isolation, customers are responsible for securing client-side configurations, keys, and data handling.

All Groq API traffic is encrypted in transit using TLS 1.2+ and authenticated via API keys.

## [Secure API Key Management](#secure-api-key-management)

Never expose or hardcode API keys directly into your source code.

Use environment variables or a secret management system.

shell

```
# Good: use environment variables
export GROQ_API_KEY="gsk_your_secret_key_here"

# Bad: avoid committing secrets to source
echo 'api_key="gsk_your_secret_key_here"' >> config.py
```

```
import os
from groq import Groq

client = Groq(api_key=os.getenv("GROQ_API_KEY"))
```

```
import { Groq } from "groq";

const client = new Groq({
apiKey: process.env.GROQ_API_KEY,
});
```

**Warning:** Never embed keys in frontend code or expose them in browser bundles. If you need client-side usage, route through a trusted backend proxy.

## [Key Rotation & Revocation](#key-rotation--revocation)

- Rotate API keys periodically (e.g., quarterly).
- Revoke keys immediately if compromise is suspected.
- Use per-environment keys (dev / staging / prod).
- Log all API key creations and deletions.

Python

```
import os
from groq import Groq

def secure_client():
  key = os.getenv("GROQ_API_KEY")
  if not key:
      raise RuntimeError("Missing GROQ_API_KEY in environment")
  return Groq(api_key=key)

client = secure_client()
print(client.models.list())  # Test call
```

```
import { Groq } from "groq";

function secureClient() {
const key = process.env.GROQ_API_KEY;
if (!key) {
  throw new Error("Missing GROQ_API_KEY in environment");
}
return new Groq({ apiKey: key });
}

const client = secureClient();
console.log(await client.models.list());  // Test call
```

## [Transport Security (TLS)](#transport-security-tls)

Groq APIs enforce HTTPS (TLS 1.2 or higher). You should **never** disable SSL verification.

Python

```
import requests

response = requests.get("https://api.groq.com", verify=True)
```

```
const https = require("https");

https.get("https://api.groq.com", (res) => {
console.log("TLS Verified:", res.socket.authorized);
});
```

## [Input and Prompt Safety](#input-and-prompt-safety)

When integrating Groq into user-facing systems, ensure that user inputs cannot trigger prompt injection or tool misuse.

**Recommendations:**

- Sanitize user input before embedding in prompts.
- Avoid exposing internal system instructions or hidden context.
- Validate model outputs (especially JSON / code / commands).
- Limit model access to safe tools or actions only.

## [Rate Limiting and Retry Logic](#rate-limiting-and-retry-logic)

Implement client-side rate limiting and exponential backoff for 429 / 5xx responses.

Python

```
import time, random
from groq import Groq

client = Groq(api_key="gsk_...")

for attempt in range(5):
  try:
      resp = client.models.list()
      break
  except Exception as e:
      wait = min(2 ** attempt + random.random(), 30)
      time.sleep(wait)
```

```
async function callWithBackoff(fn, maxRetries = 5) {
for (let i = 0; i < maxRetries; i++) {
  try {
    return await fn();
  } catch (err) {
    const delay = Math.min(2 ** i + Math.random(), 30);
    await new Promise((r) => setTimeout(r, delay * 1000));
  }
}
}
```

## [Logging & Monitoring](#logging--monitoring)

Maintain structured logs for all API interactions.

**Include:**

- Timestamp
- Endpoint
- Request latency
- Key / service ID (non-secret)
- Error codes

**Tip:** Avoid logging sensitive data or raw model responses containing user information.

## [Secure Tool Use & Agent Integrations](#secure-tool-use--agent-integrations)

When using Groq's **Tool Use** or external function execution features:

- Expose only vetted, sandboxed tools.
- Restrict external network calls.
- Audit all registered tools and permissions.
- Validate arguments and outputs.

Python

```
import requests
from urllib.parse import quote

class SafeTools:
  @staticmethod
  async def get_weather(city):
      url = f"https://api.weather.com?q={quote(city)}"
      return requests.get(url)

# Export for use
safe_tools = SafeTools()
```

```
const safeTools = {
getWeather: async (city) => fetch(`https://api.weather.com?q=${encodeURIComponent(city)}`),
};

export default safeTools;
```

## [Incident Response](#incident-response)

If you suspect your API key is compromised:

1. Revoke the key immediately from the [Groq Console](https://console.groq.com/keys).
2. Rotate to a new key and redeploy secrets.
3. Review logs for suspicious activity.
4. Notify your security admin.

**Warning:** Never reuse compromised keys, even temporarily.

## [Resources](#resources)

- [Groq API Documentation](https://console.groq.com/docs/api-reference)
- [Prompt Engineering Guide](https://console.groq.com/docs/prompting)
- [Understanding and Optimizing Latency](https://console.groq.com/docs/production-readiness/optimizing-latency)
- [Production-Ready Checklist](https://console.groq.com/docs/production-readiness/production-ready-checklist)
- [Groq Developer Community](https://community.groq.com)
- [OpenBench](https://openbench.dev)

---

_This security guide should be customized based on your specific application requirements and updated based on production learnings._

---

description: Explore official and community Groq client libraries for Python, JavaScript, and more to access the Groq API easily.
title: Groq Client Libraries - GroqDocs
image: https://console.groq.com/og_cloudv5.jpg

---

# Groq Client Libraries

Groq provides both a Python and JavaScript/Typescript client library.

PythonJavaScript

## [Groq Python Library](#groq-python-library)

The [Groq Python library](https://pypi.org/project/groq/) provides convenient access to the Groq REST API from any Python 3.7+ application. The library includes type definitions for all request params and response fields, and offers both synchronous and asynchronous clients.

### [Installation](#installation)

shell

```
pip install groq
```

### [Usage](#usage)

Use the library and your secret key to run:

Python

```
import os

from groq import Groq

client = Groq(
    # This is the default and can be omitted
    api_key=os.environ.get("GROQ_API_KEY"),
)

chat_completion = client.chat.completions.create(
    messages=[
        {
            "role": "system",
            "content": "You are a helpful assistant."
        },
        {
            "role": "user",
            "content": "Explain the importance of fast language models",
        }
    ],
    model="llama-3.3-70b-versatile",
)

print(chat_completion.choices[0].message.content)
```

While you can provide an `api_key` keyword argument, we recommend using [python-dotenv](https://github.com/theskumar/python-dotenv) to add `GROQ_API_KEY="My API Key"` to your `.env` file so that your API Key is not stored in source control.

The following response is generated:

JSON

```
{
  "id": "34a9110d-c39d-423b-9ab9-9c748747b204",
  "object": "chat.completion",
  "created": 1708045122,
  "model": "mixtral-8x7b-32768",
  "system_fingerprint": "fp_dbffcd8265",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "Low latency Large Language Models (LLMs) are important in the field of artificial intelligence and natural language processing (NLP) for several reasons:\n\n1. Real-time applications: Low latency LLMs are essential for real-time applications such as chatbots, voice assistants, and real-time translation services. These applications require immediate responses, and high latency can lead to a poor user experience.\n\n2. Improved user experience: Low latency LLMs provide a more seamless and responsive user experience. Users are more likely to continue using a service that provides quick and accurate responses, leading to higher user engagement and satisfaction.\n\n3. Competitive advantage: In today's fast-paced digital world, businesses that can provide quick and accurate responses to customer inquiries have a competitive advantage. Low latency LLMs can help businesses respond to customer inquiries more quickly, potentially leading to increased sales and customer loyalty.\n\n4. Better decision-making: Low latency LLMs can provide real-time insights and recommendations, enabling businesses to make better decisions more quickly. This can be particularly important in industries such as finance, healthcare, and logistics, where quick decision-making can have a significant impact on business outcomes.\n\n5. Scalability: Low latency LLMs can handle a higher volume of requests, making them more scalable than high-latency models. This is particularly important for businesses that experience spikes in traffic or have a large user base.\n\nIn summary, low latency LLMs are essential for real-time applications, providing a better user experience, enabling quick decision-making, and improving scalability. As the demand for real-time NLP applications continues to grow, the importance of low latency LLMs will only become more critical."
      },
      "finish_reason": "stop",
      "logprobs": null
    }
  ],
  "usage": {
    "prompt_tokens": 24,
    "completion_tokens": 377,
    "total_tokens": 401,
    "prompt_time": 0.009,
    "completion_time": 0.774,
    "total_time": 0.783
  },
  "x_groq": {
    "id": "req_01htzpsmfmew5b4rbmbjy2kv74"
  }
}
```

## [Groq Community Libraries](#groq-community-libraries)

Groq encourages our developer community to build on our SDK. If you would like your library added, please fill out this [form](https://docs.google.com/forms/d/e/1FAIpQLSfkg3rPUnmZcTwRAS-MsmVHULMtD2I8LwsKPEasuqSsLlF0yA/viewform?usp=sf%5Flink).

Please note that Groq does not verify the security of these projects. **Use at your own risk.**

### [C#](#c)

- [jgravelle.GroqAPILibrary](https://github.com/jgravelle/GroqApiLibrary) by [jgravelle](https://github.com/jgravelle)

### [Dart/Flutter](#dartflutter)

- [TAGonSoft.groq-dart](https://github.com/TAGonSoft/groq-dart) by [TAGonSoft](https://github.com/TAGonSoft)

### [PHP](#php)

- [lucianotonet.groq-php](https://github.com/lucianotonet/groq-php) by [lucianotonet](https://github.com/lucianotonet)

### [Ruby](#ruby)

- [drnic.groq-ruby](https://github.com/drnic/groq-ruby) by [drnic](https://github.com/drnic)

---

title: GroqCloud - Build Fast
description: Build Fast with GroqCloud
image: https://console.groq.com/og_cloudv5.jpg

---

# Groq Badge

We love seeing what you build with the millions of free tokens generated with Groq API each day. For projects and demos built with Groq, please use our**Powered by Groq** badge on your application user interface.

![Powered by Groq](https://console.groq.com/powered-by-groq-light.svg)![Powered by Groq](https://console.groq.com/powered-by-groq-dark.svg)

## [Installation](#installation)

You can use the following HTML code snippet to integrate our badge into your user interface:

bash

```
<a href="https://groq.com" target="_blank" rel="noopener noreferrer">
  <img
    src="https://console.groq.com/powered-by-groq-light.svg"
    alt="Powered by Groq for fast inference."
  />
</a>
```

bash

```
<a href="https://groq.com" target="_blank" rel="noopener noreferrer">
  <img
    src="https://console.groq.com/powered-by-groq-dark.svg"
    alt="Powered by Groq for fast inference."
  />
</a>
```

---

description: Browse and connect Groq-powered applications to external services using integrations for agents, app development, observability, and more.
title: Integrations - GroqDocs
image: https://console.groq.com/og_cloudv5.jpg

---

# What are integrations?

Integrations are a way to connect your application to external services and enhance your Groq-powered applications with additional capabilities. Browse the categories below to find integrations that suit your needs.

[AI Agent Frameworks](#ai-agent-frameworks)[Browser Automation](#browser-automation)[LLM App Development](#llm-app-development)[Observability and Monitoring](#observability-and-monitoring)[LLM Code Execution and Sandboxing](#llm-code-execution-and-sandboxing)

[UI and UX](#ui-and-ux)[Tool Management](#tool-management)[Real-time Voice](#realtime-voice)

## [AI Agent Frameworks](#ai-agent-frameworks)

Create autonomous AI agents that can perform complex tasks, reason, and collaborate effectively using Groq's fast inference capabilities.

[![Agno](https://console.groq.com/integrations/agno_black.svg)AgnoAgno is a lightweight library for building Agents with memory, knowledge, tools and reasoning.](/docs/agno)[![AutoGen](https://console.groq.com/integrations/autogen.svg)AutoGenAutoGen is a framework for building conversational AI systems that can operate autonomously or collaborate with humans and other agents.](/docs/autogen)[![CrewAI](https://console.groq.com/integrations/crewai.png)CrewAICrewAI is a framework for orchestrating role-playing AI agents that work together to accomplish complex tasks.](/docs/crewai)[![xRx](https://console.groq.com/integrations/xrx.png)xRxxRx is a reactive AI agent framework for building reliable and observable LLM agents with real-time feedback.](/docs/xrx)

## [Browser Automation](#browser-automation)

Automate browser interactions and perform complex tasks and transform any browser-based task in to an API endpoint instantly with models via Groq.

[![Anchor Browser](https://console.groq.com/integrations/anchorbrowser.png)Anchor BrowserAnchor Browser is a browser automation platform that allows you to automate workflows for web applications that lack APIs or have limited API coverage.](/docs/anchorbrowser)

## [LLM App Development](#llm-app-development)

Build powerful LLM applications with these frameworks and libraries that provide essential tools for working with Groq models.

[![LangChain](https://console.groq.com/integrations/langchain_black.png)LangChainLangChain is a framework for developing applications powered by language models through composability.](/docs/langchain)[![LlamaIndex](https://console.groq.com/integrations/llamaindex_black.png)LlamaIndexLlamaIndex is a data framework for building LLM applications with context augmentation over external data.](/docs/llama-index)[![LiteLLM](https://console.groq.com/integrations/litellm.png)LiteLLMLiteLLM is a library that standardizes LLM API calls and provides robust tracking, fallbacks, and observability for LLM applications.](/docs/litellm)[![Vercel AI SDK](https://console.groq.com/vercel-integration.png)Vercel AI SDKVercel AI SDK is a typescript library for building AI-powered applications in modern frontend frameworks.](/docs/ai-sdk)

## [Observability and Monitoring](#observability-and-monitoring)

Track, analyze, and optimize your LLM applications with these integrations that provide insights into model performance and behavior.

[![Arize](https://console.groq.com/integrations/arize_phoenix.png)ArizeArize is an observability platform for monitoring, troubleshooting, and explaining LLM applications.](/docs/arize)[![MLflow](https://console.groq.com/integrations/mlflow-white.svg)MLflowMLflow is an open-source platform for managing the end-to-end machine learning lifecycle, including experiment tracking and model deployment.](/docs/mlflow)

## [LLM Code Execution and Sandboxing](#llm-code-execution-and-sandboxing)

Enable secure code execution in controlled environments for your AI applications with these integrations.

[![E2B](https://console.groq.com/integrations/e2b_black.png)E2BE2B provides secure sandboxed environments for LLMs to execute code and use tools in a controlled manner.](/docs/e2b)

## [UI and UX](#ui-and-ux)

Create beautiful and responsive user interfaces for your Groq-powered applications with these UI frameworks and tools.

[![FlutterFlow](https://console.groq.com/integrations/flutterflow_black.png)FlutterFlowFlutterFlow is a visual development platform for building high-quality, custom, cross-platform apps with AI capabilities.](/docs/flutterflow)[![Gradio](https://console.groq.com/integrations/gradio.svg)GradioGradio is a Python library for quickly creating customizable UI components for machine learning models and LLM applications.](/docs/gradio)

## [Tool Management](#tool-management)

Manage and orchestrate tools for your AI agents, enabling them to interact with external services and perform complex tasks.

[![Composio](https://console.groq.com/integrations/composio_black.png)ComposioComposio is a platform for managing and integrating tools with LLMs and AI agents for seamless interaction with external applications.](/docs/composio)[![JigsawStack](https://console.groq.com/integrations/jigsaw.svg)JigsawStackJigsawStack is a powerful AI SDK that integrates into any backend, automating tasks using LLMs with features like Mixture-of-Agents approach.](/docs/jigsawstack)[![Toolhouse](https://console.groq.com/integrations/toolhouse.svg)ToolhouseToolhouse is a tool management platform that helps developers organize, secure, and scale tool usage across AI agents.](/docs/toolhouse)

## [Real-time Voice](#realtime-voice)

Build voice-enabled applications that leverage Groq's fast inference for natural and responsive conversations.

[![LiveKit](https://console.groq.com/integrations/livekit_white.svg)LiveKitLiveKit provides text-to-speech and real-time communication features that complement Groq's speech recognition for end-to-end AI voice applications.](/docs/livekit)

---

description: Control your API costs with automated spending limits and proactive usage alerts. Set monthly budgets, configure alert thresholds, and prevent unexpected charges with organization-wide spending controls.
title: Spend Limits - GroqDocs
image: https://console.groq.com/og_cloudv5.jpg

---

# Spend Limits

Control your API costs with automated spending limits and proactive usage alerts when approaching budget thresholds.

## [Quick Start](#quick-start)

**Set a spending limit in 3 steps:**

1. Go to [**Settings** → **Billing** → **Limits**](https://console.groq.com/settings/billing/limits)
2. Click **Add Limit** and enter your monthly budget in USD
3. Add alert thresholds at 50%, 75%, and 90% of your limit
4. Click **Save** to activate the limit

**Requirements:** Paid tier account with organization owner permissions.

## [How It Works](#how-it-works)

Spend limits automatically protect your budget by blocking API access when you reach your monthly cap. The limit applies organization-wide across all API keys, so usage from any team member or application counts toward the same shared limit. If you hit your set limit, API calls from any key in your organization will return a 400 with code `blocked_api_access`. Usage alerts notify you via email before you hit the limit, giving you time to adjust usage or increase your budget.

This feature offers:

- **Near real-time tracking:** Your current spend updates every 10-15 minutes
- **Automatic monthly reset:** Limits reset at the beginning of each billing cycle (1st of the month)
- **Immediate blocking:** API access is blocked when a spend update detects you've hit your limit

> ⚠️ **Important:** There's a 10-15 minute delay in spend tracking. This means you might exceed your limit by a small amount during high usage periods.

## [Setting Up Spending Limits](#setting-up-spending-limits)

### [Create a Spending Limit](#create-a-spending-limit)

Navigate to [**Settings** → **Billing** → **Limits**](https://console.groq.com/settings/billing/limits) and click **Add Limit**.

Example Monthly Spending Limit: $500

Your API requests will be blocked when you reach $500 in monthly usage. The limit resets automatically on the 1st of each month.

### [Add Usage Alerts](#add-usage-alerts)

Set up email notifications before you hit your limit: Alert at $250 (50% of limit) Alert at $375 (75% of limit) Alert at $450 (90% of limit)

**To add an alert:**

1. Click **Add Alert** in the Usage Alerts section
2. Enter the USD amount trigger
3. Click **Save**

Alerts appear as visual markers on your spending progress bar on Groq Console Limits page under Billing.

### [Manage Your Alerts](#manage-your-alerts)

- **Edit Limit:** Click the pencil icon next to any alert
- **Delete:** Click the trash icon to remove an alert
- **Multiple alerts:** Add as many thresholds as needed

## [Email Notifications](#email-notifications)

All spending alerts and limit notifications are sent from **[\[email protected\]](/cdn-cgi/l/email-protection#067573767669747246617469772865696b)** to your billing email addresses.

**Update billing emails:**

1. Go to [**Settings** → **Billing** → **Manage**](https://console.groq.com/settings/billing)
2. Add or update email addresses
3. Return to the Limits page to confirm the changes

**Pro tip:** Add multiple team members to billing emails so important notifications don't get missed.

## [Best Practices](#best-practices)

### [Setting Effective Limits](#setting-effective-limits)

- **Start conservative:** Set your first limit 20-30% above your expected monthly usage to account for variability.
- **Monitor patterns:** Review your usage for 2-3 months, then adjust limits based on actual consumption patterns.
- **Leave buffer room:** Don't set limits exactly at your expected usage—unexpected spikes can block critical API access.
- **Use multiple thresholds:** Set alerts at 50%, 75%, and 90% of your limit to get progressive warnings.

## [Troubleshooting](#troubleshooting)

### [Can't Access the Limits Page?](#cant-access-the-limits-page)

- **Check your account tier:** Spending limits are only available on paid plans, not free tier accounts.
- **Verify permissions:** You need organization owner permissions to manage spending limits.
- **Feature availability:** Contact us via [\[email protected\]](/cdn-cgi/l/email-protection#45363035352a37310522372a346b262a28) if you're on a paid tier but don't see the spending limits feature.

### [Not Receiving Alert Emails?](#not-receiving-alert-emails)

- **Verify email addresses:** Check that your billing emails are correct in [**Settings** → **Billing** → **Manage**](https://console.groq.com/settings/billing).
- **Check spam folders:** Billing alerts might be filtered by your email provider.
- **Test notifications:** Set a low-dollar test alert to verify email delivery is working.

### [API Access Blocked?](#api-access-blocked)

- **Check your spending status:** The [limits page](https://console.groq.com/settings/billing/limits) shows your current spend against your limit.
- **Increase your limit:** You can raise your spending limit at any time to restore immediate access if you've hit your spend limit. You can also remove it to unblock your API access immediately.
- **Wait for reset:** If you've hit your limit, API access will restore on the 1st of the next month.

## [FAQ](#faq)

**Q: Can I set different limits for different API endpoints or API keys?**

A: No, spending limits are organization-wide and apply to your total monthly usage across all API endpoints and all API keys in your organization. All team members and applications using your organization's API keys share the same spending limit.

**Q: What happens to in-flight requests when I hit my limit?**

A: In-flight requests complete normally, but new requests are blocked immediately.

**Q: Can I set weekly or daily spending limits?**

A: Currently, only monthly limits are supported. Limits reset on the 1st of each month.

**Q: How accurate is the spending tracking?**

A: Spending is tracked in near real-time with a 10-15 minute delay. The delay prevents brief usage spikes from prematurely triggering limits.

**Q: Can I temporarily disable my spending limit?**

A: Yes, you can edit or remove your spending limit at any time from the limits page.

---

Need help? Contact our support team at [\[email protected\]](/cdn-cgi/l/email-protection#f5868085859a8781b592879a84db969a98) with details about your configuration and any error messages.

---

description: Learn how to organize your Groq applications and manage resources with Projects - including rate limits, usage tracking, and team permissions.
title: Projects - GroqDocs
image: https://console.groq.com/og_cloudv5.jpg

---

# Projects

Projects provide organizations with a powerful framework for managing multiple applications, environments, and teams within a single Groq account. By organizing your work into projects, you can isolate workloads to gain granular control over resources, costs, access permissions, and usage tracking on a per-project basis.

## [Why Use Projects?](#why-use-projects)

- **Isolation and Organization:** Projects create logical boundaries between different applications, environments (development, staging, production), and use cases. This prevents resource conflicts and enables clear separation of concerns across your organization.
- **Cost Control and Visibility:** Track spending, usage patterns, and resource consumption at the project level. This granular visibility enables accurate cost allocation, budget management, and ROI analysis for specific initiatives.
- **Team Collaboration:** Control who can access what resources through project-based permissions. Teams can work independently within their projects while maintaining organizational oversight and governance.
- **Operational Excellence:** Configure rate limits, monitor performance, and debug issues at the project level. This enables optimized resource allocation and simplified troubleshooting workflows.

## [Project Structure](#project-structure)

Projects inherit settings and permissions from your organization while allowing project-specific customization. Your organization-level role determines your maximum permissions within any project.

Each project acts as an isolated workspace containing:

- **API Keys:** Project-specific credentials for secure access
- **Rate Limits:** Customizable quotas for each available model
- **Usage Data:** Consumption metrics, costs, and request logs
- **Team Access:** Role-based permissions for project members

The following are the roles that are inherited from your organization along with their permissions within a project:

- **Owner:** Full access to creating, updating, and deleting projects, modifying limits for models within projects, managing API keys, viewing usage and spending data across all projects, and managing project access.
- **Developer:** Currently same as Owner.
- **Reader:** Read-only access to projects and usage metrics, logs, and spending data.

## [Getting Started](#getting-started)

### [Creating Your First Project](#creating-your-first-project)

**1\. Access Projects**: Navigate to the **Projects** section at the top lefthand side of the Console. You will see a dropdown that looks like **Organization** / **Projects**.

**2\. Create Project:** Click the rightside **Projects** dropdown and click **Create Project** to create a new project by inputting a project name. You will also notice that there is an option to **Manage Projects** that will be useful later.

> **Note:** Create separate projects for development, staging, and production environments, and use descriptive, consistent naming conventions (e.g. "myapp-dev", "myapp-staging", "myapp-prod") to avoid conflicts and maintain clear project boundaries.

**3\. Configure Settings**: Once you create a project, you will be able to see it in the dropdown and under **Manage Projects**. Click **Manage Projects** and click **View** to customize project rate limits.

> **Note:** Start with conservative limits for new projects, increase limits based on actual usage patterns and needs, and monitor usage regularly to adjust as needed.

**4\. Generate API Keys:** Once you've configured your project and selected it in the dropdown, it will persist across the console. Any API keys generated will be specific to the project you have selected. Any logs will also be project-specific.

**5\. Start Building:** Begin making API calls using your project-specific API credentials

### [Project Selection](#project-selection)

Use the project selector in the top navigation to switch between projects. All Console sections automatically filter to show data for the selected project:

- API Keys
- Batch Jobs
- Logs and Usage Analytics

## [Rate Limit Management](#rate-limit-management)

### [Understanding Rate Limits](#understanding-rate-limits)

Rate limits control the maximum number of requests your project can make to models within a specific time window. Rate limits are applied per project, meaning each project has its own separate quota that doesn't interfere with other projects in your organization. Each project can be configured to have custom rate limits for every available model, which allows you to:

- Allocate higher limits to production projects
- Set conservative limits for experimental or development projects
- Customize limits based on specific use case requirements

Custom project rate limits can only be set to values equal to or lower than your organization's limits. Setting a custom rate limit for a project does not increase your organization's overall limits, it only allows you to set more restrictive limits for that specific project. Organization limits always take precedence and act as a ceiling for all project limits.

### [Configuring Rate Limits](#configuring-rate-limits)

To configure rate limits for a project:

1. Navigate to **Projects** in your settings
2. Select the project you want to configure
3. Adjust the limits for each model as needed

### [Example: Rate Limits Across Projects](#example-rate-limits-across-projects)

Let's say you've created three projects for your application:

- myapp-prod for production
- myapp-staging for testing
- myapp-dev for development

**Scenario:**

- Organization Limit: 100 requests per minute
- myapp-prod: 80 requests per minute
- myapp-staging: 30 requests per minute
- myapp-dev: Using default organization limits

**Here's how the rate limits work in practice:**

1. myapp-prod
   - Can make up to 80 requests per minute (custom project limit)
   - Even if other projects are idle, cannot exceed 80 requests per minute
   - Contributing to the organization's total limit of 100 requests per minute
2. myapp-staging
   - Limited to 30 requests per minute (custom project limit)
   - Cannot exceed this limit even if organization has capacity
   - Contributing to the organization's total limit of 100 requests per minute
3. myapp-dev
   - Inherits the organization limit of 100 requests per minute
   - Actual available capacity depends on usage from other projects
   - If myapp-prod is using 80 requests/min and myapp-staging is using 15 requests/min, myapp-dev can only use 5 requests/min

**What happens during high concurrent usage:**

If both myapp-prod and myapp-staging try to use their maximum configured limits simultaneously:

- myapp-prod attempts to use 80 requests/min
- myapp-staging attempts to use 30 requests/min
- Total attempted usage: 110 requests/min
- Organization limit: 100 requests/min

In this case, some requests will fail with rate limit errors because the combined usage exceeds the organization's limit. Even though each project is within its configured limits, the organization limit of 100 requests/min acts as a hard ceiling.

## [Usage Tracking](#usage-tracking)

Projects provide comprehensive usage tracking including:

- Monthly spend tracking: Monitor costs and spending patterns for each project
- Usage metrics: Track API calls, token usage, and request patterns
- Request logs: Access detailed logs for debugging and monitoring

Dashboard pages will automatically be filtered by your selected project. Access these insights by:

1. Selecting your project in the top left of the navigation bar
2. Navigate to the **Dashboard** to see your project-specific **Usage**, **Metrics**, and **Logs** pages

## [Next Steps](#next-steps)

- **Explore** the [Rate Limits](https://console.groq.com/docs/rate-limits) documentation for detailed rate limit configuration
- **Learn** about [Groq Libraries](https://console.groq.com/docs/libraries) to integrate Projects into your applications
- **Join** our [developer community](https://community.groq.com) for Projects tips and best practices

Ready to get started? Create your first project in the [Projects dashboard](https://console.groq.com/settings/projects) and begin organizing your Groq applications today.

---

description: Control which models are available at the organization and project level. Restrict API access to specific models using allow or block strategies.
title: Model Permissions - GroqDocs
image: https://console.groq.com/og_cloudv5.jpg

---

# Model Permissions

Limit which models can be used at the organization and project level. When a request attempts to use a restricted model, the API returns a 403 error.

## [How It Works](#how-it-works)

Configure model permissions using either **"Only Allow"** or **"Only Block"** strategies:

### [Only Allow](#only-allow)

When you only allow specific models, all other models are blocked.

**Example:** Only allow `llama-3.3-70b-versatile` and `llama-3.1-8b-instant` → all other models are blocked.

### [Only Block](#only-block)

When you only block specific models, all other models remain available.

**Example:** Only block `openai/gpt-oss-120b` → all other models remain available.

## [Organization and Project Level Permissions](#organization-and-project-level-permissions)

You can configure model permissions on either your organization, project, or both. These permissions cascade from the organization to the project, meaning that the project can only configure model permissions within the models which are allowed by the organization-level permissions.

### [Organization Level Permissions](#organization-level-permissions)

Members of the organization with the **Owner** role can configure model permissions at the organization level.

### [Project Level Permissions](#project-level-permissions)

Members of the organization with either the **Developer** or **Owner** role can configure model permissions at the project level.

### [Cascading Permissions](#cascading-permissions)

Permissions cascade from organization to project level. Organization settings always take precedence.

**How it works:**

1. **Organization Check First:** The system checks if the model is allowed at the org level
   - If blocked at org level → request rejected
   - If allowed at org level → proceed to project check
2. **Project Check Second:** The system checks if the model is allowed at the project level
   - If blocked at project level → request rejected
   - If allowed at project level → request proceeds

**Key point:** Projects can only work with models that are available after org-level filtering. They can only allow a subset of what the org allows, or block a subset of what the org allows. A model blocked at the org level cannot be enabled at the project level.

See the examples below for more details.

## [Configuring Model Permissions](#configuring-model-permissions)

### [At the Organization Level](#at-the-organization-level)

1. Go to [**Settings** → **Organization** → **Limits**](https://console.groq.com/settings/limits)
2. Choose **Only Allow** or **Only Block**
3. Select which models to allow or block
4. Click **Save**

### [At the Project Level](#at-the-project-level)

1. Select your project from the project selector
2. Go to [**Settings** → **Projects** → **Limits**](https://console.groq.com/settings/project/limits)
3. Choose **Only Allow** or **Only Block**
4. Select which models to allow or block
   - **Only Allow:** Choose from models available after org-level filtering
   - **Only Block:** Choose from models available after org-level filtering
5. Click **Save**

## [Error Responses](#error-responses)

Requests to restricted models return a 403 error with specific error codes depending on where the block occurred.

### [Organization-Level Block](#organizationlevel-block)

When a model is blocked at the organization level:

JSON

```
{
  "error": {
    "message": "The model `openai/gpt-oss-120b` is blocked at the organization level. Please have the org admin enable this model in the org settings at https://console.groq.com/settings/limits",
    "type": "permissions_error",
    "code": "model_permission_blocked_org"
  }
}
```

### [Project-Level Block](#projectlevel-block)

When a model is blocked at the project level:

JSON

```
{
  "error": {
    "message": "The model `openai/gpt-oss-120b` is blocked at the project level. Please have a project admin enable this model in the project settings at https://console.groq.com/settings/project/limits",
    "type": "permissions_error",
    "code": "model_permission_blocked_project"
  }
}
```

## [Common Use Cases](#common-use-cases)

- **Compliance:** Restrict models that don't meet your data handling requirements
- **Cost Control:** Limit access to higher-cost models for specific teams
- **Environment Isolation:** Different model access for dev, staging, and production
- **Team Access:** Give teams access to specific models based on their needs

## [Examples](#examples)

**Scenario 1: Org permissions only**

- **Org:** Only Allow `llama-3.3-70b-versatile`, `llama-3.1-8b-instant`, `openai/gpt-oss-120b`
- **Project:** No restrictions

**Result:** Project can use `llama-3.3-70b-versatile`, `llama-3.1-8b-instant`, `openai/gpt-oss-120b`; all other models are blocked by the organization.

**Scenario 2: Project permissions only**

- **Org:** No restrictions (all models available)
- **Project:** Only Block `openai/gpt-oss-120b`

**Result:** Project can use all models except `openai/gpt-oss-120b`.

**Scenario 3: Only Allow org → Only Allow subset on project**

- **Org:** Only Allow `llama-3.3-70b-versatile`, `llama-3.1-8b-instant`, `openai/gpt-oss-120b`
- **Project:** Only Allow `llama-3.3-70b-versatile`, `llama-3.1-8b-instant`

**Result:** Project can use `llama-3.3-70b-versatile` and `llama-3.1-8b-instant`, as the project permissions narrow it down. The organization allowed `openai/gpt-oss-120b` is blocked by the project. All other models are blocked by the organization.

**Scenario 4: Only Allow org → Block subset on project**

- **Org:** Only Allow `llama-3.3-70b-versatile`, `llama-3.1-8b-instant`, `openai/gpt-oss-120b`
- **Project:** Only Block `openai/gpt-oss-120b`

**Result:** Project can use `llama-3.3-70b-versatile` and `llama-3.1-8b-instant`, as the project blocks `openai/gpt-oss-120b` from the organization's allowed set. All other models are blocked by the organization.

**Scenario 5: Only Block org → Only Allow subset on project**

- **Org:** Only Block `openai/gpt-oss-120b`, `openai/gpt-oss-20b`
- **Project:** Only Allow `llama-3.3-70b-versatile`, `llama-3.1-8b-instant`

**Result:** Project can only use `llama-3.3-70b-versatile` and `llama-3.1-8b-instant`, as the project only allows a subset from the organization's allowed set. All other models are blocked by the project.

**Scenario 6: Only Block org → Block more on project**

- **Org:** Only Block `openai/gpt-oss-120b`
- **Project:** Only Block `llama-3.3-70b-versatile`

**Result:** Project blocked from using both `openai/gpt-oss-120b` and `llama-3.3-70b-versatile`. The project level permissions combine with the organization-level permissions to block both models. All other models are available.

## [FAQ](#faq)

### [Can I configure different permission strategies for different projects?](#can-i-configure-different-permission-strategies-for-different-projects)

Yes, each project can have its own "only allow" or "only block" strategy. However, all project permissions are limited by organization-level settings.

### [What happens if I block all models?](#what-happens-if-i-block-all-models)

All API requests will be rejected with a 403 `permissions_error`.

### [Can I temporarily disable model permissions?](#can-i-temporarily-disable-model-permissions)

Yes, you can modify or remove permission settings at any time. Changes take effect immediately.

### [Do model permissions affect existing API keys?](#do-model-permissions-affect-existing-api-keys)

Yes, permissions apply to all API requests regardless of which API key is used. Restrictions are based on the organization and project, not the API key.

### [Can a project enable a model that's blocked at the org level?](#can-a-project-enable-a-model-thats-blocked-at-the-org-level)

No, organization-level blocks always take precedence. Projects can only further restrict access, not expand it.

---

Need help? Contact our support team at **[\[email protected\]](/cdn-cgi/l/email-protection#2c5f595c5c435e586c4b5e435d024f4341)** or visit our [developer community](https://community.groq.com).

---

description: Frequently asked questions about Groq&#x27;s billing model, progressive billing, spending monitoring, invoices, and common billing issues.
title: Billing FAQs - GroqDocs
image: https://console.groq.com/og_cloudv5.jpg

---

# Billing FAQs

## [Upgrading to Developer Tier](#upgrading-to-developer-tier)

### [What happens when I upgrade to the Developer tier?](#what-happens-when-i-upgrade-to-the-developer-tier)

When you upgrade, **there's no immediate charge** \- you'll be billed for tokens at month-end or when you reach progressive billing thresholds (see below for details).

To upgrade from the Free tier to the Developer tier, you'll need to provide a valid payment method (credit card, US bank account, or SEPA debit account).

Your upgrade takes effect immediately, but billing only occurs at the end of your monthly billing cycle or when you cross progressive thresholds ($1, $10, $100, $500, $1,000; see below for details).

### [What are the benefits of upgrading?](#what-are-the-benefits-of-upgrading)

The Developer tier is designed for developers and companies who want increased capacity and more features with pay-as-you-go pricing. Immediately after upgrading, you unlock several benefits:

**Core Features:**

- **Higher Token Limits:** Significantly increased rate limits for production workloads
- **Chat Support:** Direct access to our support team via chat
- **[Flex Service Tier](https://console.groq.com/docs/flex-processing):** Flexible processing options for your workloads
- **[Batch Processing](https://console.groq.com/docs/batch):** Submit and process large batches of requests efficiently
- **[Spend Limits](https://console.groq.com/docs/spend-limits):** Set automated spending limits and receive budget alerts

### [Can I downgrade back to the Free tier after I upgrade?](#can-i-downgrade-back-to-the-free-tier-after-i-upgrade)

Yes, you can downgrade to the Free tier at any time from your account Settings under [**Billing**](https://console.groq.com/settings/billing).

> **Note:** When you downgrade, we will issue a final invoice for any outstanding usage that has not yet been billed. You'll need to pay this final invoice before the downgrade is complete.

After downgrading:

- Your account returns to Free tier rate limits and restrictions
- You'll lose access to Developer tier benefits (priority support, unlimited requests, etc.)
- Any usage-based charges stop immediately
- You can upgrade again at any time if you need more capacity

## [Understanding Groq's Billing Model](#understanding-groqs-billing-model)

### [How does Groq's billing cycle work?](#how-does-groqs-billing-cycle-work)

Groq uses a monthly billing cycle, where you receive an invoice in arrears for usage. However, for new users, we also apply progressive billing thresholds to help ease you into pay-as-you-go usage.

### [How does progressive billing work?](#how-does-progressive-billing-work)

When you first start using Groq on the Developer plan, your billing follows a progressive billing model. In this model, an invoice is automatically triggered and payment is deducted when your cumulative usage reaches specific thresholds: $1, $10, $100, $500, and $1,000.

**Special billing for customers in India:** Customers with a billing address in India have different progressive billing thresholds. For India customers, the thresholds are only $1, $10, and then $100 recurring. The $500 and $1,000 thresholds do not apply to India customers. Instead, after reaching the initial $1 and $10 thresholds, billing will continue to trigger every time usage reaches another $100 increment.

This helps you monitor early usage and ensures you're not surprised by a large first bill. These are one-time thresholds for most customers. Once you cross the $1,000 lifetime usage threshold, only monthly billing continues (this does not apply to India customers who continue with recurring $100 billing).

### [What if I don't reach the next threshold?](#what-if-i-dont-reach-the-next-threshold)

If you don't reach the next threshold, your usage will be billed on your regular end-of-month invoice.

**Example:**

- You cross $1 → you're charged immediately.
- You then use $2 more for the entire month (lifetime usage = $3, still below $10).
- That $2 will be invoiced at the end of your monthly billing cycle, not immediately.

This ensures you're not repeatedly charged for small amounts and are charged only when hitting a lifetime cumulative threshold or when your billing period ends.

Once your lifetime usage crosses the $1,000 threshold, the progressive thresholds no longer apply. From this point forward, your account is billed solely on a monthly cycle. All future usage is accrued and billed once per month, with payment automatically deducted when the invoice is issued.

### [When is payment withdrawn from my account?](#when-is-payment-withdrawn-from-my-account)

Payment is withdrawn automatically from your connected payment method each time an invoice is issued. This can happen in two cases:

- **Progressive billing phase:** When your usage first crosses the $1, $10, $100, $500, or $1,000 thresholds. For customers in India, payment is withdrawn at $1, $10, and then every $100 thereafter (the $500 and $1,000 thresholds do not apply).
- **Monthly billing phase:** At the end of each monthly billing cycle.

> **Note:** We only bill you once your usage has reached at least $0.50\. If you see a total charge of < $0.50 or you get an invoice for < $0.50, there is no action required on your end.

## [Monitoring Your Spending & Usage](#monitoring-your-spending--usage)

### [How can I view my current usage and spending in real time?](#how-can-i-view-my-current-usage-and-spending-in-real-time)

You can monitor your usage and charges in near real-time directly within your Groq Cloud dashboard. Simply navigate to [**Dashboard** → **Usage**](https://console.groq.com/dashboard/usage)

This dashboard allows you to:

- Track your current usage across models
- Understand how your consumption aligns with pricing per model

### [Can I set spending limits or receive budget alerts?](#can-i-set-spending-limits-or-receive-budget-alerts)

Yes, Groq provides Spend Limits to help you control your API costs. You can set automated spending limits and receive proactive usage alerts as you approach your defined budget thresholds. [**More details here**](https://console.groq.com/docs/spend-limits)

## [Invoices, Billing Info & Credits](#invoices-billing-info--credits)

### [Where can I find my past invoices and payment history?](#where-can-i-find-my-past-invoices-and-payment-history)

You can view and download all your invoices and receipts in the Groq Console:[**Settings** → **Billing** → **Manage Billing**](https://console.groq.com/settings/billing/manage)

### [Can I change my billing info and payment method?](#can-i-change-my-billing-info-and-payment-method)

You can update your billing details anytime from the Groq Console:[**Settings** → **Billing** → **Manage Billing**](https://console.groq.com/settings/billing/manage)

### [What payment methods do you accept?](#what-payment-methods-do-you-accept)

Groq accepts credit cards (Visa, MasterCard, American Express, Discover), United States bank accounts, and SEPA debit accounts as payment methods.

### [Are there promotional credits, or trial offers?](#are-there-promotional-credits-or-trial-offers)

Yes! We occasionally offer promotional credits, such as during hackathons and special events. We encourage you to visit our [**Groq Community**](https://community.groq.com/) page to learn more and stay updated on announcements.

If you're building a startup, you may be eligible for the [**Groq for Startups**](https://groq.com/groq-for-startups) program, which unlocks $10,000 in credits to help you scale faster.

## [Common Billing Questions & Troubleshooting](#common-billing-questions--troubleshooting)

### [How are refunds handled, if applicable?](#how-are-refunds-handled-if-applicable)

Refunds are handled on a case-by-case basis. Due to the specific circumstances involved in each situation, we recommend reaching out directly to our customer support team at **[\[email protected\]](/cdn-cgi/l/email-protection#265553565649545266415449570845494b)** for assistance. They will review your case and provide guidance.

### [What if a user believes there's an error in their bill?](#what-if-a-user-believes-theres-an-error-in-their-bill)

Check your console's Usage and Billing tab first. If you still believe there's an issue:

Please contact our customer support team immediately at **[\[email protected\]](/cdn-cgi/l/email-protection#33404643435c41477354415c421d505c5e)**. They will investigate the specific circumstances of your billing dispute and guide you through the resolution process.

### [Under what conditions can my account be suspended due to billing issues?](#under-what-conditions-can-my-account-be-suspended-due-to-billing-issues)

Account suspension or restriction due to billing issues typically occurs when there's a prolonged period of non-payment or consistently failed payment attempts. However, the exact conditions and resolution process are handled on a case-by-case basis. If your account is impacted, or if you have concerns, please reach out to our customer support team directly at **[\[email protected\]](/cdn-cgi/l/email-protection#24575154544b56506443564b550a474b49)** for specific guidance regarding your account status.

### [What happens if my payment fails? Why did my payment fail?](#what-happens-if-my-payment-fails-why-did-my-payment-fail)

You may attempt to retry the payment up to two times. Before doing so, we recommend updating your payment method to ensure successful processing. If the issue persists, please contact our support team at [\[email protected\]](/cdn-cgi/l/email-protection#30434540405f42447057425f411e535f5d) for further assistance. Failed payments may result in service suspension. We will email you to remind you of your unpaid invoice.

### [What should I do if my billing question isn't answered in the FAQ?](#what-should-i-do-if-my-billing-question-isnt-answered-in-the-faq)

Feel free to contact **[\[email protected\]](/cdn-cgi/l/email-protection#a7d4d2d7d7c8d5d3e7c0d5c8d689c4c8ca)**

---

Need help? Contact our support team at **[\[email protected\]](/cdn-cgi/l/email-protection#4d3e383d3d223f390d2a3f223c632e2220)** with details about your billing questions.

---

description: Learn how GroqCloud handles data retention, including standard 30-day retention, Zero Data Retention (ZDR) options, prompt caching, and compliance requirements for prompts and outputs.
title: Your Data in GroqCloud - GroqDocs
image: https://console.groq.com/og_cloudv5.jpg

---

# Your Data in GroqCloud

Understand how Groq uses customer data and the controls you have.

## [What Data Groq Retains](#what-data-groq-retains)

Groq handles two distinct types of information:

1. **Usage Metadata (always retained)**
   - We collect usage metadata for all users to measure service activity and system performance.
   - This metadata does **not** contain customer inputs or outputs.
2. **Customer Data (retained only in limited circumstances)**
   - **By default, Groq does not retain customer data for inference requests.**
   - Customer data (inputs, outputs, and related state) is only retained in two cases:  
      1. **If you use features that require data retention to function** (e.g., batch jobs, fine-tuning and LoRAs).  
      2. **If needed to protect platform reliability** (e.g., to troubleshoot system failures or investigate abuse).

You can control these settings yourself in the [Data Controls settings](https://console.groq.com/settings/data-controls).

## [When Customer Data May Be Retained](#when-customer-data-may-be-retained)

Review the [Data Location](#data-location) section below to learn where data is retained.

### [1\. Application State](#1-application-state)

Certain API features require data retention to function:

- **Batch Processing (`/openai/v1/batches`)**: Input and output files retained for 30 days unless deleted earlier by the customer.
- **Fine-tuning (`/openai/v1/fine_tunings`)**: Model weights and training datasets retained until deleted by the customer.

To prevent data retention for application state, you can disable these features for all users in your organization in [Data Controls settings](https://console.groq.com/settings/data-controls).

### [2\. System Reliability and Abuse Monitoring](#2-system-reliability-and-abuse-monitoring)

As noted above, inference requests are not retained by default. We may temporarily log inputs and outputs **only when**:

- Troubleshooting errors that degrade platform reliability, or
- Investigating suspected abuse (e.g. rate-limit circumvention).

These logs are retained for up to **30 days**, unless legally required to retain longer. You may opt out of this storage in [Data Controls settings](https://console.groq.com/settings/data-controls), but you remain responsible for ensuring safe, compliant usage of the services in accordance with [the terms](https://groq.com/terms-of-use) and [Acceptable Use & Responsible AI Policy](https://console.groq.com/docs/legal/ai-policy).

## [Summary Table](#summary-table)

| Product     | Endpoints                                                                                                                          | Data Retention Type                     | Retention Period | ZDR Eligible           |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- | ---------------- | ---------------------- |
| Inference   | /openai/v1/chat/completions/openai/v1/responses/openai/v1/audio/transcriptions/openai/v1/audio/translations/openai/v1/audio/speech | System reliability and abuse monitoring | Up to 30 days    | Yes                    |
| Batch       | /openai/v1/batches/openai/v1/files (purpose: batch)                                                                                | Application state                       | Up to 30 days    | Yes (feature disabled) |
| Fine-tuning | /openai/v1/fine_tunings/openai/v1/files (purpose: fine_tuning)                                                                     | Application state                       | Until deleted    | Yes (feature disabled) |

## [Zero Data Retention](#zero-data-retention)

All customers may enable Zero Data Retention (ZDR) in [Data Controls settings](https://console.groq.com/settings/data-controls). When ZDR is enabled, Groq will not retain customer data for system reliability and abuse monitoring. As noted above, this also means that features that rely on data retention to function will be disabled. Organization admins can decide to enable ZDR globally or on a per-feature basis at any time on the Data Controls page in [Data Controls settings](https://console.groq.com/settings/data-controls).

## [Data Location](#data-location)

All customer data is retained in Google Cloud Platform (GCP) buckets located in the United States. Groq maintains strict access controls and security standards as detailed in the [Groq Trust Center](https://trust.groq.com/). Where applicable, Customers can rely on standard contractual clauses (SCCs) for transfers between third countries and the U.S.

## [Key Takeaways](#key-takeaways)

- **Usage metadata**: always collected, never includes customer data.
- **Customer data**: not retained by default. Only retained if you opt into persistence features, or in cases for system reliability and abuse monitoring.
- **Controls**: You can manage data retention in [Data Controls settings](https://console.groq.com/settings/data-controls), including opting into **Zero Data Retention**.
