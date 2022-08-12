import { DownloadIcon, UploadIcon } from '@heroicons/react/outline';
import { DotsCircleHorizontalIcon } from '@heroicons/react/solid';
import { Transaction } from '@vite/vitejs/distSrc/accountBlock/type';
// import { AccountBlockBlock } from '@vite/vitejs/distSrc/utils/type';
import React, { useMemo, useState } from 'react';
import TransactionModal from '../components/TransactionModal';
import FetchWidget from '../containers/FetchWidget';
import { connect } from '../utils/global-context';
import { shortenAddress, toBiggestUnit } from '../utils/strings';
import { formatDate } from '../utils/time';
import { State } from '../utils/types';

type Props = State & {
	tti?: string;
};

const FETCH_AMOUNT = 10;

const TransactionList = ({
	viteApi,
	activeAccount,
	setState,
	i18n,
	transactionHistory,
	viteBalanceInfo,
	tti,
}: Props) => {
	const [txInfoModalTx, txInfoModalTxSet] = useState<undefined | Transaction>();
	const [ttiEndReached, ttiEndReachedSet] = useState(false);
	const transactions = useMemo(() => {
		if (tti) {
			return transactionHistory?.[tti];
		}
		return transactionHistory?.received && transactionHistory?.unreceived
			? [...transactionHistory.received, ...transactionHistory.unreceived]
			: undefined;
	}, [transactionHistory, tti]);
	const allUnreceivedTxsLoaded = useMemo(
		() =>
			ttiEndReached ||
			(viteBalanceInfo &&
				transactionHistory?.unreceived?.length === +viteBalanceInfo?.unreceived?.blockCount),
		[ttiEndReached, transactionHistory, viteBalanceInfo]
	);
	const allReceivedTxsLoaded = useMemo(
		() =>
			ttiEndReached ||
			(viteBalanceInfo &&
				transactionHistory?.received?.length === +viteBalanceInfo?.balance?.blockCount),
		[ttiEndReached, transactionHistory, viteBalanceInfo]
	);

	return (
		<div className="flex-1 overflow-scroll p-4 space-y-4">
			<FetchWidget
				shouldFetch={!transactions && !!viteApi}
				getPromise={() => {
					if (tti) {
						// console.log('tti:', tti);
						return viteApi.request(
							'ledger_getAccountBlocks',
							activeAccount.address,
							null, // last tx hash
							tti,
							FETCH_AMOUNT
						);
					}
					return Promise.all([
						viteApi.request(
							'ledger_getUnreceivedBlocksByAddress',
							activeAccount.address,
							0,
							FETCH_AMOUNT
						),
						viteApi.request(
							'ledger_getAccountBlocksByAddress',
							activeAccount.address,
							0,
							FETCH_AMOUNT
						),
					]);
					// viteApi.getTransactionList(
					// 	{ address: activeAccount.address, pageIndex: 0, pageSize: 10 },
					// 	'all'
					// );
				}}
				onResolve={(data: any) => {
					// console.log('data:', data);
					// @ts-ignore
					// data?.[1]?.[0] && txInfoModalTxSet(data[1][0]);
					setState(
						{
							transactionHistory: tti
								? {
										[tti]: (data as Transaction[]) || [],
								  }
								: {
										unreceived: (data[0] as Transaction[]) || [],
										received: (data[1] as Transaction[]) || [],
								  },
						},
						{ deepMerge: true }
					);
				}}
			>
				{!transactions ? null : !transactions.length ? (
					<p className="text-skin-secondary text-center">{i18n.noTransactionHistory}</p>
				) : (
					transactions.map((tx, i) => {
						const Icon =
							{
								2: UploadIcon,
								4: DownloadIcon,
							}[tx.blockType] || DotsCircleHorizontalIcon;
						return (
							<React.Fragment key={tx.hash}>
								{!!transactionHistory?.unreceived?.length && i === 0 && (
									<p className="leading-3">
										{viteBalanceInfo!.unreceived.blockCount} {i18n.unreceived}
									</p>
								)}
								{i === transactionHistory?.unreceived?.length && (
									<>
										{!allUnreceivedTxsLoaded && (
											<button
												className="mx-auto block text-skin-lowlight font-medium leading-3"
												onClick={async () => {
													const additionalTxs = await viteApi.request(
														'ledger_getUnreceivedBlocksByAddress',
														activeAccount.address,
														Math.ceil(transactionHistory.unreceived!.length / FETCH_AMOUNT),
														FETCH_AMOUNT
													);
													const unreceived = [...transactionHistory.unreceived!, ...additionalTxs];
													setState({ transactionHistory: { unreceived } }, { deepMerge: true });
												}}
											>
												{i18n.loadMore}
											</button>
										)}
										{!!transactionHistory.unreceived?.length && (
											<div className="h-0.5 bg-skin-divider"></div>
										)}
										<p className="leading-3">
											{viteBalanceInfo!.balance.blockCount} {i18n.received}
										</p>
									</>
								)}
								<button
									className="fx text-sm rounded w-full px-3 py-2.5 shadow cursor-pointer bg-skin-middleground brightness-button"
									onClick={() => {
										txInfoModalTxSet(tx);
									}}
								>
									<div className="flex-1 flex justify-between">
										<div className="fx">
											<div className="h-5 w-5 rounded-full xy bg-skin-lowlight">
												<Icon className="text-white w-4" />
											</div>
											<p className="ml-2">
												{toBiggestUnit(tx.amount!, +tx.tokenInfo!.decimals)}{' '}
												{tx.tokenInfo!.tokenSymbol}
											</p>
										</div>
										<div className="flex flex-col items-end font-medium">
											<p className="text-skin-secondary">{shortenAddress(tx.address)}</p>
											<p className="text-skin-tertiary">{formatDate(+tx.timestamp!)}</p>
										</div>
									</div>
								</button>
								{!allReceivedTxsLoaded && i === transactions.length - 1 && (
									<button
										className="mx-auto block text-skin-lowlight font-medium leading-3"
										onClick={async () => {
											if (tti) {
												const currentList = transactionHistory?.[tti];
												if (!currentList) return;
												const additionalTxs = (
													await viteApi.request(
														'ledger_getAccountBlocks',
														activeAccount.address,
														currentList[currentList.length - 1].hash,
														tti,
														FETCH_AMOUNT + 1
													)
												).slice(1);
												const list = [...currentList, ...additionalTxs];
												console.log('additionalTxs:', additionalTxs);
												if (additionalTxs.length === 0) {
													// OPTIMIZE: save this globally so it doesn't reset on component mount
													ttiEndReachedSet(true);
												}
												return setState(
													{ transactionHistory: { [tti]: list } },
													{ deepMerge: true }
												);
											}
											const currentList = transactionHistory?.received;
											if (!currentList) return;
											const received = [
												...currentList,
												...(await viteApi.request(
													'ledger_getAccountBlocksByAddress',
													activeAccount.address,
													Math.ceil(currentList.length / FETCH_AMOUNT),
													FETCH_AMOUNT
												)),
											];
											setState({ transactionHistory: { received } }, { deepMerge: true });
										}}
									>
										{i18n.loadMore}
									</button>
								)}
							</React.Fragment>
						);
					})
				)}
				<TransactionModal transaction={txInfoModalTx} onClose={() => txInfoModalTxSet(undefined)} />
			</FetchWidget>
		</div>
	);
};

export default connect(TransactionList);
