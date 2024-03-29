import { wallet } from '@vite/vitejs';
import { AddressObj } from '@vite/vitejs/distSrc/utils/type';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import A from '../components/A';
import Button from '../components/Button';
import Checkbox from '../components/Checkbox';
import PageContainer from '../components/PageContainer';
import TextInput, { useTextInputRef } from '../containers/TextInput';
import { encrypt } from '../utils/encryption';
import { connect } from '../utils/global-context';
import { validateInputs } from '../utils/misc';
import { setValue } from '../utils/storage';
import { State } from '../utils/types';

const Import = ({ i18n, sendBgScriptPortMessage, setState }: State) => {
	const navigate = useNavigate();
	const [agreesToTerms, agreesToTermsSet] = useState(false);
	const mnemonicRef = useTextInputRef();
	const { state } = useLocation() as {
		state: { routeAfterUnlock?: string };
	};
	const passwordRef = useTextInputRef();
	const confirmPasswordRef = useTextInputRef();

	return (
		<PageContainer heading={i18n.importWallet} className="gap-4">
			<TextInput
				textarea
				autoFocus
				_ref={mnemonicRef}
				label={i18n.mnemonicPhrase}
				inputClassName="h-44"
				getIssue={(v) => {
					if (!wallet.validateMnemonics(v)) {
						return i18n.invalidMnemonicPhrase;
					}
				}}
			/>
			<TextInput password showPasswordRequirements _ref={passwordRef} label={i18n.password} />
			<TextInput password _ref={confirmPasswordRef} label={i18n.confirmPassword} />
			{/* <p className="mt-1 text-skin-tertiary text-sm">{i18n.mustContainAtLeast8Characters}</p> */}
			<div className="fx">
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
				label={i18n.next}
				disabled={!agreesToTerms}
				onClick={async () => {
					let valid = validateInputs([mnemonicRef, passwordRef, confirmPasswordRef]);
					if (passwordRef.value !== confirmPasswordRef.value) {
						confirmPasswordRef.error = i18n.passwordsDoNotMatch;
						valid = false;
					}
					if (valid) {
						const secrets = { mnemonics: mnemonicRef.value.trim() };
						sendBgScriptPortMessage({ secrets, type: 'updateSecrets' });
						const encryptedSecrets = await encrypt(JSON.stringify(secrets), passwordRef.value);
						const account: AddressObj = wallet.deriveAddress({
							...secrets,
							index: 0,
						});
						const derivedAddresses = [account.address];
						const contacts = { [account.address]: 'Account 0' };
						setValue({ encryptedSecrets, derivedAddresses, contacts });
						setState({
							secrets,
							encryptedSecrets,
							derivedAddresses,
							contacts,
							activeAccount: account,
						});
						navigate(state.routeAfterUnlock || '/home');
					}
				}}
			/>
		</PageContainer>
	);
};

export default connect(Import);
