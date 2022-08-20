import { accountBlock } from '@vite/vitejs';
import AccountBlockClass from '@vite/vitejs/distSrc/accountBlock/accountBlock';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Spinner from '../components/Spinner';
import TransactionModal from '../components/TransactionModal';
import { connect } from '../utils/global-context';
import { State } from '../utils/types';

const SignTx = ({ activeAccount, viteBalanceInfo, i18n }: State) => {
	const [searchParams] = useSearchParams();
	const [error, errorSet] = useState('');
	const [showTxModal, showTxModalSet] = useState(false);

	const block = useMemo<undefined | AccountBlockClass>(() => {
		const activeAddress = activeAccount.address;
		try {
			const methodName = searchParams.get('methodName');
			if (!methodName) errorSet('Invalid `methodName` argument');
			const params: { [key: string]: any } = JSON.parse(searchParams.get('params')!);
			if (!params) errorSet('Invalid `params` argument');
			if (!!params.address && params.address !== activeAddress) {
				errorSet(`Block address does not match wallet's active address`);
			}
			params.address = activeAddress;
			return accountBlock.createAccountBlock(methodName!, params);
		} catch (error) {
			console.log('error:', error);
			errorSet(JSON.stringify(error));
		}
	}, []); // eslint-disable-line

	useEffect(() => {
		if (viteBalanceInfo) {
			const balanceInfoMap = viteBalanceInfo?.balance?.balanceInfoMap || {};
			if (block?.tokenId && balanceInfoMap) {
				const balance = balanceInfoMap?.[block.tokenId]?.balance || '0';
				if (+balance < +(block.amount || 0)) {
					errorSet(i18n.insufficientFunds);
				} else {
					showTxModalSet(true);
				}
			}
		}
	}, [viteBalanceInfo, block, i18n]);

	// TODO: make this look nicer
	return error ? (
		<div className="h-screen xy">
			<p className="text-center">{error}</p>
		</div>
	) : !showTxModal ? (
		<div className="h-screen xy">
			<Spinner />
		</div>
	) : (
		<TransactionModal noBackArrow onCancel={() => window.close()} unsentBlock={block} />
	);
};

export default connect(SignTx);
