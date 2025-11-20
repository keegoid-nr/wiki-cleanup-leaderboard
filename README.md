# Forge Confluence Custom UI Macro - Leaderboard

![platform](https://img.shields.io/badge/platform-Forge-0052CC)

This project contains a Forge app with a Custom UI macro for Confluence. It displays a leaderboard for a wiki cleanup competition.

See [developer.atlassian.com/platform/forge/](https://developer.atlassian.com/platform/forge) for documentation and tutorials explaining Forge.

## Requirements

See [Set up Forge](https://developer.atlassian.com/platform/forge/set-up-forge/) for instructions to get set up.

## Quick Start

### 1. Install Dependencies

There are two `package.json` files. You need to install dependencies for both the top-level Forge app and the Custom UI frontend.

```sh
# Install top-level dependencies
npm install

# Install frontend dependencies
cd static/wiki-cleanup-competition
npm install
cd ../..
```

### 2. Build the Frontend

Before deploying, you need to create a production build of the React app.

```sh
# From the root directory
cd static/wiki-cleanup-competition
npm run build
cd ../..
```

### 3. Deploy and Install

Deploy the app to your Atlassian cloud environment and install it on your Confluence site.

```sh
# Deploy the app
forge deploy

# Install the app on your site
# Replace your-site.atlassian.net with your actual Confluence cloud URL
forge install --site your-site.atlassian.net --product confluence
```

After installation, you can add the "wiki-cleanup-competition" macro to any Confluence page.

### 4. Development with Tunnel

For a much faster development workflow, use the Forge tunnel to connect your local development server to Confluence.

1. **In your first terminal**, from the project root, start the tunnel:

    ```sh
    forge tunnel
    ```

2. **In a second terminal**, start the React development server:

    ```sh
    cd static/wiki-cleanup-competition
    npm start
    ```

Now, any changes you make to the frontend code in `static/wiki-cleanup-competition/src/` will hot-reload directly on the Confluence page where your macro is active.

## Support

See [Get help](https://developer.atlassian.com/platform/forge/get-help/) for how to get help and provide feedback.
