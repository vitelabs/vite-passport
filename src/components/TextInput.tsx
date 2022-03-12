import React, { useRef, useMemo, useState, HTMLProps } from 'react';
import { TextInputRefObject } from '../utils/types';

type Props = HTMLProps<HTMLInputElement> & {
	label: string;
	value: string;
	onUserInput: (value: string) => void;
	className?: string;
	textarea?: boolean;
	numeric?: boolean;
	maxDecimals?: number;
	disabled?: boolean;
	onMetaEnter?: () => void;
	placeholder?: string;
	optional?: boolean;
	maxLength?: number;
	type?: string;
	getIssue?: (text: string) => string;
	_ref?: Function | React.MutableRefObject<TextInputRefObject | undefined>;
};

const normalizeNumericInput = (str: string, decimals = 6, removeInsignificantZeros = false) => {
	if (Number.isNaN(+str) || !str) {
		return '';
	}
	const firstDotIndex = str.indexOf('.');
	if (str.slice(firstDotIndex + 1).length > decimals) {
		str = str.slice(0, firstDotIndex + decimals + 1);
	}
	if (removeInsignificantZeros) {
		str = +str + '';
	}
	return str;
};

const TextInput = ({
	className,
	textarea,
	numeric,
	maxDecimals,
	disabled,
	label,
	value = '',
	placeholder = '',
	onUserInput,
	optional,
	maxLength,
	type = 'text',
	getIssue = () => '',
	_ref,
}: Props) => {
	const input = useRef<HTMLElement | null>();
	const [issue, issueSet] = useState('');
	const id = useMemo(() => label.toLowerCase().replace(/\s+/g, '-'), [label]);
	const Tag = useMemo(() => (textarea ? 'textarea' : 'input'), [textarea]);

	return (
		<div className="w-full">
			<label htmlFor={id} onMouseDown={() => setTimeout(() => input.current!.focus(), 0)}>
				<span className="text-sm font-black text-skin-muted">
					{label}
					{optional && ' - optional'}
				</span>
			</label>
			<Tag
				id={id}
				placeholder={placeholder}
				value={value}
				disabled={disabled}
				autoComplete="off"
				className={`mt-1 w-full text-lg block bg-skin-middleground transition duration-200 border-2 border-skin-input focus:border-skin-highlight rounded shadow px-2 py-1 resize-none ${className}`}
				{...(numeric
					? {
							type: 'number',
							pattern: 'd*',
							inputMode: 'decimal',
					  }
					: { type })}
				onFocus={() => issueSet('')}
				onBlur={({ target: { value } }) => {
					if (numeric) {
						value = normalizeNumericInput(value, maxDecimals, true);
						onUserInput(value);
					}
				}}
				onChange={({ target: { value } }) => {
					// e.stopPropagation();
					// e.preventDefault();
					if (disabled) {
						return;
					}
					issue && issueSet('');
					if (numeric && value) {
						value = value.replace(/[^0123456789\.]/g, '');
						// value = value.replace(/\.+/g, '.');
						value = normalizeNumericInput(value, maxDecimals);
					}
					onUserInput(maxLength ? value.slice(0, maxLength) : value);
				}}
				ref={(tag: HTMLElement | null) => {
					input.current = tag;
					if (_ref) {
						const refObject = {
							tag,
							issueSet,
							get isValid() {
								const trimmedValue = value.trim();
								if (!optional && !trimmedValue) {
									issueSet(`This field cannot be blank`);
									return false;
								} else if (trimmedValue && getIssue) {
									const newIssue = getIssue(trimmedValue);
									// if (typeof newIssue === 'object') {
									// 	newIssue.then((newIssue) => issueSet(newIssue));
									// 	return newIssue;
									// }
									issueSet(newIssue);
									return !newIssue;
								}
								return true;
							},
						};
						if (typeof _ref === 'function') {
							_ref(refObject);
						} else {
							_ref.current = refObject;
						}
					}
				}}
			/>
			{issue && <p className="mt-1 text-sm leading-3 font-bold text-skin-alert-red">{issue}</p>}
		</div>
	);
};

export default TextInput;
