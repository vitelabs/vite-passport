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
import { State, UnreceivedBlockMessage, ViteBalanceInfo } from '../utils/types';

// const providerTimeout = 60000;
// const providerOptions = { retryTimes: 5, retryInterval: 5000 };
// new WS_RPC(networkRpcUrl, providerTimeout, providerOptions)

type Props = State;

const Router = ({
	setState,
	i18n,
	activeAccount,
	encryptedSecrets,
	secrets,
	transactionHistory,
	displayedTokenIdsAndNames,
	networkList,
	activeNetworkIndex,
	currencyConversion,
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
			if (secrets && activeAccount) {
				// return ['/create'];
				return ['/home'];
				// return ['/settings'];
				// return ['/my-transactions'];
				// return ['/connect?hostname=example.com'];
			} else {
				return ['/lock'];
			}
		}
		// return ['/import'];
		return ['/'];
	}, []); // eslint-disable-line
	const networkRpcUrl = useMemo(() => {
		const activeNetwork = networkList[activeNetworkIndex];
		return activeNetwork.rpcUrl;
	}, [networkList, activeNetworkIndex]);
	const rpc = useMemo(
		() => (/^ws/.test(networkRpcUrl) ? new WS_RPC(networkRpcUrl) : new HTTP_RPC(networkRpcUrl)),
		[networkRpcUrl]
	);

	const viteApi = useMemo(() => {
		return new ViteAPI(rpc, () => {
			console.log('client connected');
		});
	}, [rpc]);

	useEffect(() => setState({ viteApi }), [setState, viteApi]);

	useEffect(() => {
		if (!currencyConversion) return;
		const ttiToNameMap: { [tti: string]: string } = {};
		fetch(
			`https://api.coingecko.com/api/v3/simple/price?ids=${displayedTokenIdsAndNames
				.map(([, name]) => name)
				.join(',')}&vs_currencies=usd`
		)
			.then((res) => res.json())
			.then(async (prices: State['prices']) => {
				const tokenIdsWithMissingPrices = displayedTokenIdsAndNames
					.filter(([tti, name]) => {
						ttiToNameMap[tti] = name;
						return !prices[name];
					})
					.map(([tti]) => tti);
				if (tokenIdsWithMissingPrices.length) {
					try {
						const res = await fetch(
							`https://api.vitex.net/api/v2/exchange-rate?tokenIds=${tokenIdsWithMissingPrices.join(
								','
							)}`
						);
						const {
							data,
						}: {
							code: number; // 0
							msg: string; // 'ok'
							data: {
								tokenId: string; // 'tti_72f4cbbed88a5902c78a896f'
								tokenSymbol: string; // 'KAS-000'
								usdRate: number; // 0.0042559459142507
								cnyRate: number; // 0.0275329909030624
								rubRate: string; // '0.3441996641185654'
								krwRate: string; // '5.2923228587407548'
								tryRate: string; // '0.0625824930042014'
								vndRate: string; // '97.7591815998849374'
								eurRate: string; // '0.0039259611477892'
								gbpRate: string; // '0.0032689282175472'
								inrRate: string; // '0.3246980517265688'
								uahRate: string; // '0.1257728925549642'
								btcRate: number; // 1.843110962e-7
							}[];
						} = await res.json();
						// console.log('data:', data);
						data.forEach(({ tokenId, usdRate }) => {
							prices[ttiToNameMap[tokenId]] = { usd: usdRate };
						});
					} catch (error) {}
				}
				setState({ prices });
			})
			.catch((e) => {
				console.log('error:', e);
				setState({ toast: [e, 'error'] });
			});
	}, [currencyConversion, displayedTokenIdsAndNames, setState]);

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
						receiveTask.start();
					}
				})
				.catch((err) => {
					console.log(err);
					setState({ toast: [err, 'error'] });
					// Sometimes on page load, this will catch with
					// Error: CONNECTION ERROR: Couldn't connect to node wss://buidl.vite.net/gvite/ws.
				});
		}
	}, [viteApi, activeAccount, setState]);

	useEffect(updateViteBalanceInfo, [activeAccount, networkRpcUrl, updateViteBalanceInfo]);

	useEffect(() => {
		if (!activeAccount) return;
		viteApi
			.subscribe('newUnreceivedBlockByAddress', activeAccount.address)
			.then((event: { on: (callback: (result: UnreceivedBlockMessage[]) => void) => void }) => {
				event.on((messages) => {
					messages.forEach((blockMessage) => {
						if (!blockMessage.received) {
							setState({ toast: [i18n.newUnreceivedAccountBlock, 'info'] });
						}
						viteApi
							.request('ledger_getAccountBlockByHash', blockMessage.hash)
							.then((sendTx: Transaction) => {
								// console.log('sendTx:', sendTx);
								const history: {
									[tti: string]: Transaction[] | undefined;
									received?: Transaction[] | undefined;
									unreceived?: Transaction[] | undefined;
								} = {};
								if (!blockMessage.received) {
									if (transactionHistory?.unreceived) {
										history.unreceived = [sendTx, ...transactionHistory.unreceived!];
										setState({ transactionHistory: history }, { deepMerge: true });
									}
								} else {
									setTimeout(() => {
										viteApi
											.request('ledger_getAccountBlockByHash', sendTx.receiveBlockHash)
											.then((receiveTx: Transaction) => {
												// console.log('receiveTx:', receiveTx);
												if (transactionHistory?.unreceived) {
													history.received = [receiveTx, ...transactionHistory.received!];
													history.unreceived = transactionHistory.unreceived!.filter(
														(unreceivedBlock) => unreceivedBlock.hash !== blockMessage.hash
													);
												}
												if (sendTx.tokenId && transactionHistory?.[sendTx.tokenId]) {
													history[sendTx.tokenId] = [
														receiveTx,
														...transactionHistory[sendTx.tokenId]!,
													];
												}
												setState({ transactionHistory: history }, { deepMerge: true });
											})
											.catch((err: any) => {
												console.log(err);
												setState({ toast: [err, 'error'] });
											});
									}, 1000); // HACK: without this timeout, the timestamp would be 0
								}
							});
						// TODO: throttle updateViteBalanceInfo()
						updateViteBalanceInfo();
					});
				});
			})
			.catch((err: any) => {
				console.log(err);
				setState({ toast: [err, 'error'] });
			});

		return () => viteApi.unsubscribeAll();
	}, [
		activeAccount,
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
	}, [i18n, setState]);

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
