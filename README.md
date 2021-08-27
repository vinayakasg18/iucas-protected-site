# IU-CAS Protected Site

An express-based application server which hosts a static site
viewable only by a specified set of IU users.

## Pre-requisites

* NodeJS 8+

## Installation

Run `npm install` to install dependencies. Copy [example.env](example.env) to `.env`
and customize for your static site.

## Running

Either run `npm start` or `./server.js`. The server normally checks for a `.env` file in the same directory as `server.js`. If you want to provide a different `.env` pass it on the command like like this: `./server.js my.env`.

## See also

* <https://github.com/soichih/passport-iucas>
* <https://github.iu.edu/UITS-IMS/CasIntegrationExamples/blob/master/nodejs-express-passport.js>


## Run the application using docker
Run the docker using below command.

`docker run -it -p 8080:8080 vinayakasgadag/cns:iucas01`

## Architecture
Below is the architecure of the appication on how it is deployed to Kubernetes and accessible.
![Architecture](site/architecture.png)
