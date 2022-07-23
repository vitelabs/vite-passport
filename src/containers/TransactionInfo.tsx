import { ExternalLinkIcon } from '@heroicons/react/solid';
import { AccountBlockBlock } from '@vite/vitejs/distSrc/utils/type';
import React, { useEffect, useMemo, useState } from 'react';
import A from '../components/A';
import DeterministicIcon from '../components/DeterministicIcon';
import { connect } from '../utils/global-context';
import { getTokenApiInfo } from '../utils/misc';
import { addIndexToTokenSymbol, toBiggestUnit } from '../utils/strings';
import { State, TokenApiInfo } from '../utils/types';

type Props = State &
	AccountBlockBlock & {
		contractFuncParams?: any[];
		_toAddress?: string;
	};

const TransactionInfo = ({
	i18n,
	viteBalanceInfo,
	contacts,
	contractFuncParams,
	activeNetwork,
	// Below are AccountBlockBlock params
	address,
	amount,
	blockType,
	data,
	difficulty,
	fee,
	hash,
	height,
	nonce,
	previousHash,
	publicKey,
	sendBlockHash,
	signature,
	_toAddress,
	// accountBlock.createAccountBlock returns a block with _toAddress instead of toAddress idk y
	toAddress = _toAddress,
	tokenId,
}: Props) => {
	const [tokenApiInfo, tokenApiInfoSet] = useState<undefined | TokenApiInfo>();
	useEffect(() => {
		(async () => {
			if (tokenId) {
				const info = await getTokenApiInfo(tokenId);
				if (info.length === 1) {
					tokenApiInfoSet(info[0]);
				}
			}
		})();
	}, [tokenId]);
	const balanceInfoMap = useMemo(
		() => (viteBalanceInfo ? viteBalanceInfo?.balance?.balanceInfoMap || {} : undefined),
		[viteBalanceInfo]
	);
	const tokenName = useMemo(
		() =>
			!tokenApiInfo ? '' : addIndexToTokenSymbol(tokenApiInfo.symbol, tokenApiInfo.tokenIndex),
		[tokenApiInfo]
	);
	const selectedTokenBalance = useMemo(() => {
		if (balanceInfoMap && tokenApiInfo && tokenId) {
			const balance = balanceInfoMap?.[tokenId]?.balance;
			return balance ? toBiggestUnit(balance, tokenApiInfo.decimal) : '0';
		}
		return null;
	}, [balanceInfoMap, tokenApiInfo, tokenId]);

	return (
		<div className="flex flex-col gap-2 p-2">
			<div className="">
				<p className="text-xl">
					{
						{
							1: i18n.contractCreation, // request(create contract)
							2: i18n.send, // request(transfer)
							3: i18n.reissueToken, // request(re-issue token)
							4: i18n.receive, // response
							5: i18n.failedResponse, // response(failed)
							6: i18n.contractRefund, // request(refund by contract)
							7: i18n.genesis, // response(genesis)
						}[blockType]
					}
				</p>
			</div>
			{!!+(amount || 0) && !tokenApiInfo ? (
				<p className="">...</p>
			) : (
				<div className="">
					<div className="fx">
						{!tokenApiInfo?.icon ? (
							<DeterministicIcon tti={tokenId!} className="h-10 w-10 rounded-full mr-2" />
						) : (
							<img
								src={tokenApiInfo?.icon}
								// alt={tokenApiInfo.symbol}
								alt={tokenName}
								className="h-10 w-10 rounded-full mr-2 overflow-hidden bg-gradient-to-tr from-skin-alt to-skin-bg-base"
							/>
						)}
						<p className="">{tokenName}</p>
					</div>
					<p className="">{tokenId}</p>
					<p className="leading-5 text-skin-secondary">{i18n.amount}</p>
					<p>{toBiggestUnit(amount!, tokenApiInfo?.decimal)}</p>
					{!hash && (
						<>
							<p className="leading-5 text-skin-secondary">{i18n.balance}</p>
							<p className="">{selectedTokenBalance || '...'}</p>
						</>
					)}
					{/* {insufficientFunds && <p className="text-sm text-red-500">{i18n.insufficientFunds}</p>} */}
				</div>
			)}
			{contractFuncParams && (
				<div className="">
					<p className="leading-5 text-skin-secondary">{i18n.params}</p>
					<p className="break-words">{JSON.stringify(contractFuncParams, null, 2)}</p>

					{/* {contractFuncParams.map((param, i) => (
						<p key={i}>
							{i}. {param}
						</p>
					))} */}
				</div>
			)}
			<div className="">
				<p className="leading-5 text-skin-secondary">{i18n.from}</p>
				<p className="break-words">{contacts[address]}</p>
				<p className="break-words">{address}</p>
			</div>
			{toAddress && (
				<div className="">
					<p className="leading-5 text-skin-secondary">{i18n.to}</p>
					{contacts[toAddress] && <p className="break-words">{contacts[toAddress]}</p>}
					<p className="break-words">{toAddress}</p>
				</div>
			)}
			{[
				[i18n.data, data],
				[i18n.difficulty, difficulty],
				[i18n.fee, fee],
				[i18n.hash, hash],
				[i18n.height, height],
				[i18n.nonce, nonce],
				[i18n.previousHash, previousHash],
				[i18n.publicKey, publicKey],
				[i18n.sendBlockHash, sendBlockHash],
				[i18n.signature, signature],
			].map(([key, value]) => {
				return !value ? null : (
					<div className="" key={key}>
						<p className="leading-5 text-skin-secondary">{key}</p>
						<p className="break-words">{value}</p>
					</div>
				);
			})}
			{hash && (
				<A
					className="fx brightness-button mr-auto"
					// OPTIMIZE: Make this URL more flexible for different network URLs
					href={`${activeNetwork.explorerUrl}/tx/${hash}`}
				>
					<p className="text-left text-skin-secondary">{i18n.viewOnViteScan}</p>
					<ExternalLinkIcon className="w-6 ml-1 mr-2 text-skin-secondary" />
				</A>
			)}
		</div>
	);
};

export default connect(TransactionInfo);
