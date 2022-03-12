import { XIcon } from '@heroicons/react/outline';
import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import A from '../components/A';
import TextInput from '../components/TextInput';
import { connect } from '../utils/global-context';
import { validateInputs } from '../utils/misc';
import { State, TextInputRefObject } from '../utils/types';

type Props = State;

// eslint-disable-next-line
const Create2 = ({ i18n }: Props) => {
	const navigate = useNavigate();
	const [passphrase, passphraseSet] = useState<string>('');
	const [pin, pinSet] = useState<string>('');
	const passphraseRef = useRef<TextInputRefObject>();
	const pinRef = useRef<TextInputRefObject>();

	return (
		<div className="h-full pt-10 flex flex-col">
			<div className="fx fixed w-full top-0 bg-skin-base justify-between h-10 px-1">
				<A to="/" className="p-1">
					<XIcon className="w-7 text-skin-secondary" />
				</A>
				<p className="text-xl font-bold">Create Wallet</p>
				<div className="w-9" />
			</div>
			<div className="flex-1 p-3 pt-0 fy gap-1">
				<TextInput
					optional
					_ref={passphraseRef}
					value={passphrase}
					onUserInput={(v) => passphraseSet(v)}
					label="BIP-39 PASSPHRASE"
				/>
				<TextInput _ref={pinRef} value={pin} onUserInput={(v) => pinSet(v)} label="PIN" />
				<p className="mt-2 text-skin-secondary">What's the difference?</p>
				<p className="text-skin-secondary">
					Your <span className="font-bold">BIP-39 passphrase</span> is like an additional word to your mnemonic phrase
					for extra security.
				</p>
				<p className="text-skin-secondary">
					Your <span className="font-bold">pin</span> is used for encrypting your mnemonic phrase and BIP-39 passphrase
					on your computer.
				</p>
				<div className="flex-1"></div>
				<button
					className="round-solid-button"
					onClick={() => {
						const valid = validateInputs([pinRef, passphraseRef]);
						if (valid) {
							navigate('/home');
						}
					}}
				>
					{i18n.next}
				</button>
			</div>
		</div>
	);
};

export default connect(Create2);
