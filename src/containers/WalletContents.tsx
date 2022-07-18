import React, { useMemo, useRef, useState, useCallback } from 'react';
import { connect } from '../utils/global-context';
import { State, TokenApiInfo } from '../utils/types';
import FetchWidget from './FetchWidget';
import TransactionModal from '../components/TransactionModal';
import { AccountBlockBlock } from '@vite/vitejs/distSrc/utils/type';
// import { Transaction } from '@vite/vitejs/distSrc/accountBlock/type';
import { defaultTokenList } from '../utils/constants';
import { getTokenApiInfo } from '../utils/misc';
import { calculatePrice, debounce, validateInputs } from '../utils/misc';
import {
	addIndexToTokenSymbol,
	shortenTti,
	toBiggestUnit,
	toQueryString,
	toSmallestUnit,
} from '../utils/strings';
import TextInput, { TextInputRefObject } from './TextInput';
import { accountBlock, wallet } from '@vite/vitejs';
import Checkbox from '../components/Checkbox';
import QR from '../components/QR';
import TransactionList from './TransactionList';
import Modal from '../components/Modal';
import { DuplicateIcon } from '@heroicons/react/outline';
import { setValue } from '../utils/storage';
import AccountBlockClass from '@vite/vitejs/distSrc/accountBlock/accountBlock';
import DeterministicIcon from '../components/DeterministicIcon';
import TransactionInfo from './TransactionInfo';

const searchTokenApiInfo = debounce((query: string, callback: (list: TokenApiInfo[]) => void) => {
	return fetch(`https://vitex.vite.net/api/v1/cryptocurrency/info/search?fuzzy=${query}`)
		.then((res) => res.json())
		.then((data: { data: { VITE: TokenApiInfo[] } }) => {
			// console.log('data:', data);
			callback(data?.data?.VITE || []);
		});
}, 300);

type Props = State;

