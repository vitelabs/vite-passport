import { CreditCardIcon, DuplicateIcon, PencilIcon, XIcon } from '@heroicons/react/outline';
import { CheckCircleIcon, ExternalLinkIcon, MinusSmIcon, PlusIcon, PlusSmIcon } from '@heroicons/react/solid';
import { useEffect, useMemo, useState } from 'react';
import A from '../components/A';
import Checkbox from '../components/Checkbox';
import Modal from '../components/Modal';
import QR from '../components/QR';
import TabContainer from '../components/TabContainer';
import TextInput from '../components/TextInput';
import TransactionList from '../containers/TransactionList';
import { providerWsURLs, testBalanceInfo, testTransactions } from '../utils/constants';
import { connect } from '../utils/global-context';
import { formatDate, shortenAddress, shortenHash, shortenTti, toBiggestUnit } from '../utils/strings';
import { BalanceInfo, State } from '../utils/types';
// import { getBalanceInfo } from '../utils/vitescripts';

type Props = State;

const testAddress = 'vite_5e8d4ac7dc8b75394cacd21c5667d79fe1824acb46c6b7ab1f';
const testAccountName = 'Main wallet';

const Home = ({ i18n, setState, copyWithToast, network, transactionHistory, toastSuccess, toastError }: Props) => {
	const [pickingNetwork, pickingNetworkSet] = useState(false);
	const [addingNetwork, addingNetworkSet] = useState(false);
	const [accountsModalOpen, accountsModalOpenSet] = useState(false);
	const [editingAccountName, editingAccountNameSet] = useState(false);
	const [accountName, accountNameSet] = useState(testAccountName);
	const [networkName, networkNameSet] = useState('');
	const [rpcUrl, rpcUrlSet] = useState('');
	const [editingTokenList, editingTokenListSet] = useState(false);
	const [tokenQuery, tokenQuerySet] = useState('');
	const [blockExplorerUrl, blockExplorerUrlSet] = useState('');
	const [displayedTokenDraft, displayedTokenDraftSet] = useState<{ [key: string]: boolean }>({});
	const [tokenOrderDraft, tokenOrderDraftSet] = useState<string[]>([]);
	const [selectedTti, selectedTtiSet] = useState('');
	const [receivingFunds, receivingFundsSet] = useState(false);
	const [sendingFunds, sendingFundsSet] = useState(false);
	const [amount, amountSet] = useState('');
	const [comment, commentSet] = useState('');

	const selectedToken = useMemo(
		() => (testBalanceInfo as BalanceInfo).balance.balanceInfoMap[selectedTti],
		[selectedTti]
	);

	const balances = {
		tti_5649544520544f4b454e6e40: 10,
	};
	const activeAccountIndex = 0;
	const accounts = [
		testAddress,
		testAddress.slice(0, 62) + '0',
		testAddress.slice(0, 62) + '1',
		testAddress.slice(0, 62) + '2',
		// testAddress.slice(0, 62) + '3',
		// testAddress.slice(0, 62) + '4',
		// testAddress.slice(0, 62) + '5',
	];
	const accountNames = [testAccountName];

	useEffect(() => {
		// getBalanceInfo(testAddress)
		// 	// @ts-ignore
		// 	.then((res: { balance: { balanceInfoMap: object } }) => {
		// 		console.log('res:', res);
		// 		if (res.balance.balanceInfoMap) {
		// 			const balanceUpdates = { vite: { [networkType]: {} } };
		// 			const tokenUpdates: { [key: string]: TokenInfo } = {};
		// 			Object.entries(res.balance.balanceInfoMap).forEach(([tti, { balance, tokenInfo }]) => {
		// 				// @ts-ignore
		// 				balanceUpdates.vite[networkType][tti] = toBiggestUnit(balance, tokenInfo.decimals);
		// 				tokenUpdates[tti] = tokenInfo;
		// 			});
		// 			setState({ balances: balanceUpdates }, { deepMerge: true });
		// 		}
		// 	})
		// 	.catch((e: string) => toastError(e));
	}, []);

	const assets = [
		{ symbol: 'VITE', tti: 'tti_5649544520544f4b454e6e40' },
		{ symbol: 'VX', tti: 'tti_564954455820434f494e69b5' },
		{ symbol: 'VIVA', tti: 'tti_a23c2f75791efafe5fada99e' },
		{ symbol: 'BTC', tti: 'tti_b90c9baffffc9dae58d1f33f' },
		{ symbol: 'ETH', tti: 'tti_687d8a93915393b219212c73' },
		{ symbol: 'USDT', tti: 'tti_80f3751485e4e83456059473' },
	];

	return (
		<TabContainer scrollable={false}>
			<div className="bg-skin-middleground shadow-md z-10 p-2">
				<div className="fx justify-between">
					<button
						className="border-2 px-2 rounded-full border-skin-alt text-sm bg-skin-middleground text-skin-secondary hover:shadow-md active:shadow brightness-button"
						onClick={() => pickingNetworkSet(true)}
					>
						{network}
					</button>
					<button
						className="p-1 -mt-1 -mr-1 text-skin-secondary darker-brightness-button"
						onClick={() => accountsModalOpenSet(true)}
					>
						<CreditCardIcon className="w-6 text-inherit" />
					</button>
				</div>
				<div className="fy">
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
						<button className="group fx darker-brightness-button" onClick={() => editingAccountNameSet(true)}>
							<p className="text-xl ml-10">{testAccountName}</p>
							<div className="w-10 p">
								<PencilIcon className="ml-1.5 w-5 mr-3.5 opacity-0 duration-200 group-hover:opacity-100" />
							</div>
						</button>
					)}
					<button className="group fx darker-brightness-button" onClick={() => copyWithToast(testAddress)}>
						<p className="text-skin-secondary ml-10">{shortenAddress(testAddress)}</p>
						<DuplicateIcon className="ml-1 w-5 mr-4 text-skin-secondary opacity-0 duration-200 group-hover:opacity-100" />
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
			<Modal visible={pickingNetwork} fromLeft={addingNetwork} onClose={() => pickingNetworkSet(false)}>
				<div className="w-64">
					<p className="text-xl text-center p-2 border-b-2 border-skin-alt">Networks</p>
					{Object.entries(providerWsURLs).map(([label, uri]) => {
						const active = network === label;
						return (
							<button
								key={uri}
								className={`pr-1 py-2 fx w-full bg-skin-middleground brightness-button`}
								onClick={() => {
									if (!active) {
										toastSuccess('Network changed');
										setState({ network: label });
									}
									pickingNetworkSet(false);
								}}
							>
								<div className="w-10 xy">
									{active ? (
										<CheckCircleIcon className="w-6 text-skin-highlight" />
									) : (
										<div className="w-5 h-5 border-2 border-skin-alt rounded-full" />
									)}
								</div>
								<div className="text-left">
									<p className="leading-5">{label}</p>
									<p className="leading-5 text-sm text-skin-secondary">{uri}</p>
								</div>
							</button>
						);
					})}
					<button
						className="px-1 py-2 fx w-full bg-skin-middleground brightness-button"
						onClick={() => {
							pickingNetworkSet(false);
							addingNetworkSet(true);
						}}
					>
						<PlusIcon className="w-6 ml-1 mr-2 text-skin-secondary" />
						<p className="text-left text-skin-secondary">Add network</p>
					</button>
				</div>
			</Modal>
			<Modal
				visible={addingNetwork}
				fromRight
				onStartClose={() => {
					pickingNetworkSet(true);
					setTimeout(() => addingNetworkSet(false), 0);
					networkNameSet('');
					rpcUrlSet('');
					blockExplorerUrlSet('');
				}}
			>
				<div className="w-64">
					<p className="text-xl text-center p-2 border-b-2 border-skin-alt">Add Network</p>
					<div className="space-y-3 p-3">
						<TextInput label="Network Name" value={networkName} onUserInput={(v) => networkNameSet(v)} />
						<TextInput label="RPC URL" value={rpcUrl} onUserInput={(v) => rpcUrlSet(v)} />
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
				</div>
			</Modal>
			<Modal visible={accountsModalOpen} className="w-64" onClose={() => accountsModalOpenSet(false)}>
				<div className="w-64">
					<p className="text-xl text-center p-2 border-b-2 border-skin-alt">Accounts</p>
					{accounts.map((address, i) => {
						const active = i === activeAccountIndex;
						return (
							<button
								key={address}
								className={`pr-1 py-2 fx w-full bg-skin-middleground brightness-button`}
								onClick={() => {
									if (!active) {
										toastSuccess('Account changed');
										// setState({ network: label });
									}
									accountsModalOpenSet(false);
								}}
							>
								<div className="w-10 xy">
									{active ? (
										<CheckCircleIcon className="w-6 text-skin-highlight" />
									) : (
										<div className="w-5 h-5 border-2 border-skin-alt rounded-full" />
									)}
								</div>
								<div className="text-left flex-1">
									<p className="leading-5 text-lg">{accountNames[i] || 'Account ' + i}</p>
									<p className="leading-5 text-skin-secondary">{shortenAddress(address)}</p>
								</div>
								{!transactionHistory[address]?.length && (
									<div className="self-start border-2 border-skin-alt px-1 text-skin-muted rounded-full text-xs">
										New
									</div>
								)}
							</button>
						);
					})}
					<button
						className="px-1 py-2 fx w-full bg-skin-middleground brightness-button"
						onClick={() => {
							// TODO: derive address
						}}
					>
						<PlusIcon className="w-6 ml-1 mr-2 text-skin-secondary" />
						<p className="text-skin-secondary">Derive address</p>
					</button>
				</div>
			</Modal>
			<Modal fullscreen visible={editingTokenList} onClose={() => editingTokenListSet(false)} className="flex flex-col">
				<div className="z-50 fx w-full px-1 shadow">
					<button className="brightness-button" onClick={() => editingTokenListSet(false)}>
						<XIcon className="w-8 text-skin-secondary" />
					</button>
					<p className="text-xl flex-1 text-center p-2 mr-8">Edit Token List</p>
				</div>
				<input
					placeholder="Search tokens by symbol or tti"
					value={tokenQuery}
					className="p-2 shadow z-10 w-full"
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
										<button className="group fx darker-brightness-button" onClick={() => copyWithToast(tti)}>
											<p className="text-xs text-skin-secondary">{shortenTti(tti)}</p>
											<DuplicateIcon className="ml-1 w-4 text-skin-secondary opacity-0 duration-200 group-hover:opacity-100" />
										</button>
									</div>
									<Checkbox
										checked={displayedTokenDraft[tti]}
										onUserInput={(c) => {
											displayedTokenDraft[tti] = !displayedTokenDraft[tti];
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
							//
						}}
					>
						Cancel
					</button>
					<button
						className="p-0 round-solid-button"
						onClick={() => {
							// TODO: replace token list with token list draft
						}}
					>
						Confirm
					</button>
				</div>
			</Modal>
			<Modal fullscreen visible={!!selectedTti} onClose={() => selectedTtiSet('')} className="flex flex-col">
				<div className="z-50 fx w-full px-1 shadow ">
					<button className="brightness-button w-10" onClick={() => selectedTtiSet('')}>
						<XIcon className="w-8 text-skin-secondary" />
					</button>
					<div className="flex-1 fy">
						<p className="text-xl leading-4 mt-1">BTC-000</p>
						<button className="group fx darker-brightness-button" onClick={() => copyWithToast(testAddress)}>
							<p className="ml-5 leading-3 text-xs text-skin-secondary">{shortenTti(selectedTti)}</p>
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
				</div>
				<div className="flex-1 p-2 space-y-2 overflow-scroll bg-skin-base">
					<TransactionList transactions={testTransactions} />
				</div>
				<div className="fx p-2 gap-2 shadow">
					<button className="round-outline-button p-0" onClick={() => receivingFundsSet(true)}>
						Receive
					</button>
					<button className="round-outline-button p-0" onClick={() => sendingFundsSet(true)}>
						Send
					</button>
				</div>
			</Modal>
			<Modal fullscreen visible={receivingFunds} onClose={() => receivingFundsSet(false)} className="flex flex-col">
				<div className="z-50 fx w-full px-1 shadow ">
					<button className="brightness-button w-10" onClick={() => receivingFundsSet(false)}>
						<XIcon className="w-8 text-skin-secondary" />
					</button>
					<div className="flex-1 fy">
						<p className="text-xl leading-4 mt-1">BTC-000</p>
						<button className="group fx darker-brightness-button" onClick={() => copyWithToast(testAddress)}>
							<p className="ml-5 leading-3 text-xs text-skin-secondary">{shortenTti(selectedTti)}</p>
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
				</div>
				<div className="flex-1 p-2 space-y-2 overflow-scroll bg-skin-base">
					{/* {tokens[selectedTti].symbol} */}
					{/* https://docs.vite.org/vite-docs/vep/vep-6.html */}
					<QR data={testAddress} className="h-40 w-40 mx-auto" />
					<TextInput numeric label="Amount" value={amount} onUserInput={(v) => amountSet(v)} />
					<TextInput textarea label="Comment" value={comment} onUserInput={(v) => commentSet(v)} />
				</div>
			</Modal>
		</TabContainer>
	);
};

export default connect(Home);
