import { CreditCardIcon, DuplicateIcon, XIcon } from '@heroicons/react/outline';
import { CheckCircleIcon, PlusIcon } from '@heroicons/react/solid';
import { useEffect, useRef, useState } from 'react';
import Checkbox from '../components/Checkbox';
import Modal, { ModalRefObject } from '../components/Modal';
import TabContainer from '../components/TabContainer';
import TextInput from '../components/TextInput';
import { providerWsURLs } from '../utils/constants';
import { connect } from '../utils/global-context';
import { shortenAddress, shortenTti } from '../utils/strings';
import { State } from '../utils/types';
// import { getBalanceInfo } from '../utils/vitescripts';

type Props = State;

const Home = ({ i18n, setState, copyWithToast, network, toastSuccess, toastError }: Props) => {
	const editingTokenListModal = useRef<ModalRefObject>();
	const [networkPickerOpen, networkPickerOpenSet] = useState(false);
	const [walletInfoOpen, walletInfoOpenSet] = useState(false);
	const [addNetworkModalOpen, addNetworkModalOpenSet] = useState(false);
	const [networkName, networkNameSet] = useState('');
	const [rpcUrl, rpcUrlSet] = useState('');
	const [editingTokenList, editingTokenListSet] = useState(!false);
	const [tokenQuery, tokenQuerySet] = useState('');
	const [blockExplorerUrl, blockExplorerUrlSet] = useState('');
	const [displayedTokenDraft, displayedTokenDraftSet] = useState<{ [key: string]: boolean }>({});
	const [tokenOrderDraft, tokenOrderDraftSet] = useState<string[]>([]);
	const balances = {
		tti_5649544520544f4b454e6e40: 10,
	};

	useEffect(() => {
		// getBalanceInfo('vite_5e8d4ac7dc8b75394cacd21c5667d79fe1824acb46c6b7ab1f')
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
						onClick={() => networkPickerOpenSet(true)}
					>
						{network}
					</button>
					<button
						className="p-1 -mt-1 -mr-1 text-skin-secondary darker-brightness-button"
						onClick={() => walletInfoOpenSet(true)}
					>
						<CreditCardIcon className="w-6 text-inherit" />
					</button>
				</div>
				<div className="fy">
					{/* <input className="text-xl b text-center px-2 w-full" value="Account 0" /> */}
					<p className="text-xl">Account 0</p>
					<button className="fx text-skin-secondary darker-brightness-button" onClick={() => copyWithToast('address')}>
						<p className="text-inherit">{shortenAddress('vite_5e8d4ac7dc8b75394cacd21c5667d79fe1824acb46c6b7ab1f')}</p>
						<DuplicateIcon className="ml-1 w-5 text-inherit" />
					</button>
				</div>
			</div>
			<div className="flex-1 p-2 space-y-2 overflow-scroll">
				{assets.map(({ tti, symbol }) => {
					return (
						<div
							key={tti}
							className="fx rounded p-1.5 shadow bg-skin-middleground"
							onMouseDown={() => {
								// TODO: drag to sort
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
									<button
										className="text-xs text-skin-muted darker-brightness-button"
										onClick={() => copyWithToast(tti)}
									>
										{shortenTti(tti)}
									</button>
								</div>
								<div className="flex flex-col items-end mr-1.5">
									<p className="text-lg">{'0'}</p>
									<p className="text-xs text-skin-secondary">$0</p>
								</div>
							</div>
						</div>
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
			{networkPickerOpen && (
				<Modal onClose={() => networkPickerOpenSet(false)}>
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
										networkPickerOpenSet(false);
									}}
								>
									<div className="w-10 xy">
										{active ? (
											<CheckCircleIcon className="w-6 text-skin-highlight" />
										) : (
											<div className="w-5 h-5 border-2 border-skin-alt rounded-full" />
										)}
									</div>
									<div>
										<p className="leading-4 text-left">{label}</p>
										<p className="leading-4 text-sm text-skin-secondary">{uri}</p>
									</div>
								</button>
							);
						})}
						<button
							className="px-1 py-2 fx w-full bg-skin-middleground brightness-button"
							onClick={() => {
								networkPickerOpenSet(false);
								addNetworkModalOpenSet(true);
							}}
						>
							<PlusIcon className="w-6 ml-1 mr-2 text-skin-secondary" />
							<p className="text-left text-skin-secondary">Add network</p>
						</button>
					</div>
				</Modal>
			)}
			{addNetworkModalOpen && (
				<Modal
					onClose={() => {
						networkPickerOpenSet(true);
						addNetworkModalOpenSet(false);
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
								className="round-solid-button"
								onClick={() => {
									// TODO: store
								}}
							>
								Add
							</button>
						</div>
					</div>
				</Modal>
			)}
			{walletInfoOpen && (
				<Modal onClose={() => walletInfoOpenSet(false)}>
					<p className="text-xl">Accounts</p>
				</Modal>
			)}
			{editingTokenList && (
				<Modal padless _ref={editingTokenListModal} onClose={() => editingTokenListSet(false)}>
					<div className="flex flex-col w-[18rem] h-[30rem] bg-skin-middleground rounded-t">
						<input
							placeholder="Search tokens by symbol or tti"
							value={tokenQuery}
							className="p-2 shadow z-10"
							onChange={(e) => tokenQuerySet(e.target.value)}
						/>
						<div className="flex-1 overflow-scroll">
							{assets.map(({ tti, symbol }) => {
								return (
									<div
										key={tti}
										className="fx rounded py-1 px-2 shadow bg-skin-middleground"
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
													className="text-xs text-skin-muted darker-brightness-button"
													onClick={() => copyWithToast(tti)}
												>
													{tti}
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
							<button className="p-0 round-outline-button" onClick={() => editingTokenListModal?.current?.close()}>
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
					</div>
				</Modal>
			)}
		</TabContainer>
	);
};

export default connect(Home);
