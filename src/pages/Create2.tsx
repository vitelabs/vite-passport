import { useLocation, useNavigate } from 'react-router-dom';
import PageContainer from '../components/PageContainer';
import TextInput, { useTextInputRef } from '../containers/TextInput';
import { connect } from '../utils/global-context';
import { validateInputs } from '../utils/misc';
import { State } from '../utils/types';
import A from '../components/A';
import Checkbox from '../components/Checkbox';
import { encrypt } from '../utils/encryption';
import { wallet } from '@vite/vitejs';
import { setValue } from '../utils/storage';
import { defaultStorage } from '../utils/constants';
import { useState } from 'react';
import Button from '../components/Button';

const Create2 = ({ i18n, sendBgScriptPortMessage, setState, secrets }: State) => {
	const navigate = useNavigate();
	const {
		state: { routeAfterUnlock },
	} = useLocation() as {
		state: { routeAfterUnlock?: string };
	};
	const [agreesToTerms, agreesToTermsSet] = useState(false);
	const mnemonicRef = useTextInputRef();
	const passwordRef = useTextInputRef();
	const confirmPasswordRef = useTextInputRef();

	return !secrets ? null : (
		<PageContainer heading={i18n.createWallet}>
			<TextInput
				optional
				autoFocus
				textarea
				_ref={mnemonicRef}
				label={i18n.confirmMnemonicPhrase}
				getIssue={(v) => {
					if (v !== secrets.mnemonics) {
						return i18n.incorrectMnemonicPhrase;
					}
				}}
			/>
			<TextInput
				password
				showPasswordRequirements
				containerClassName="mt-4"
				_ref={passwordRef}
				label={i18n.password}
			/>
			<TextInput
				password
				containerClassName="mt-4"
				_ref={confirmPasswordRef}
				label={i18n.confirmPassword}
			/>
			<div className="mt-4 fx">
				<Checkbox value={agreesToTerms} onUserInput={(v) => agreesToTermsSet(v)} />
				<p className="text-skin-tertiary text-xs">
					{i18n.iHaveReadAndAgreeToThe}{' '}
					<A href="https://vite.org/terms.html" className="text-skin-lowlight">
						{i18n.termsOfUse}
					</A>
				</p>
			</div>
			<div className="flex-1"></div>
			<Button
				theme="highlight"
				disabled={!agreesToTerms}
				label={i18n.next}
				onClick={async () => {
					let valid = validateInputs([mnemonicRef, passwordRef, confirmPasswordRef]);
					if (passwordRef.value !== confirmPasswordRef.value) {
						confirmPasswordRef.error = i18n.passwordsDoNotMatch;
						valid = false;
					}
					if (valid) {
						sendBgScriptPortMessage({ secrets, type: 'updateSecrets' });
						const encryptedSecrets = await encrypt(JSON.stringify(secrets), passwordRef.value);
						const account = wallet.deriveAddress({
							...secrets,
							index: 0,
						});
						const { privateKey } = account;
						delete account.privateKey;
						const accountList = [account];
						const contacts = { [account.address]: 'Account 0' };
						setValue({ ...defaultStorage, encryptedSecrets, accountList, contacts });
						setState({
							...defaultStorage,
							secrets,
							encryptedSecrets,
							accountList,
							contacts,
							activeAccount: { ...account, privateKey },
						});
						navigate(routeAfterUnlock || '/home');
					}
				}}
			/>
		</PageContainer>
	);
};

export default connect(Create2);
