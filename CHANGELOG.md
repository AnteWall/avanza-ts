# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Unreleased

## 0.7.0 - 2022-12-04
### Added
- `priceChart.getPriceChart` returns price chart data for instruments.
- `auth.getSession` retrives active session from backend. Includes `session` and `user` objects.

## 0.6.0 - 2022-11-28
### Added
- `getInstrumentDetails` fetches details for a single instrument.

### Fixed
- `getOverview` typescript definition
- `search` missing typescript definition for resultGroups

## 0.5.0 - 2022-11-25
### Added
- add `isConnected` method to `AvanzaClient` to check if the client is connected to the Avanza API

### Fixed
- fix errors to return json object as string instead of stringified string json object

## 0.4.0 - 2022-11-22
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
