# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Unreleased

### Added

- `onSessionChange` callback to `AvanzaClient` constructor to be able to listen to session changes if you want to persist the session
- `search` method to `AvanzaClient.market` to search for stocks, funds, bonds, etc.
- `getInstrument` method to `AvanzaClient.market` to get a specific instrument by id

### Fixed

- Correctly rename `getAccountOverview` to `getOverview` in `Account` class and remove accountId parameter
- Made fetch mandatory to fix require crashing if node-fetch is not installed

## 0.2.0 - 2022-11-20

### Added

- Changelog
