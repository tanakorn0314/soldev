import {
  LAMPORTS_PER_SOL,
  PublicKey,
  Connection,
  clusterApiUrl,
  Keypair,
  Transaction,
  SystemProgram,
  sendAndConfirmTransaction,
  TransactionInstruction,
} from "@solana/web3.js";
import * as bs58 from "bs58";

export const solanaEndpoint = clusterApiUrl("devnet");

export const solToLamports = (sol: number) => {
  return sol * LAMPORTS_PER_SOL;
};

export const lamportsToSOL = (lamport: number) => {
  return lamport / LAMPORTS_PER_SOL;
};

export const getTxURL = (signature: string) => {
  const baseURL = `https://solscan.io/tx`;
  return `${baseURL}/${signature}?cluster=devnet`;
};

export const generateKeypair = () => {
  return Keypair.generate();
};

export const secretKeyToKeypair = (secretKey: string) => {
  if (secretKey.includes(",")) {
    const secret = secretKey.split(",").map((x) => Number(x));
    return Keypair.fromSecretKey(Uint8Array.from(secret));
  } else {
    const secret = bs58.decode(secretKey);
    return Keypair.fromSecretKey(Uint8Array.from(secret));
  }
};

export const getBalance = async (
  address: string,
  connection = new Connection(solanaEndpoint)
) => {
  const key = new PublicKey(address);
  return connection
    .getBalance(key)
    .then((balance) => lamportsToSOL(balance).toString());
};

export const getAccountInfo = async (
  address: string,
  connection = new Connection(solanaEndpoint)
) => {
  const key = new PublicKey(address);
  return connection.getAccountInfo(key);
};

export const airdropSOL = async (
  to: string,
  connection = new Connection(solanaEndpoint)
) => {
  return connection.requestAirdrop(new PublicKey(to), LAMPORTS_PER_SOL);
};

export const transferSOL = async (
  from: string,
  to: string,
  amount: number,
  secretKey: string
) => {
  const connection = new Connection(solanaEndpoint);
  const transaction = getTransferTransaction(from, to, amount);
  return sendAndConfirmTransaction(connection, transaction, [
    secretKeyToKeypair(secretKey),
  ]);
};

export const incrementCounter = async (secretKey: string) => {
  const connection = new Connection(solanaEndpoint);
  const transaction = getIncrementTransaction();
  return sendAndConfirmTransaction(connection, transaction, [
    secretKeyToKeypair(secretKey),
  ]);
};

export const getTransferTransaction = (
  from: string,
  to: string,
  amount: number
) => {
  const transaction = new Transaction();

  const sendSolInstruction = SystemProgram.transfer({
    fromPubkey: new PublicKey(from),
    toPubkey: new PublicKey(to),
    lamports: LAMPORTS_PER_SOL * amount,
  });

  transaction.add(sendSolInstruction);

  return transaction;
};

export const getIncrementTransaction = () => {
  const counterProgramID = "ChT1B39WKLS8qUrkLvFDXMhEJ4F1XZzwUNHUt4AU9aVa";
  const counterAccountID = "Ah9K7dQ8EHaZqcAsgBW8w37yN2eAy3koFmUn4x3CJtod";

  const instruction = new TransactionInstruction({
    keys: [
      {
        pubkey: new PublicKey(counterAccountID),
        isSigner: false,
        isWritable: true,
      },
    ],
    programId: new PublicKey(counterProgramID),
  });

  const transaction = new Transaction();
  transaction.add(instruction);
  return transaction;
};
