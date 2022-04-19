import { DuplicateIcon } from '@heroicons/react/outline';
import { ExternalLinkIcon } from '@heroicons/react/solid';
import { useState } from 'react';
import A from '../components/A';
import Modal from '../components/Modal';
import { testTransactions } from '../utils/constants';
import { connect } from '../utils/global-context';
import { formatDate, shortenAddress, shortenHash, toBiggestUnit } from '../utils/strings';
import { State, Transaction } from '../utils/types';

type Props = State & {
	transactions: Transaction[];
};

const TransactionList = ({ transactions, copyWithToast }: Props) => {
	const [txInfoModalTx, txInfoModalTxSet] = useState<typeof testTransactions[9]>();
	return (
		<>
			{transactions.map((tx) => {
				// console.log('tx:', tx);

				return (
					<button
						key={tx.hash}
						className="fx text-sm rounded w-full p-1.5 shadow cursor-pointer bg-skin-middleground brightness-button"
						onClick={() => txInfoModalTxSet(tx)}
					>
						<div className="ml-2 flex-1 flex justify-between">
							<div className="flex flex-col items-start">
								<p className="">
									{
										{
											1: 'Contract creation', // request(create contract)
											2: 'Sent', // request(transfer)
											3: 'Reissue token', // request(re-issue token)
											4: 'Received', // response
											5: 'Failed response', // response(failed)
											6: 'Contract refund', // request(refund by contract)
											7: 'Genesis', // response(genesis)
										}[tx.blockType]
									}
								</p>
								<p className="">
									{toBiggestUnit(tx.amount, tx.tokenInfo.decimals)} {tx.tokenInfo.tokenSymbol}
								</p>
							</div>
							<div className="flex flex-col items-end">
								<p className="">{shortenAddress(tx.address)}</p>
								<p className="text-skin-secondary">{formatDate(tx.timestamp)}</p>
							</div>
						</div>
					</button>
				);
			})}
			<Modal visible={!!txInfoModalTx} onClose={() => txInfoModalTxSet(undefined)}>
				{!!txInfoModalTx && (
					<div className="w-64">
						<p className="text-xl text-center p-2 border-b-2 border-skin-alt">Transaction</p>
						{[
							['Hash', txInfoModalTx.hash, shortenHash(txInfoModalTx.hash)],
							['To', txInfoModalTx.toAddress, shortenAddress(txInfoModalTx.toAddress)],
							['From', txInfoModalTx.fromAddress, shortenAddress(txInfoModalTx.fromAddress)],
							['Height', txInfoModalTx.height],
							['Block type', txInfoModalTx.blockType],
							['Timestamp', txInfoModalTx.timestamp],
						].map(([label, value, displayedValue], i) => {
							return (
								<button
									key={label}
									className="group fx w-full px-2 py-1 bg-skin-middleground brightness-button"
									onClick={() => copyWithToast(value + '')}
								>
									<p className="whitespace-nowrap mr-1">{label}:</p>
									<p className="text-skin-secondary">{displayedValue ? displayedValue : value}</p>
									<DuplicateIcon className="ml-1 w-5 mr-4 text-skin-secondary opacity-0 duration-200 group-hover:opacity-100" />
								</button>
							);
						})}
						<A
							className="px-1 py-2 fx w-full bg-skin-middleground brightness-button"
							// href={`${explorerURL}`}
						>
							<ExternalLinkIcon className="w-6 ml-1 mr-2 text-skin-secondary" />
							<p className="text-left text-skin-secondary">View on ViteScan</p>
						</A>
					</div>
				)}
			</Modal>
		</>
	);
};

export default connect(TransactionList);
