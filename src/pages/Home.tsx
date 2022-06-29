/* eslint-disable */

import {
	CreditCardIcon,
	DuplicateIcon,
	PencilIcon,
	LockClosedIcon,
	SortAscendingIcon,
	XIcon,
} from '@heroicons/react/outline';
import { accountBlock, constant, wallet } from '@vite/vitejs';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Checkbox from '../components/Checkbox';
import Modal from '../components/Modal';
import QR from '../components/QR';
import ModalListItem from '../components/ModalListItem';
import TabContainer from '../components/TabContainer';
import TextInput, { TextInputRefObject } from '../components/TextInput';
import TransactionList from '../containers/TransactionList';
import { connect } from '../utils/global-context';
import { calculatePrice, validateInputs } from '../utils/misc';
import {
	getTokenImage,
	shortenAddress,
	shortenTti,
	toBiggestUnit,
	toQueryString,
	toSmallestUnit,
	validateHttpUrl,
	validateWsUrl,
} from '../utils/strings';
import { State, TokenInfo } from '../utils/types';
import ModalListBottomButton from '../components/ModalListBottomButton';
import { setValue } from '../utils/storage';
import { _Buffer } from '@vite/vitejs/distSrc/utils';
import TransactionModal from '../components/TransactionModal';
import { AccountBlockBlock } from '@vite/vitejs/distSrc/utils/type';
import { Transaction } from '@vite/vitejs/distSrc/accountBlock/type';

type Props = State;

// constant.Contracts.StakeForQuota_V1
// constant.Contracts.StakeForQuota

