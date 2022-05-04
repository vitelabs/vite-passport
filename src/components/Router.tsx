import { MemoryRouter, Route, Routes, Navigate } from 'react-router-dom';
import Start from '../pages/Start';
import { connect } from '../utils/global-context';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { NewAccountBlock, PortMessage, State, ToastTypes, TokenInfo } from '../utils/types';
// @ts-ignore
import WS_RPC from '@vite/vitejs-ws';
import { copyToClipboardAsync, toBiggestUnit } from '../utils/strings';
import Toast from '../containers/Toast';
import Create from '../pages/Create';
import Create2 from '../pages/Create2';
import Import from '../pages/Import';
import Home from '../pages/Home';
import MyTransactions from '../pages/MyTransactions';
import Settings from '../pages/Settings';
import en from '../i18n/en';
import { getValue } from '../utils/storage';
import Lock from '../pages/Lock';
import { decrypt } from '../utils/encryption';
import { wallet, ViteAPI } from '@vite/vitejs';
import { i18nDict, now } from '../main';

const providerWsURLs = {
	mainnet: 'wss://node.vite.net/gvite/ws', // or 'wss://node-tokyo.vite.net/ws'
	testnet: 'wss://buidl.vite.net/gvite/ws',
	localnet: 'ws://localhost:23457',
};
const providerTimeout = 60000;
const providerOptions = { retryTimes: 10, retryInterval: 5000 };

type Props = State;

const Router = ({
	setState,
	i18n,
	language,
	activeAccountIndex,
	networkType,
	addressList,
	encryptedSecrets,
	secrets,
}: Props) => {
	const initialEntries = useMemo(() => {
		// alert(Date.now() - now);
		if (encryptedSecrets) {
			if (secrets) {
				return ['/home'];
			} else {
				return ['/lock'];
			}
		}
		return ['/'];
	}, []); // eslint-disable-line

	const activeAddress = useMemo(() => {
		if (addressList) {
			return addressList[activeAccountIndex].address;
		}
	}, [addressList, activeAccountIndex]);

	useEffect(() => {
		if (secrets) {
			setState({
				addressList: wallet.deriveAddressList({
					mnemonics: secrets.mnemonics,
					passphrase: secrets.bip39Passphrase,
					startIndex: 0,
					endIndex: 10,
				}),
			});
		}
	}, [secrets]);

	useEffect(() => {
		setState({ i18n: i18nDict[language] });
	}, [language]);

	const rpc = useMemo(
		() =>
			new WS_RPC(
				{
					mainnet: providerWsURLs.mainnet,
					testnet: providerWsURLs.testnet,
					localnet: providerWsURLs.localnet,
				}[networkType],
				providerTimeout,
				providerOptions
			),
		[networkType]
	);

	const viteApi = useMemo(() => {
		return new ViteAPI(rpc, () => {
			console.log('client connected');
		});
	}, [rpc]);

	useEffect(() => setState({ viteApi }), [viteApi]); // eslint-disable-line

	const subscribe = useCallback(
		(event: string, ...args: any) => {
			return viteApi.subscribe(event, ...args);
		},
		[viteApi]
	);

	const updateViteBalanceInfo = useCallback(() => {
		if (activeAddress) {
			viteApi
				.getBalanceInfo(activeAddress)
				// @ts-ignore
				.then((res: ViteBalanceInfo) => {
					console.log('res:', res);
					setState({ viteBalanceInfo: res });
				})
				.catch((e) => {
					console.log(e);
					setState({ toast: [JSON.stringify(e), 'error'] });
					// Sometimes on page load, this will catch with
					// Error: CONNECTION ERROR: Couldn't connect to node wss://buidl.vite.net/gvite/ws.
				});
		}
	}, [setState, viteApi, activeAddress]);

	useEffect(updateViteBalanceInfo, [activeAddress]); // eslint-disable-line

	useEffect(() => {
		if (activeAddress) {
			subscribe('newAccountBlocksByAddr', activeAddress)
				.then((event: any) => {
					event.on((result: NewAccountBlock) => {
						// NOTE: seems like a hack cuz I don't even need the block info
						updateViteBalanceInfo();
					});
				})
				.catch((err: any) => console.warn(err));
		}
		return () => viteApi.unsubscribeAll();
	}, [setState, subscribe, activeAddress, viteApi, updateViteBalanceInfo]);

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
	}, [i18n]);

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
				<Route path="*" element={<Navigate to="/" />} />
			</Routes>
			<Toast />
		</MemoryRouter>
	);
};

export default connect(Router);
