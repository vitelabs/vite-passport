import { CreditCardIcon, DuplicateIcon } from '@heroicons/react/outline';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TabContainer from '../components/TabContainer';
import { connect } from '../utils/global-context';
import { shortenAddress, shortenTti } from '../utils/strings';
import { State } from '../utils/types';
// import { getBalanceInfo } from '../utils/vitescripts';

type Props = State;

const Home = ({ i18n, setState, copyWithToast, toastError }: Props) => {
	const navigate = useNavigate();
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
						className="border-2 px-2 rounded-full border-skin-alt text-sm text-skin-secondary transition duration-200 hover:shadow-md active:shadow active:bg-skin-base"
						onClick={() => {}}
					>
						Mainnet
					</button>
					<button className="" onClick={() => {}}>
						<CreditCardIcon className="w-6 text-skin-secondary" />
					</button>
				</div>
				<div className="fy">
					{/* <input className="text-xl b text-center px-2 w-full" value="Account 0" /> */}
					<p className="text-xl">Account 0</p>
					<button className="fx" onClick={() => copyWithToast('address')}>
						<p className="text-skin-secondary">
							{shortenAddress('vite_5e8d4ac7dc8b75394cacd21c5667d79fe1824acb46c6b7ab1f')}
						</p>
						<DuplicateIcon className="ml-1 w-5 text-skin-secondary" />
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
									<button className="text-xs text-skin-muted" onClick={() => copyWithToast(tti)}>
										{shortenTti(tti)}
									</button>
									<p className="text-xs text-skin-secondary">$0</p>
								</div>
							</div>
						</div>
					);
				})}
			</div>
		</TabContainer>
	);
};

export default connect(Home);
