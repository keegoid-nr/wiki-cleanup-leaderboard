# Confluence Custom UI Frontend

![language](https://img.shields.io/badge/language-TypeScript-3178C6) &nbsp;&nbsp; ![framework](https://img.shields.io/badge/framework-React-61DAFB)

This directory contains the React frontend for a Forge Custom UI macro.

## Development

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

To develop this frontend with live reloading in Confluence, you need to use the Forge tunnel.

1. **Start the Forge Tunnel**

    In a terminal at the root of the project (`forge-macro-custom-ui-leaderboard`), run:

    ```sh
    forge tunnel
    ```

2. **Start the React App**

    In a separate terminal, navigate into this directory and start the development server:

    ```sh
    npm install
    npm start
    ```

    This runs the app in development mode. Your Confluence site, connected via the tunnel, will load the app from `http://localhost:3000`. The page will reload if you make edits.

## Building for Production

To create a production build that can be deployed with Forge, run:

```sh
npm run build
```

This builds the app for production to the `build` folder. The `manifest.yml` in the root directory is configured to use this folder for deployments.

![Made with ❤️ by Google AI Studio](https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6)
