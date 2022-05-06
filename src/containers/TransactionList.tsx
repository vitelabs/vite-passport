import { DuplicateIcon } from '@heroicons/react/outline';
import { ExternalLinkIcon } from '@heroicons/react/solid';
import { useMemo, useState } from 'react';
import A from '../components/A';
import Modal from '../components/Modal';
import FetchWidget from '../containers/FetchWidget';
import { connect } from '../utils/global-context';
import { shortenAddress, shortenHash, toBiggestUnit } from '../utils/strings';
import { formatDate } from '../utils/time';
import { State, Transaction } from '../utils/types';

type Props = State & {
	tti?: string;
};

const TransactionList = ({
	viteApi,
	activeAccount,
	setState,
	i18n,
	tti,
	copyWithToast,
	transactionHistory,
}: Props) => {
	const transactions = useMemo(
		() => transactionHistory?.[tti || 'all'],
		[transactionHistory]
	);
	const [txInfoModalTx, txInfoModalTxSet] = useState<Transaction>();

	return (
		<FetchWidget
			shouldFetch={!transactions}
			getPromise={() => {
				return viteApi.getTransactionList(
					{ address: activeAccount.address, pageIndex: 0, pageSize: 10 },
					'all'
				);
			}}
			onResolve={(list: Transaction[]) => {
				setState(
					{ transactionHistory: { [tti || 'all']: list } },
					{ deepMerge: true }
				);
				console.log('list:', list);
			}}
		>
			{!transactions ? null : !transactions.length ? (
				<p className="text-skin-secondary text-center">
					{i18n.noTransactionHistory}
				</p>
			) : (
				transactions.map((tx) => {
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
												1: i18n.contractCreation, // request(create contract)
												2: i18n.sent, // request(transfer)
												3: i18n.reissueToken, // request(re-issue token)
												4: i18n.received, // response
												5: i18n.failedResponse, // response(failed)
												6: i18n.contractRefund, // request(refund by contract)
												7: i18n.genesis, // response(genesis)
											}[tx.blockType]
										}
									</p>
									<p className="">
										{toBiggestUnit(tx.amount, tx.tokenInfo.decimals)}{' '}
										{tx.tokenInfo.tokenSymbol}
									</p>
								</div>
								<div className="flex flex-col items-end">
									<p className="">{shortenAddress(tx.address)}</p>
									<p className="text-skin-secondary">
										{formatDate(tx.timestamp)}
									</p>
								</div>
							</div>
						</button>
					);
				})
			)}
			<Modal
				heading={i18n.transaction}
				visible={!!txInfoModalTx}
				onClose={() => txInfoModalTxSet(undefined)}
			>
				{!!txInfoModalTx && (
					<div className="">
						{[
							['Hash', txInfoModalTx.hash, shortenHash(txInfoModalTx.hash)],
							[
								'To',
								txInfoModalTx.toAddress,
								shortenAddress(txInfoModalTx.toAddress),
							],
							[
								'From',
								txInfoModalTx.fromAddress,
								shortenAddress(txInfoModalTx.fromAddress),
							],
							['Height', txInfoModalTx.height],
							['Block type', txInfoModalTx.blockType],
							['Timestamp', txInfoModalTx.timestamp],
						].map(([label, value, displayedValue]) => {
							return (
								<button
									key={label}
									className="group fx w-full px-2 py-1 bg-skin-middleground brightness-button"
									onClick={() => copyWithToast(value + '')}
								>
									<p className="text-skin-secondary mr-1">{label}:</p>
									<p className="">{displayedValue ? displayedValue : value}</p>
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
		</FetchWidget>
	);
};

export default connect(TransactionList);
