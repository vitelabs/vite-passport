import { MemoryRouter, Route, Routes, Navigate } from 'react-router-dom';
import Start from '../pages/Start';
import { connect } from '../utils/global-context';
import { useCallback, useEffect, useMemo } from 'react';
import { NewAccountBlock, State, ViteBalanceInfo } from '../utils/types';
import WS_RPC from '@vite/vitejs-ws';
import HTTP_RPC from '@vite/vitejs-http';
import { copyToClipboardAsync } from '../utils/strings';
import Toast from '../containers/Toast';
import Create from '../pages/Create';
import Create2 from '../pages/Create2';
import Import from '../pages/Import';
import Home from '../pages/Home';
import MyTransactions from '../pages/MyTransactions';
import Settings from '../pages/Settings';
import Lock from '../pages/Lock';
import { wallet, ViteAPI, accountBlock } from '@vite/vitejs';

// const providerTimeout = 60000;
// const providerOptions = { retryTimes: 5, retryInterval: 5000 };
// new WS_RPC(networkUrl, providerTimeout, providerOptions)

type Props = State;

const Router = ({
	setState,
	i18n,
	activeAccount,
	networkUrl,
	encryptedSecrets,
	secrets,
}: Props) => {
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

	const rpc = useMemo(
		() =>
			/^ws/.test(networkUrl)
				? new WS_RPC(networkUrl)
				: new HTTP_RPC(networkUrl),
		[networkUrl]
	);

	const viteApi = useMemo(() => {
		return new ViteAPI(rpc, () => {
			console.log('client connected');
		});
	}, [rpc]);

	useEffect(() => setState({ viteApi }), [viteApi]); // eslint-disable-line

	const updateViteBalanceInfo = useCallback(() => {
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
	}, [setState, viteApi, activeAccount]);

	useEffect(updateViteBalanceInfo, [activeAccount]); // eslint-disable-line

	useEffect(() => {
		if (activeAccount) {
			viteApi
				.subscribe('newAccountBlocksByAddr', activeAccount.address)
				.then(
					(event: {
						on: (callback: (result: NewAccountBlock) => void) => void;
					}) => {
						event.on(() => {
							// TODO: throttle updateViteBalanceInfo()
							updateViteBalanceInfo();
						});
					}
				)
				.catch((err: any) => {
					console.log(err);
					setState({ toast: [JSON.stringify(err), 'error'] });
				});
		}
		return () => viteApi.unsubscribeAll();
	}, [activeAccount, viteApi, updateViteBalanceInfo]);

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
