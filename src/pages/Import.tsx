import { XIcon } from '@heroicons/react/outline';
import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageContainer from '../components/PageContainer';
import TextInput, { TextInputRefObject } from '../components/TextInput';
import { connect } from '../utils/global-context';
import { validateInputs } from '../utils/misc';
import { State } from '../utils/types';

type Props = State;

// eslint-disable-next-line
const Import = ({ i18n, setState }: Props) => {
	const navigate = useNavigate();
	const [mnemonics, mnemonicsSet] = useState<string>('');
	const [passphrase, passphraseSet] = useState<string>('');
	const [password, passwordSet] = useState<string>('');
	const mnemonicRef = useRef<TextInputRefObject>();
	const passphraseRef = useRef<TextInputRefObject>();
	const passwordRef = useRef<TextInputRefObject>();

	return (
		<PageContainer title="Import Wallet" className="gap-3">
			<TextInput
				textarea
				_ref={mnemonicRef}
				value={mnemonics}
				onUserInput={(v) => mnemonicsSet(v)}
				label="Mnemonic Phrase"
				inputClassName="h-44"
				getIssue={(v) => {
					console.log('v:', v);
					if (false) {
						// TODO: Verify mnemonic with ViteJS
						return 'Invalid mnemonic phrase';
					}
					return '';
				}}
			/>
			<TextInput
				optional
				_ref={passphraseRef}
				value={passphrase}
				onUserInput={(v) => passphraseSet(v)}
				label="BIP-39 Passphrase"
			/>
			<TextInput _ref={passwordRef} value={password} onUserInput={(v) => passwordSet(v)} label="Password" />
			<div className="flex-1"></div>
			<button
				className="mt-4 round-solid-button"
				onClick={() => {
					const valid = validateInputs([mnemonicRef, passphraseRef, passwordRef]);
					if (valid) {
						navigate('/home');
					} else {
						// setState({ toast: ['Fix the input errors', 'error'] });
					}
				}}
			>
				{i18n.next}
			</button>
		</PageContainer>
	);
};

export default connect(Import);
