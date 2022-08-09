import { CheckIcon } from '@heroicons/react/solid';

type Props = {
	onUserInput: (value: boolean) => void;
	value?: boolean;
	className?: string;
};

const Checkbox = ({ onUserInput, value, className }: Props) => {
	return (
		<button
			className={`brightness-button h-8 w-8 p-1.5 -m-1.5 -mr-2 ${className}`}
			onClick={() => onUserInput(!value)}
		>
			<div
				className={`h-3 w-3 xy border rounded-sm shadow ${
					value ? 'border-skin-lowlight' : 'border-skin-unchecked-checkbox'
				}`}
			>
				{value && <CheckIcon className="h-3 w-3 text-skin-lowlight" />}
			</div>
		</button>
	);
};

export default Checkbox;
