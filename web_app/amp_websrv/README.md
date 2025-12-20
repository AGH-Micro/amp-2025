# amp_websrv Project (Express)

This project is a backend server based on **Node.js**, **Express.js**, and the **ws** library. It acts as a bridge (proxy) between the web application (communicating via WebSocket) and a physical device, e.g., an STM32 microcontroller (communicating via a raw TCP socket).

## Running the Project (Development Mode)

To run the project locally for development purposes, follow the steps below.

### 1. Cloning the Repository (First Time Only)

```bash
git clone <gitlab-repository-url>
cd amp_websrv
```

### 2. Installing Dependencies (First Time Only or After Update)

Make sure you have [Node.js](https://nodejs.org/) installed. Then, in the main project directory (`amp_websrv`), run the command:

```bash
npm install
```

This command will install all required packages defined in `package.json`.

### 3. Running the Development Server

To run the application in development mode with automatic reloading after code changes, use the command:

```bash
npm run dev
```

## Available Scripts

The following scripts are available in this project:

-   `npm run dev`: Runs the development server.
-   `npm start`: Runs the production server.
