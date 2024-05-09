# fragments

This is a microservice for CCP.

## Getting Started

### Prerequisites

Before you start, ensure you have Node.js installed on your machine. Additionally, you'll need the following global packages:

- `nodemon`
- `eslint`
- `cross-env`

You can install them using npm:

```bash
npm install -g nodemon eslint cross-env
```

### Installation

Clone the repository and install the dependencies:

```bash
git clone https://github.com/Sahib-Aujla/fragments.git
cd fragments
npm install
```

## Running the Application

### Start the Server

To start the server in production mode, run:

```bash
npm run start
```

This will start the server using Node.js.

### Development Mode

To start the server in development mode, run:

```bash
npm run dev
```

This uses `nodemon` and `cross-env` and set the log level to debug.

### Debugging

To start the server in debug mode, which allows for debugging via an debugger, run:

```bash
npm run debug
```

This also uses `nodemon` for watching file changes and restarts.

### Linting

To lint the codebase for JavaScript syntax errors or style issues, run:

```bash
npm run lint
```

This uses `eslint` with the configurations specified in the `eslint.config.mjs` file.

## Author

- Sahibpreet Singh
