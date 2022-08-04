import { useLocation, useNavigate } from 'react-router-dom';
import PageContainer from '../components/PageContainer';
import TextInput, { useTextInputRef } from '../containers/TextInput';
import { connect } from '../utils/global-context';
import { validateInputs } from '../utils/misc';
import { State } from '../utils/types';
import A from '../components/A';
import Checkbox, { useCheckboxRef } from '../components/Checkbox';
import { encrypt } from '../utils/encryption';
import { wallet } from '@vite/vitejs';
import { setValue } from '../utils/storage';
import { defaultStorage } from '../utils/constants';

const Create2 = ({ i18n, postPortMessage, setState }: State) => {
	const navigate = useNavigate();
	const {
		state: { mnemonics, routeAfterUnlock },
	} = useLocation() as {
		state: { mnemonics: string; routeAfterUnlock?: string };
	};

	const passwordRef = useTextInputRef();
	const confirmPasswordRef = useTextInputRef();
	const agreeToTermsRef = useCheckboxRef();

	return (
		<PageContainer heading={i18n.createWallet}>
			<TextInput password autoFocus _ref={passwordRef} label={i18n.password} />
			<TextInput
				password
				containerClassName="mt-4"
				_ref={confirmPasswordRef}
				label={i18n.confirmPassword}
			/>
			{/* <p className="mt-1 text-skin-tertiary text-sm">{i18n.mustContainAtLeast8Characters}</p> */}
			<div className="mt-4 fx">
				<Checkbox _ref={agreeToTermsRef} />
				<p className="text-skin-tertiary text-xs">
					{i18n.iHaveReadAndAgreeToThe}{' '}
					<A href="TODO" className="text-skin-lowlight">
						{i18n.termsOfUse}
					</A>
				</p>
			</div>
			<div className="flex-1"></div>
			<button
				className="h-10 w-full bg-skin-highlight xy rounded-sm"
				onClick={async () => {
					let valid = validateInputs([passwordRef, confirmPasswordRef]);
					if (passwordRef.value !== confirmPasswordRef.value) {
						confirmPasswordRef.error = i18n.passwordsDoNotMatch;
						valid = false;
					}
					if (valid) {
						const secrets = { mnemonics };
						postPortMessage({ secrets, type: 'updateSecrets' });
						const encryptedSecrets = await encrypt(JSON.stringify(secrets), passwordRef.value);
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
						navigate(routeAfterUnlock || '/home');
					}
				}}
			>
				{i18n.next}
			</button>
		</PageContainer>
	);
};

export default connect(Create2);
