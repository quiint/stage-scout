# Hacksgiving 2026 submission requirements

Last checked: November 25, 2026 (America/New_York).

## The non-negotiable project requirements

- The entry must be an **agent that runs on Fly.io Sprites**.
- It must use **at least one Sprites connector**.
- It must be built during Hacksgiving week: **Monday, November 23 through Sunday, November 29, 2026**.
- The entrant needs a Fly.io account and may submit **one entry**. Developers anywhere are welcome.
- The project must follow the Fly.io Terms of Service.

Source: [Hacksgiving — Rules and guidelines](https://fly.io/hacksgiving/).

## What must be submitted

Fly’s submission form requires the entrant’s name and email, the agent name, a one- or two-sentence description, the connector(s) used, and these three links:

1. A link to the code.
2. A demo link.
3. A social post link that tags `@flydotio`.

The stated deadline is **11:59 p.m. Pacific on Sunday, November 29, 2026**. The event page says “before midnight PST”; the official form supplies the exact time.

Sources: [Hacksgiving — How to submit](https://fly.io/hacksgiving/) and [official submission form](https://docs.google.com/forms/d/e/1FAIpQLSfZ_xearoDOSRXI3VjAbM4BJlObUdxSFO0SDwyZ8G6M2lapRQ/viewform).

## Sharing requirement and useful extras

- Share the agent on **X, Bluesky, LinkedIn, or Reddit**, with a short demo, and tag **@flydotio**.
- A video demo is described as earning “bonus points,” but Fly explicitly says it **will not affect the score**.

Source: [Hacksgiving — How to submit](https://fly.io/hacksgiving/).

## Judging and announcement

Fly says its judges choose winners for the Grand Prize, Second Place, and Weird Uncle Award. The Hacksgiving page names Daniel Gafni, Carter Rabasa, Scott Johnston, Asaf Ashirov, and Michael Chiang as judges. Winners are announced by email on **Tuesday, December 1, 2026**.

The official page does not publish a detailed scoring rubric beyond the eligibility and submission requirements above. Avoid claiming that “bonus points” are formal judging criteria.

Source: [Hacksgiving — Meet the Judges, Prizes, and Rules and guidelines](https://fly.io/hacksgiving/).

## Stage Scout readiness checklist

- [x] Runs on a Fly Sprite: `stage-scout`.
- [x] Uses a Sprites connector: the Sprite-scoped OpenRouter connector.
- [x] Source is published at https://github.com/quiint/stage-scout.
- [ ] Make a short demo that shows a real search, saved pick, and source-linked result.
- [x] Host a working public demo with anonymous session isolation and bounded request limits.
- [ ] Write the one- or two-sentence entry description.
- [ ] Publish a short social post with the demo and `@flydotio` tag.
- [ ] Complete Fly’s submission form with the code link, demo link, social-post link, connector name, and description before the Pacific deadline.

## Suggested submission description

> Stage Scout is a theatre discovery agent that turns a city, dates, and a few taste notes into a source-linked, poster-led shortlist of real upcoming productions. It runs on Fly Sprites, uses a Sprites connector to rank only verified catalogue results, and lets the user save the shows they want to track.
