import {
	CreditCardIcon,
	DuplicateIcon,
	PencilIcon,
} from '@heroicons/react/outline';
import { wallet } from '@vite/vitejs';
import { useMemo, useRef, useState } from 'react';
import Checkbox from '../components/Checkbox';
import Modal from '../components/Modal';
import QR from '../components/QR';
import ModalListItem from '../components/ModalListItem';
import TabContainer from '../components/TabContainer';
import TextInput, { TextInputRefObject } from '../components/TextInput';
import TransactionList from '../containers/TransactionList';
import { providerWsURLs } from '../utils/constants';
import { connect } from '../utils/global-context';
import { validateInputs } from '../utils/misc';
import { shortenAddress, shortenTti, toSmallestUnit } from '../utils/strings';
import { NetworkTypes, State } from '../utils/types';
import ModalListBottomButton from '../components/ModalListBottomButton';

type Props = State;

const testAccountName = 'Main wallet';

const Home = ({
	i18n,
	setState,
	viteBalanceInfo,
	secrets,
	activeAccountIndex,
	activeAccount,
	copyWithToast,
	networkType,
	transactionHistory,
	toastSuccess,
}: Props) => {
	console.log('viteBalanceInfo:', viteBalanceInfo);
	const toAddressRef = useRef<TextInputRefObject>();
	const amountRef = useRef<TextInputRefObject>();
	const commentRef = useRef<TextInputRefObject>();
	const [pickingNetwork, pickingNetworkSet] = useState(false);
	const [addingNetwork, addingNetworkSet] = useState(false);
	const [changingActiveAccount, changingActiveAccountSet] = useState(false);
	const [editingAccountName, editingAccountNameSet] = useState(false);
	const [accountName, accountNameSet] = useState(testAccountName);
	const [networkName, networkNameSet] = useState('');
	const [rpcUrl, rpcUrlSet] = useState('');
	const [editingTokenList, editingTokenListSet] = useState(false);
	const [tokenQuery, tokenQuerySet] = useState('');
	const [blockExplorerUrl, blockExplorerUrlSet] = useState('');
	const [displayedTokenDraft, displayedTokenDraftSet] = useState<{
		[key: string]: boolean;
	}>({});
	const [tokenOrderDraft, tokenOrderDraftSet] = useState<string[]>([]);
	console.log('tokenOrderDraft:', tokenOrderDraft);
	const [selectedTti, selectedTtiSet] = useState('');
	const [receivingFunds, receivingFundsSet] = useState(false);
	const [sendingFunds, sendingFundsSet] = useState(false);
	const [toAddress, toAddressSet] = useState('');
	const [amount, amountSet] = useState('');
	const [comment, commentSet] = useState('');
	const [confirmingTransaction, confirmingTransactionSet] = useState(false);

	const selectedToken = useMemo(() => {
		if (viteBalanceInfo && selectedTti) {
			return viteBalanceInfo.balance.balanceInfoMap![selectedTti];
		}
	}, [viteBalanceInfo, selectedTti]);

	// This is a very slow function - causes ui leg
	// const derivedAccounts = useMemo(() => {
	// 	return wallet.deriveAddressList({
	// 		...secrets,
	// 		startIndex: 0,
	// 		endIndex: 1,
	// 		// endIndex: 10,
	// 	});
	// }, [secrets]);

	const activeAddress = useMemo(
		() => activeAccount?.address || '',
		[activeAccount]
	);

	// const accountNames = [testAccountName];

	const assets = [
		{ symbol: 'VITE', tti: 'tti_5649544520544f4b454e6e40' },
		{ symbol: 'VX', tti: 'tti_564954455820434f494e69b5' },
		{ symbol: 'VIVA', tti: 'tti_a23c2f75791efafe5fada99e' },
		{ symbol: 'BTC', tti: 'tti_b90c9baffffc9dae58d1f33f' },
		{ symbol: 'ETH', tti: 'tti_687d8a93915393b219212c73' },
		{ symbol: 'USDT', tti: 'tti_80f3751485e4e83456059473' },
	];
	// return (
	// 	<TabContainer>
	// 		<p className="">home</p>
	// 	</TabContainer>
	// );
	return (
		<TabContainer>
			<div className="bg-skin-middleground shadow-md z-10 p-2">
				<div className="fx justify-between">
					<button
						className="border-2 px-2 rounded-full border-skin-alt text-sm bg-skin-middleground text-skin-secondary hover:shadow-md active:shadow brightness-button"
						onClick={() => pickingNetworkSet(true)}
					>
						{i18n[networkType]}
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
								accountNameSet(accountName);
							}}
						>
							<input
								autoFocus
								className="text-xl text-center px-2 w-full bg-skin-base rounded"
								value={accountName}
								placeholder={testAccountName}
								onChange={(e) => accountNameSet(e.target.value)}
								onBlur={() => {
									// TODO: set account name
									editingAccountNameSet(false);
									accountNameSet(accountName);
								}}
								onKeyDown={(e) => {
									if (e.key === 'Escape') {
										editingAccountNameSet(false);
										accountNameSet(testAccountName);
									}
								}}
							/>
						</form>
					) : (
						<button
							className="group ml-[1.625rem] fx darker-brightness-button"
							onClick={() => editingAccountNameSet(true)}
						>
							<p className="text-xl">{testAccountName}</p>
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
				{assets.map(({ tti, symbol }) => {
					return (
						<button
							key={tti}
							className="fx rounded w-full p-1.5 shadow cursor-pointer bg-skin-middleground brightness-button"
							onClick={() => {
								selectedTtiSet(tti);
							}}
						>
							<img
								src={`https://github.com/vitelabs/crypto-info/blob/master/tokens/${symbol.toLowerCase()}/${tti}.png?raw=true`}
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
									<p className="text-xs text-skin-muted">{shortenTti(tti)}</p>
								</div>
								<div className="flex flex-col items-end mr-1.5">
									<p className="text-lg">{'0'}</p>
									<p className="text-xs text-skin-secondary">$0</p>
								</div>
							</div>
						</button>
					);
				})}
				<button
					className="mx-auto block text-skin-highlight brightness-button"
					onClick={() => {
						editingTokenListSet(true);
						const displayedTokenDraft: { [key: string]: boolean } = {};
						const tokenOrderDraft: string[] = [];
						assets.forEach(({ tti }) => {
							displayedTokenDraft[tti] = true;
							tokenOrderDraft.push(tti);
						});
						displayedTokenDraftSet(displayedTokenDraft);
						tokenOrderDraftSet(tokenOrderDraft);
					}}
				>
					Edit token list
				</button>
			</div>
			<Modal
				visible={pickingNetwork}
				fromLeft={addingNetwork}
				onClose={() => pickingNetworkSet(false)}
				heading={i18n.networks}
			>
				{Object.entries(providerWsURLs).map(([label, uri]) => {
					const active = networkType === label;
					return (
						<ModalListItem
							radio
							key={uri}
							active={active}
							label={label}
							sublabel={uri}
							onClick={() => {
								if (!active) {
									toastSuccess(i18n.networkChanged);
									setState({ networkType: label as NetworkTypes });
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
					networkNameSet('');
					rpcUrlSet('');
					blockExplorerUrlSet('');
				}}
			>
				<div className="space-y-3 p-3">
					<TextInput
						label="Network Name"
						value={networkName}
						onUserInput={(v) => networkNameSet(v)}
					/>
					<TextInput
						label="RPC URL"
						value={rpcUrl}
						onUserInput={(v) => rpcUrlSet(v)}
					/>
					<TextInput
						optional
						label="Block Explorer URL"
						value={blockExplorerUrl}
						onUserInput={(v) => blockExplorerUrlSet(v)}
					/>
					<button
						className="round-solid-button p-1"
						onClick={() => {
							// TODO: store
						}}
					>
						Add
					</button>
				</div>
			</Modal>
			<Modal
				heading={i18n.accounts}
				visible={changingActiveAccount}
				onClose={() => changingActiveAccountSet(false)}
			>
				{/* {derivedAccounts.map(({ address }, i) => {
					const active = i === activeAccountIndex;
					return (
						<ModalListItem
							radio
							key={address}
							active={active}
							label={accountNames[i] || 'Account ' + i}
							sublabel={shortenAddress(address)}
							rightJSX={
								!transactionHistory[address]?.length && (
									<div className="self-start border-2 border-skin-alt px-1 text-skin-muted rounded-full text-xs">
										{i18n.new}
									</div>
								)
							}
							onClick={() => {
								if (!active) {
									toastSuccess(i18n.accountChanged);
								}
								changingActiveAccountSet(false);
							}}
						/>
					);
				})} */}
				<ModalListBottomButton
					label={i18n.deriveAddress}
					onClick={() => {
						// TODO: derive address
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
					{assets.map(({ tti, symbol }) => {
						return (
							<div
								key={tti}
								className="fx rounded py-1 px-2 bg-skin-middleground"
								onMouseDown={() => {
									// TODO: drag to sort
								}}
							>
								<img
									src={`https://github.com/vitelabs/crypto-info/blob/master/tokens/${symbol.toLowerCase()}/${tti}.png?raw=true`}
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
				visible={!!selectedTti}
				onClose={() => selectedTtiSet('')}
				className="flex flex-col"
				headerComponent={
					<>
						<div className="flex-1 fy">
							<p className="text-xl leading-4 mt-1">BTC-000</p>
							<button
								className="group fx darker-brightness-button"
								onClick={() => copyWithToast(activeAddress)}
							>
								<p className="ml-5 leading-3 text-xs text-skin-secondary">
									{shortenTti(selectedTti)}
								</p>
								<DuplicateIcon className="ml-1 w-4 text-skin-secondary opacity-0 duration-200 group-hover:opacity-100" />
							</button>
						</div>
						<div className="w-10 p-1">
							<img
								src={`https://github.com/vitelabs/crypto-info/blob/master/tokens/${selectedToken?.tokenInfo.tokenSymbol.toLowerCase()}/${selectedTti}.png?raw=true`}
								alt={selectedToken?.tokenInfo.tokenSymbol}
								className="h-8 w-8 rounded-full mr-2 bg-gradient-to-tr from-skin-alt to-skin-bg-base"
							/>
						</div>
					</>
				}
			>
				<div className="flex-1 p-2 space-y-2 overflow-scroll bg-skin-base">
					<TransactionList transactions={[]} />
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
						Send
					</button>
				</div>
			</Modal>
			<Modal
				visible={receivingFunds}
				onClose={() => receivingFundsSet(false)}
				className="flex flex-col"
				heading={`${i18n.receive} ${'BTC-000'}`}
				subheading={selectedTti}
			>
				<div className="flex-1 p-2 space-y-2 overflow-scroll bg-skin-base">
					{/* https://docs.vite.org/vite-docs/vep/vep-6.html */}
					<QR data={activeAddress} className="h-40 w-40 mx-auto" />
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
				heading={`${i18n.send} ${'BTC-000'}`}
				subheading={selectedTti}
			>
				<div className="flex-1 p-2 space-y-2 overflow-scroll bg-skin-base">
					<div className="">
						<p className="leading-5 text-skin-secondary">{i18n.from}</p>
						<p className="break-words text-sm">{activeAddress}</p>
					</div>
					<div className="">
						<p className="leading-5 text-skin-secondary">{i18n.balance}</p>
						<p className="">{toSmallestUnit('100000')}</p>
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
							// if (+toBiggestUnit(v, balances[selectedTti].decimals) > +balances[selectedTti].balance) {
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
						onClick={() => {
							// TODO
						}}
					>
						{i18n.confirm}
					</button>
				</div>
			</Modal>
		</TabContainer>
	);
};

export default connect(Home);
