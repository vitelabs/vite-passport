import { getValue, removeKeys, setValue, StorageFields } from '../utils/storage';
import Modal from '../components/Modal';
import { connect } from '../utils/global-context';
import { State } from '../utils/types';
import { useNavigate } from 'react-router-dom';
import { defaultStorage } from '../utils/constants';

type Props = State & {
	onClose: () => void;
};

const ResetWalletModal = ({ onClose, i18n, setState }: Props) => {
	const navigate = useNavigate();
	return (
		<Modal
			onClose={onClose}
			heading={i18n.resetWallet}
			buttonText={i18n.confirm}
			onButtonClick={async () => {
				const storage = await getValue(null);
				removeKeys(Object.keys(storage) as StorageFields[]);
				setValue(defaultStorage);
				setState(defaultStorage);
				navigate('/', { replace: true });
			}}
		>
			<p className="m-3">{i18n.youAreAboutToErase}</p>
		</Modal>
	);
};

export default connect(ResetWalletModal);
