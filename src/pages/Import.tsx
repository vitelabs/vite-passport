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
const Import = ({ i18n, setState }: Props) => {
	const navigate = useNavigate();
	const [mnemonics, mnemonicsSet] = useState<string>('');
	const [passphrase, passphraseSet] = useState<string>('');
	const [pin, pinSet] = useState<string>('');
	const mnemonicRef = useRef<TextInputRefObject>();
	const passphraseRef = useRef<TextInputRefObject>();
	const pinRef = useRef<TextInputRefObject>();

	return (
		<div className="h-full pt-10 flex flex-col">
			<div className="fx fixed w-full top-0 bg-skin-base justify-between h-10 px-1">
				<A to="/" className="p-1">
					<XIcon className="w-7 text-skin-secondary" />
				</A>
				<p className="text-xl font-bold">Import Wallet</p>
				<div className="w-9" />
			</div>
			<div className="flex-1 p-3 pt-0 fy gap-1">
				<TextInput
					textarea
					_ref={mnemonicRef}
					value={mnemonics}
					onUserInput={(v) => mnemonicsSet(v)}
					label="MNEMONIC PHRASE"
					className="h-44"
				/>
				<TextInput
					optional
					_ref={passphraseRef}
					value={passphrase}
					onUserInput={(v) => passphraseSet(v)}
					label="BIP-39 PASSPHRASE"
				/>
				<TextInput _ref={pinRef} value={pin} onUserInput={(v) => pinSet(v)} label="PIN" />
				<div className="flex-1"></div>
				<button
					className="mt-4 round-solid-button"
					onClick={() => {
						const valid = validateInputs([mnemonicRef, passphraseRef, pinRef]);
						if (valid) {
							navigate('/create2');
						} else {
							// setState({ toast: ['Fix the input errors', 'error'] });
						}
					}}
				>
					{i18n.next}
				</button>
			</div>
		</div>
	);
};

export default connect(Import);
