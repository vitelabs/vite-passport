/* eslint-disable */

import { useRef, useState } from 'react';
import Modal from '../components/Modal';
import ModalListBottomButton from '../components/ModalListBottomButton';
import ModalListItem from '../components/ModalListItem';
import Secrets from '../containers/Secrets';
import TabContainer from '../components/TabContainer';
import TextInput, { TextInputRefObject } from '../components/TextInput';
import { currencyConversions, i18nDict, languages } from '../utils/constants';
import { connect } from '../utils/global-context';
import { shortenAddress } from '../utils/strings';
import { State } from '../utils/types';
import { useNavigate } from 'react-router-dom';
import { getValue, removeKeys, StorageFields } from '../utils/storage';

type Props = State;

const ListItem = ({
	label,
	value,
	onClick,
}: {
	label: string;
	value?: string;
	onClick: () => void;
}) => (
	<button
		onClick={onClick}
		className="fx w-full bg-skin-base justify-between p-2 brightness-button"
	>
		<p>{label}</p>
		{value && <p>{value}</p>}
	</button>
);

const Settings = ({
	postPortMessage,
	setState,
	currencyConversion,
	secrets,
	i18n,
	language,
	toastSuccess,
}: Props) => {
	const navigate = useNavigate();
	const oldPasswordRef = useRef<TextInputRefObject>();
	const newPasswordRef = useRef<TextInputRefObject>();
	const [activeModal, activeModalSet] = useState<
		'currency' | 'language' | 'contacts' | 'password' | 'secrets' | 'reset' | ''
	>();
	const [oldPassword, oldPasswordSet] = useState('');
	const [newPassword, newPasswordSet] = useState('');

	// TODO: show prices

	return (
		<TabContainer heading={i18n.settings}>
			<div className="flex-1 overflow-scroll">
				<ListItem
					onClick={() => activeModalSet('currency')}
					label={i18n.currencyConversion}
					value={currencyConversion}
				/>
				<ListItem
					onClick={() => activeModalSet('language')}
					label={i18n.language}
					value={languages[language]}
				/>
				{/* <ListItem
					onClick={() => activeModalSet('contacts')}
					label={i18n.contacts}
				/> */}
				<ListItem
					onClick={() => activeModalSet('password')}
					label={i18n.changePassword}
				/>
				<ListItem
					onClick={() => activeModalSet('secrets')}
					label={i18n.showSecrets}
				/>
				<ListItem
					onClick={() => activeModalSet('reset')}
					label={i18n.resetWallet}
				/>
				<ListItem
					onClick={() => {
						postPortMessage({ type: 'lock' });
						navigate('/lock', { replace: true });
					}}
					label={i18n.lockWallet}
				/>
			</div>
			<Modal
				heading={i18n.currencyConversion}
				visible={activeModal === 'currency'}
				onClose={() => activeModalSet('')}
			>
				{currencyConversions.map((shorthand) => {
					const active = currencyConversion === shorthand;
					return (
						<ModalListItem
							radio
							key={shorthand}
							active={active}
							label={shorthand}
							sublabel={i18n[shorthand]}
							onClick={() => {
								if (!active) {
									toastSuccess(i18n.currencyChanged);
								}
								activeModalSet('');
							}}
						/>
					);
				})}
			</Modal>
			<Modal
				heading={i18n.language}
				visible={activeModal === 'language'}
				onClose={() => activeModalSet('')}
			>
				{Object.entries(languages).map(([shorthand, label]) => {
					const active = currencyConversion === shorthand;
					return (
						<ModalListItem
							radio
							key={shorthand}
							active={active}
							label={label}
							onClick={() => {
								if (!active) {
									toastSuccess(i18n.languageChanged);
									setState({
										i18n: i18nDict[shorthand as keyof typeof i18nDict],
									});
								}
								activeModalSet('');
							}}
						/>
					);
				})}
			</Modal>
			{/* <Modal
				heading={i18n.contacts}
				visible={activeModal === 'contacts'}
				onClose={() => activeModalSet('')}
			>
				{[
					[
						'account',
						'vite_5e8d4ac7dc8b75394cacd21c5667d79fe1824acb46c6b7ab1f',
					],
				].map(([label, address]) => {
					return (
						<ModalListItem
							key={address}
							label={'accountName'}
							sublabel={shortenAddress(address)}
							onClick={() => {
								// TODO
							}}
						/>
					);
				})}
				<ModalListBottomButton
					label={i18n.addContact}
					onClick={() => {
						// TODO: add contact
					}}
				/>
			</Modal> */}
			<Modal
				heading={i18n.changePassword}
				visible={activeModal === 'password'}
				onClose={() => {
					activeModalSet('');
					oldPasswordSet('');
					newPasswordSet('');
				}}
			>
				<div className="p-2 space-y-2">
					<TextInput
						password
						_ref={oldPasswordRef}
						value={oldPassword}
						onUserInput={(v) => oldPasswordSet(v)}
						label={i18n.oldPassword}
					/>
					<TextInput
						password
						_ref={newPasswordRef}
						value={newPassword}
						onUserInput={(v) => newPasswordSet(v)}
						label={i18n.newPassword}
					/>
					<button
						className="round-solid-button"
						onClick={() => {
							// TODO
						}}
					>
						{i18n.confirm}
					</button>
				</div>
			</Modal>
			<Modal
				visible={activeModal === 'secrets'}
				onClose={() => activeModalSet('')}
				heading={i18n.secrets}
			>
				<Secrets {...secrets} />
			</Modal>
			<Modal
				visible={activeModal === 'reset'}
				onClose={() => activeModalSet('')}
				heading={i18n.resetWallet}
			>
				<div className="p-2 space-y-2">
					<p className="">{i18n.youAreAboutToErase}</p>
					<button
						className="round-solid-button"
						onClick={async () => {
							const storage = await getValue(null);
							removeKeys(Object.keys(storage) as StorageFields[]);
							navigate('/', { replace: true });
						}}
					>
						{i18n.confirm}
					</button>
				</div>
			</Modal>
		</TabContainer>
	);
};

export default connect(Settings);
