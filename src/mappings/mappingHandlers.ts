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
  const { transaction: transactionData, meta } : any = transaction;
  let record = new Transaction(transactionData.message.recentBlockhash);
  record.blockHash = transactionData.message.recentBlockhash;
  record.slot = transaction.slot;
  record.blockHeight = transaction.blockHeight;
  record.signature = transactionData.signatures[0] ? transactionData.signatures[0] : null;
  if (meta) {
    record.programId = meta.logMessages
      ? ([
          ...new Set(
            meta.logMessages.map((log) => log.split(" ")[1])
          ),
        ] as string[])
      : null;
    record.status = Object.keys(meta.status).length
      ? Object.keys(meta.status)[0]
      : null;
  }
  await record.save();
}
