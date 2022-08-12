import { accountBlock, ViteAPI } from '@vite/vitejs';
import HTTP_RPC from '@vite/vitejs-http';
import WS_RPC from '@vite/vitejs-ws';
import { Transaction } from '@vite/vitejs/distSrc/utils/type';
import { useCallback, useEffect, useMemo } from 'react';
import { MemoryRouter, Navigate, Route, Routes } from 'react-router-dom';
import Toast from '../containers/Toast';
import Connect from '../pages/Connect';
import Create from '../pages/Create';
import Create2 from '../pages/Create2';
import Home from '../pages/Home';
import Import from '../pages/Import';
import Lock from '../pages/Lock';
import MyTransactions from '../pages/MyTransactions';
import Settings from '../pages/Settings';
import SignTx from '../pages/SignTx';
import Start from '../pages/Start';
import { connect } from '../utils/global-context';
import { copyToClipboardAsync, parseQueryString, toQueryString } from '../utils/strings';
import { NewAccountBlock, State, UnreceivedBlockMessage, ViteBalanceInfo } from '../utils/types';

// const providerTimeout = 60000;
// const providerOptions = { retryTimes: 5, retryInterval: 5000 };
// new WS_RPC(networkRpcUrl, providerTimeout, providerOptions)

type Props = State;

const blocksReceivedSinceOpening: { [hash: string]: boolean } = {};

