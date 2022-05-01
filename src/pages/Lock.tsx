import { useState } from 'react';
import ViteLogo from '../assets/ViteLogo';
import A from '../components/A';
import TextInput from '../components/TextInput';
import { connect } from '../utils/global-context';
import { State } from '../utils/types';
// import { accountBlock } from '@vite/vitejs'
// console.log('accountBlock:', accountBlock)

type Props = State;

const Lock = ({ i18n, chromePort }: Props) => {
	const [password, passwordSet] = useState('');
	return (
		<div className="p-4 h-full flex flex-col">
			<div className="flex-1 xy flex-col">
				{/* <ViteLogo size={170} className="drop-shadow-lg text-[var(--bg-base-color)]" /> */}
				<p className="text-3xl drop-shadow-lg font-black text-skin-muted">Vite Passport</p>
			</div>
			<TextInput label={i18n.password} value={password} onUserInput={(v) => passwordSet(v)} />
			<button
				className="mt-2 round-solid-button"
				onClick={() => {
					// getValue(['secrets']).then((value) => {
					// 	console.log('value:', value);
					// 	if (value.secrets) {
					// 		if (message.password) {
					// 			decrypt(value.secrets as string, message.password).then((secrets) => {
					// 				setState({ secrets: JSON.parse(secrets) });
					// 				initialEntriesSet(['/home']);
					// 				chromePort.postMessage({ password, type: 'updatePassword' });
					// 			});
					// 		}
					// 	}
					// });
				}}
			>
				{i18n.unlock}
			</button>
		</div>
	);
};

export default connect(Lock);
