import { DuplicateIcon } from '@heroicons/react/outline';
import { ExternalLinkIcon } from '@heroicons/react/solid';
import { Transaction } from '@vite/vitejs/distSrc/accountBlock/type';
import { AccountBlockBlock } from '@vite/vitejs/distSrc/utils/type';
import { useMemo, useState } from 'react';
import A from '../components/A';
import Modal from '../components/Modal';
import TransactionModal from '../components/TransactionModal';
import FetchWidget from '../containers/FetchWidget';
import { connect } from '../utils/global-context';
import { shortenAddress, shortenHash, toBiggestUnit } from '../utils/strings';
import { formatDate } from '../utils/time';
import { State } from '../utils/types';

type Props = State & {
	tti?: string;
	unreceived?: boolean;
};

const TransactionList = ({
	viteApi,
	activeAccount,
	setState,
	i18n,
	copyWithToast,
	transactionHistory,
	tti,
	unreceived,
}: Props) => {
	const txListKey = useMemo(
		() => (unreceived ? 'unreceived' : tti || 'all'),
		[unreceived, tti]
	);
	const transactions = useMemo(
		() => transactionHistory?.[txListKey],
		[transactionHistory, txListKey]
	);
	const [txInfoModalTx, txInfoModalTxSet] = useState<AccountBlockBlock | null>(
		null
	);

	return (
		<FetchWidget
			shouldFetch={!transactions}
			getPromise={() => {
				if (unreceived) {
					return viteApi.request(
						'ledger_getUnreceivedBlocksByAddress',
						activeAccount.address,
						0,
						20
					);
				} else if (tti) {
					// console.log('tti:', tti);
					return viteApi.request(
						'ledger_getAccountBlocks',
						activeAccount.address,
						null, // last tx hash
						tti,
						20
					);
				}
				return viteApi.getTransactionList(
					{ address: activeAccount.address, pageIndex: 0, pageSize: 10 },
					'all'
				);
			}}
			onResolve={(list: Transaction[]) => {
				// console.log('list:', list);
				setState(
					{
						transactionHistory: {
							[txListKey]: list,
						},
					},
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
										{toBiggestUnit(tx.amount!, +tx.tokenInfo!.decimals)}{' '}
										{tx.tokenInfo!.tokenSymbol}
									</p>
								</div>
								<div className="flex flex-col items-end">
									<p className="">{shortenAddress(tx.address)}</p>
									<p className="text-skin-secondary">
										{formatDate(+tx.timestamp!)}
									</p>
								</div>
							</div>
						</button>
					);
				})
			)}
			<TransactionModal
				transaction={txInfoModalTx}
				onClose={() => txInfoModalTxSet(null)}
			/>
		</FetchWidget>
	);
};

export default connect(TransactionList);
