import { XIcon } from '@heroicons/react/outline';
import Checkbox from './Checkbox';

type Props = {
	radio?: boolean;
	active?: boolean;
	base?: boolean;
	onClick: () => void;
	label: string;
	sublabel?: string;
	className?: string;
	onClose?: () => void;
};

const ModalListItem = ({
	radio,
	active,
	onClick,
	base,
	label,
	sublabel,
	className,
	onClose,
}: Props) => {
	return (
		<div className="flex items-center">
			<button
				className={`p-4 fx w-full ${base ? 'bg-skin-base' : 'bg-skin-middleground'} ${className}`}
				onClick={onClick}
			>
				{radio && <Checkbox disabled radio value={active} />}
				<div className={`text-left flex-1 ${radio ? 'ml-4' : ''}`}>
					<p className="leading-4">{label}</p>
					{sublabel && (
						<p className="mt-1 leading-4 text-sm font-medium text-skin-secondary">{sublabel}</p>
					)}
				</div>
			</button>
			{onClose && (
				<button
					className="xy w-8 h-8 mr-2 overflow-hidden rounded-full bg-skin-middleground"
					onClick={onClose}
				>
					<XIcon className="w-5 text-skin-eye-icon" />
				</button>
			)}
		</div>
	);
};

export default ModalListItem;
