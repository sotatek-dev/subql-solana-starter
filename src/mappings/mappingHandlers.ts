import {Block, Transaction} from '../types';
import { SolanaBlock, SolanaTransaction } from '@sotatek-subql/types-solana';

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
  let record = new Transaction(transaction.transaction.message.recentBlockhash);
  record.blockHash = transaction.transaction.message.recentBlockhash;
  record.slot = transaction.slot;
  record.blockHeight = transaction.blockHeight;
  record.signature = transaction.transaction.signatures[0];
  record.programId = [...new Set(transaction.meta.logMessages.map(log => log.split(' ')[1]))] as string[];
  record.status = Object.keys(transaction.meta.status)[0];
  await record.save();
}
