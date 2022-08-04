import { CheckIcon } from '@heroicons/react/solid';
import { useRef, useState } from 'react';

type Props = {
	_ref: CheckboxRefObject;
	onUserInput?: (checked: boolean) => void;
	initialValue?: string;
	className?: string;
};

export type CheckboxRefObject = {
	tag: HTMLElement | null;
	value: boolean;
};

export const useCheckboxRef = () => {
	return useRef<CheckboxRefObject>({
		tag: null,
		value: false,
	}).current;
};

const Checkbox = ({ onUserInput, initialValue, _ref, className }: Props) => {
	const [internalValue, internalValueSet] = useState(initialValue || false);

	return (
		<button
			className={`brightness-button h-8 w-8 p-1.5 -m-1.5 -mr-2 ${className}`}
			onClick={() => {
				onUserInput && onUserInput(!internalValue);
				internalValueSet(!internalValue);
			}}
			ref={(tag) => {
				_ref.tag = tag;
				Object.defineProperty(_ref, 'value', {
					get: () => internalValue,
					set: (v) => internalValueSet(v),
				});
			}}
		>
			<div
				className={`h-3 w-3 xy border rounded-sm shadow ${
					internalValue ? 'border-skin-lowlight' : 'border-skin-unchecked-checkbox'
				}`}
			>
				{internalValue && <CheckIcon className="h-3 w-3 text-skin-lowlight" />}
			</div>
		</button>
	);
};

export default Checkbox;
