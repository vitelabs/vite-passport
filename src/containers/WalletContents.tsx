import { useMemo, useRef, useState, useEffect } from 'react';
import { connect } from '../utils/global-context';
import { State, TokenApiInfo, TokenInfo } from '../utils/types';
import FetchWidget from './FetchWidget';
import TransactionModal from '../components/TransactionModal';
import { AccountBlockBlock } from '@vite/vitejs/distSrc/utils/type';
import { Transaction } from '@vite/vitejs/distSrc/accountBlock/type';
import { defaultTokenList, getTokenApiInfo } from '../utils/constants';
import { calculatePrice, validateInputs } from '../utils/misc';
import {
	addIndexToTokenSymbol,
	shortenTti,
	toBiggestUnit,
	toQueryString,
	toSmallestUnit,
} from '../utils/strings';
import TextInput, { TextInputRefObject } from '../components/TextInput';
import { accountBlock, constant, wallet } from '@vite/vitejs';
import Checkbox from '../components/Checkbox';
import QR from '../components/QR';
import TransactionList from './TransactionList';
import Modal from '../components/Modal';
import { DuplicateIcon } from '@heroicons/react/outline';
import { _Buffer } from '@vite/vitejs/distSrc/utils';

type Props = State & {};

const WalletContents = ({
	i18n,
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
	const [tokenQuery, tokenQuerySet] = useState('');
	const [displayedTokenDraft, displayedTokenDraftSet] = useState<{
		[key: string]: boolean;
	}>({});
	const [selectedToken, selectedTokenSet] = useState<TokenApiInfo | null>(null);
	const [editingTokenList, editingTokenListSet] = useState(false);
	const [receivingFunds, receivingFundsSet] = useState(false);
	const [sendingFunds, sendingFundsSet] = useState(false);
	const [toAddress, toAddressSet] = useState('');
	const [amount, amountSet] = useState('');
	const [comment, commentSet] = useState('');
	const [confirmingTransaction, confirmingTransactionSet] = useState(false);
	const [sentTx, sentTxSet] = useState<Transaction | null>(null);
	const [displayedTokens, displayedTokensSet] = useState<TokenApiInfo[] | null>(
		null
	);
	const [availableTokens, availableTokensSet] =
		useState<TokenApiInfo[]>(defaultTokenList);
	const balanceInfoMap = useMemo(
		() => viteBalanceInfo?.balance?.balanceInfoMap,
		[viteBalanceInfo]
	);
	const activeAddress = useMemo(() => activeAccount.address, [activeAccount]);

	return (
		<>
			<FetchWidget
				shouldFetch={displayedTokens === null}
				getPromise={() => {
					return getTokenApiInfo(displayedTokenIds);
				}}
				onResolve={(list: TokenApiInfo[]) => {
					displayedTokensSet(list);
				}}
			>
				{displayedTokens === null ? (
					<p className="text-center text-skin-secondary">{i18n.loading}...</p>
				) : (
					<>
						{!displayedTokens.length ? (
							<p className="text-center text-skin-secondary">
								{i18n.yourWalletIsEmpty}
							</p>
						) : (
							displayedTokens.map((tokenApiInfo) => {
								const {
									symbol,
									name,
									tokenAddress: tti,
									tokenIndex,
									icon,
									decimal,
									gatewayInfo,
								} = tokenApiInfo;
								const balance = balanceInfoMap?.[tti]?.balance;
								const biggestUnit = !balanceInfoMap
									? null
									: toBiggestUnit(balance!, decimal);
								return (
									<button
										key={tti}
										className="fx rounded w-full p-1.5 shadow cursor-pointer bg-skin-middleground brightness-button"
										onClick={() => selectedTokenSet(tokenApiInfo)}
									>
										<img
											src={icon}
											alt={symbol}
											className="h-10 w-10 rounded-full mr-2 bg-gradient-to-tr from-skin-alt to-skin-bg-base"
										/>
										<div className="flex-1 flex">
											<div className="flex flex-col flex-1 items-start">
												<p className="text-lg">{symbol}</p>
												{/* <button
										className="text-xs text-skin-muted darker-brightness-button"
										onClick={() => copyWithToast(tti)}
									>
										{shortenTti(tti)}
									</button> */}
												<p className="text-xs text-skin-muted">
													{shortenTti(tti)}
												</p>
											</div>
											<div className="flex flex-col items-end mr-1.5">
												<p className="text-lg">
													{biggestUnit ? '...' : biggestUnit}
												</p>
												<p className="text-xs text-skin-secondary">
													{!biggestUnit
														? '...'
														: calculatePrice(biggestUnit, vitePrice)}
												</p>
											</div>
										</div>
									</button>
								);
							})
						)}
						<button
							className="mx-auto block text-skin-highlight brightness-button"
							onClick={() => {
								const displayedTokenDraft: { [key: string]: boolean } = {};
								displayedTokenIds.forEach((tti) => {
									displayedTokenDraft[tti] = true;
								});
								displayedTokenDraftSet(displayedTokenDraft);
								availableTokensSet(defaultTokenList);
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
				onClose={() => editingTokenListSet(false)}
				className="flex flex-col"
			>
				<input
					placeholder="Search tokens by symbol or tti"
					value={tokenQuery}
					className="p-2 shadow z-10 w-full bg-skin-middleground"
					onChange={(e) => tokenQuerySet(e.target.value)}
				/>
				<div className="flex-1 overflow-scroll">
					{availableTokens.map((tokenApiInfo) => {
						const {
							symbol,
							name,
							tokenAddress: tti,
							tokenIndex,
							icon,
							decimal,
							gatewayInfo,
						} = tokenApiInfo;

						return (
							<div
								key={tti}
								className="fx rounded py-1 px-2 bg-skin-middleground"
							>
								<img
									src={icon}
									alt={addIndexToTokenSymbol(symbol, tokenIndex)}
									className="h-8 w-8 rounded-full mr-2 bg-gradient-to-tr from-skin-alt to-skin-bg-base"
								/>
								<div className="flex-1 fx">
									<div className="flex flex-col flex-1 items-start">
										<p className="text-lg">
											{addIndexToTokenSymbol(symbol, tokenIndex)}
										</p>
										<button
											className="group fx darker-brightness-button"
											onClick={() => copyWithToast(tti)}
										>
											<p className="text-xs text-skin-secondary">
												{shortenTti(tti)}
											</p>
											<DuplicateIcon className="ml-1 w-4 text-skin-secondary opacity-0 duration-200 group-hover:opacity-100" />
										</button>
									</div>
									<Checkbox
										checked={displayedTokenDraft[tti]}
										onUserInput={(checked) => {
											displayedTokenDraft[tti] = checked;
											displayedTokenDraftSet({ ...displayedTokenDraft });
										}}
									/>
								</div>
							</div>
						);
					})}
				</div>
				<div className="flex gap-2 p-2 shadow z-50">
					<button
						className="p-0 round-outline-button"
						onClick={() => editingTokenListSet(false)}
					>
						{i18n.cancel}
					</button>
					<button
						className="p-0 round-solid-button"
						onClick={() => {
							setState({
								displayedTokenIds: Object.entries(displayedTokenDraft)
									.filter(([_, checked]) => checked)
									.map(([tti]) => tti),
							});
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
				onClose={() => selectedTokenSet(null)}
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
								<img
									src={selectedToken.icon}
									alt={selectedToken.symbol}
									className="h-8 w-8 rounded-full mr-2 bg-gradient-to-tr from-skin-alt to-skin-bg-base"
								/>
							</div>
						</>
					)
				}
			>
				<div className="flex-1 p-2 space-y-2 overflow-scroll bg-skin-base">
					{selectedToken && (
						<TransactionList tti={selectedToken.tokenAddress} />
					)}
				</div>
				<div className="fx p-2 gap-2 shadow">
					<button
						className="round-outline-button p-0"
						onClick={() => receivingFundsSet(true)}
					>
						Receive
					</button>
					<button
						className="round-outline-button p-0"
						onClick={() => sendingFundsSet(true)}
					>
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
								// data: _Buffer.from(comment).toString('base64'),
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
							onUserInput={(v) => {
								console.log(v, _Buffer.from(v).toString('base64'));
								commentSet(v);
							}}
						/>
					</div>
				)}
			</Modal>
			<Modal
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
				heading={`${i18n.send} ${selectedToken?.symbol}`}
				subheading={selectedToken?.tokenAddress}
			>
				{!!selectedToken && (
					<div className="flex-1 p-2 space-y-2 overflow-scroll bg-skin-base">
						<div className="">
							<p className="leading-5 text-skin-secondary">{i18n.from}</p>
							<p className="break-words text-sm">{contacts[activeAddress]}</p>
							<p className="break-words text-sm">{activeAddress}</p>
						</div>
						<div className="">
							<p className="leading-5 text-skin-secondary">{i18n.balance}</p>
							<p className="">
								{balanceInfoMap?.[selectedToken.tokenAddress]?.balance &&
									toBiggestUnit(
										balanceInfoMap[selectedToken.tokenAddress]?.balance,
										balanceInfoMap[selectedToken.tokenAddress]?.tokenInfo
											?.decimals
									)}
							</p>
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
								// if (+toBiggestUnit(v, balances[selectedToken].decimals) > +balances[selectedToken].balance) {
								// 	return i18n.insufficientFunds;
								// }
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
								const valid = validateInputs([
									toAddressRef,
									amountRef,
									commentRef,
								]);
								if (valid) {
									confirmingTransactionSet(true);
									setTimeout(() => sendingFundsSet(false), 0);
								}
							}}
						>
							{i18n.next}
						</button>
					</div>
				)}
			</Modal>
			<Modal
				fromRight={sendingFunds}
				visible={confirmingTransaction}
				onStartClose={() => {
					sendingFundsSet(true);
					setTimeout(() => confirmingTransactionSet(false), 0);
				}}
				heading={i18n.confirmTransaction}
			>
				<div className="p-2 space-y-2">
					<div className="">
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
					)}
					<button
						className="round-solid-button"
						onClick={async () => {
							const block = accountBlock.createAccountBlock('send', {
								address: activeAddress,
								toAddress: toAddress.trim(),
								tokenId: selectedToken!.tokenAddress,
								amount: toSmallestUnit(
									amount,
									balanceInfoMap![selectedToken!.tokenAddress]?.tokenInfo
										?.decimals
								),
							});
							block.setProvider(viteApi);
							block.setPrivateKey(activeAccount.privateKey);
							await block.autoSetPreviousAccountBlock();
							block.sign(activeAccount.privateKey);
							const res: Transaction = await block.autoSendByPoW();
							res.fromAddress = activeAddress;
							res.timestamp = '' + Math.round(Date.now() / 1000);
							sentTxSet(res);
						}}
					>
						{i18n.confirm}
					</button>
				</div>
			</Modal>
			<TransactionModal
				visible={!!sentTx}
				fromRight
				heading={i18n.transactionSent}
				onClose={() => {
					sendingFundsSet(false);
					confirmingTransactionSet(false);
					setTimeout(() => sentTxSet(null), 0);
				}}
				transaction={sentTx}
			/>
		</>
	);
};

export default connect(WalletContents);
