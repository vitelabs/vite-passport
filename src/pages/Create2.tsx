import { wallet } from '@vite/vitejs';
import { useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import PageContainer from '../components/PageContainer';
import TextInput, { TextInputRefObject } from '../components/TextInput';
import { encrypt } from '../utils/encryption';
import { connect } from '../utils/global-context';
import { validateInputs } from '../utils/misc';
import { setValue } from '../utils/storage';
import { State } from '../utils/types';

type Props = State;

const Create2 = ({ i18n, postPortMessage, setState }: Props) => {
	const navigate = useNavigate();
	const {
		state: { mnemonics },
	} = useLocation() as {
		state: { mnemonics: string };
	};

	const [passphrase, passphraseSet] = useState('');
	const [password, passwordSet] = useState('');
	const passphraseRef = useRef<TextInputRefObject>();
	const passwordRef = useRef<TextInputRefObject>();

	return (
		<PageContainer heading={i18n.createWallet}>
			<TextInput
				optional
				password
				_ref={passphraseRef}
				value={passphrase}
				onUserInput={(v) => passphraseSet(v)}
				label={i18n.bip39Passphrase}
				containerClassName="my-2"
			/>
			<TextInput
				password
				_ref={passwordRef}
				value={password}
				onUserInput={(v) => passwordSet(v)}
				label="Password"
			/>
			<p className="mt-2">{i18n.whatsTheDifference}</p>
			<p
				className=""
				// TODO: i18n for these sentences
			>
				Your <span className="font-bold">BIP-39 passphrase</span> is like an
				additional word to your mnemonic phrase for extra security.
			</p>
			<p className="">
				Your <span className="font-bold">password</span> is used for encrypting
				your mnemonic phrase and BIP-39 passphrase on your computer.
			</p>
			<div className="flex-1"></div>
			<button
				className="round-solid-button"
				onClick={async () => {
					const valid = validateInputs([passwordRef, passphraseRef]);
					if (valid) {
						const secrets = { mnemonics, passphrase };
						postPortMessage({ secrets, type: 'updateSecrets' });
						const encryptedSecrets = await encrypt(
							JSON.stringify(secrets),
							password
						);
						const accountList = [
							wallet.deriveAddress({
								...secrets,
								index: 0,
							}),
						];
						setValue({ encryptedSecrets, accountList });
						setState({
							secrets,
							encryptedSecrets,
							accountList,
							activeAccountIndex: 0,
							activeAccount: accountList[0],
						});
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
