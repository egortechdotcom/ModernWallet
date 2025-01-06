const { DefaultAzureCredential } = require("@azure/identity");
const { SecretClient } = require("@azure/keyvault-secrets");
require("dotenv").config();

const credential = new DefaultAzureCredential();


const vaultName = process.env.VAULT_NAME;
const url = process.env.VAULT_URL;

const client = new SecretClient(url, credential);

// const secretName = "MySecretName";

async function addWalletKey(secretName,secretValue) {
  const result = await client.setSecret(secretName, secretValue);
  console.log("result: ", result);
}

exports.addWalletKey = addWalletKey;