# Test Data Generator

A lightweight browser extension for generating sample data to use in development and testing. It runs locally in the browser and does not require a build step or external dependencies.

## Features

- Generate realistic sample data, edge cases, and security test payloads.
- Choose from presets or build a custom set of fields.
- Select a country to generate matching phone numbers and address details.
- Export as JSON, CSV, SQL `INSERT` statements, plain text, or one value per line.
- Copy generated data or download it as a file.
- Save the current settings in the browser.

Security payloads are test inputs, not an assessment of an application. Use them only with systems you own or are authorized to test.

## Install

The extension uses the Chromium Side Panel API and requires Chrome 114 or later. Compatible Chromium browsers such as Microsoft Edge may also work.

1. Download or clone this repository.
2. if Download as zip then unzip it first.
3. Open `chrome://extensions` in Chrome (or the equivalent extensions page in your browser).
4. Turn on **Developer mode**.
5. Select **Load unpacked** and choose this project folder.
6. Select the extension toolbar icon to open the generator.

## Use

Choose a data mode and country, configure fields and output format, then copy or download the generated result. Country selection affects country-related fields such as phone numbers, city, region, postal code, and country. Choose **Random country** to vary these values across generated rows. The extension supports up to 1,000 rows or payloads per generation.

## Permissions and data

- `storage`: saves extension settings in the browser.
- `sidePanel`: displays the generator in the browser side panel.

Generation is performed locally; the extension does not send generated data to a server.

## Security notes

- Security payload mode generates test strings only. Run payloads only against systems you own or are authorized to test.
- CSV exports prefix spreadsheet-formula-like values with an apostrophe to reduce formula-injection risk.
- Test passwords are generated locally; do not reuse them for real accounts or sensitive systems.
- The extension enforces a restrictive Content Security Policy and uses only bundled local scripts.

## Development

This project is plain JavaScript and HTML, with no build or package-install step. To test changes, load the folder as an unpacked extension and reload it from the extensions page.
