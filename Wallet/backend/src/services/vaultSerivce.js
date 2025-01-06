require("dotenv").config();
const {
  ClientSecretCredential,
  DefaultAzureCredential,
} = require("@azure/identity");
const { SecretClient } = require("@azure/keyvault-secrets");
const credential = new DefaultAzureCredential();
const client = new SecretClient(process.env.KEYVAULT_URI, credential);

const getSecretVault = (req, res) => {
  const { secretName } = req.body;
  console.log(secretName);
  client
    .getSecret(secretName)
    .then((data) => {
      res.send(data.value);
    })
    .catch((error) => {
      console.log(error);
      res.send(error);
    });
};

const setSecretVault = (req, res) => {
  const { name, value } = req.body;
  client
    .setSecret(name, value)
    .then((data) => {
      const parsedSecret = JSON.parse(data.value);
      res.json(parsedSecret);
    })
    .catch((error) => {
      console.log(error);
      res.send(error);
    });
};

module.exports = { getSecretVault, setSecretVault };
