import { MemoryRouter, Route, Routes, Navigate } from 'react-router-dom';
import Start from '../pages/Start';
import { connect } from '../utils/global-context';
import { useCallback, useEffect, useState } from 'react';
import { NewAccountBlock, PortMessage, State, ToastTypes, TokenInfo } from '../utils/types';
import { getBalanceInfo, subscribe } from '../utils/vitescripts';
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

type Props = State;

const Router = ({ setState, i18n, language, chromePort, postPortMessage, currentAddress, networkType }: Props) => {
	const [initialEntries, initialEntriesSet] = useState<string[]>();
	useEffect(() => {
		// This is just here to enable the onDisconnect listener in background.ts
		const listen = (message: PortMessage) => {
			if (message.type === 'opening') {
				getValue(['encryptedSecrets'])
					.then((value) => {
						if (value.encryptedSecrets) {
							if (message.password) {
								decrypt(value.encryptedSecrets, message.password).then((secrets) => {
									setState({ secrets: JSON.parse(secrets) });
									initialEntriesSet(['/home']);
								});
								postPortMessage({ type: 'unlock' });
							} else {
								initialEntriesSet(['/lock']);
							}
						} else {
							initialEntriesSet(['/']);
						}
					})
					.catch((e) => {
						console.log('e:', e);
					});

				chromePort.onMessage.removeListener(listen);
			}
		};
		chromePort.onMessage.addListener(listen);
	}, []);

	useEffect(() => {
		setState({ i18n: { en }[language] });
	}, [language]);

	// const updateBalances = useCallback(() => {
	//   getBalanceInfo(currentAddress)
	//     // @ts-ignore
	//     .then((res: { balance: { balanceInfoMap: object } }) => {
	//       if (res.balance.balanceInfoMap) {
	//         const balanceUpdates = {};
	//         console.log(
	//           "res.balance.balanceInfoMap:",
	//           res.balance.balanceInfoMap
	//         );
	//         Object.entries(res.balance.balanceInfoMap).forEach(
	//           ([tti, { balance, tokenInfo }]) => {
	//             // @ts-ignore
	//             balanceUpdates[tti] = toBiggestUnit(balance, ...tokenInfo);
	//           }
	//         );
	//         setState({ balances: balanceUpdates });
	//       }
	//     })
	//     .catch((e) => {
	//       console.log(e);
	//       // setState({ toast: e.toString(), currentAddress: null });
	//       // localStorage.removeItem(VCSessionKey);
	//       // Sometimes on page load, this will catch with
	//       // Error: CONNECTION ERROR: Couldn't connect to node wss://buidl.vite.net/gvite/ws.
	//     });
	// }, [setState, currentAddress, networkType]);

	// useEffect(() => {
	//   updateBalances();
	// }, [currentAddress]); // eslint-disable-line

	// useEffect(() => {
	//   if (currentAddress) {
	//     // updateBalances();
	//     subscribe("newAccountBlocksByAddr", currentAddress)
	//       .then((event: any) => {
	//         event.on((result: NewAccountBlock) => {
	//           // NOTE: seems like a hack, I don't even need the block info
	//           updateBalances();
	//         });
	//       })
	//       .catch((err: any) => {
	//         console.warn(err);
	//       });
	//   }
	// }, [setState, currentAddress, updateBalances]);

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

	return !initialEntries ? null : (
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
