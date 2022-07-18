import A from '../components/A';
import { useCallback, useRef, useState } from 'react';
import { connect } from '../utils/global-context';
import { State } from '../utils/types';
import PageContainer from '../components/PageContainer';
import Secrets from '../containers/Secrets';
import { wallet } from '@vite/vitejs';
import { useLocation, useNavigate } from 'react-router-dom';
import TextInput, { TextInputRefObject } from '../containers/TextInput';
import { validateInputs } from '../utils/misc';
import { setValue } from '../utils/storage';
import { defaultStorage } from '../utils/constants';
import { encrypt } from '../utils/encryption';

const Create = ({ i18n, postPortMessage, setState }: State) => {
	const navigate = useNavigate();
	const [mnemonics, mnemonicsSet] = useState(wallet.createMnemonics());
	const createMnemonics = useCallback((twelveWords = false) => {
		mnemonicsSet(wallet.createMnemonics(twelveWords ? 128 : 256));
	}, []);
	const [password, passwordSet] = useState('');
	const passwordRef = useRef<TextInputRefObject>();
	const {
		state: { routeAfterUnlock },
	} = useLocation() as {
		state: { routeAfterUnlock?: string };
	};

	return (
		<PageContainer heading={i18n.createWallet}>
			<div className="w-full xy">
				<div className="flex bg-skin-middleground shadow rounded overflow-hidden">
					<button
						className={`brightness-button px-2 py-0.5 text-sm ${
							mnemonics.length === 12 ? 'bg-skin-foreground' : 'bg-skin-middleground'
						}`}
						onClick={() => createMnemonics(true)}
					>
						{i18n._12Words}
					</button>
					<button
						className={`brightness-button px-2 py-0.5 text-sm ${
							mnemonics.length === 24 ? 'bg-skin-foreground' : 'bg-skin-middleground'
						}`}
						onClick={() => createMnemonics()}
					>
						{i18n._24Words}
					</button>
				</div>
			</div>
			<Secrets mnemonics={mnemonics} className="mt-2" />
			<p className="mt-1 text-skin-secondary text-center text-sm">
				Store these words somewhere safe
			</p>
			<TextInput
				password
				_ref={passwordRef}
				value={password}
				onUserInput={(v) => passwordSet(v)}
				label={i18n.password}
				containerClassName="mt-2"
			/>
			<div className="flex-1"></div>
			{/* <A to="/create2" className="round-solid-button" state={{ mnemonics, routeAfterUnlock }}>
				{i18n.next}
			</A> */}
			<button
				className="round-solid-button"
				onClick={async () => {
					// const valid = validateInputs([passwordRef, passphraseRef]);
					const valid = validateInputs([passwordRef]);
					if (valid) {
						// const secrets = { mnemonics, passphrase };
						const secrets = { mnemonics };
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

export default connect(Create);
