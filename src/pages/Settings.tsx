/* eslint-disable */

import React, { useCallback, useRef, useState } from 'react';
import Modal from '../components/Modal';
import ModalListBottomButton from '../components/ModalListBottomButton';
import ModalListItem from '../components/ModalListItem';
import Secrets from '../containers/Secrets';
import TabContainer from '../components/TabContainer';
import TextInput, { useTextInputRef } from '../containers/TextInput';
import { currencyConversions, i18nDict, languages } from '../utils/constants';
import { connect } from '../utils/global-context';
import { shortenAddress } from '../utils/strings';
import { State } from '../utils/types';
import { useNavigate } from 'react-router-dom';
import ResetWalletModal from '../containers/ResetWalletModal';
import { validateInputs } from '../utils/misc';
import { decrypt, encrypt } from '../utils/encryption';
import { setValue } from '../utils/storage';

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
		className="fx w-full bg-skin-base justify-between p-3 brightness-button"
	>
		<p className="text-skin-input-label font-normal">{label}</p>
		{value && <p>{value}</p>}
	</button>
);

const Settings = ({
	postPortMessage,
	setState,
	currencyConversion,
	encryptedSecrets,
	secrets,
	i18n,
	language,
	toastSuccess,
}: State) => {
	const navigate = useNavigate();
	const oldPasswordRef = useTextInputRef();
	const newPasswordRef = useTextInputRef();
	const passwordRef = useTextInputRef();
	const [activeModal, activeModalSet] = useState<
		'currency' | 'language' | 'contacts' | 'password' | 'secrets' | 'reset' | ''
	>();
	const [showSecrets, showSecretsSet] = useState(false);

	// TODO: toggle show prices

	const verifyPassword = useCallback(
		async (str: string) => {
			try {
				await decrypt(encryptedSecrets, str);
				return true;
			} catch {
				passwordRef.error = i18n.incorrectPassword;
				return false;
			}
		},
		[encryptedSecrets, i18n.incorrectPassword]
	);

	const attemptToShowSecrets = useCallback(async () => {
		const valid = validateInputs([passwordRef]);
		if (valid) {
			const passwordIsCorrect = await verifyPassword(passwordRef.value);
			if (passwordIsCorrect) {
				showSecretsSet(true);
			}
		}
	}, [verifyPassword]);

	return (
		<TabContainer heading={i18n.settings}>
			<div className="flex-1 overflow-scroll">
				{/* <ListItem
					onClick={() => activeModalSet('currency')}
					label={i18n.currencyConversion}
					value={currencyConversion}
				/> */}
				<ListItem
					onClick={() => activeModalSet('language')}
					label={i18n.language}
					value={languages[language]}
				/>
				{/* <ListItem
					onClick={() => activeModalSet('contacts')}
					label={i18n.contacts}
				/> */}
				<ListItem onClick={() => activeModalSet('password')} label={i18n.changePassword} />
				<ListItem onClick={() => activeModalSet('secrets')} label={i18n.showSecrets} />
				<ListItem onClick={() => activeModalSet('reset')} label={i18n.resetWallet} />
				<ListItem
					onClick={() => {
						postPortMessage({ type: 'lock' });
						navigate('/lock', { replace: true });
					}}
					label={i18n.lockWallet}
				/>
			</div>
			{activeModal === 'currency' && (
				<Modal heading={i18n.currencyConversion} onClose={() => activeModalSet('')}>
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
			)}
			{activeModal === 'language' && (
				<Modal heading={i18n.language} onClose={() => activeModalSet('')}>
					{Object.entries(languages).map(([shorthand, label]) => {
						const active = language === shorthand;
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
			)}
			{/* {activeModal === 'contacts' && (
				<Modal heading={i18n.contacts} onClose={() => activeModalSet('')}>
					{[['account', 'vite_5e8d4ac7dc8b75394cacd21c5667d79fe1824acb46c6b7ab1f']].map(
						([label, address]) => {
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
						}
					)}
					<ModalListBottomButton
						label={i18n.addContact}
						onClick={() => {
							// TODO: add contact
						}}
					/>
				</Modal>
			)} */}
			{activeModal === 'password' && (
				<Modal
					heading={i18n.changePassword}
					onClose={() => {
						activeModalSet('');
					}}
					buttonText={i18n.confirm}
					onButtonClick={async () => {
						const valid = validateInputs([oldPasswordRef]);
						if (valid) {
							const passwordIsCorrect = await verifyPassword(oldPasswordRef.value);
							if (passwordIsCorrect) {
								const encryptedSecrets = await encrypt(
									JSON.stringify(secrets),
									newPasswordRef.value
								);
								setValue({ encryptedSecrets });
								activeModalSet('');
								toastSuccess(i18n.passwordChanged);
							}
						}
					}}
				>
					<div className="p-3 space-y-3">
						<TextInput password _ref={oldPasswordRef} label={i18n.oldPassword} />
						<TextInput password _ref={newPasswordRef} label={i18n.newPassword} />
					</div>
				</Modal>
			)}
			{activeModal === 'secrets' && (
				<Modal
					onClose={() => {
						activeModalSet('');
						showSecretsSet(false);
					}}
					heading={i18n.secrets}
					buttonText={!showSecrets ? i18n.next : ''}
					onButtonClick={() => {
						attemptToShowSecrets();
					}}
				>
					{showSecrets ? (
						<Secrets {...secrets!} />
					) : (
						<div className="p-3">
							<TextInput
								password
								autoFocus
								_ref={passwordRef}
								label={i18n.password}
								onKeyDown={(key) => {
									if (key === 'Enter') {
										attemptToShowSecrets();
									}
								}}
							/>
						</div>
					)}
				</Modal>
			)}
			{activeModal === 'reset' && <ResetWalletModal onClose={() => activeModalSet('')} />}
		</TabContainer>
	);
};

export default connect(Settings);
