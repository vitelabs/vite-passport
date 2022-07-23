import { accountBlock } from '@vite/vitejs';
import AccountBlockClass from '@vite/vitejs/distSrc/accountBlock/accountBlock';
import { AccountBlockBlock } from '@vite/vitejs/distSrc/accountBlock/type';
import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import TransactionModal from '../components/TransactionModal';
import TransactionInfo from '../containers/TransactionInfo';
import { connect } from '../utils/global-context';
import { getTokenApiInfo } from '../utils/misc';
import { State, TokenApiInfo } from '../utils/types';

const SignTx = ({
	viteApi,
	toastError,
	activeAccount,
	viteBalanceInfo,
	i18n,
	postPortMessage,
}: State) => {
	const [searchParams] = useSearchParams();
	const [sendingTx, sendingTxSet] = useState(false);
	const [error, errorSet] = useState('');
	const [sentBlock, sentBlockSet] = useState<undefined | AccountBlockBlock>();
	const [tokenApiInfo, tokenApiInfoSet] = useState<undefined | null | TokenApiInfo>(undefined);
	const activeAddress = useMemo(() => activeAccount.address, [activeAccount]);
	const contractFuncParams = useMemo<undefined | any[]>(() => {
		try {
			const { params } = JSON.parse(searchParams.get('params')!);
			return params;
		} catch (error) {
			return undefined;
		}
	}, [searchParams]);
	const block = useMemo<undefined | AccountBlockClass>(() => {
		try {
			const methodName = searchParams.get('methodName');
			if (!methodName) errorSet('Invalid `methodName` argument');
			const params: { [key: string]: any } = JSON.parse(searchParams.get('params')!);
			if (!params) errorSet('Invalid `params` argument');
			if (!!params.address && params.address !== activeAddress) {
				errorSet(`Block address does not match wallet's active address`);
			}
			params.address = activeAddress;
			const block: AccountBlockClass = accountBlock.createAccountBlock(methodName!, params);
			console.log('params:', params);
			console.log('block:', block);
			return block;
		} catch (error) {
			console.log('error:', error);
			errorSet(JSON.stringify(error));
		}
	}, [searchParams, activeAddress]);
	const balanceInfoMap = useMemo(
		() => (viteBalanceInfo ? viteBalanceInfo?.balance?.balanceInfoMap || {} : undefined),
		[viteBalanceInfo]
	);
	const insufficientFunds = useMemo(() => {
		return !block || !balanceInfoMap
			? false
			: +balanceInfoMap?.[block.tokenId!].balance < +(block.amount || 0);
	}, [balanceInfoMap, block]);
	useEffect(() => {
		if (block?.tokenId) {
			getTokenApiInfo(block.tokenId).then((info) => {
				if (info.length === 1) {
					tokenApiInfoSet(info[0]);
				} else {
					tokenApiInfoSet(null);
					errorSet('Invalid tokenId');
				}
			});
		}
	}, [block]);

	return tokenApiInfo === null || error ? (
		<div className="h-screen xy">
			<p className="text-center">{error}</p>
		</div>
	) : !block || tokenApiInfo === undefined ? (
		<div className="h-screen xy">
			<p className="text-center">{i18n.loading}...</p>
		</div>
	) : (
		<div className="flex-1 p-4 space-y-2 overflow-scroll bg-skin-base">
			<TransactionInfo {...block} contractFuncParams={contractFuncParams} />
			<button
				disabled={insufficientFunds || sendingTx}
				className="mt-2 round-solid-button"
				onClick={async () => {
					try {
						sendingTxSet(true);
						block.setProvider(viteApi);
						block.setPrivateKey(activeAccount.privateKey);
						await block.autoSetPreviousAccountBlock();
						const res: AccountBlockBlock = await block.autoSendByPoW();
						const sanitizedBlock = {
							// Don't want to send `block: res` in case the type of `res` changes and includes `privateKey`
							// This ensures the private key is never sent to the content script
							blockType: res.blockType,
							address: res.address,
							fee: res.fee,
							data: res.data,
							sendBlockHash: res.sendBlockHash,
							toAddress: res.toAddress,
							tokenId: res.tokenId,
							amount: res.amount,
							height: res.height,
							previousHash: res.previousHash,
							difficulty: res.difficulty,
							nonce: res.nonce,
							signature: res.signature,
							publicKey: res.publicKey,
							hash: res.hash,
						};
						postPortMessage({
							type: 'writeAccountBlock',
							block: sanitizedBlock,
						});
						sentBlockSet(sanitizedBlock);
						console.log('sanitizedBlock:', sanitizedBlock);
						// window.close();
					} catch (e) {
						sendingTxSet(false);
						toastError(JSON.stringify(e));
						// let err = {
						// 	jsonrpc: '2.0',
						// 	id: 12,
						// 	error: {
						// 		code: -32002,
						// 		message: 'chain forked',
						// 	},
						// };
					}
				}}
			>
				{i18n.signAndSendBlock}
			</button>
			<TransactionModal
				transaction={sentBlock}
				contractFuncParams={contractFuncParams}
				onClose={() => {
					// TODO: Make this look nicer when the tx is sent
				}}
			/>
		</div>
	);
};

export default connect(SignTx);
