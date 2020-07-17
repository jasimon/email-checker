# Argus
A gmail scanner to protect your inbox in the event your account is compromised.  Detects publicly accessible Google drive and dropbox links and some source code as well.


## Setup

### Dependencies
- Install `node`
    - Use NVM (https://github.com/nvm-sh/nvm): `nvm install lts/dubnium && nvm use lts/dubnium`
    - Alternatively you can download and install it manually: https://nodejs.org/en/download/
- Install `yarn ^1.10.1`
    - Use brew (https://brew.sh/): `brew install yarn`
    - Alternatively you can download and install it manually: https://classic.yarnpkg.com/en/docs/install
- Install `redis`
    - `brew install redis`
    - `launchctl load ~/Library/LaunchAgents/homebrew.mxcl.redis.plist`
- Install `postgres`
    - `brew install postgres'
    - Start postgres `launchctl load ~/Library/LaunchAgents/homebrew.mxcl.postgresql.plist`
    - Create the user `createuser emailadmin`
    - Create the db `createdb -O emailadmin emaildb`

### Env setup
This project uses `dotenv` (https://github.com/motdotla/dotenv) to manage environment variables, you'll need to create one and fill in the keys with values surrounded by `< >`
First run `touch .env` in the project root
Paste in the file below, and complete the necessary keys:
```
DB_NAME=emaildb
DB_USER=emailadmin
DB_PASS=
DB_HOST=localhost
DB_PORT=5432
GOOGLE_CLIENT_ID=<your google client id>
GOOGLE_CLIENT_SECRET=<your google client secret>
GOOGLE_REDIRECT_URI=<your google redirect uri>
SESSION_SECRET=fartoolongtoreasonablyguess
EMAIL_QUEUE_NAME=email_queue
GMAIL_TOPIC_NAME=<your topic name>
```
NOTE: Your google redirect URI is what you specified for your callback url when setting up the project.  Existing projects may have multiple urls configured.

### Setting up push updates
- Download [ngrok](https://ngrok.com/download)
- Follow the instructions [here](https://developers.google.com/gmail/api/guides/push) to set up a topic and subscription, using ngrok (`ngrok http 8080`) to get a publicly accessible url as the push endpoint in the subscription
- enter the topic name into your `.env` file

## Development
- Download and install VSCode: https://code.visualstudio.com/
- Read the setup guide https://code.visualstudio.com/docs/setup/setup-overview
    - Launching VSCode from the command line: Open the Command Palette (F1) and type `shell command` to find the `Shell Command: Install 'code' command in PATH command`
        - After doing this you can start VSCode on a repo with `code .`
- Install TSLint extension in VSCode https://marketplace.visualstudio.com/items?itemName=ms-vscode.vscode-typescript-tslint-plugin
- In order to run the debugger for backend/tests put a breakpoint in VSCode and run this command in VSCode (`CMD + SHIFT + P`): `Debug: attach node to process`. You can also enable `Debug: Toggle Auto Attach` to start the debugger every time a node process is started from VSCode terminal.
- To open a terminal in VSCode: ```CTRL + ` ```

## Usage
- Install dependencies: `yarn install`
- Build application (both frontend and backend in http://localhost:8080): `yarn build`
    - Some browser automatically redirects you to `https` so make sure to disable the automatic redirect
- Watch for changes and build application: `yarn build-watch`
- Build frontend, watch for changes and hot reload (port 8000): `yarn build-hot-reload`
    - All the backend requests will be forwarded to port 8080 so you need to run the backend
- Run application (port 8080): `yarn start`
- Run tests: `yarn test`
- Remove all the generated files: `yarn clean`
- Run the worker for development: `yarn worker:dev`
- Run the worker for production: `yarn worker`
- Run multiple workers in parallel: `yarn parallelize`

To run the whole project first run `yarn build`, then you'll need 3 shells, one running `yarn start`, one running `yarn build-hot-reload`, and one running `yarn parallelize`
