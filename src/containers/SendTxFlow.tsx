import { accountBlock, wallet } from '@vite/vitejs';
import AccountBlockClass from '@vite/vitejs/distSrc/accountBlock/accountBlock';
import { useMemo, useState } from 'react';
import Button from '../components/Button';
import Modal from '../components/Modal';
import TransactionModal from '../components/TransactionModal';
import { connect } from '../utils/global-context';
import { validateInputs } from '../utils/misc';
import { addIndexToTokenSymbol, toBiggestUnit, toSmallestUnit } from '../utils/strings';
import { State, TokenApiInfo } from '../utils/types';
import TextInput, { useTextInputRef } from './TextInput';
import TokenCard from './TokenCard';

type Props = State & {
	selectedToken: TokenApiInfo;
	onClose: () => void;
};

const SendTxFlow = ({ selectedToken, onClose, i18n, viteBalanceInfo, activeAccount }: Props) => {
	const toAddressRef = useTextInputRef();
	const amountRef = useTextInputRef();
	const commentRef = useTextInputRef();
	const [unsentBlock, unsentBlockSet] = useState<undefined | AccountBlockClass>();

	const balanceInfoMap = useMemo(
		() => (viteBalanceInfo ? viteBalanceInfo?.balance?.balanceInfoMap || {} : undefined),
		[viteBalanceInfo]
	);

	const selectedTokenBalance = useMemo(() => {
		return !selectedToken
			? null
			: balanceInfoMap?.[selectedToken.tokenAddress]?.balance
			? toBiggestUnit(
					balanceInfoMap[selectedToken.tokenAddress]?.balance,
					balanceInfoMap[selectedToken.tokenAddress]?.tokenInfo?.decimals
			  )
			: '0';
	}, [balanceInfoMap, selectedToken]);

	return (
		<>
			<Modal
				fullscreen
				onClose={onClose}
				className="flex flex-col p-4 pt-0"
				heading={`${i18n.send} ${addIndexToTokenSymbol(
					selectedToken.symbol,
					selectedToken.tokenIndex
				)}`}
				// subheading={selectedToken?.tokenAddress}
			>
				<div className="flex-1 space-y-4 overflow-scroll">
					<TokenCard {...selectedToken} />
					{/* <div className="">
						<p className="leading-5 text-skin-secondary">{i18n.from}</p>
						<p className="break-words text-sm">{contacts[activeAccount.address]}</p>
						<p className="break-words text-sm">{activeAccount.address}</p>
					</div> */}
					{/* <div className="">
						<p className="leading-5 text-skin-secondary">
							{i18n.quotaAvailable} / {i18n.quotaLimit}
						</p>
						<p className="">
							{10} / {10} Quota
						</p>
					</div> */}
					<TextInput
						_ref={toAddressRef}
						label={i18n.toAddress}
						initialValue="vite_f30697191707a723c70d0652ab80304195e5928dcf71fcab99"
						getIssue={(v) => {
							if (!wallet.isValidAddress(v)) {
								return i18n.invalidAddress;
							}
						}}
					/>
					<TextInput
						numeric
						_ref={amountRef}
						initialValue="0.002"
						label={i18n.amount}
						getIssue={(v) => {
							if (+v > +selectedTokenBalance!) {
								return i18n.insufficientFunds;
							}
						}}
					/>
					<TextInput
						optional
						textarea
						_ref={commentRef}
						initialValue="s" //
						label={i18n.comment}
					/>
				</div>
				<Button
					theme="highlight"
					label={i18n.next}
					onClick={() => {
						const valid = validateInputs([toAddressRef, amountRef, commentRef]);
						if (valid) {
							unsentBlockSet(
								accountBlock.createAccountBlock('send', {
									address: activeAccount.address,
									toAddress: toAddressRef.value.trim(),
									tokenId: selectedToken.tokenAddress,
									amount: toSmallestUnit(
										amountRef.value,
										balanceInfoMap![selectedToken.tokenAddress]?.tokenInfo?.decimals
									),
									data: btoa(commentRef.value),
								})
							);
						}
					}}
				/>
			</Modal>
			{unsentBlock && (
				<TransactionModal
					onBack={() => unsentBlockSet(undefined)}
					onClose={onClose}
					unsentBlock={unsentBlock}
				/>
			)}
		</>
	);
};

export default connect(SendTxFlow);
