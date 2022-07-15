import { wallet } from '@vite/vitejs';
import { validateMnemonics } from '@vite/vitejs/distSrc/wallet/hdKey';
import { useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import PageContainer from '../components/PageContainer';
import TextInput, { TextInputRefObject } from '../containers/TextInput';
import { defaultStorage } from '../utils/constants';
import { encrypt } from '../utils/encryption';
import { connect } from '../utils/global-context';
import { validateInputs } from '../utils/misc';
import { setValue } from '../utils/storage';
import { State } from '../utils/types';

const Import = ({ i18n, postPortMessage, setState }: State) => {
	const navigate = useNavigate();
	const [mnemonics, mnemonicsSet] = useState('');
	// const [passphrase, passphraseSet] = useState('');
	const [password, passwordSet] = useState('');
	const mnemonicRef = useRef<TextInputRefObject>();
	// const passphraseRef = useRef<TextInputRefObject>();
	const passwordRef = useRef<TextInputRefObject>();
	const {
		state: { routeAfterUnlock },
	} = useLocation() as {
		state: { routeAfterUnlock?: string };
	};

	return (
		<PageContainer heading={i18n.importWallet} className="gap-3">
			<TextInput
				textarea
				_ref={mnemonicRef}
				value={mnemonics}
				onUserInput={(v) => mnemonicsSet(v)}
				label={i18n.mnemonicPhrase}
				inputClassName="h-44"
				getIssue={(v) => {
					if (!validateMnemonics(v)) {
						return i18n.invalidMnemonicPhrase;
					}
				}}
			/>
			{/* <TextInput
				optional
				_ref={passphraseRef}
				value={passphrase}
				onUserInput={(v) => passphraseSet(v)}
				label={i18n.bip39Passphrase}
			/> */}
			<TextInput
				password
				_ref={passwordRef}
				value={password}
				onUserInput={(v) => passwordSet(v)}
				label="Password"
			/>
			<div className="flex-1"></div>
			<button
				className="mt-4 round-solid-button"
				onClick={async () => {
					// const valid = validateInputs([mnemonicRef, passphraseRef, passwordRef]);
					const valid = validateInputs([mnemonicRef, passwordRef]);
					if (valid) {
						const secrets = {
							// passphrase,
							mnemonics: mnemonics.trim(),
						};
						postPortMessage({ secrets, type: 'updateSecrets' });
						const encryptedSecrets = await encrypt(JSON.stringify(secrets), password);
						const accountList = [
							wallet.deriveAddress({
								...secrets,
								index: 0,
							}),
						];
						const contacts = { [accountList[0].address]: 'Account 0' };
						setValue({ ...defaultStorage, encryptedSecrets, accountList, contacts });
						setState({
							...defaultStorage,
							secrets,
							encryptedSecrets,
							accountList,
							contacts,
							activeAccount: accountList[0],
						});
						navigate(routeAfterUnlock || '/home', { replace: true });
					}
				}}
			>
				{i18n.next}
			</button>
		</PageContainer>
	);
};

export default connect(Import);
