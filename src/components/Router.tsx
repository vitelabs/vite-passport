import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import Start from '../pages/Start';
import PageContainer from './PageContainer';
import { connect } from '../utils/global-context';
import { useCallback, useEffect } from 'react';
import { NewAccountBlock, State, TokenInfo } from '../utils/types';
import { getBalanceInfo, subscribe } from '../utils/vitescripts';
import { copyToClipboardAsync, toBiggestUnit } from '../utils/strings';
import Create from '../pages/Create';
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
			copyWithToast: (text = '') => {
				copyToClipboardAsync(text);
				setState({ toast: i18n.successfullyCopied });
			},
		});
	}, [i18n]);

	return (
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<Start />} />
				<Route path="/create" element={<Create />} />
				{/* <Route path="/import" element={<Start />} /> */}
				<Route path="*" element={<Navigate to="/" />} />
			</Routes>
			<Toast />
		</BrowserRouter>
	);
};

export default connect(Router);
