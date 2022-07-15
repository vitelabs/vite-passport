import { MemoryRouter, Route, Routes, Navigate } from 'react-router-dom';
import Start from '../pages/Start';
import { connect } from '../utils/global-context';
import { useCallback, useEffect, useMemo } from 'react';
import { NewAccountBlock, State, ViteBalanceInfo } from '../utils/types';
import WS_RPC from '@vite/vitejs-ws';
import HTTP_RPC from '@vite/vitejs-http';
import { copyToClipboardAsync, parseQueryString, toQueryString } from '../utils/strings';
import Toast from '../containers/Toast';
import Create from '../pages/Create';
import Create2 from '../pages/Create2';
import Import from '../pages/Import';
import Home from '../pages/Home';
import MyTransactions from '../pages/MyTransactions';
import Settings from '../pages/Settings';
import Lock from '../pages/Lock';
import Connect from '../pages/Connect';
import SignTx from '../pages/SignTx';
import { ViteAPI, accountBlock } from '@vite/vitejs';

// const providerTimeout = 60000;
// const providerOptions = { retryTimes: 5, retryInterval: 5000 };
// new WS_RPC(networkUrl, providerTimeout, providerOptions)

type Props = State;

const getVitePrice = async () => {
	const res = await fetch(
		'https://api.coingecko.com/api/v3/simple/price?ids=vite&vs_currencies=usd'
	);
	const {
		vite: { usd },
	} = await res.json();
	// console.log('usd:', typeof usd, usd);
	return usd;
};

const Router = ({
	setState,
	i18n,
	activeAccount,
	networkUrl,
	encryptedSecrets,
	secrets,
	toastInfo,
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
				return ['/home'];
			} else {
				return ['/lock'];
			}
		}
		return ['/'];
	}, []); // eslint-disable-line

	const rpc = useMemo(
		() => (/^ws/.test(networkUrl) ? new WS_RPC(networkUrl) : new HTTP_RPC(networkUrl)),
		[networkUrl]
	);

	const viteApi = useMemo(() => {
		return new ViteAPI(rpc, () => {
			console.log('client connected');
		});
	}, [rpc]);

	useEffect(() => setState({ viteApi }), [viteApi]); // eslint-disable-line

	useEffect(() => {
		getVitePrice().then((usd) => {
			setState({ vitePrice: usd });
		});
	}, []); // eslint-disable-line

	const updateViteBalanceInfo = useCallback(() => {
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
		if (activeAccount) {
			viteApi
				.getBalanceInfo(activeAccount.address)
				// @ts-ignore getBalanceInfo needs a more descriptive return type
				.then((res: ViteBalanceInfo) => {
					console.log('res:', res);
					setState({ viteBalanceInfo: res });
					if (res.unreceived.blockCount !== '0') {
						const receiveTask = new accountBlock.ReceiveAccountBlockTask({
							address: activeAccount.address,
							privateKey: activeAccount.privateKey,
							provider: viteApi,
						});
						receiveTask.start();
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

	useEffect(updateViteBalanceInfo, [activeAccount, networkUrl]); // eslint-disable-line

	useEffect(() => {
		if (activeAccount) {
			viteApi
				// https://docs.vite.org/vite-docs/api/rpc/subscribe_v2.html#newaccountblockbyaddress
				// .subscribe('newAccountBlockByAddress', activeAccount.address)
				.subscribe('newUnreceivedBlockByAddress', activeAccount.address)
				.then((event: { on: (callback: (result: NewAccountBlock) => void) => void }) => {
					event.on((e) => {
						console.log('e:', e);
						toastInfo(i18n.newUnreceivedAccountBlock);
						// TODO: throttle updateViteBalanceInfo()
						updateViteBalanceInfo();
					});
				})
				.catch((err: any) => {
					console.log(err);
					setState({ toast: [JSON.stringify(err), 'error'] });
				});
		}
		return () => viteApi.unsubscribeAll();
	}, [activeAccount, toastInfo, viteApi, updateViteBalanceInfo]); // eslint-disable-line

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
		<MemoryRouter initialEntries={initialEntries} initialIndex={0}>
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
