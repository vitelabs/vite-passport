import { EyeIcon, EyeOffIcon } from '@heroicons/react/outline';
import { HTMLProps, useMemo, useRef, useState } from 'react';
import { connect } from '../utils/global-context';
import { State } from '../utils/types';

export type TextInputRefObject = {
	tag: HTMLElement | null;
	// errorSet: React.Dispatch<React.SetStateAction<string>>;
	readonly isValid: boolean;
	value: string;
	error: string;
	autoFocus?: boolean;
};

export const useTextInputRef = () => {
	return useRef<TextInputRefObject>({
		tag: null,
		isValid: true,
		value: '',
		error: '',
	}).current;
};

type Props = State &
	HTMLProps<HTMLInputElement> & {
		label: string;
		_ref: TextInputRefObject;
		// _ref?: Function | React.MutableRefObject<TextInputRefObject | undefined>;
		onUserInput?: (value: string) => void;
		initialValue?: string;
		containerClassName?: string;
		inputClassName?: string;
		textarea?: boolean;
		numeric?: boolean;
		password?: boolean;
		resizable?: boolean;
		maxDecimals?: number;
		disabled?: boolean;
		onMetaEnter?: () => void;
		placeholder?: string;
		optional?: boolean;
		maxLength?: number;
		getIssue?: (value: string) => string | void;
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
	i18n,
	containerClassName,
	autoFocus,
	inputClassName,
	textarea,
	numeric,
	password,
	initialValue,
	resizable,
	maxDecimals,
	disabled,
	label,
	placeholder = '',
	onUserInput,
	optional,
	maxLength,
	getIssue = () => '',
	_ref,
}: Props) => {
	const input = useRef<HTMLInputElement | HTMLTextAreaElement | null>();
	const [internalValue, internalValueSet] = useState(initialValue || '');
	const [error, errorSet] = useState('');
	const [focused, focusedSet] = useState(false);
	const [visible, visibleSet] = useState(false);
	const id = useMemo(() => label.toLowerCase().replace(/\s+/g, '-'), [label]);
	const Tag = useMemo(() => (textarea ? 'textarea' : 'input'), [textarea]);

	return (
		<div className={`relative ${containerClassName}`}>
			<label
				htmlFor={id}
				onMouseDown={() => setTimeout(() => input.current!.focus(), 0)}
				className={`absolute transition-all pt-0.5 w-[calc(100%-1.2rem)] duration-200 ${
					focused || internalValue ? 'top-0.5 left-2 font-bold text-xs' : 'text-md top-2.5 left-2.5'
				} 
				// ${focused ? 'text-skin-highlight' : 'text-skin-input-label'} 
				text-skin-input-label`}
			>
				{label}
				{/* {optional && ' - optional'} */}
				{optional && ' (?)'}
			</label>
			<Tag
				id={id}
				placeholder={placeholder}
				value={internalValue}
				disabled={disabled}
				autoFocus={autoFocus}
				autoComplete="off"
				className={`px-2 pt-4 w-full text-lg block transition duration-200 border-2 rounded-sm ${
					password ? 'pr-10' : ''
				} ${textarea ? 'bg-skin-middleground' : 'bg-skin-base'} ${
					focused
						? 'border-skin-lowlight shadow-md'
						: 'shadow ' + (error ? 'border-skin-error' : 'border-skin-divider')
				} ${resizable ? 'resize-y' : 'resize-none'} ${inputClassName}`}
				type={password && !visible ? 'password' : 'text'}
				onFocus={() => {
					focusedSet(true);
					errorSet('');
				}}
				onBlur={({ target: { value } }) => {
					focusedSet(false);
					if (numeric && onUserInput) {
						value = normalizeNumericInput(value, maxDecimals, true);
						onUserInput(value);
					}
					internalValueSet(value);
				}}
				onChange={({ target: { value } }) => {
					// e.stopPropagation();
					// e.preventDefault();
					if (disabled) {
						return;
					}
					error && errorSet('');
					if (numeric && value) {
						// eslint-disable-next-line
						value = value.replace(/[^0123456789\.]/g, '');
						// value = value.replace(/\.+/g, '.');
						value = normalizeNumericInput(value, maxDecimals);
					}
					value = maxLength ? value.slice(0, maxLength) : value;
					if (onUserInput) {
						onUserInput(value);
					}
					internalValueSet(value);
				}}
				ref={(tag: HTMLInputElement | HTMLTextAreaElement | null) => {
					input.current = tag;
					_ref.tag = tag;
					Object.defineProperty(_ref, 'error', {
						get: () => error,
						set: (v) => errorSet(v),
					});
					Object.defineProperty(_ref, 'value', {
						get: () => internalValue,
						set: (v) => internalValueSet(v),
					});
					Object.defineProperty(_ref, 'isValid', {
						get() {
							const trimmedValue = internalValue.trim();
							if (!optional && !trimmedValue) {
								errorSet(i18n.thisFieldCannotBeBlank);
								return false;
							} else if (trimmedValue && getIssue) {
								const newIssue = getIssue(trimmedValue) || '';
								errorSet(newIssue);
								return !newIssue;
							}
							return true;
						},
					});
				}}
			/>
			{password && (
				<button
					className={`absolute right-3 top-4 h-8 w-8 p-1.5 -m-1.5 transition duration-200 ${
						focused ? 'text-skin-lowlight' : 'text-skin-eye-icon'
					}`}
					onMouseDown={(e) => e.preventDefault()}
					onClick={() => {
						visibleSet(!visible);
						setTimeout(() => {
							// move cursor to end
							input.current!.setSelectionRange(internalValue.length, internalValue.length);
						}, 0);
					}}
				>
					{visible ? <EyeOffIcon className="text-inherit" /> : <EyeIcon className="text-inherit" />}
				</button>
			)}
			{error && <p className="mt-1 text-sm leading-3 font-bold text-red-500">{error}</p>}
		</div>
	);
};

export default connect(TextInput);
