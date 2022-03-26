import { XIcon } from '@heroicons/react/outline';
import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import A from '../components/A';
import PageContainer from '../components/PageContainer';
import TextInput, { TextInputRefObject } from '../components/TextInput';
import { connect } from '../utils/global-context';
import { validateInputs } from '../utils/misc';
import { State } from '../utils/types';

type Props = State;

// eslint-disable-next-line
const Create2 = ({ i18n }: Props) => {
	const navigate = useNavigate();
	const [passphrase, passphraseSet] = useState<string>('');
	const [password, passwordSet] = useState<string>('');
	const passphraseRef = useRef<TextInputRefObject>();
	const passwordRef = useRef<TextInputRefObject>();

	return (
		<PageContainer title="Create Wallet">
			<TextInput
				optional
				password
				_ref={passphraseRef}
				value={passphrase}
				onUserInput={(v) => passphraseSet(v)}
				label="BIP-39 Passphrase"
				containerClassName="my-2"
			/>
			<TextInput password _ref={passwordRef} value={password} onUserInput={(v) => passwordSet(v)} label="Password" />
			<p className="mt-2 ">What's the difference?</p>
			<p className="">
				Your <span className="font-bold">BIP-39 passphrase</span> is like an additional word to your mnemonic phrase for
				extra security.
			</p>
			<p className="">
				Your <span className="font-bold">password</span> is used for encrypting your mnemonic phrase and BIP-39
				passphrase on your computer.
			</p>
			<div className="flex-1"></div>
			<button
				className="round-solid-button"
				onClick={() => {
					const valid = validateInputs([passwordRef, passphraseRef]);
					if (valid) {
						navigate('/home');
					}
				}}
			>
				{i18n.next}
			</button>
		</PageContainer>
	);
};

export default connect(Create2);
