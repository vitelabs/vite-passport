import { MemoryRouter, Route, Routes, Navigate } from 'react-router-dom';
import Start from '../pages/Start';
import PageContainer from './PageContainer';
import { connect } from '../utils/global-context';
import { useCallback, useEffect } from 'react';
import { NewAccountBlock, State, ToastTypes, TokenInfo } from '../utils/types';
import { getBalanceInfo, subscribe } from '../utils/vitescripts';
import { copyToClipboardAsync, toBiggestUnit } from '../utils/strings';
import Create from '../pages/Create';
import Create2 from '../pages/Create2';
import Import from '../pages/Import';
import Toast from '../containers/Toast';

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
			copyWithToast: (text = '', type: ToastTypes = 'success') => {
				copyToClipboardAsync(text);
				setState({ toast: [i18n.successfullyCopied, type] });
			},
		});
	}, [i18n]);

	return (
		// https://v5.reactrouter.com/web/api/MemoryRouter
		// <MemoryRouter initialEntries={['/create']}>
		<MemoryRouter initialEntries={['/create2']}>
			<Routes>
				<Route path="/" element={<Start />} />
				<Route path="/create" element={<Create />} />
				<Route path="/create2" element={<Create2 />} />
				<Route path="/import" element={<Import />} />
				<Route path="*" element={<Navigate to="/" />} />
			</Routes>
			<Toast />
		</MemoryRouter>
	);
};

export default connect(Router);
