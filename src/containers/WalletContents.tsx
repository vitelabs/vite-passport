import React, { useMemo, useRef, useState, useCallback } from 'react';
import { connect } from '../utils/global-context';
import { State, TokenApiInfo } from '../utils/types';
import FetchWidget from './FetchWidget';
import TransactionModal from '../components/TransactionModal';
import { AccountBlockBlock } from '@vite/vitejs/distSrc/utils/type';
// import { Transaction } from '@vite/vitejs/distSrc/accountBlock/type';
import { defaultTokenList } from '../utils/constants';
import { getTokenApiInfo } from '../utils/misc';
import { calculatePrice, debounce, validateInputs } from '../utils/misc';
import {
	addIndexToTokenSymbol,
	shortenTti,
	toBiggestUnit,
	toQueryString,
	toSmallestUnit,
} from '../utils/strings';
import TextInput, { useTextInputRef } from './TextInput';
import { accountBlock, wallet } from '@vite/vitejs';
import Checkbox from '../components/Checkbox';
import QR from '../components/QR';
import TransactionList from './TransactionList';
import Modal from '../components/Modal';
import { DocumentDuplicateIcon } from '@heroicons/react/outline';
import { setValue } from '../utils/storage';
import AccountBlockClass from '@vite/vitejs/distSrc/accountBlock/accountBlock';
import DeterministicIcon from '../components/DeterministicIcon';
import { Transaction } from '@vite/vitejs/distSrc/accountBlock/type';
import Button from '../components/Button';
import TokenCard from './TokenCard';
import SendTxFlow from './SendTxFlow';

const searchTokenApiInfo = debounce((query: string, callback: (list: TokenApiInfo[]) => void) => {
	return fetch(`https://vitex.vite.net/api/v1/cryptocurrency/info/search?fuzzy=${query}`)
		.then((res) => res.json())
		.then((data: { data: { VITE: TokenApiInfo[] } }) => {
			// console.log('data:', data);
			callback(data?.data?.VITE || []);
		});
}, 300);

type Props = State;

