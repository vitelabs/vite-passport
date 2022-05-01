import { useMemo, useRef, useState } from 'react';
import Modal from '../components/Modal';
import ModalListBottomButton from '../components/ModalListBottomButton';
import ModalListItem from '../components/ModalListItem';
import Secrets from '../containers/Secrets';
import TabContainer from '../components/TabContainer';
import TextInput, { TextInputRefObject } from '../components/TextInput';
import { currencyConversions, languages, testWallet } from '../utils/constants';
import { connect } from '../utils/global-context';
import { shortenAddress } from '../utils/strings';
import { State } from '../utils/types';
import { useNavigate } from 'react-router-dom';
import { setValue } from '../utils/storage';

type Props = State;

const ListItem = ({ label, value, onClick }: { label: string; value?: string; onClick: () => void }) => (
	<button onClick={onClick} className="fx w-full bg-skin-base justify-between p-2 brightness-button">
		<p>{label}</p>
		{value && <p>{value}</p>}
	</button>
);

const Settings = ({ currencyConversion, secrets, i18n, language, toastSuccess }: Props) => {
	const navigate = useNavigate();
	const oldPasswordRef = useRef<TextInputRefObject>();
	const newPasswordRef = useRef<TextInputRefObject>();
	const [changingNetwork, changingNetworkSet] = useState(false);
	const [changingCurrencyConversion, changingCurrencyConversionSet] = useState(false);
	const [changingLanguage, changingLanguageSet] = useState(false);
	const [changingContacts, changingContactsSet] = useState(false);
	const [changingPassword, changingPasswordSet] = useState(false);
	const [oldPassword, oldPasswordSet] = useState('');
	const [newPassword, newPasswordSet] = useState('');
	const [showingSecrets, showingSecretsSet] = useState(false);

	return (
		<TabContainer heading={i18n.settings}>
			<div className="flex-1 overflow-scroll">
				<ListItem
					onClick={() => changingCurrencyConversionSet(true)}
					label={i18n.currencyConversion}
					value={currencyConversion}
				/>
				<ListItem onClick={() => changingLanguageSet(true)} label={i18n.language} value={language} />
				<ListItem onClick={() => changingContactsSet(true)} label={i18n.contacts} />
				<ListItem onClick={() => changingPasswordSet(true)} label={i18n.changePassword} />
				<ListItem onClick={() => showingSecretsSet(true)} label={i18n.showSecrets} />
				<ListItem
					onClick={() => {
						// TODO
					}}
					label={i18n.resetWallet}
				/>
				<ListItem
					onClick={() => {
						setValue({ lockAfter: Date.now() });
						navigate('/lock', { replace: true });
					}}
					label={i18n.lockWallet}
				/>
			</div>
			<Modal
				heading={i18n.currencyConversion}
				visible={changingCurrencyConversion}
				onClose={() => changingCurrencyConversionSet(false)}
			>
				{currencyConversions.map(([shorthand, label], i) => {
					const active = currencyConversion === shorthand;
					return (
						<ModalListItem
							radio
							key={shorthand}
							active={active}
							label={shorthand}
							sublabel={label}
							onClick={() => {
								if (!active) {
									toastSuccess(i18n.currencyChanged);
								}
								changingCurrencyConversionSet(false);
							}}
						/>
					);
				})}
			</Modal>
			<Modal heading={i18n.language} visible={changingLanguage} onClose={() => changingLanguageSet(false)}>
				{languages.map(([shorthand, label], i) => {
					const active = currencyConversion === shorthand;
					return (
						<ModalListItem
							radio
							key={shorthand}
							active={active}
							label={shorthand}
							sublabel={label}
							onClick={() => {
								if (!active) {
									toastSuccess(i18n.languageChanged);
								}
								changingLanguageSet(false);
							}}
						/>
					);
				})}
			</Modal>
			<Modal heading={i18n.contacts} visible={changingContacts} onClose={() => changingContactsSet(false)}>
				{[['account', 'vite_5e8d4ac7dc8b75394cacd21c5667d79fe1824acb46c6b7ab1f']].map(([label, address], i) => {
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
			</Modal>
			<Modal
				visible={changingPassword}
				onClose={() => {
					changingPasswordSet(false);
					oldPasswordSet('');
					newPasswordSet('');
				}}
				heading={i18n.password}
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
				visible={showingSecrets}
				onClose={() => {
					showingSecretsSet(false);
				}}
				heading={i18n.secrets}
			>
				<Secrets {...secrets} />
			</Modal>
		</TabContainer>
	);
};

export default connect(Settings);