const Router = ({
	setState,
	i18n,
	activeAccount,
	encryptedSecrets,
	secrets,
	activeNetwork,
	transactionHistory,
	toastInfo,
	displayedTokenNames,
	toastError,
}: Props) => {
	const initialEntries = useMemo(() => {
		if (window.location.pathname === '/src/confirmation.html') {
			// This pathname is only used for popups (i.e. vitePassport.<methodName> was called from a third party tab)
			const obj = parseQueryString(window.location.search);
			if (typeof obj.routeAfterUnlock === 'string') {
				if (!obj.routeAfterUnlock.startsWith('/')) {
					throw new Error('routeAfterUnlock param must start with "/"');
				}
				if (!encryptedSecrets) {
					// create account
					return ['/' + toQueryString({ routeAfterUnlock: obj.routeAfterUnlock })];
				}
				if (secrets) {
					return [obj.routeAfterUnlock];
				}
				return ['/lock' + toQueryString({ routeAfterUnlock: obj.routeAfterUnlock })];
			} else {
				throw new Error('routeAfterUnlock param must be provided');
			}
		}
		if (encryptedSecrets) {
			if (secrets) {
				// return ['/create'];
				return ['/home'];
				// return ['/my-transactions'];
				// return ['/connect?hostname=example.com'];
			} else {
				return ['/lock'];
			}
		}
		return ['/'];
	}, []); // eslint-disable-line
	const networkRpcUrl = useMemo(() => activeNetwork.rpcUrl, [activeNetwork]);
	const rpc = useMemo(
		() => (/^ws/.test(networkRpcUrl) ? new WS_RPC(networkRpcUrl) : new HTTP_RPC(networkRpcUrl)),
		[networkRpcUrl]
	);

	const viteApi = useMemo(() => {
		return new ViteAPI(rpc, () => {
			console.log('client connected');
		});
	}, [rpc]);

	useEffect(() => setState({ viteApi }), [viteApi]); // eslint-disable-line

	useEffect(() => {
		try {
			(async () => {
				const prices = await (
					await fetch(
						`https://api.coingecko.com/api/v3/simple/price?ids=${displayedTokenNames
							.map((n) => n.replace(/ /g, ''))
							.join(',')}&vs_currencies=usd`
					)
				).json();
				// console.log('prices:', prices);
				setState({ prices });
			})();
		} catch (error) {
			console.log('error:', error);
			toastError(error);
		}
	}, [displayedTokenNames]); // eslint-disable-line

	// Check if tti is listed on ViteX
	// viteApi.request('dex_getTokenInfo', 'tti_5649544520544f4b454e6e40').then(
	// 	(
	// 		data: null | {
	// 			decimals: number; // 18;
	// 			index: number; // 0;
	// 			owner: string; // 'vite_4c2c19f563187163145ab8f53f5bd36864756996e47a767ebe';
	// 			quoteTokenType: number; // 1;
	// 			tokenId: string; // 'tti_5649544520544f4b454e6e40';
	// 			tokenSymbol: string; // 'VITE';
	// 		}
	// 	) => {
	// 		console.log('data:', data);
	// 	}
	// );
	const updateViteBalanceInfo = useCallback(() => {
		if (activeAccount) {
			viteApi
				.getBalanceInfo(activeAccount.address)
				// @ts-ignore getBalanceInfo needs a more descriptive return type
				.then((res: ViteBalanceInfo) => {
					// console.log('res:', res);
					setState({ viteBalanceInfo: res });
					if (res.unreceived.blockCount !== '0') {
						const receiveTask = new accountBlock.ReceiveAccountBlockTask({
							address: activeAccount.address,
							privateKey: activeAccount.privateKey,
							provider: viteApi,
						});
						// receiveTask.start();
					}
				})
				.catch((err) => {
					console.log(err);
					setState({ toast: [JSON.stringify(err), 'error'] });
					// Sometimes on page load, this will catch with
					// Error: CONNECTION ERROR: Couldn't connect to node wss://buidl.vite.net/gvite/ws.
				});
		}
	}, [viteApi, activeAccount]); // eslint-disable-line

	useEffect(updateViteBalanceInfo, [activeAccount, networkRpcUrl]); // eslint-disable-line

	// TODO: This stuff is not working reliably
	useEffect(() => {
		if (!activeAccount) return;
		// https://docs.vite.org/vite-docs/api/rpc/subscribe_v2.html#newaccountblockbyaddress
		viteApi
			.subscribe('newAccountBlockByAddress', activeAccount.address)
			.then((event: { on: (callback: (result: NewAccountBlock) => void) => void }) => {
				event.on(async (newBlock) => {
					console.log('newAccountBlockByAddress:', newBlock);
					const tx: Transaction = await viteApi.request(
						'ledger_getAccountBlockByHash',
						newBlock[0].hash
					);
					if (tx.blockType !== 2) {
						// i.e. user probably sent this block from VP
						toastInfo(i18n.newAccountBlock);
					}
				});
			})
			.catch((err: any) => {
				console.log(err);
				setState({ toast: [JSON.stringify(err), 'error'] });
			});

		viteApi
			.subscribe('newUnreceivedBlockByAddress', activeAccount.address)
			.then((event: { on: (callback: (result: UnreceivedBlockMessage[]) => void) => void }) => {
				event.on((res) => {
					const { hash } = res[0];
					if (blocksReceivedSinceOpening[hash]) return; // This cb run twice, when the block is unreceived and received
					blocksReceivedSinceOpening[hash] = true;
					// console.log('newUnreceivedBlockByAddress:', res);
					// toastInfo(i18n.newUnreceivedAccountBlock);

					// if (transactionHistory?.unreceived) {
					// 	res.forEach(async (block) => {
					// 		const tx: Transaction = await viteApi.request('ledger_getAccountBlockByHash');
					// 		const key = block.received ? 'received' : 'unreceived';
					// 		// console.log('transactionHistory[key]:', key, transactionHistory[key]);
					// 		setState(
					// 			{ transactionHistory: { [key]: [...transactionHistory[key]!, tx] } },
					// 			{ deepMerge: true }
					// 		);
					// 	});
					// }
					// TODO: throttle updateViteBalanceInfo()
					updateViteBalanceInfo();
				});
			})
			.catch((err: any) => {
				console.log(err);
				setState({ toast: [JSON.stringify(err), 'error'] });
			});

		return () => viteApi.unsubscribeAll();
	}, [
		activeAccount,
		toastInfo,
		viteApi,
		updateViteBalanceInfo,
		i18n.newUnreceivedAccountBlock,
		setState,
		transactionHistory,
	]);

	useEffect(() => {
		setState({
			copyWithToast: (text = '') => {
				if (copyToClipboardAsync(text)) {
					setState({ toast: [i18n.successfullyCopied, 'success'] });
				} else {
					setState({ toast: ['clipboard API not supported', 'error'] });
				}
			},
			toastSuccess: (text = '') => setState({ toast: [text, 'success'] }),
			toastWarning: (text = '') => setState({ toast: [text, 'warning'] }),
			toastError: (text = '') => setState({ toast: [text, 'error'] }),
			toastInfo: (text = '') => setState({ toast: [text, 'info'] }),
		});
	}, [i18n]); // eslint-disable-line

	return (
		// https://v5.reactrouter.com/web/api/MemoryRouter
		<MemoryRouter initialEntries={initialEntries}>
			<Routes>
				<Route path="/" element={<Start />} />
				<Route path="/create" element={<Create />} />
				<Route path="/create2" element={<Create2 />} />
				<Route path="/import" element={<Import />} />
				<Route path="/home" element={<Home />} />
				<Route path="/my-transactions" element={<MyTransactions />} />
				<Route path="/settings" element={<Settings />} />
				<Route path="/lock" element={<Lock />} />
				<Route path="/connect" element={<Connect />} />
				<Route path="/sign-tx" element={<SignTx />} />
				<Route path="*" element={<Navigate to="/" />} />
			</Routes>
			<Toast />
		</MemoryRouter>
	);
};

export default connect(Router);
