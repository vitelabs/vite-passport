import { PlusIcon } from '@heroicons/react/solid';

type Props = {
	onClick: () => void;
	label: string;
};

const ModalListBottomButton = ({ onClick, label }: Props) => {
	return (
		<button
			className="px-1 py-2 fx w-full bg-skin-middleground brightness-button"
			onClick={onClick}
		>
			<PlusIcon className="w-6 ml-1 mr-2 text-skin-secondary" />
			<p className="text-left text-skin-secondary">{label}</p>
		</button>
	);
};

export default ModalListBottomButton;
