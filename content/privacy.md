---
title: "Privacy Policy"
date: 2026-07-17
hidemeta: false
ShowReadingTime: false
ShowBreadCrumbs: false
---

_Last updated: July 17, 2026_

This Privacy Policy explains what information the **CB Servers Launcher** (the
"Launcher") and its supporting service at `auth.cbservers.xyz` collect, how it is
used, and the choices you have. CB Servers is a free, community-run project for
Call of Duty custom game clients. We have designed the Launcher to collect as
little information as possible.

## Summary

- We do **not** require an account to use the Launcher.
- The Launcher contacts our update servers on startup to keep itself and your
  game clients up to date. No personal information is sent.
- We only store data if you choose to **link your Discord account** for the
  friends-list feature.
- The only information we keep is your **Discord user ID** and the **time you
  linked**. Nothing else.
- We never store your Discord login, OAuth tokens, email, username, or your
  friends list.

## Information we collect and store

The Launcher works without any account. The only feature that stores information
is the optional **Discord friends list**, which lets you see which of your
Discord friends also use the Launcher.

If — and only if — you link your Discord account, our link registry service
(`auth.cbservers.xyz`) stores:

- Your **Discord user ID** (a public numeric identifier, also called a
  "snowflake").
- A **timestamp** recording when you linked.

That is the complete set of information we retain.

### Information processed but not stored

To operate the friends-list feature securely, the service briefly processes some
data without keeping it:

- **Discord access token.** When the Launcher calls our service, it sends your
  Discord OAuth2 access token so we can confirm your identity with Discord. We
  never store the token. We keep only a short-lived (about 5 minutes)
  **one-way hash** of it as a verification cache, after which it is discarded.
- **Friend ID lookups.** To show which friends also use the Launcher, the
  Launcher sends us a list of your Discord friends' IDs. We check them against
  our registry and return the matches **in real time**. We do **not** store the
  list you send.
- **Rate-limit counters.** We keep temporary counters to prevent abuse. These
  expire automatically within minutes.

## Information we do NOT collect

We want to be explicit. The Launcher and its services do **not** collect or
store:

- Your Discord email, username, avatar, or password.
- Your Discord OAuth tokens.
- Your friends list.
- Any game files, in-game activity, play history, or statistics.
- Your IP address, hardware information, or other device identifiers (beyond
  what is incidentally present in standard, short-lived server request logs from
  our hosting provider).
- Any payment or financial information — the Launcher is free.

## How we use Discord

The Launcher integrates with Discord using Discord's official OAuth2 flow and
Social SDK. With your authorization, this is used to:

- Confirm your Discord identity so the friends-list feature can work.
- Read your Discord friends list **locally, on your device**, to compare it
  against the registry.
- Display **Rich Presence** — that is, show what game you are playing on your own
  Discord profile. This activity is sent to **Discord**, not to us, and is
  controlled by your Discord privacy settings.

Your use of Discord is also governed by
[Discord's Privacy Policy](https://discord.com/privacy).

## Software updates and downloads

To keep your installation current, the Launcher communicates with CB Servers
infrastructure without requiring any account or action on your part:

- **Update checks.** On startup, the Launcher checks for updates to the
  Launcher itself and to the game clients it manages. Update manifests and
  files are hosted on **GitHub** in our public
  [updater repository](https://github.com/CBServers/updater).
- **Game downloads.** Game files you install are downloaded from our CDN. Your
  selected CDN region is stored locally on your device only.

These requests carry no account information or personal identifiers — only the
standard metadata inherent to any HTTP request (such as your IP address), which
our hosting providers may briefly process to deliver the service. Running the
Launcher with the `-offline` flag disables all update checks and downloads.

## Third-party services

We rely on the following third parties to operate the Launcher:

- **Discord** — for account linking, identity, and Rich Presence. See Discord's
  [Privacy Policy](https://discord.com/privacy) and
  [Terms of Service](https://discord.com/terms).
- **Cloudflare** — our link registry runs on Cloudflare Workers and storage.
  Cloudflare may process request metadata (such as IP addresses) as part of
  delivering and protecting the service. See Cloudflare's
  [Privacy Policy](https://www.cloudflare.com/privacypolicy/).
- **GitHub** — Launcher and game client updates are distributed through our
  public GitHub repositories. GitHub may process request metadata (such as IP
  addresses) when the Launcher checks for or downloads updates. See GitHub's
  [Privacy Statement](https://docs.github.com/en/site-policy/privacy-policies/github-privacy-statement).

## Data retention and deletion

Your Discord user ID and link timestamp remain stored only for as long as your
account is linked. You can remove this data at any time by **unlinking your
Discord account** in the Launcher, which immediately and permanently deletes your
entry from the registry.

If you cannot access the Launcher and want your data removed, contact us (see
below) and we will delete your registry entry.

## Children's privacy

The Launcher is not directed at children under 13 (or the minimum age required
in your country). We do not knowingly collect information from children. Discord
itself requires users to be at least 13 years old.

## Changes to this policy

We may update this Privacy Policy from time to time. Material changes will be
reflected by updating the "Last updated" date above. Continued use of the
Launcher after a change constitutes acceptance of the revised policy.

## Contact

Questions about this Privacy Policy or requests to delete your data can be sent
to us via our [Discord server](https://discord.gg/WyJQCwCCGW) or through our
[GitHub organization](https://github.com/CBServers).
