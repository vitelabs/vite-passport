import { MemoryRouter, Route, Routes, Navigate } from 'react-router-dom';
import Start from '../pages/Start';
import { connect } from '../utils/global-context';
import { useCallback, useEffect, useMemo } from 'react';
import { NewAccountBlock, State } from '../utils/types';
// @ts-ignore
import WS_RPC from '@vite/vitejs-ws';
import { copyToClipboardAsync } from '../utils/strings';
import Toast from '../containers/Toast';
import Create from '../pages/Create';
import Create2 from '../pages/Create2';
import Import from '../pages/Import';
import Home from '../pages/Home';
import MyTransactions from '../pages/MyTransactions';
import Settings from '../pages/Settings';
import Lock from '../pages/Lock';
import { wallet, ViteAPI } from '@vite/vitejs';

const providerWsURLs = {
	mainnet: 'wss://node.vite.net/gvite/ws', // or 'wss://node-tokyo.vite.net/ws'
	testnet: 'wss://buidl.vite.net/gvite/ws',
	localnet: 'ws://localhost:23457',
};
const providerTimeout = 60000;
const providerOptions = { retryTimes: 10, retryInterval: 5000 };

type Props = State;

const Router = ({ setState, i18n, activeAccountIndex, networkType, encryptedSecrets, secrets }: Props) => {
	const initialEntries = useMemo(() => {
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
		if (secrets) {
			return wallet.deriveAddress({ ...secrets, index: activeAccountIndex || 0 }).address;
		}
	}, [secrets, activeAccountIndex]);

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
				.then((event: { on: (callback: (result: NewAccountBlock) => void) => void }) => {
					event.on(() => {
						// NOTE: seems like a hack cuz I don't even need the block info
						updateViteBalanceInfo();
					});
				})
				.catch((err: any) => console.warn(err));
		}
		return () => viteApi.unsubscribeAll();
	}, [subscribe, activeAddress, viteApi, updateViteBalanceInfo]);

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
				<Route path="*" element={<Navigate to="/" />} />
			</Routes>
			<Toast />
		</MemoryRouter>
	);
};

export default connect(Router);
