/* eslint-disable no-console */
const axios = require('axios');
const program = require('commander');

const isPortAvailable = port =>
  axios
    .get('/', { baseURL: `http://localhost:${port}` })
    .then(res => false)
    .catch(err => err.code === 'ECONNREFUSED');

/*
  @usage
  npm run start-fake-services -- -s integrations,authenticator
*/
program
  .version('0.1.0')
  .option('-s, --services <services>', 'list of services to start')
  .parse(process.argv);

let services = {};
if (program.services) program.services.split(',').forEach(service => (services[service] = true));
else {
  services = {
    otp: true
  };
}

const startServer = (name, port) =>
  isPortAvailable(port).then(isAvailable => {
    if (isAvailable) {
      require(`./${name}`).listen(port);
      console.log(`fake ${name} server started on port ${port}`);
    } else {
      console.error(`fake ${name} server not started. ${port} unavailable`)
    }
  });

if (services.otp) startServer('otp', 1234);
