import makeContractDeploy from "@stacks/transactions";
import TransactionVersion from "@stacks/transactions";
import getAddressFromPrivateKey from "@stacks/transactions";
import { StacksTestnet } from "@stacks/network";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();
const STACKS_TESTNET = new StacksTestnet();

async function broadcastTx(rawTx: string) {
  const res = await fetch("https://stacks-node-api.testnet.stacks.co/v2/transactions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tx: rawTx }),
  });
  return res.json();
}

async function deployContract() {
  try {
    const privateKey = process.env.DEPLOYER_PRIVATE_KEY;
    if (!privateKey) throw new Error("DEPLOYER_PRIVATE_KEY .env.local'de yok!");

    const contractName = "student-cert";
    const contractPath = path.join(__dirname, "../contracts/student-cert.clar");
    if (!fs.existsSync(contractPath)) throw new Error(`Contract bulunamadı: ${contractPath}`);
    const codeBody = fs.readFileSync(contractPath, "utf-8");

    const senderAddress = getAddressFromPrivateKey(privateKey, TransactionVersion.Testnet);

    const tx = await makeContractDeploy({
      contractName,
      codeBody,
      senderKey: privateKey,
      network: STACKS_TESTNET,
      fee: 10000n,
    });

    const rawTx = tx.serialize().toString("hex");
    const result = await broadcastTx(rawTx);

    console.log("✅ Contract deploy sonucu:", result);
    if ("txid" in result) {
      console.log("📋 Transaction ID:", result.txid);
      console.log(`🔗 Explorer: https://explorer.stacks.co/txid/${result.txid}?chain=testnet`);
    }

  } catch (err) {
    console.error("❌ Deploy hatası:", err);
  }
}

deployContract();
