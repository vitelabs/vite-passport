import { EyeIcon, EyeOffIcon } from '@heroicons/react/outline';
import React, { useRef, useMemo, useState, HTMLProps } from 'react';
import { connect } from '../utils/global-context';
import { State } from '../utils/types';

export type TextInputRefObject = {
	tag: HTMLElement | null;
	issueSet: React.Dispatch<React.SetStateAction<string>>;
	readonly isValid: boolean;
};

type Props = State &
	HTMLProps<HTMLInputElement> & {
		label: string;
		value: string;
		onUserInput: (value: string) => void;
		containerClassName?: string;
		inputClassName?: string;
		textarea?: boolean;
		autoFocus?: boolean;
		numeric?: boolean;
		password?: boolean;
		resizable?: boolean;
		maxDecimals?: number;
		disabled?: boolean;
		placeholder?: string;
		optional?: boolean;
		maxLength?: number;
		type?: string;
		getIssue?: (text: string) => string | void;
		_ref?:
			| React.MutableRefObject<TextInputRefObject | undefined>
			| ((ref: TextInputRefObject) => void);
		onKeyDown?: (key: string) => void;
	};

let lastKeyDown = '';

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
	containerClassName,
	inputClassName,
	textarea,
	autoFocus = false,
	numeric,
	password,
	resizable,
	maxDecimals,
	disabled,
	label,
	value = '',
	placeholder = '',
	onUserInput,
	optional,
	maxLength,
	getIssue = () => '',
	_ref,
	onKeyDown,
	i18n,
}: Props) => {
	const input = useRef<HTMLInputElement | HTMLTextAreaElement | null>();
	const [issue, issueSet] = useState('');
	const [focused, focusedSet] = useState(autoFocus);
	const [visible, visibleSet] = useState(false);
	const id = useMemo(() => label.toLowerCase().replace(/\s+/g, '-'), [label]);
	const Tag = useMemo(() => (textarea ? 'textarea' : 'input'), [textarea]);

	return (
		<div className={`relative ${containerClassName}`}>
			<label
				htmlFor={id}
				onMouseDown={() => setTimeout(() => input.current!.focus(), 0)}
				className={`absolute transition-all pt-0.5 w-[calc(100%-1.2rem)] duration-200 ${
					focused || value
						? 'bg-skin-middleground top-0.5 left-2 font-bold text-xs'
						: 'text-md top-2.5 left-2.5'
				} ${focused ? 'text-skin-highlight' : 'text-skin-muted'}`}
			>
				{label}
				{/* {optional && ' - optional'} */}
				{optional && ' (?)'}
			</label>
			{password && (
				<button
					className={`absolute right-3 top-4 h-8 w-8 p-1.5 -m-1.5 transition duration-200 ${
						focused ? 'text-skin-highlight' : 'text-skin-muted'
					}`}
					onMouseDown={(e) => e.preventDefault()}
					onClick={() => {
						if (lastKeyDown !== 'Enter') {
							visibleSet(!visible);
							setTimeout(() => {
								// move cursor to end
								input.current!.setSelectionRange(value.length, value.length);
							}, 0);
						}
					}}
				>
					{visible ? <EyeOffIcon className="text-inherit" /> : <EyeIcon className="text-inherit" />}
				</button>
			)}
			<Tag
				id={id}
				placeholder={focused || !!value ? placeholder : ''}
				value={value}
				disabled={disabled}
				autoFocus={autoFocus}
				autoComplete="off"
				onKeyDown={(event) => {
					// Prevents onClick from being triggered when TextInput is placed in a form
					// https://stackoverflow.com/questions/33166871/javascript-why-onclick-getting-called-by-enter-key
					lastKeyDown = event.key;
					onKeyDown && onKeyDown(event.key);
				}}
				className={`px-2 pt-4 w-full text-lg block bg-skin-middleground transition duration-200 border-2 rounded ${
					password ? 'pr-10' : ''
				} ${
					focused
						? 'border-skin-highlight shadow-md'
						: 'shadow ' + (issue ? 'border-red-400' : 'border-skin-alt')
				} ${resizable ? 'resize-y' : 'resize-none'} ${inputClassName}`}
				{...(numeric
					? {
							type: 'number',
							pattern: 'd*',
							inputMode: 'decimal',
					  }
					: { type: password && !visible ? 'password' : 'text' })}
				onFocus={() => {
					focusedSet(true);
					issueSet('');
				}}
				onBlur={({ target: { value } }) => {
					focusedSet(false);
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
						// eslint-disable-next-line
						value = value.replace(/[^0123456789\.]/g, '');
						// value = value.replace(/\.+/g, '.');
						value = normalizeNumericInput(value, maxDecimals);
					}
					onUserInput(maxLength ? value.slice(0, maxLength) : value);
				}}
				ref={(tag: HTMLInputElement | HTMLTextAreaElement | null) => {
					input.current = tag;
					if (_ref) {
						const refObject = {
							tag,
							issueSet,
							value,
							get isValid() {
								// NOTE: all text inputs should be trimmed before using
								const trimmedValue = value.trim();
								if (!optional && !trimmedValue) {
									issueSet(i18n.thisFieldCannotBeBlank);
									return false;
								} else if (trimmedValue && getIssue) {
									const newIssue = getIssue(trimmedValue) || '';
									// if (typeof newIssue === 'object') {
									// 	newIssue.then((newIssue) => issueSet(newIssue));
									// 	return newIssue;
									// }
									issueSet(newIssue || '');
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
			{issue && <p className="mt-1 text-sm leading-3 font-bold text-red-500">{issue}</p>}
		</div>
	);
};

export default connect(TextInput);