const WalletContents = ({
	i18n,
	toastError,
	viteBalanceInfo,
	displayedTokenIds,
	viteApi,
	vitePrice,
	copyWithToast,
	activeAccount,
	contacts,
	setState,
	transactionHistory,
}: Props) => {
	const amountRef = useTextInputRef();
	const commentRef = useTextInputRef();
	const [tokenQuery, tokenQuerySet] = useState('');
	const [checkedTokens, checkedTokensSet] = useState<{
		[tti: string]: boolean;
	}>({});
	const [selectedToken, selectedTokenSet] = useState<undefined | TokenApiInfo>();
	const [editingTokenList, editingTokenListSet] = useState(false);
	const [receivingFunds, receivingFundsSet] = useState(false);
	const [sendingFunds, sendingFundsSet] = useState(false);
	const [amount, amountSet] = useState('');
	// const [comment, commentSet] = useState('');
	const [comment, commentSet] = useState('test');
	const [displayedTokens, displayedTokensSet] = useState<undefined | TokenApiInfo[]>();
	const [availableTokens, availableTokensSet] = useState<undefined | TokenApiInfo[]>();
	const activeAddress = useMemo(() => activeAccount.address, [activeAccount]);
	const getPromise = useCallback(() => {
		return getTokenApiInfo(displayedTokenIds);
	}, [displayedTokenIds]);
	const onResolve = useCallback((list: TokenApiInfo[]) => {
		displayedTokensSet(
			list.sort((a, b) =>
				a.symbol === 'VITE' ? -1 : b.symbol === 'VITE' ? 1 : a.symbol < b.symbol ? -1 : 1
			)
		);
		// selectedTokenSet(list[0]);
	}, []);

	return (
		<>
			<FetchWidget
				shouldFetch={
					!displayedTokens ||
					displayedTokens.length !== displayedTokenIds.length ||
					!displayedTokens.every((token) => displayedTokenIds.includes(token.tokenAddress)) // used `includes` instead of just checking index cuz getTokenApiInfo API doesn't return token info in order of displayedTokenIds
				}
				getPromise={getPromise}
				onResolve={onResolve}
			>
				{!displayedTokens ? (
					<p className="text-center text-skin-secondary">{i18n.loading}...</p>
				) : (
					<>
						{!displayedTokens.length ? (
							<p className="text-center text-skin-secondary">{i18n.yourWalletIsEmpty}</p>
						) : (
							displayedTokens.map((tokenApiInfo) => (
								<TokenCard
									{...tokenApiInfo}
									key={tokenApiInfo.tokenAddress}
									onClick={() => selectedTokenSet(tokenApiInfo)}
								/>
							))
						)}
						<button
							className="mx-auto block text-skin-highlight brightness-button leading-3"
							onClick={() => {
								const checkedTokens: { [tti: string]: boolean } = {};
								displayedTokenIds.forEach((tti) => {
									checkedTokens[tti] = true;
								});
								checkedTokensSet(checkedTokens);
								availableTokensSet([
									...displayedTokens!,
									...defaultTokenList.filter(({ tokenAddress }) => !checkedTokens[tokenAddress]),
								]);
								editingTokenListSet(true);
							}}
						>
							{i18n.editTokenList}
						</button>
					</>
				)}
			</FetchWidget>
			{editingTokenList && (
				<Modal
					fullscreen
					heading={i18n.editTokenList}
					onClose={() => {
						editingTokenListSet(false);
						tokenQuerySet('');
					}}
					className="flex flex-col"
				>
					<input
						placeholder={i18n.searchTokensBySymbolOrTti}
						value={tokenQuery}
						className="p-2 shadow z-10 w-full bg-skin-middleground"
						onChange={(e) => {
							tokenQuerySet(e.target.value);
							if (availableTokens !== null) {
								availableTokensSet(undefined);
							}
							if (!e.target.value) {
								availableTokensSet([
									...displayedTokens!,
									...defaultTokenList.filter(({ tokenAddress }) => !checkedTokens[tokenAddress]),
								]);
								return;
							}
							searchTokenApiInfo(e.target.value, (list: TokenApiInfo[]) => {
								// console.log('list:', list);
								availableTokensSet(list);
							});
						}}
					/>
					<div className="flex-1 overflow-scroll">
						{!availableTokens ? (
							<div className="xy min-h-8">
								<p className="text-skin-secondary text-center">{i18n.loading}...</p>
							</div>
						) : !availableTokens.length ? (
							<div className="xy min-h-8">
								<p className="text-skin-secondary text-center">{i18n.nothingFound}</p>
							</div>
						) : (
							availableTokens.map((tokenApiInfo, i) => {
								const {
									symbol,
									// name,
									tokenAddress: tti,
									tokenIndex,
									icon,
									// decimal,
									// gatewayInfo,
								} = tokenApiInfo;
								// newlyAddedTokens
								const tokenName = addIndexToTokenSymbol(symbol, tokenIndex);
								return (
									<React.Fragment key={tti}>
										{i === displayedTokenIds.length && (
											<div className="h-0.5 bg-skin-eye-icon mt-2"></div>
										)}
										<div className="fx rounded-sm py-1 px-2 bg-skin-middleground">
											{!icon ? (
												<DeterministicIcon tti={tti} className="h-8 w-8 rounded-full mr-2" />
											) : (
												<img
													src={icon}
													alt={tokenName}
													className="h-8 w-8 rounded-full mr-2 overflow-hidden bg-gradient-to-tr from-skin-eye-icon to-skin-bg-base"
												/>
											)}
											<div className="flex-1 fx">
												<div className="flex flex-col flex-1 items-start">
													<p className="text-lg">{tokenName}</p>
													<button className="group fx" onClick={() => copyWithToast(tti)}>
														<p className="text-xs text-skin-secondary">{shortenTti(tti)}</p>
														<DocumentDuplicateIcon className="ml-1 w-4 text-skin-secondary opacity-0 duration-200 group-hover:opacity-100" />
													</button>
												</div>
												<Checkbox
													value={checkedTokens[tti]}
													onUserInput={(checked) => {
														checkedTokens[tti] = checked;
														checkedTokensSet({ ...checkedTokens });
													}}
												/>
											</div>
										</div>
									</React.Fragment>
								);
							})
						)}
					</div>
					<div className="flex gap-2 p-2 shadow z-50">
						<Button theme="white" label={i18n.cancel} onClick={() => editingTokenListSet(false)} />
						<Button
							theme="highlight"
							label={i18n.confirm}
							onClick={() => {
								const data = {
									displayedTokenIds: Object.entries(checkedTokens)
										.filter(([, checked]) => checked)
										.map(([tti]) => tti),
								};
								setState(data);
								setValue(data);
								editingTokenListSet(false);
							}}
						/>
					</div>
				</Modal>
			)}
			{selectedToken && (
				<Modal
					fullscreen
					onClose={() => selectedTokenSet(undefined)}
					className="flex flex-col flex-1"
					heading={addIndexToTokenSymbol(selectedToken.symbol, selectedToken.tokenIndex)}
					subheading={selectedToken.tokenAddress}
				>
					<div className="flex-1">
						<TransactionList tti={selectedToken.tokenAddress} />
					</div>
					<div className="fx p-4 gap-4 shadow">
						<Button theme="white" onClick={() => sendingFundsSet(true)} label={i18n.send} />
						<Button
							theme="highlight"
							onClick={() => receivingFundsSet(true)}
							label={i18n.receive}
						/>
					</div>
				</Modal>
			)}
			{receivingFunds && (
				<Modal
					onClose={() => receivingFundsSet(false)}
					className="flex flex-col"
					heading={`${i18n.receive} ${selectedToken?.symbol}`}
					subheading={selectedToken?.tokenAddress}
				>
					{!!selectedToken && (
						<div className="flex-1 p-2 space-y-2 overflow-scroll bg-skin-base">
							{/* https://docs.vite.org/vite-docs/vep/vep-6.html */}
							<QR
								data={`vite:${activeAddress}${toQueryString({
									amount,
									tti: selectedToken.tokenAddress,
									data: btoa(comment).replace(/=+$/, ''),
								})}`}
							/>
							<TextInput
								optional
								numeric
								_ref={amountRef}
								label="Amount"
								value={amount}
								onUserInput={(v) => amountSet(v)}
							/>
							<TextInput
								optional
								textarea
								_ref={commentRef}
								label="Comment"
								value={comment}
								onUserInput={(v) => commentSet(v)}
							/>
						</div>
					)}
				</Modal>
			)}
			{sendingFunds && (
				<SendTxFlow selectedToken={selectedToken!} onClose={() => sendingFundsSet(false)} />
			)}
		</>
	);
};

export default connect(WalletContents);
