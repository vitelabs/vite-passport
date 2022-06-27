/* eslint-disable */

import { DuplicateIcon } from '@heroicons/react/outline';
import { ExternalLinkIcon } from '@heroicons/react/solid';
import { Transaction } from '@vite/vitejs/distSrc/accountBlock/type';
import { connect } from '../utils/global-context';
import { shortenAddress, shortenHash } from '../utils/strings';
import { State } from '../utils/types';
import A from './A';
import Modal from './Modal';

type Props = State & {
	transaction: Transaction;
	onClose: () => void;
	fromRight?: boolean;
	heading?: string;
};

const TransactionModal = ({
	i18n,
	transaction,
	fromRight,
	copyWithToast,
	heading,
	onClose,
}: Props) => {
	return (
		<Modal
			fromRight={fromRight}
			heading={heading || i18n.transaction}
			visible={!!transaction}
			onClose={onClose}
		>
			{!!transaction && (
				<div className="">
					{[
						['Hash', transaction.hash, shortenHash(transaction.hash)],
						[
							'To',
							transaction.toAddress,
							shortenAddress(transaction.toAddress!),
						],
						[
							'From',
							transaction.fromAddress,
							shortenAddress(transaction.fromAddress!),
						],
						['Height', transaction.height],
						['Block type', transaction.blockType],
						['Timestamp', transaction.timestamp],
					].map(([label, value, displayedValue]) => {
						return (
							<button
								key={label}
								className="group fx w-full px-2 py-1 bg-skin-middleground brightness-button"
								onClick={() => copyWithToast(value + '')}
							>
								<p className="text-skin-secondary mr-1">{label}:</p>
								<p className="">{displayedValue ? displayedValue : value}</p>
								<DuplicateIcon className="ml-1 w-5 mr-4 text-skin-secondary opacity-0 duration-200 group-hover:opacity-100" />
							</button>
						);
					})}
					<A
						className="px-1 py-2 fx w-full bg-skin-middleground brightness-button"
						// href={`${explorerURL}`}
					>
						<ExternalLinkIcon className="w-6 ml-1 mr-2 text-skin-secondary" />
						<p className="text-left text-skin-secondary">View on ViteScan</p>
					</A>
				</div>
			)}
		</Modal>
	);
};

export default connect(TransactionModal);
