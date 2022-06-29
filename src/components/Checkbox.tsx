import { CheckIcon } from '@heroicons/react/solid';
import { ReactNode } from 'react';

type Props = {
	checked: boolean;
	onUserInput: (checked: boolean) => void;
	children?: ReactNode;
};

const Checkbox = ({ checked, onUserInput }: Props) => {
	return (
		<button
			className="brightness-button h-8 w-8 p-1.5 -m-1.5"
			onClick={() => onUserInput(checked)}
		>
			<div
				className={`h-5 w-5 xy border-2 rounded shadow ${
					checked
						? 'bg-skin-highlight border-skin-lowlight'
						: 'bg-skin-foreground border-skin-alt'
				}`}
			>
				{checked && <CheckIcon className="h-4 w-4 text-white" />}
			</div>
		</button>
	);
};

export default Checkbox;
