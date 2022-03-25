import {Block, Transaction} from '../types';
import { SolanaBlock, SolanaTransaction } from '@sotatek-subql/types-solana';

const getSolanaAddress = (value: string) => {
  return value.match(/[1-9A-HJ-NP-Za-km-z]{32,44}/g);//reference: https://docs.solana.com/integrations/exchange
};

const getInstruction = (value: string) => {
  const result = value.match(/Instruction:/g);
  if (result) {
    return value.split(" ").pop();
  }
  return result;
};

export async function handleBlock(block: SolanaBlock): Promise<void> {
  let record = await Block.get(block.block.blockhash);
  if (!record) {
      record = new Block(block.block.blockhash);
  }
  //Record block number
  record.slot = block.block.parentSlot + 1;
  await record.save();
}

export async function handleTransaction(transaction: SolanaTransaction): Promise<void> {
  const { transaction: transactionData, meta } : any = transaction;
  let record = new Transaction(transactionData.message.recentBlockhash);
  record.blockHash = transactionData.message.recentBlockhash;
  record.slot = transaction.slot;
  record.blockHeight = transaction.blockHeight;
  record.signature = transactionData.signatures[0] ? transactionData.signatures[0] : null;
  if (meta) {
    if (meta.logMessages) {
      record.programId = [...meta.logMessages.reduce((programs, log) => {
          const solanaProgram = getSolanaAddress(log);
          if (solanaProgram && solanaProgram.length) {
            programs.add(solanaProgram[0])
          }
          return programs;
      }, new Set())] as string[];

      record.instruction = [...meta.logMessages.reduce((instructions, log) => {
          const solanaInstruction = getInstruction(log);
          if (solanaInstruction) {
            instructions.add(solanaInstruction)
          }
          return instructions;
      }, new Set())] as string[];
    } else {
      record.programId = null;
      record.instruction = null;
    }

    record.status = Object.keys(meta.status).length
      ? Object.keys(meta.status)[0]
      : null;
  }
  await record.save();
}