const WalletContents = ({
	i18n,
	toastError,
	viteBalanceInfo,
	displayedTokenIds,
	viteApi,
	vitePrice,
	copyWithToast,
	activeAccount,
	contacts,
	setState,
}: Props) => {
	const toAddressRef = useRef<TextInputRefObject>();
	const amountRef = useRef<TextInputRefObject>();
	const commentRef = useRef<TextInputRefObject>();
	const [sendingTx, sendingTxSet] = useState(false);
	const [tokenQuery, tokenQuerySet] = useState('');
	const [checkedTokens, checkedTokensSet] = useState<{
		[tti: string]: boolean;
	}>({});
	const [selectedToken, selectedTokenSet] = useState<undefined | TokenApiInfo>();
	const [editingTokenList, editingTokenListSet] = useState(false);
	const [receivingFunds, receivingFundsSet] = useState(false);
	const [sendingFunds, sendingFundsSet] = useState(false);
	// const [toAddress, toAddressSet] = useState('');
	const [toAddress, toAddressSet] = useState(
		'vite_f30697191707a723c70d0652ab80304195e5928dcf71fcab99'
	);
	// const [amount, amountSet] = useState('');
	const [amount, amountSet] = useState('0.002');
	// const [comment, commentSet] = useState('');
	const [comment, commentSet] = useState('test');
	const [confirmingTransaction, confirmingTransactionSet] = useState(false);
	const [sentTx, sentTxSet] = useState<undefined | AccountBlockBlock>();
	const [displayedTokens, displayedTokensSet] = useState<undefined | TokenApiInfo[]>();
	const [availableTokens, availableTokensSet] = useState<undefined | TokenApiInfo[]>();
	const balanceInfoMap = useMemo(
		() => (viteBalanceInfo ? viteBalanceInfo?.balance?.balanceInfoMap || {} : undefined),
		[viteBalanceInfo]
	);
	const selectedTokenBalance = useMemo(() => {
		return !selectedToken
			? null
			: balanceInfoMap?.[selectedToken.tokenAddress]?.balance
			? toBiggestUnit(
					balanceInfoMap[selectedToken.tokenAddress]?.balance,
					balanceInfoMap[selectedToken.tokenAddress]?.tokenInfo?.decimals
			  )
			: '0';
	}, [balanceInfoMap, selectedToken]);
	const activeAddress = useMemo(() => activeAccount.address, [activeAccount]);
	const getPromise = useCallback(() => {
		return getTokenApiInfo(displayedTokenIds);
	}, [displayedTokenIds]);
	const onResolve = useCallback((list: TokenApiInfo[]) => {
		displayedTokensSet(
			list.sort((a, b) =>
				a.symbol === 'VITE' ? -1 : b.symbol === 'VITE' ? 1 : a.symbol < b.symbol ? -1 : 1
			)
		);
	}, []);

	const unsentBlock = useMemo<AccountBlockClass>(() => {
		if (confirmingTransaction && balanceInfoMap && selectedToken) {
			return accountBlock.createAccountBlock('send', {
				address: activeAddress,
				toAddress: toAddress.trim(),
				tokenId: selectedToken.tokenAddress,
				amount: toSmallestUnit(
					amount,
					balanceInfoMap![selectedToken.tokenAddress]?.tokenInfo?.decimals
				),
				data: btoa(comment),
			});
		}
	}, [
		confirmingTransaction,
		activeAddress,
		amount,
		balanceInfoMap,
		selectedToken,
		toAddress,
		comment,
	]);

	return (
		<>
			<FetchWidget
				shouldFetch={
					!displayedTokens ||
					displayedTokens.length !== displayedTokenIds.length ||
					!displayedTokens.every((token) => displayedTokenIds.includes(token.tokenAddress)) // used `includes` instead of just checking index cuz getTokenApiInfo API doesn't return token info in order of displayedTokenIds
				}
				getPromise={getPromise}
				onResolve={onResolve}
			>
				{!displayedTokens ? (
					<p className="text-center text-skin-secondary">{i18n.loading}...</p>
				) : (
					<>
						{!displayedTokens.length ? (
							<p className="text-center text-skin-secondary">{i18n.yourWalletIsEmpty}</p>
						) : (
							displayedTokens.map((tokenApiInfo) => {
								const {
									symbol,
									// name,
									tokenAddress: tti,
									tokenIndex,
									icon,
									decimal,
									// gatewayInfo,
								} = tokenApiInfo;
								const balance = balanceInfoMap?.[tti]?.balance || '0';
								const biggestUnit = !balanceInfoMap ? null : toBiggestUnit(balance, decimal);
								return (
									<button
										key={tti}
										className="fx rounded w-full p-1.5 shadow cursor-pointer bg-skin-middleground brightness-button"
										onClick={() => selectedTokenSet(tokenApiInfo)}
									>
										{!icon ? (
											<DeterministicIcon tti={tti} className="h-10 w-10 rounded-full mr-2" />
										) : (
											<img
												src={icon}
												alt={addIndexToTokenSymbol(symbol, tokenIndex)}
												className="h-10 w-10 rounded-full mr-2 bg-gradient-to-tr from-skin-alt to-skin-bg-base"
											/>
										)}
										<div className="flex-1 flex">
											<div className="flex flex-col flex-1 items-start">
												<p className="text-lg">{addIndexToTokenSymbol(symbol, tokenIndex)}</p>
												<p className="text-xs text-skin-muted">{shortenTti(tti)}</p>
											</div>
											<div className="flex flex-col items-end mr-1.5">
												<p className="text-lg">{biggestUnit === null ? '...' : biggestUnit}</p>
												<p className="text-xs text-skin-secondary">
													{!vitePrice || biggestUnit === null
														? '...'
														: calculatePrice(biggestUnit!, vitePrice)}
												</p>
											</div>
										</div>
									</button>
								);
							})
						)}
						<button
							className="mx-auto block text-skin-highlight brightness-button leading-3"
							onClick={() => {
								const checkedTokens: { [tti: string]: boolean } = {};
								displayedTokenIds.forEach((tti) => {
									checkedTokens[tti] = true;
								});
								checkedTokensSet(checkedTokens);
								availableTokensSet([
									...displayedTokens!,
									...defaultTokenList.filter(({ tokenAddress }) => !checkedTokens[tokenAddress]),
								]);
								editingTokenListSet(true);
							}}
						>
							{i18n.editTokenList}
						</button>
					</>
				)}
			</FetchWidget>
			<Modal
				fullscreen
				heading={i18n.editTokenList}
				visible={editingTokenList}
				onClose={() => {
					editingTokenListSet(false);
					tokenQuerySet('');
				}}
				className="flex flex-col"
			>
				<input
					placeholder="Search tokens by symbol or tti"
					value={tokenQuery}
					className="p-2 shadow z-10 w-full bg-skin-middleground"
					onChange={(e) => {
						tokenQuerySet(e.target.value);
						if (availableTokens !== null) {
							availableTokensSet(undefined);
						}
						if (!e.target.value) {
							availableTokensSet([
								...displayedTokens!,
								...defaultTokenList.filter(({ tokenAddress }) => !checkedTokens[tokenAddress]),
							]);
							return;
						}
						searchTokenApiInfo(e.target.value, (list: TokenApiInfo[]) => {
							// console.log('list:', list);
							availableTokensSet(list);
						});
					}}
				/>
				<div className="flex-1 overflow-scroll">
					{!availableTokens ? (
						<div className="xy min-h-8">
							<p className="text-skin-secondary text-center">{i18n.loading}...</p>
						</div>
					) : !availableTokens.length ? (
						<div className="xy min-h-8">
							<p className="text-skin-secondary text-center">{i18n.nothingFound}</p>
						</div>
					) : (
						availableTokens.map((tokenApiInfo, i) => {
							const {
								symbol,
								// name,
								tokenAddress: tti,
								tokenIndex,
								icon,
								// decimal,
								// gatewayInfo,
							} = tokenApiInfo;
							// newlyAddedTokens
							const tokenName = addIndexToTokenSymbol(symbol, tokenIndex);
							return (
								<React.Fragment key={tti}>
									{i === displayedTokenIds.length && <div className="h-0.5 bg-skin-alt mt-2"></div>}
									<div className="fx rounded py-1 px-2 bg-skin-middleground">
										{!icon ? (
											<DeterministicIcon tti={tti} className="h-8 w-8 rounded-full mr-2" />
										) : (
											<img
												src={icon}
												alt={tokenName}
												className="h-8 w-8 rounded-full mr-2 overflow-hidden bg-gradient-to-tr from-skin-alt to-skin-bg-base"
											/>
										)}
										<div className="flex-1 fx">
											<div className="flex flex-col flex-1 items-start">
												<p className="text-lg">{tokenName}</p>
												<button
													className="group fx darker-brightness-button"
													onClick={() => copyWithToast(tti)}
												>
													<p className="text-xs text-skin-secondary">{shortenTti(tti)}</p>
													<DuplicateIcon className="ml-1 w-4 text-skin-secondary opacity-0 duration-200 group-hover:opacity-100" />
												</button>
											</div>
											<Checkbox
												checked={checkedTokens[tti]}
												onUserInput={(checked) => {
													checkedTokens[tti] = checked;
													checkedTokensSet({ ...checkedTokens });
												}}
											/>
										</div>
									</div>
								</React.Fragment>
							);
						})
					)}
				</div>
				<div className="flex gap-2 p-2 shadow z-50">
					<button className="p-0 round-outline-button" onClick={() => editingTokenListSet(false)}>
						{i18n.cancel}
					</button>
					<button
						className="p-0 round-solid-button"
						onClick={() => {
							const data = {
								displayedTokenIds: Object.entries(checkedTokens)
									.filter(([, checked]) => checked)
									.map(([tti]) => tti),
							};
							setState(data);
							setValue(data);
							editingTokenListSet(false);
						}}
					>
						{i18n.confirm}
					</button>
				</div>
			</Modal>
			<Modal
				fullscreen
				visible={!!selectedToken}
				onClose={() => selectedTokenSet(undefined)}
				className="flex flex-col"
				headerComponent={
					selectedToken && (
						<>
							<div className="flex-1 fy">
								<p className="text-xl leading-4 mt-1">{selectedToken.symbol}</p>
								<button
									className="group fx darker-brightness-button"
									onClick={() => copyWithToast(selectedToken.tokenAddress)}
								>
									<p className="ml-5 leading-3 text-xs text-skin-secondary">
										{shortenTti(selectedToken.tokenAddress)}
									</p>
									<DuplicateIcon className="ml-1 w-4 text-skin-secondary opacity-0 duration-200 group-hover:opacity-100" />
								</button>
							</div>
							<div className="w-10 p-1">
								{!selectedToken.icon ? (
									<DeterministicIcon
										tti={selectedToken.tokenAddress}
										className="h-8 w-8 rounded-full mr-2"
									/>
								) : (
									<img
										src={selectedToken.icon}
										alt={selectedToken.symbol}
										className="h-8 w-8 rounded-full mr-2 overflow-hidden bg-gradient-to-tr from-skin-alt to-skin-bg-base"
									/>
								)}
							</div>
						</>
					)
				}
			>
				<div className="flex-1 p-2 space-y-2 overflow-scroll bg-skin-base">
					{selectedToken && <TransactionList tti={selectedToken.tokenAddress} />}
				</div>
				<div className="fx p-2 gap-2 shadow">
					<button className="round-outline-button p-0" onClick={() => receivingFundsSet(true)}>
						Receive
					</button>
					<button className="round-outline-button p-0" onClick={() => sendingFundsSet(true)}>
						{i18n.send}
					</button>
				</div>
			</Modal>
			<Modal
				visible={receivingFunds}
				onClose={() => receivingFundsSet(false)}
				className="flex flex-col"
				heading={`${i18n.receive} ${selectedToken?.symbol}`}
				subheading={selectedToken?.tokenAddress}
			>
				{!!selectedToken && (
					<div className="flex-1 p-2 space-y-2 overflow-scroll bg-skin-base">
						{/* https://docs.vite.org/vite-docs/vep/vep-6.html */}
						<QR
							data={`vite:${activeAddress}${toQueryString({
								amount,
								tti: selectedToken.tokenAddress,
								data: btoa(comment).replace(/=+$/, ''),
							})}`}
							className="h-40 w-40 mx-auto"
						/>
						<TextInput
							optional
							numeric
							label="Amount"
							value={amount}
							onUserInput={(v) => amountSet(v)}
						/>
						<TextInput
							optional
							textarea
							label="Comment"
							value={comment}
							onUserInput={(v) => commentSet(v)}
						/>
					</div>
				)}
			</Modal>
			<Modal
				fullscreen
				visible={sendingFunds}
				onClose={() => {
					sendingFundsSet(false);
					if (!confirmingTransaction) {
						toAddressSet('');
						amountSet('');
						commentSet('');
					}
				}}
				fromLeft={confirmingTransaction}
				className="flex flex-col"
				heading={
					!selectedToken
						? ''
						: `${i18n.send} ${addIndexToTokenSymbol(
								selectedToken!.symbol,
								selectedToken!.tokenIndex
						  )}`
				}
				// subheading={selectedToken?.tokenAddress}
			>
				{!!selectedToken && (
					<div className="flex-1 p-4 space-y-2 overflow-scroll bg-skin-base">
						<div className="">
							<p className="leading-5 text-skin-secondary">{i18n.from}</p>
							<p className="break-words text-sm">{contacts[activeAddress]}</p>
							<p className="break-words text-sm">{activeAddress}</p>
						</div>
						<div className="">
							<p className="leading-5 text-skin-secondary">{i18n.balance}</p>
							<p className="">{selectedTokenBalance}</p>
						</div>
						{/* <div className="">
						<p className="leading-5 text-skin-secondary">
							{i18n.quotaAvailable} / {i18n.quotaLimit}
						</p>
						<p className="">
							{10} / {10} Quota
						</p>
					</div> */}
						<TextInput
							_ref={toAddressRef}
							label="To Address"
							value={toAddress}
							onUserInput={(v) => toAddressSet(v)}
							getIssue={(v) => {
								if (!wallet.isValidAddress(v)) {
									return i18n.invalidAddress;
								}
							}}
						/>
						<TextInput
							numeric
							_ref={amountRef}
							label="Amount"
							value={amount}
							onUserInput={(v) => amountSet(v)}
							getIssue={(v) => {
								console.log('v:', v);
								if (+v > +selectedTokenBalance!) {
									return i18n.insufficientFunds;
								}
							}}
						/>
						<TextInput
							optional
							textarea
							_ref={commentRef}
							label="Comment"
							value={comment}
							onUserInput={(v) => commentSet(v)}
						/>
						<button
							className="round-solid-button"
							onClick={() => {
								const valid = validateInputs([toAddressRef, amountRef, commentRef]);
								if (valid) {
									confirmingTransactionSet(true);
									// setTimeout(() => sendingFundsSet(false), 0);
								}
							}}
						>
							{i18n.next}
						</button>
					</div>
				)}
			</Modal>
			<Modal
				heading={i18n.confirmTransaction}
				visible={confirmingTransaction}
				onStartClose={() => {
					confirmingTransactionSet(false);
				}}
			>
				<div className="p-2 space-y-2">
					{/* <div className="">
						<p className="leading-5 text-skin-secondary">{i18n.toAddress}</p>
						<p className="break-words text-sm">{toAddress}</p>
					</div>
					<div className="">
						<p className="leading-5 text-skin-secondary">{i18n.amount}</p>
						<p className="">{amount}</p>
					</div>
					{comment && (
						<div className="">
							<p className="leading-5 text-skin-secondary">{i18n.comment}</p>
							<p className="">{comment}</p>
						</div>
					)} */}
					{unsentBlock && <TransactionInfo {...unsentBlock} />}
					<button
						disabled={sendingTx}
						className="round-solid-button"
						onClick={async () => {
							try {
								sendingTxSet(true);
								// await vitePassport.writeAccountBlock('send', {
								// address: 'vite_2daedeee8d0a41085dee136e36052f48d8e6122b9fec075639',
								// toAddress: 'vite_f30697191707a723c70d0652ab80304195e5928dcf71fcab99',
								// tokenId: 'tti_5649544520544f4b454e6e40',
								// amount: 1 + '0'.repeat(17), // 0.1 VITE
								// });
								unsentBlock.setProvider(viteApi);
								unsentBlock.setPrivateKey(activeAccount.privateKey);
								await unsentBlock.autoSetPreviousAccountBlock();
								unsentBlock.sign(activeAccount.privateKey);
								const res: AccountBlockBlock = await unsentBlock.autoSendByPoW();
								sentTxSet(res);
							} catch (e) {
								console.log('error:', e);
								toastError(JSON.stringify(e));
								sendingTxSet(false);
							}
						}}
					>
						{i18n.signAndSendBlock}
					</button>
				</div>
			</Modal>
			<TransactionModal
				heading={i18n.transactionSent}
				onClose={() => {
					sendingFundsSet(false);
					confirmingTransactionSet(false);
					setTimeout(() => sentTxSet(undefined), 0);
				}}
				transaction={sentTx}
			/>
		</>
	);
};

export default connect(WalletContents);
