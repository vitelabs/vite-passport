import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ViteLogo from '../assets/ViteLogo';
import A from '../components/A';
import TextInput, { TextInputRefObject } from '../components/TextInput';
import { decrypt } from '../utils/encryption';
import { connect } from '../utils/global-context';
import { validateInputs } from '../utils/misc';
import { getValue } from '../utils/storage';
import { State } from '../utils/types';
// import { accountBlock } from '@vite/vitejs'
// console.log('accountBlock:', accountBlock)

type Props = State;

const Lock = ({ i18n, setState, postPortMessage }: Props) => {
	const passwordRef = useRef<TextInputRefObject>();
	const [password, passwordSet] = useState('');
	const navigate = useNavigate();

	return (
		<div className="p-4 h-full flex flex-col">
			<div className="flex-1 xy flex-col">
				{/* <ViteLogo size={170} className="drop-shadow-lg text-[var(--bg-base-color)]" /> */}
				<p className="text-3xl drop-shadow-lg font-black text-skin-muted">Vite Passport</p>
			</div>
			<TextInput
				password
				_ref={passwordRef}
				label={i18n.password}
				value={password}
				onUserInput={(v) => passwordSet(v)}
			/>
			<button
				className="mt-2 round-solid-button"
				onClick={() => {
					const valid = validateInputs([passwordRef]);
					if (valid) {
						getValue(['encryptedSecrets']).then((value) => {
							console.log('value:', value);
							if (value.encryptedSecrets) {
								decrypt(value.encryptedSecrets, password)
									.then((secrets) => {
										setState({ secrets: JSON.parse(secrets) });
										navigate('/home', { replace: true });
										postPortMessage({ password, type: 'updatePassword' });
									})
									.catch(() => {
										passwordRef.current?.issueSet(i18n.incorrectPassport);
									});
							}
						});
					}
				}}
			>
				{i18n.unlock}
			</button>
		</div>
	);
};

export default connect(Lock);
