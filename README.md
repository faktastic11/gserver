# Pre-requirements

Since this is a node server you'll need npm, node 18+ (installed with nvm) and yarn installed.

1. Install NVM - [instructions here](<[url](https://github.com/nvm-sh/nvm#installing-and-updating)>)
2. Using NVM install node 18

```
nvm install 18 # downloads node 18

nvm use 18 # switch to actually using the node version you've downloaded

node -v # checks the node version, confirms that node 18 is actually installed
```

3. Install yarn globally to your computer

```
npm install --global yarn
```

Check that yarn is running

```
yarn --version
```

# environment variables for local development at server root

create a .env file with the following variables

```
PORT=<localPort_to_run_server_on default is >
NODE_ENV=<development_staging_production_etc>
MONGO_URI=mongodb+srv://<staging_or_local_mongodb_db_uri_string>/<db>?retryWrites=true&w=majority
```

# install with yarn

```sh
yarn
```

# start the server

```sh
yarn dev
```

# Debugging

Debugging has 2 steps

1. Running a builder task
   - Option 1: run `yarn build:watch`
   - Option 2: press `CMD+Shift+B` which will run a task that should be in the background during your vscode session
2. Running the actual debugger
   - On the debug tab click on the drop down at the top and select 'Debug Server'. Then click on the green play icon

# Write and Run a Script outside of the server

In general all scripts should be in the src/scripts folder. Note that since we're not directly starting up a node server but instead using ts-node to run a script we're going to have to manually connect mongoose to the db in order to use mongoose models or communicate with the db. An example of this is [here](https://github.com/cozyrimz/guidance-server/blob/main/src/scripts/seedSPConstituents.ts#L14).

Then in terminal run your script with npx and ts-node ex:

```bash
npx ts-node src/scripts/seedDBCleanedTranscripts.ts
```
