# Playwright Automation Dashboard

This project provides a comprehensive Playwright automation suite with a custom web-based dashboard for easy execution and monitoring of scripts. It includes modules for web scraping, automated user login/creation, and end-to-end testing.

## Table of Contents

-   [Features](#features)
-   [Prerequisites](#prerequisites)
-   [Installation](#installation)
-   [Usage](#usage)
    -   [Starting the Dashboard](#starting-the-dashboard)
    -   [Running Individual Modules via CLI](#running-individual-modules-via-cli)
-   [Project Structure](#project-structure)
-   [Configuration](#configuration)

## Features

-   **Web Scraping**: Scrapes product information from a target website.h
-   **Automated User Flow**: Automates admin login, user creation, and verification login.
-   **End-to-End Testing**: Playwright E2E tests for core functionalities.
-   **Interactive Dashboard**: A local web interface to trigger and monitor all automation tasks with real-time logs and result displays.

## Prerequisites

Before you begin, ensure you have the following installed:

-   **Node.js**: [LTS version recommended](https://nodejs.org/en/download/)
-   **pnpm**: A fast, disk space efficient package manager.
    ```bash
    npm install -g pnpm
    ```

## Installation

1.  **Clone the repository** (if you haven't already):
    ```bash
    git clone <your-repository-url>
    cd playwright_demo
    ```
2.  **Install dependencies**:
    Navigate to the project's root directory and install all required packages using `pnpm`:
    ```bash
    pnpm install
    ```
    This will also install Playwright's browser binaries.

## Usage

**Important**: This automation suite is specifically designed to interact with your local web project, which is expected to be running at `http://localhost:3000`. Ensure your web application is active before running any scripts or tests.

### Starting the Dashboard

The recommended way to interact with the automation suite is through the custom web dashboard.

1.  **Ensure your target application is running** (e.g., on `http://localhost:3000`).
2.  **Start the dashboard**:
    ```bash
    pnpm dashboard
    ```
    This command will launch a local server and automatically open the dashboard in your default web browser (usually at `http://localhost:3333`).

    From the dashboard, you can:
    -   Click **"Scrape Products"** to initiate the web scraping process.
    -   Click **"Auto Login & Create"** to run the automated user flow.
    -   Click **"E2E Tests"** to execute the Playwright end-to-end tests and view the HTML report.

### Running Individual Modules via CLI

You can also run each automation module directly from the command line if preferred.

-   **Run End-to-End Tests**:
    ```bash
    pnpm test
    ```
    The HTML test report will be generated in `result/playwright-report/`.

-   **Run Product Scraper**:
    ```bash
    pnpm scrape
    ```
    Scraped data will be saved to `result/products.json`.

-   **Run Auto Login & Create User**:
    ```bash
    pnpm auto
    ```
    A screenshot of the successful login will be saved to `result/auto-login.png`.

## Project Structure

```
.
├── dashboard/                 # Web dashboard for running/monitoring tasks
│   ├── public/                #   Frontend assets (HTML, CSS, JS)
│   └── server.ts              #   Backend server for dashboard
├── modules/
│   ├── scripts/               # Automation scripts
│   │   ├── create-user-and-login.ts
│   │   └── scrape-products.ts
│   └── tests/                 # Playwright E2E test files
│       └── e2e-login.spec.ts
├── result/                    # Output directory for screenshots, JSON, and reports
├── playwright.config.ts       # Playwright configuration
├── package.json
├── pnpm-lock.yaml
├── README.md                  # This file
└── tsconfig.json              # TypeScript configuration
```

## Configuration

-   **Base URL**: The `BASE_URL` for the target application is configured in `playwright.config.ts` (default: `http://localhost:3000`).
-   **Playwright Browsers**: Configured to run on Chromium by default.
-   **Output Directory**: All automation results (screenshots, JSON, test reports) are stored in the `./result` directory.
