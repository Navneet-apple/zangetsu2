# Zangetsu2 — Community Sources

A clean, community-maintained catalog of JavaScript providers compatible with Zangetsu.

## Add this repository

Use this raw manifest URL in Zangetsu:

`https://raw.githubusercontent.com/Navneet-apple/zangetsu2/main/index.json`

## Current provider

- **Internet Archive — Licensed Animation** (`ia-licensed-animation`): searches Internet Archive animation and cartoon records whose metadata identifies a public-domain or Creative Commons license. License metadata is checked again before showing playback links.

## Repository layout

- `index.json` — provider catalog / manifest
- `providers/` — provider JavaScript implementations
- `tests/` — provider validation tests (to be added as the catalog grows)

## Compatibility notes

Providers use the Zangetsu JavaScript provider interface. Test each provider in the target Zangetsu version before relying on it; source APIs and metadata can change.

## Rights and safety

This repository prioritizes sources that identify their content as public-domain, Creative Commons, or otherwise authorized. A license field is only metadata and is not a legal determination; verify an item's actual rights and terms before downloading, redistributing, or using it. Do not use this repository to bypass access controls or paywalls.

## Contributing

1. Add a provider under `providers/`.
2. Register its unique `id`, version, type, language, and file path in `index.json`.
3. Validate the manifest JSON and test search, detail, episode, and playback behavior in Zangetsu.
4. Document API limitations and rights assumptions in the provider file.
