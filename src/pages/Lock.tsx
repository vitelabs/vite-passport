import { wallet } from '@vite/vitejs';
import { useCallback, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import TextInput, { useTextInputRef } from '../containers/TextInput';
import ResetWalletModal from '../containers/ResetWalletModal';
import { decrypt } from '../utils/encryption';
import { connect } from '../utils/global-context';
import { validateInputs } from '../utils/misc';
import { State } from '../utils/types';
import ViteLogo from '../assets/ViteLogo';
import Button from '../components/Button';
// import { accountBlock } from '@vite/vitejs'
// console.log('accountBlock:', accountBlock)

const Lock = ({ i18n, activeAccountIndex, setState, postPortMessage, encryptedSecrets }: State) => {
	const passwordRef = useTextInputRef();
	const [resettingWallet, resettingWalletSet] = useState(false);
	const [password, passwordSet] = useState('');
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();

	const attemptUnlock = useCallback(async () => {
		const valid = validateInputs([passwordRef]);
		if (valid) {
			try {
				const secrets = JSON.parse(await decrypt(encryptedSecrets, password));
				setState({
					secrets,
					activeAccount: wallet.deriveAddress({
						...secrets,
						index: activeAccountIndex,
					}),
				});
				postPortMessage({ secrets, type: 'updateSecrets' });
				const routeAfterUnlock = searchParams.get('routeAfterUnlock');
				navigate(routeAfterUnlock || '/home', { replace: true });
			} catch {
				passwordRef.error = i18n.incorrectPassword;
			}
		}
	}, [
		password,
		activeAccountIndex,
		searchParams,
		encryptedSecrets,
		i18n.incorrectPassword,
		navigate,
		postPortMessage,
		setState,
	]);

	return (
		<div className="p-4 h-full flex flex-col">
			<div className="flex-1 xy flex-col">
				<ViteLogo size={150} className="text-skin-primary" />
			</div>
			<TextInput
				password
				autoFocus
				_ref={passwordRef}
				label={i18n.password}
				value={password}
				onUserInput={(v) => passwordSet(v)}
				onKeyDown={(key) => {
					if (key === 'Enter') {
						attemptUnlock();
					}
				}}
			/>
			<Button theme="highlight" label={i18n.unlock} onClick={attemptUnlock} />
			<button
				className="mt-1 text-skin-highlight self-center"
				onClick={() => resettingWalletSet(true)}
			>
				{i18n.resetWallet}
			</button>
			{resettingWallet && <ResetWalletModal onClose={() => resettingWalletSet(false)} />}
		</div>
	);
};

export default connect(Lock);
