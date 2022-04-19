import { MemoryRouter, Route, Routes, Navigate } from 'react-router-dom';
import Start from '../pages/Start';
import { connect } from '../utils/global-context';
import { useCallback, useEffect } from 'react';
import { NewAccountBlock, State, ToastTypes, TokenInfo } from '../utils/types';
import { getBalanceInfo, subscribe } from '../utils/vitescripts';
import { copyToClipboardAsync, toBiggestUnit } from '../utils/strings';
import Toast from '../containers/Toast';
import Create from '../pages/Create';
import Create2 from '../pages/Create2';
import Import from '../pages/Import';
import Home from '../pages/Home';
import MyTransactions from '../pages/MyTransactions';
import Settings from '../pages/Settings';

type Props = State;

const Router = ({ setState, i18n, language, currentAddress, networkType }: Props) => {
	useEffect(() => {
		// TODO: Does this need to be JSON files?
		import(`../i18n/${language}.json`).then((translation) => {
			setState({ i18n: translation });
		});
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
	//         setState({ balances: balanceUpdates }, { deepMerge: true });
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

	return (
		// https://v5.reactrouter.com/web/api/MemoryRouter
		// <MemoryRouter initialEntries={['/', '/create', '/create2']}>
		// <MemoryRouter initialEntries={['/home']}>
		<MemoryRouter initialEntries={['/']}>
			<Routes>
				<Route path="/" element={<Start />} />
				<Route path="/create" element={<Create />} />
				<Route path="/create2" element={<Create2 />} />
				<Route path="/import" element={<Import />} />
				<Route path="/home" element={<Home />} />
				<Route path="/my-transactions" element={<MyTransactions />} />
				<Route path="/settings" element={<Settings />} />
				<Route path="*" element={<Navigate to="/" />} />
			</Routes>
			<Toast />
		</MemoryRouter>
	);
};

export default connect(Router);
