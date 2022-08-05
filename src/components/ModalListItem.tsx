import { XIcon } from '@heroicons/react/outline';
import { CheckCircleIcon } from '@heroicons/react/solid';
import { ReactNode } from 'react';

type Props = {
	radio?: boolean;
	active?: boolean;
	onClick: () => void;
	rightJSX?: ReactNode;
	label: string;
	sublabel?: string;
	className?: string;
	onClose?: () => void;
};

const ModalListItem = ({
	radio,
	active,
	onClick,
	label,
	sublabel,
	rightJSX,
	className,
	onClose,
}: Props) => {
	return (
		<div className="flex items-center">
			<button
				className={`p-4 ${
					radio ? 'pl-0' : ''
				} fx w-full bg-skin-middleground brightness-button ${className}`}
				onClick={onClick}
			>
				{radio && (
					<div className="w-12 xy">
						{active && (
							// This hack gives CheckCircleIcon a white checkmark
							<div className="bg-white h-4 w-4 absolute rounded-full z-0" />
						)}
						{active ? (
							<CheckCircleIcon className="w-6 text-skin-lowlight z-10" />
						) : (
							<div className="w-5 h-5 border-2 border-skin-eye-icon rounded-full" />
						)}
					</div>
				)}
				<div className="text-left flex-1">
					<p className="leading-4">{label}</p>
					{sublabel && <p className="mt-1 leading-4 text-sm text-skin-secondary">{sublabel}</p>}
				</div>
				{rightJSX}
			</button>
			{onClose && (
				<button
					className="xy w-8 h-8 mr-2 overflow-hidden rounded-full bg-skin-middleground brightness-button"
					onClick={onClose}
				>
					<XIcon className="w-5 text-skin-eye-icon" />
				</button>
			)}
		</div>
	);
};

export default ModalListItem;
