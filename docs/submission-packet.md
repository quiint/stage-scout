# Stage Scout — Hacksgiving submission packet

Prepared November 25, 2026. Requirements and source links: [Hacksgiving requirements](./hacksgiving-submission-requirements.md).

## Form answers

**Agent name**
Stage Scout

**Description**
Stage Scout is a theatre discovery agent that turns a city, a real date range, and a few taste notes into a source-linked, poster-led shortlist of upcoming productions. It runs on Fly Sprites and only ranks productions already returned by Stagedoor’s approved catalogue, while retaining the original source and last-check date on every result.

**Connector**
Sprites-managed OpenRouter connector, restricted to the `stage-scout` Sprite label and the chat-completions/model endpoints. The live ranking demonstration uses Groq's `openai/gpt-oss-20b` through a signed Stagedoor service route so Scout never receives the Groq API key.

**Demo link**
https://stage-scout-hkui.sprites.app

**Code link**
https://github.com/quiint/stage-scout

**Social-post link**
Pending: publish the prepared post below, tagging `@flydotio`.

## Two-minute demo route

1. Open Stage Scout and point out the calendar controls, city/state fields, and optional taste note.
2. Search Charlotte, NC from February 1 through February 23, 2027 with “big vocals, playful camp, and musicals.”
3. Show the returned *Death Becomes Her* engagement: poster, Belk Theater, run dates, IBDB source link, and source-check date.
4. Save it, open **Saved**, then return to results.
5. Explain the provenance rule: production-run dates are not individual performance times, and every recommendation must be drawn from the returned catalogue.
6. Show the `SCOUT’S PICKS` ranking state: Groq's `openai/gpt-oss-20b` ranks only the catalogue records supplied by Scout. Disconnecting ranking visibly and honestly falls back to `CATALOGUE MATCHES`.

## Social post draft

> Built **Stage Scout** for @flydotio Hacksgiving: a poster-led theatre discovery companion that turns a city, dates, and a little taste into a source-linked shortlist of real productions. It runs on Fly Sprites and keeps the original source/check date attached to every pick.
>
> Demo: https://stage-scout-hkui.sprites.app

## Pre-submit checklist

- [x] Agent runs on a Fly Sprite.
- [x] Working public demo is live with anonymous session isolation and bounded search limits.
- [x] Sprites-managed OpenRouter connector is scoped exclusively to `stage-scout`.
- [x] Full local regression suite passes: 9 tests, 16 assertions; the public Sprite search flow is verified end to end.
- [x] Form description, demo route, and social copy are ready.
- [x] Run a live ranked-result demo with Groq `openai/gpt-oss-20b`.
- [x] Publish the reviewed source to https://github.com/quiint/stage-scout.
- [x] Isolate browser sessions and apply search limits before making the demo public.
- [ ] Publish the social post and use its URL in Fly’s form.
- [ ] Submit the form before 11:59 p.m. Pacific on November 29, 2026.
