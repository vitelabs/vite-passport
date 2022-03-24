import { CreditCardIcon, DuplicateIcon } from '@heroicons/react/outline';
import { CheckCircleIcon, PlusIcon } from '@heroicons/react/solid';
import { useEffect, useState } from 'react';
import Modal from '../components/Modal';
import TabContainer from '../components/TabContainer';
import TextInput from '../components/TextInput';
import { providerWsURLs } from '../utils/constants';
import { connect } from '../utils/global-context';
import { shortenAddress, shortenTti } from '../utils/strings';
import { State } from '../utils/types';
// import { getBalanceInfo } from '../utils/vitescripts';

type Props = State;

const Home = ({ i18n, setState, copyWithToast, network, toastError }: Props) => {
	const [networkPickerOpen, networkPickerOpenSet] = useState(false);
	const [walletInfoOpen, walletInfoOpenSet] = useState(false);
	const [addNetworkModalOpen, addNetworkModalOpenSet] = useState(false);
	const [networkName, networkNameSet] = useState('');
	const [rpcUrl, rpcUrlSet] = useState('');
	const [blockExplorerUrl, blockExplorerUrlSet] = useState('');
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
			<div className="bg-skin-middleground shadow p-2">
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
						<div key={tti} className="fx rounded shadow bg-skin-middleground">
							<img
								src={`https://github.com/vitelabs/crypto-info/blob/master/tokens/${symbol.toLowerCase()}/${tti}.png?raw=true`}
								alt={symbol}
								className="h-9 w-9 rounded-full m-2 ml-2.5 bg-gradient-to-tr from-skin-alt to-skin-bg-base"
							/>
							<div className="my-1.5 mr-3 flex-1">
								<div className="fx justify-between">
									<p className="text-lg">{symbol}</p>
									<p className="text-lg">{'0'}</p>
								</div>
								<div className="fx justify-between">
									<button
										className="text-xs text-skin-muted darker-brightness-button"
										onClick={() => copyWithToast(tti)}
									>
										{shortenTti(tti)}
									</button>
									<p className="text-xs text-skin-secondary">$0</p>
								</div>
							</div>
						</div>
					);
				})}
				<div className="fy">
					<button className="text-skin-secondary brightness-button">Add token</button>
				</div>
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
									className="px-1 py-2 fx w-full bg-skin-middleground brightness-button"
									onClick={() => {
										setState({ network: label });
										networkPickerOpenSet(false);
									}}
								>
									<div className="w-8 xy">
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
							<div className="w-8 xy">
								<PlusIcon className="w-6 text-skin-secondary" />
							</div>
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
		</TabContainer>
	);
};

export default connect(Home);
