<p align="center">
  <img src="https://raw.githubusercontent.com/thunder-app/thunder/refs/heads/develop/assets/logo.png" alt="Thunder Server" width="200">
</p>

<h1 align="center">Thunder Server</h1>

<p align="center">
  A companion server which handles Thunder related services
</p>

<p align="center">
  <a href="https://lemmy.world/c/thunder_app">
    <img src="https://img.shields.io/lemmy/thunder_app%40lemmy.world?label=lemmy%20community" alt="Lemmy">
  </a>
  <a href="https://matrix.to/#/#thunderapp:matrix.org">
    <img src="https://img.shields.io/badge/chat-matrix-blue?style=flat&logo=matrix" alt="Matrix">
  </a>
</p>

<p align="center">
  <a href="#overview">Overview</a> •
  <a href="#features">Features</a> •
  <a href="#quick-setup-guide">Quick Setup</a> •
  <a href="#environment-configuration">Configuration</a>
</p>

## Overview

Thunder Server is an **experimental** companion service for [Thunder](https://github.com/thunder-app/thunder) that handles push notifications for both UnifiedPush and Apple Push Notification Service (APNs).

## Features

- **Push Notifications**: Supports both UnifiedPush and Apple Push Notification Service (APNs)
- **Multi-Account Support**: Polls and delivers notifications for multiple accounts
- **Docker-Ready**: Pre-configured Docker containers for easy deployment

## Quick Setup Guide

A docker compose configuration is provided for quick deployment. For custom deployments, docker images are available via GitHub.

### Setup

```bash
# Clone the repository
git clone https://github.com/thunder-app/thunder-server.git
cd thunder-server

# Copy and configure environment variables
cp example.env .env

# Start the server and database
docker-compose up -d
```

The server will be available at `http://localhost:2831` by default.

## Environment Configuration

Configure your environment by copying `example.env` to `.env` and updating the following settings:

### Application Settings
```bash
APP_PORT=2831
```

### Database Configuration
```bash
POSTGRES_USER=postgres
POSTGRES_PASSWORD=password
POSTGRES_HOSTNAME=postgres
POSTGRES_PORT=5432
POSTGRES_DATABASE=thunder_database
```

### Apple Push Notifications (APNs)
```bash
APNS_KEY_ID=your_key_id                     # Your Apple Developer Key ID
APNS_TEAM_ID=your_team_id                   # Your Apple Developer Team ID
APNS_APP_BUNDLE_ID=com.example.thunder      # Your app's bundle identifier
```

> **Note**: For APNs to work, you'll need to configure your Apple Developer account and obtain the necessary certificates.
