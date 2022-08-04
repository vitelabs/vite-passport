import { getValue, removeKeys, StorageFields } from '../utils/storage';
import Modal from '../components/Modal';
import { connect } from '../utils/global-context';
import { State } from '../utils/types';
import { useNavigate } from 'react-router-dom';

type Props = State & {
	visible: boolean;
	onClose: () => void;
};

const ResetWalletModal = ({ visible, onClose, i18n }: Props) => {
	const navigate = useNavigate();
	return (
		<Modal visible={visible} onClose={onClose} heading={i18n.resetWallet}>
			<div className="p-2 space-y-2">
				<p className="">{i18n.youAreAboutToErase}</p>
				<button
					className="h-10 w-full bg-skin-highlight xy rounded-sm"
					onClick={async () => {
						const storage = await getValue(null);
						removeKeys(Object.keys(storage) as StorageFields[]);
						navigate('/', { replace: true });
					}}
				>
					{i18n.confirm}
				</button>
			</div>
		</Modal>
	);
};

export default connect(ResetWalletModal);
