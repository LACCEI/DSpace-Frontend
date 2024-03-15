#!/bin/bash

# cd
# wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash


export NVM_DIR=$HOME/.nvm;
source $NVM_DIR/nvm.sh;

cd
nvm install 16.18.1

node -v


npm install --global yarn
npm install --global pm2

git clone https://github.com/LACCEI/DSpace-Frontend.git ~/DSpace-Frontend

cd ~/DSpace-Frontend
yarn install 
cp ~/DSpace-Frontend/config/config.example.yml ~/DSpace-Frontend/config/config.prod.yml

sed -i 's/host: sandbox.dspace.org/host: localhost/' ~/DSpace-Frontend/config/config.prod.yml
sed -i 's/host: localhost/host: localhost/' ~/DSpace-Frontend/config/config.prod.yml
sed -i 's/port: 443/port: 8080' ~/DSpace-Frontend/config/config.prod.yml

yarn build:prod
yarn test:rest

touch ~/DSpace-Frontend/dspace-ui.json
ROUTE=~/DSpace-Frontend

echo $ROUTE
echo $(ls $ROUTE)
echo '{"apps":[{"name":"dspace-ui","cwd":"'"$ROUTE"'","script":"dist/server/main.js","instances":"max","exec_mode":"cluster","env":{"NODE_ENV":"production"}}]}' > ~/DSpace-Frontend/dspace-ui.json

pm2 start dspace-ui.json

mv ~/DSpace-Frontend/dspace-ui.json ~/

sed -i "/\/opt\/solr-8.11.3\/bin\/solr start/a bash -ci \'pm2 start dspace-ui.json\'" ~/.profile
