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
import TextInput, { useTextInputRef } from './TextInput';
import { accountBlock, wallet } from '@vite/vitejs';
import Checkbox from '../components/Checkbox';
import QR from '../components/QR';
import TransactionList from './TransactionList';
import Modal from '../components/Modal';
import { DocumentDuplicateIcon } from '@heroicons/react/outline';
import { setValue } from '../utils/storage';
import AccountBlockClass from '@vite/vitejs/distSrc/accountBlock/accountBlock';
import DeterministicIcon from '../components/DeterministicIcon';
import { Transaction } from '@vite/vitejs/distSrc/accountBlock/type';
import Button from '../components/Button';
import TokenCard from './TokenCard';

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
	transactionHistory,
}: Props) => {
	const toAddressRef = useTextInputRef();
	const amountRef = useTextInputRef();
	const commentRef = useTextInputRef();
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
		// selectedTokenSet(list[0]);
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
							displayedTokens.map((tokenApiInfo) => (
								<TokenCard
									{...tokenApiInfo}
									key={tokenApiInfo.tokenAddress}
									onClick={() => selectedTokenSet(tokenApiInfo)}
								/>
							))
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
			{editingTokenList && (
				<Modal
					fullscreen
					heading={i18n.editTokenList}
					onClose={() => {
						editingTokenListSet(false);
						tokenQuerySet('');
					}}
					className="flex flex-col"
				>
					<input
						placeholder={i18n.searchTokensBySymbolOrTti}
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
										{i === displayedTokenIds.length && (
											<div className="h-0.5 bg-skin-eye-icon mt-2"></div>
										)}
										<div className="fx rounded-sm py-1 px-2 bg-skin-middleground">
											{!icon ? (
												<DeterministicIcon tti={tti} className="h-8 w-8 rounded-full mr-2" />
											) : (
												<img
													src={icon}
													alt={tokenName}
													className="h-8 w-8 rounded-full mr-2 overflow-hidden bg-gradient-to-tr from-skin-eye-icon to-skin-bg-base"
												/>
											)}
											<div className="flex-1 fx">
												<div className="flex flex-col flex-1 items-start">
													<p className="text-lg">{tokenName}</p>
													<button className="group fx" onClick={() => copyWithToast(tti)}>
														<p className="text-xs text-skin-secondary">{shortenTti(tti)}</p>
														<DocumentDuplicateIcon className="ml-1 w-4 text-skin-secondary opacity-0 duration-200 group-hover:opacity-100" />
													</button>
												</div>
												<Checkbox
													value={checkedTokens[tti]}
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
						<Button theme="white" label={i18n.cancel} onClick={() => editingTokenListSet(false)} />
						<Button
							theme="highlight"
							label={i18n.confirm}
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
						/>
					</div>
				</Modal>
			)}
			{selectedToken && (
				<Modal
					fullscreen
					onClose={() => selectedTokenSet(undefined)}
					className="flex flex-col flex-1"
					heading={addIndexToTokenSymbol(selectedToken.symbol, selectedToken.tokenIndex)}
					subheading={selectedToken.tokenAddress}
				>
					<div className="flex-1">
						<TransactionList tti={selectedToken.tokenAddress} />
					</div>
					<div className="fx p-4 gap-4 shadow">
						<Button theme="white" onClick={() => sendingFundsSet(true)} label={i18n.send} />
						<Button
							theme="highlight"
							onClick={() => receivingFundsSet(true)}
							label={i18n.receive}
						/>
					</div>
				</Modal>
			)}
			{receivingFunds && (
				<Modal
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
							/>
							<TextInput
								optional
								numeric
								_ref={amountRef}
								label="Amount"
								value={amount}
								onUserInput={(v) => amountSet(v)}
							/>
							<TextInput
								optional
								textarea
								_ref={commentRef}
								label="Comment"
								value={comment}
								onUserInput={(v) => commentSet(v)}
							/>
						</div>
					)}
				</Modal>
			)}
			{sendingFunds && (
				<Modal
					fullscreen
					onClose={() => {
						sendingFundsSet(false);
						if (!confirmingTransaction) {
							toAddressSet('');
							amountSet('');
							commentSet('');
						}
					}}
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
							<Button
								theme="highlight"
								label={i18n.next}
								onClick={() => {
									const valid = validateInputs([toAddressRef, amountRef, commentRef]);
									if (valid) {
										confirmingTransactionSet(true);
										// setTimeout(() => sendingFundsSet(false), 0);
									}
								}}
							/>
						</div>
					)}
				</Modal>
			)}
			{confirmingTransaction && (
				<Modal heading={i18n.confirmTransaction} onClose={() => confirmingTransactionSet(false)}>
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
						<Button
							disabled={!!sendingTx}
							theme="highlight"
							label={i18n.signAndSendBlock}
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
									if (transactionHistory?.received) {
										setState(
											{
												transactionHistory: {
													received: [...transactionHistory.received, res as Transaction],
												},
											},
											{ deepMerge: true }
										);
									}
								} catch (e) {
									console.log('error:', e);
									toastError(JSON.stringify(e));
									sendingTxSet(false);
								}
							}}
						/>
					</div>
				</Modal>
			)}
			<TransactionModal
				onClose={() => {
					sendingFundsSet(false);
					confirmingTransactionSet(false);
					setTimeout(() => sentTxSet(undefined), 0);
				}}
				transaction={sentTx || unsentBlock}
			/>
		</>
	);
};

export default connect(WalletContents);
