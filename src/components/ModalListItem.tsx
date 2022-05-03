import { CheckCircleIcon } from '@heroicons/react/solid';
import { ReactNode } from 'react';

type Props = {
	radio?: boolean;
	active?: boolean;
	onClick: () => void;
	rightJSX?: ReactNode;
	label: string;
	sublabel?: string;
};

const ModalListItem = ({ radio, active, onClick, label, sublabel, rightJSX }: Props) => {
	return (
		<button className={`p-2 ${radio ? 'pl-0' : ''} fx w-full bg-skin-middleground brightness-button`} onClick={onClick}>
			{radio && (
				<div className="w-10 xy">
					{active ? (
						<CheckCircleIcon className="w-6 text-skin-highlight" />
					) : (
						<div className="w-5 h-5 border-2 border-skin-alt rounded-full" />
					)}
				</div>
			)}
			<div className="text-left flex-1">
				<p className="leading-4">{label}</p>
				{sublabel && <p className="mt-1 leading-4 text-sm text-skin-secondary">{sublabel}</p>}
			</div>
			{rightJSX}
		</button>
	);
};

export default ModalListItem;
