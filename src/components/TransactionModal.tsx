import { Transaction } from '@vite/vitejs/distSrc/accountBlock/type';
import { AccountBlockBlock } from '@vite/vitejs/distSrc/utils/type';
import TransactionInfo from '../containers/TransactionInfo';
import { connect } from '../utils/global-context';
import { State } from '../utils/types';
import Modal from './Modal';

type Props = State & {
	transaction?: Transaction | AccountBlockBlock;
	contractFuncParams?: any[];
	onClose: () => void;
	fromRight?: boolean;
	heading?: string;
};

const TransactionModal = ({
	i18n,
	contractFuncParams,
	transaction,
	fromRight,
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
				<TransactionInfo {...transaction} contractFuncParams={contractFuncParams} />
			)}
		</Modal>
	);
};

export default connect(TransactionModal);
