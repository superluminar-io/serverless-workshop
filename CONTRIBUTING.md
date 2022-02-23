# Contributing 🤓

## Bug report 🐞

Feel free to open an [issue](https://github.com/superluminar-io/serverless-workshop/issues).

## Local development setup 🧑‍💻

```sh
$ > git clone git@github.com:superluminar-io/serverless-workshop.git

$ > cd serverless-workshop

# Install dependencies
$ > npm install

# Synth all labs
$ > npm run synth:all

# Lint all labs
$ > npm run lint:all

# Run projen for all labs
$ > npm run projen:all

# Run projen in only one lab
$ > npm run projen --w lab1

# Serve docs
$ > npm start
```

Open http://localhost:3000.

## Architecture diagrams

The documentation uses SVGs for architecture diagrams. The best way to edit them is the [Draw.io Integration for VS Code](https://marketplace.visualstudio.com/items?itemName=hediet.vscode-drawio). If you don't use VS Code, you can upload the SVGs to the web interface and download the updated version.