const Home = ({
	i18n,
	setState,
	viteBalanceInfo,
	secrets,
	activeAccountIndex,
	activeAccount,
	copyWithToast,
	networks,
	networkUrl,
	accountList,
	contacts,
	viteApi,
	toastSuccess,
	vitePrice,
}: Props) => {
	const quotaBeneficiaryRef = useRef<TextInputRefObject>();
	const lockedAmountRef = useRef<TextInputRefObject>();
	const networkNameRef = useRef<TextInputRefObject>();
	const rpcUrlRef = useRef<TextInputRefObject>();
	const blockExplorerUrlRef = useRef<TextInputRefObject>();
	const toAddressRef = useRef<TextInputRefObject>();
	const amountRef = useRef<TextInputRefObject>();
	const commentRef = useRef<TextInputRefObject>();
	const [pickingNetwork, pickingNetworkSet] = useState(false);
	const [addingNetwork, addingNetworkSet] = useState(false);
	const [changingActiveAccount, changingActiveAccountSet] = useState(false);
	const [editingAccountName, editingAccountNameSet] = useState(false);
	const [accountName, accountNameSet] = useState(
		contacts[activeAccount.address] || `${i18n.account} ${activeAccountIndex}`
	);
	const [networkName, networkNameSet] = useState('');
	const [rpcUrl, rpcUrlSet] = useState('');
	// const [votingModalOpen, votingModalOpenSet] = useState(false);
	// const [quotaModalOpen, quotaModalOpenSet] = useState(false);
	const [editingTokenList, editingTokenListSet] = useState(false);
	const [tokenQuery, tokenQuerySet] = useState('');
	const [blockExplorerUrl, blockExplorerUrlSet] = useState('');
	const [displayedTokenDraft, displayedTokenDraftSet] = useState<{
		[key: string]: boolean;
	}>({});
	const [tokenOrderDraft, tokenOrderDraftSet] = useState<string[]>([]);
	const [selectedTokenInfo, selectedTokenInfoSet] = useState<TokenInfo | null>(
		null
	);
	const [receivingFunds, receivingFundsSet] = useState(false);
	const [sendingFunds, sendingFundsSet] = useState(false);
	const [toAddress, toAddressSet] = useState('');
	const [amount, amountSet] = useState('');
	const [comment, commentSet] = useState('');
	const [confirmingTransaction, confirmingTransactionSet] = useState(false);
	const [sentTx, sentTxSet] = useState<Transaction | null>(null);
	// const [quotaBeneficiary, quotaBeneficiarySet] = useState('');
	// const [lockedAmount, lockedAmountSet] = useState('');

	useEffect(() => {
		// if (changingActiveAccount)
		// TODO: get derivedAccounts elegantly somehow - this is a slow function that freezes the UI
	}, [changingActiveAccount]);

	const activeAddress = useMemo(() => {
		accountNameSet(
			contacts[activeAccount.address] || `${i18n.account} ${activeAccountIndex}`
		);
		return activeAccount?.address || '';
	}, [activeAccount]);

	const saveAccountName = useCallback(() => {
		accountNameSet(accountName);
		const data = {
			contacts: { ...contacts, [activeAddress]: accountName },
		};
		setValue(data);
		setState(data);
	}, []);
	const balanceInfoMap = useMemo(
		() => viteBalanceInfo?.balance?.balanceInfoMap,
		[viteBalanceInfo]
	);
	const assets = useMemo(() => {
		if (viteBalanceInfo) {
			return Object.values(balanceInfoMap || {});
		}
		return null;
	}, [viteBalanceInfo]);

	return (
		<TabContainer>
			<div className="bg-skin-middleground shadow-md z-10 p-2">
				<div className="fx justify-between">
					<button
						className="border-2 px-2 rounded-full border-skin-alt text-sm bg-skin-middleground text-skin-secondary hover:shadow-md active:shadow brightness-button"
						onClick={() => pickingNetworkSet(true)}
					>
						{networks[networkUrl]}
					</button>
					<button
						className="p-1 -mt-1 -mr-1 text-skin-secondary darker-brightness-button"
						onClick={() => changingActiveAccountSet(true)}
					>
						<CreditCardIcon className="w-6 text-inherit" />
					</button>
				</div>
				<div className="fy xy">
					{editingAccountName ? (
						<form
							className="w-full"
							onSubmit={(e) => {
								e.preventDefault();
								saveAccountName();
							}}
						>
							<input
								autoFocus
								className="text-xl text-center px-2 w-full bg-skin-base rounded"
								value={accountName}
								placeholder={accountName}
								onChange={(e) => accountNameSet(e.target.value)}
								onBlur={() => {
									// TODO: set account name
									editingAccountNameSet(false);
									saveAccountName();
								}}
								onKeyDown={(e) => {
									if (e.key === 'Escape') {
										editingAccountNameSet(false);
										accountNameSet(contacts[activeAccount.address]);
									}
								}}
							/>
						</form>
					) : (
						<button
							className="group ml-[1.625rem] fx darker-brightness-button"
							onClick={() => editingAccountNameSet(true)}
						>
							<p className="text-xl">{accountName}</p>
							<PencilIcon className="ml-1.5 w-5 opacity-0 duration-200 group-hover:opacity-100" />
						</button>
					)}
					<button
						className="ml-6 group fx darker-brightness-button"
						onClick={() => copyWithToast(activeAddress)}
					>
						<p className="text-skin-secondary">
							{shortenAddress(activeAddress)}
						</p>
						<DuplicateIcon className="ml-1 w-5 text-skin-secondary opacity-0 duration-200 group-hover:opacity-100" />
					</button>
				</div>
			</div>
			<div className="flex-1 p-2 space-y-2 overflow-scroll">
				{/* <div className="flex gap-2 h-10">
					<button
						className="bg-skin-middleground xy flex-1 rounded brightness-button gap-1.5"
						onClick={() => votingModalOpenSet(true)}
					>
						<SortAscendingIcon className="w-4" />
						<p>{i18n.voting}</p>
					</button>
					<button
						className="bg-skin-middleground xy flex-1 rounded brightness-button gap-1.5"
						onClick={() => quotaModalOpenSet(true)}
					>
						<LockClosedIcon className="w-4" />
						<p>{i18n.quota}</p>
					</button>
				</div> */}

				{assets === null ? (
					<p className="text-center text-skin-secondary">{i18n.loading}...</p>
				) : (
					<>
						{!assets.length ? (
							<p className="text-center text-skin-secondary">
								{i18n.yourWalletIsEmpty}
							</p>
						) : (
							assets.map(({ balance, tokenInfo }) => {
								const biggestUnit = toBiggestUnit(balance, tokenInfo.decimals);
								return (
									<button
										key={tokenInfo.tokenId}
										className="fx rounded w-full p-1.5 shadow cursor-pointer bg-skin-middleground brightness-button"
										onClick={() => selectedTokenInfoSet(tokenInfo)}
									>
										<img
											src={getTokenImage(
												tokenInfo.tokenSymbol,
												tokenInfo.tokenId
											)}
											alt={tokenInfo.tokenSymbol}
											className="h-10 w-10 rounded-full mr-2 bg-gradient-to-tr from-skin-alt to-skin-bg-base"
										/>
										<div className="flex-1 flex">
											<div className="flex flex-col flex-1 items-start">
												<p className="text-lg">{tokenInfo.tokenSymbol}</p>
												{/* <button
										className="text-xs text-skin-muted darker-brightness-button"
										onClick={() => copyWithToast(tokenInfo.tokenId)}
									>
										{shortenTti(tokenInfo.tokenId)}
									</button> */}
												<p className="text-xs text-skin-muted">
													{shortenTti(tokenInfo.tokenId)}
												</p>
											</div>
											<div className="flex flex-col items-end mr-1.5">
												<p className="text-lg">{biggestUnit}</p>
												<p className="text-xs text-skin-secondary">
													{calculatePrice(biggestUnit, vitePrice)}
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
								editingTokenListSet(true);
								const displayedTokenDraft: { [key: string]: boolean } = {};
								const tokenOrderDraft: string[] = [];
								// assets.forEach(({ tti }) => {
								// 	displayedTokenDraft[tti] = true;
								// 	tokenOrderDraft.push(tti);
								// });
								displayedTokenDraftSet(displayedTokenDraft);
								tokenOrderDraftSet(tokenOrderDraft);
							}}
						>
							{i18n.editTokenList}
						</button>
					</>
				)}
			</div>
			{/* <Modal
				visible={votingModalOpen}
				onClose={() => votingModalOpenSet(false)}
				heading={i18n.voting}
			>
				test
			</Modal>
			<Modal
				visible={quotaModalOpen}
				onClose={() => quotaModalOpenSet(false)}
				heading={i18n.quota}
			>
				<TextInput
					_ref={quotaBeneficiaryRef}
					label={i18n.quotaBeneficiary}
					value={quotaBeneficiary}
					onUserInput={(v) => quotaBeneficiarySet(v)}
				/>
				<TextInput
					_ref={lockedAmountRef}
					label={i18n.lockedAmount}
					value={lockedAmount}
					onUserInput={(v) => lockedAmountSet(v)}
				/>
			</Modal> */}
			<Modal
				visible={pickingNetwork}
				fromLeft={addingNetwork}
				onClose={() => pickingNetworkSet(false)}
				heading={i18n.networks}
			>
				{Object.entries(networks).map(([url, label]) => {
					const active = networkUrl === url;
					return (
						<ModalListItem
							radio
							key={url}
							active={active}
							label={label}
							sublabel={url}
							onClick={() => {
								if (!active) {
									toastSuccess(i18n.networkChanged);
									setState({ networkUrl: url, viteBalanceInfo: undefined });
									setValue({ networkUrl: url });
								}
								pickingNetworkSet(false);
							}}
						/>
					);
				})}
				<ModalListBottomButton
					label={i18n.addNetwork}
					onClick={() => {
						pickingNetworkSet(false);
						addingNetworkSet(true);
					}}
				/>
			</Modal>
			<Modal
				fromRight
				heading={i18n.addNetwork}
				visible={addingNetwork}
				onStartClose={() => {
					pickingNetworkSet(true);
					setTimeout(() => addingNetworkSet(false), 0);
				}}
				onClose={() => {
					networkNameSet('');
					rpcUrlSet('');
					blockExplorerUrlSet('');
				}}
			>
				{(close) => (
					<div className="space-y-3 p-3">
						<TextInput
							_ref={networkNameRef}
							label={i18n.networkName}
							value={networkName}
							onUserInput={(v) => networkNameSet(v)}
						/>
						<TextInput
							_ref={rpcUrlRef}
							label={i18n.rpcUrl}
							value={rpcUrl}
							onUserInput={(v) => rpcUrlSet(v)}
							getIssue={(v) => {
								if (!validateWsUrl(v) || !validateHttpUrl(v)) {
									// return i18n.urlMustStartWithWsWssHttpOrHttps;
								}
							}}
						/>
						<TextInput
							optional
							_ref={blockExplorerUrlRef}
							label={i18n.blockExplorerUrl}
							value={blockExplorerUrl}
							onUserInput={(v) => blockExplorerUrlSet(v)}
							getIssue={(v) => {
								// console.log(v, validateHttpUrl(v));
								if (!validateHttpUrl(v)) {
									return i18n.urlMustStartWithHttpOrHttps;
								}
							}}
						/>
						<button
							className="round-solid-button p-1"
							onClick={() => {
								const valid = validateInputs([
									networkNameRef,
									rpcUrlRef,
									blockExplorerUrlRef,
								]);
								if (valid) {
									const newNetworks = {
										...networks,
										[rpcUrl]: networkName,
									};
									setState({ networks: newNetworks });
									setValue({ networks: newNetworks });
									close();
								}
							}}
						>
							Add
						</button>
					</div>
				)}
			</Modal>
			<Modal
				heading={i18n.accounts}
				visible={changingActiveAccount}
				onClose={() => changingActiveAccountSet(false)}
			>
				{accountList.map(({ address }, i) => {
					const active = i === activeAccountIndex;
					return (
						<div key={address} className="flex items-center">
							<ModalListItem
								radio
								active={active}
								className="flex-1"
								label={contacts[address] || `${i18n.account} ${i}`}
								sublabel={shortenAddress(address)}
								// rightJSX={
								// 	// not that useful a feature for the technical overhead it creates.
								// 	false && (
								// 		<div className="self-start border-2 border-skin-alt px-1 text-skin-muted rounded-full text-xs">
								// 			{i18n.new}
								// 		</div>
								// 	)
								// }
								onClick={() => {
									if (!active) {
										toastSuccess(i18n.accountChanged);
										const data = { activeAccountIndex: i };
										setState({ ...data, activeAccount: accountList[i] });
										setValue(data);
									}
									changingActiveAccountSet(false);
								}}
							/>
							{i + 1 === accountList.length && (
								<button
									className="xy w-8 h-8 mr-2 overflow-hidden rounded-full bg-skin-middleground brightness-button"
									onClick={() => {
										const data: Partial<State> = {
											accountList: [...accountList].slice(
												0,
												accountList.length - 1
											),
										};
										if (activeAccountIndex === data.accountList!.length - 1) {
											data.activeAccountIndex = 0;
										}
										setState(data);
										setValue(data);
									}}
								>
									<XIcon className="w-5 text-skin-secondary" />
								</button>
							)}
						</div>
					);
				})}
				<ModalListBottomButton
					label={i18n.deriveAddress}
					onClick={() => {
						const data = {
							accountList: [
								...accountList,
								wallet.deriveAddress({
									...secrets,
									index: accountList.length,
								}),
							],
						};
						setState(data);
						setValue(data);
					}}
				/>
			</Modal>
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
					{!assets
						? null
						: assets.map(({ tokenInfo }) => {
								const tti = tokenInfo.tokenId;
								const symbol = tokenInfo.tokenSymbol;
								console.log(
									'getTokenImage(symbol, tti):',
									getTokenImage(symbol, tti)
								);
								return (
									<div
										key={tti}
										className="fx rounded py-1 px-2 bg-skin-middleground"
										onMouseDown={() => {
											// TODO: drag to sort
										}}
									>
										<img
											src={getTokenImage(symbol, tti)}
											alt={symbol}
											className="h-8 w-8 rounded-full mr-2 bg-gradient-to-tr from-skin-alt to-skin-bg-base"
										/>
										<div className="flex-1 fx">
											<div className="flex flex-col flex-1 items-start">
												<p className="text-lg">{symbol}</p>
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
						onClick={() => {
							editingTokenListSet(false);
						}}
					>
						{i18n.cancel}
					</button>
					<button
						className="p-0 round-solid-button"
						onClick={() => {
							// TODO: replace token list with token list draft
						}}
					>
						{i18n.confirm}
					</button>
				</div>
			</Modal>
			<Modal
				fullscreen
				visible={!!selectedTokenInfo}
				onClose={() => selectedTokenInfoSet(null)}
				className="flex flex-col"
				headerComponent={
					selectedTokenInfo && (
						<>
							<div className="flex-1 fy">
								<p className="text-xl leading-4 mt-1">
									{selectedTokenInfo?.tokenSymbol}
								</p>
								<button
									className="group fx darker-brightness-button"
									onClick={() => copyWithToast(activeAddress)}
								>
									<p className="ml-5 leading-3 text-xs text-skin-secondary">
										{shortenTti(selectedTokenInfo?.tokenId!)}
									</p>
									<DuplicateIcon className="ml-1 w-4 text-skin-secondary opacity-0 duration-200 group-hover:opacity-100" />
								</button>
							</div>
							<div className="w-10 p-1">
								<img
									src={getTokenImage(
										selectedTokenInfo?.tokenSymbol,
										selectedTokenInfo?.tokenId
									)}
									alt={selectedTokenInfo?.tokenSymbol}
									className="h-8 w-8 rounded-full mr-2 bg-gradient-to-tr from-skin-alt to-skin-bg-base"
								/>
							</div>
						</>
					)
				}
			>
				<div className="flex-1 p-2 space-y-2 overflow-scroll bg-skin-base">
					{selectedTokenInfo && (
						<TransactionList tti={selectedTokenInfo?.tokenId} />
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
				heading={`${i18n.receive} ${selectedTokenInfo?.tokenSymbol}`}
				subheading={selectedTokenInfo?.tokenId}
			>
				<div className="flex-1 p-2 space-y-2 overflow-scroll bg-skin-base">
					{/* https://docs.vite.org/vite-docs/vep/vep-6.html */}
					<QR
						data={`vite:${activeAddress}${toQueryString({
							amount,
							tti: selectedTokenInfo?.tokenId,
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
				heading={`${i18n.send} ${selectedTokenInfo?.tokenSymbol}`}
				subheading={selectedTokenInfo?.tokenId}
			>
				<div className="flex-1 p-2 space-y-2 overflow-scroll bg-skin-base">
					<div className="">
						<p className="leading-5 text-skin-secondary">{i18n.from}</p>
						<p className="break-words text-sm">{accountName}</p>
						<p className="break-words text-sm">{activeAddress}</p>
					</div>
					<div className="">
						<p className="leading-5 text-skin-secondary">{i18n.balance}</p>
						<p className="">
							{balanceInfoMap?.[selectedTokenInfo?.tokenId!]?.balance &&
								toBiggestUnit(
									balanceInfoMap[selectedTokenInfo?.tokenId!]?.balance,
									balanceInfoMap[selectedTokenInfo?.tokenId!]?.tokenInfo
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
							// if (+toBiggestUnit(v, balances[selectedTokenInfo].decimals) > +balances[selectedTokenInfo].balance) {
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
								tokenId: selectedTokenInfo?.tokenId,
								amount: toSmallestUnit(
									amount,
									balanceInfoMap![selectedTokenInfo?.tokenId!]?.tokenInfo
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
		</TabContainer>
	);
};

export default connect(Home);
