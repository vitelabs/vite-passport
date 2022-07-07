import {
	CreditCardIcon,
	DuplicateIcon,
	PencilIcon,
	// LockClosedIcon,
	// SortAscendingIcon,
	XIcon,
} from '@heroicons/react/outline';
import { wallet } from '@vite/vitejs';
import { useCallback, useMemo, useRef, useState } from 'react';
import Modal from '../components/Modal';
import ModalListItem from '../components/ModalListItem';
import TabContainer from '../components/TabContainer';
import TextInput, { TextInputRefObject } from '../containers/TextInput';
import { connect } from '../utils/global-context';
import { validateInputs } from '../utils/misc';
import {
	shortenAddress,
	validateHttpUrl,
	validateWsUrl,
} from '../utils/strings';
import { State } from '../utils/types';
import ModalListBottomButton from '../components/ModalListBottomButton';
import { setValue } from '../utils/storage';
import WalletContents from '../containers/WalletContents';
import { ExternalLinkIcon } from '@heroicons/react/solid';
import A from '../components/A';

type Props = State;

// constant.Contracts.StakeForQuota_V1
// constant.Contracts.StakeForQuota

const Home = ({
	i18n,
	setState,
	secrets,
	activeAccountIndex,
	activeAccount,
	copyWithToast,
	networks,
	networkUrl,
	accountList,
	contacts,
	toastSuccess,
}: Props) => {
	// const quotaBeneficiaryRef = useRef<TextInputRefObject>();
	// const lockedAmountRef = useRef<TextInputRefObject>();
	const networkNameRef = useRef<TextInputRefObject>();
	const rpcUrlRef = useRef<TextInputRefObject>();
	const blockExplorerUrlRef = useRef<TextInputRefObject>();
	const [editingNetwork, editingNetworkSet] = useState(false);
	const [addingNetwork, addingNetworkSet] = useState(false);
	const [changingActiveAccount, changingActiveAccountSet] = useState(false);
	const [editingAccountName, editingAccountNameSet] = useState(false);
	const [accountName, accountNameSet] = useState(
		contacts[activeAccount.address] || `${i18n.account} ${activeAccountIndex}`
	);
	const [networkName, networkNameSet] = useState('');
	const [rpcUrl, rpcUrlSet] = useState('');
	const [blockExplorerUrl, blockExplorerUrlSet] = useState('');
	// const [votingModalOpen, votingModalOpenSet] = useState(false);
	// const [quotaModalOpen, quotaModalOpenSet] = useState(false);
	// const [quotaBeneficiary, quotaBeneficiarySet] = useState('');
	// const [lockedAmount, lockedAmountSet] = useState('');

	const activeAddress = useMemo(() => {
		accountNameSet(
			contacts[activeAccount.address] || `${i18n.account} ${activeAccountIndex}`
		);
		return activeAccount.address;
	}, [activeAccount, activeAccountIndex, contacts, i18n.account]);

	const saveAccountName = useCallback(() => {
		accountNameSet(accountName);
		const data = {
			contacts: { ...contacts, [activeAddress]: accountName },
		};
		setValue(data);
		setState(data);
	}, [accountName, activeAddress, contacts, setState]);

	return (
		<TabContainer>
			<div className="bg-skin-middleground shadow-md z-10 p-2">
				<div className="fx justify-between">
					<button
						className="border-2 px-2 rounded-full border-skin-alt text-sm bg-skin-middleground text-skin-secondary hover:shadow-md active:shadow brightness-button"
						onClick={() => editingNetworkSet(true)}
					>
						{networks[networkUrl]}
					</button>
					<button
						className="p-1 -mt-1 -mr-1 text-skin-secondary darker-brightness-button"
						onClick={() => changingActiveAccountSet(true)}
					>
						<CreditCardIcon className="w-6 text-inherit" />
					</button>
				</div>
				<div className="fy xy">
					{editingAccountName ? (
						<input
							autoFocus
							className="text-xl text-center px-2 w-full bg-skin-base rounded"
							value={accountName}
							placeholder={accountName}
							onChange={(e) => accountNameSet(e.target.value)}
							onBlur={() => {
								// TODO: set account name
								saveAccountName();
								editingAccountNameSet(false);
							}}
							onKeyDown={(e) => {
								if (e.key === 'Escape') {
									editingAccountNameSet(false);
									accountNameSet(contacts[activeAccount.address]);
								} else if (e.key === 'Enter') {
									saveAccountName();
									editingAccountNameSet(false);
								}
							}}
						/>
					) : (
						<button
							className="group ml-[1.625rem] fx darker-brightness-button"
							onClick={() => editingAccountNameSet(true)}
						>
							<p className="text-xl">{accountName}</p>
							<PencilIcon className="ml-1.5 w-5 opacity-0 duration-200 group-hover:opacity-100" />
						</button>
					)}
					<div className="flex group">
						<button
							className="ml-12 fx darker-brightness-button"
							onClick={() => copyWithToast(activeAddress)}
						>
							<p className="text-skin-secondary">
								{shortenAddress(activeAddress)}
							</p>
							<DuplicateIcon className="ml-1 w-5 text-skin-secondary opacity-0 duration-200 group-hover:opacity-100" />
						</button>
						<A
							className="ml-0.5 darker-brightness-button"
							// OPTIMIZE: Make this URL more flexible for different network URLs
							href={`https://${
								networkUrl === 'wss://buidl.vite.net/gvite/ws' ? 'test.' : ''
							}vitescan.io/address/${activeAddress}`}
						>
							<ExternalLinkIcon className="ml-1 w-5 text-skin-secondary opacity-0 duration-200 group-hover:opacity-100" />
						</A>
					</div>
				</div>
			</div>
			<div className="flex-1 p-2 space-y-2 overflow-scroll">
				{/* <div className="flex gap-2 h-10">
					<button
						className="bg-skin-middleground xy flex-1 rounded brightness-button gap-1.5"
						onClick={() => votingModalOpenSet(true)}
					>
						<SortAscendingIcon className="w-4" />
						<p>{i18n.voting}</p>
					</button>
					<button
						className="bg-skin-middleground xy flex-1 rounded brightness-button gap-1.5"
						onClick={() => quotaModalOpenSet(true)}
					>
						<LockClosedIcon className="w-4" />
						<p>{i18n.quota}</p>
					</button>
				</div> */}
				<WalletContents />
			</div>
			{/* <Modal
				visible={votingModalOpen}
				onClose={() => votingModalOpenSet(false)}
				heading={i18n.voting}
			>
				test
			</Modal>
			<Modal
				visible={quotaModalOpen}
				onClose={() => quotaModalOpenSet(false)}
				heading={i18n.quota}
			>
				<TextInput
					_ref={quotaBeneficiaryRef}
					label={i18n.quotaBeneficiary}
					value={quotaBeneficiary}
					onUserInput={(v) => quotaBeneficiarySet(v)}
				/>
				<TextInput
					_ref={lockedAmountRef}
					label={i18n.lockedAmount}
					value={lockedAmount}
					onUserInput={(v) => lockedAmountSet(v)}
				/>
			</Modal> */}
			<Modal
				visible={editingNetwork}
				fromLeft={addingNetwork}
				onClose={() => editingNetworkSet(false)}
				heading={i18n.networks}
			>
				{Object.entries(networks).map(([url, label]) => {
					const active = networkUrl === url;
					return (
						<ModalListItem
							radio
							key={url}
							active={active}
							label={label}
							sublabel={url}
							onClick={() => {
								if (!active) {
									toastSuccess(i18n.networkChanged);
									setState({ networkUrl: url, viteBalanceInfo: undefined });
									setValue({ networkUrl: url });
								}
								editingNetworkSet(false);
							}}
						/>
					);
				})}
				<ModalListBottomButton
					label={i18n.addNetwork}
					onClick={() => {
						editingNetworkSet(false);
						addingNetworkSet(true);
					}}
				/>
			</Modal>
			<Modal
				fromRight
				heading={i18n.addNetwork}
				visible={addingNetwork}
				onStartClose={() => {
					editingNetworkSet(true);
					setTimeout(() => addingNetworkSet(false), 0);
				}}
				onClose={() => {
					networkNameSet('');
					rpcUrlSet('');
					blockExplorerUrlSet('');
				}}
			>
				{(close) => (
					<div className="space-y-3 p-3">
						<TextInput
							_ref={networkNameRef}
							label={i18n.networkName}
							value={networkName}
							onUserInput={(v) => networkNameSet(v)}
						/>
						<TextInput
							_ref={rpcUrlRef}
							label={i18n.rpcUrl}
							value={rpcUrl}
							onUserInput={(v) => rpcUrlSet(v)}
							getIssue={(v) => {
								if (!validateWsUrl(v) || !validateHttpUrl(v)) {
									return i18n.urlMustStartWithWsWssHttpOrHttps;
								}
							}}
						/>
						<TextInput
							optional
							_ref={blockExplorerUrlRef}
							label={i18n.blockExplorerUrl}
							value={blockExplorerUrl}
							onUserInput={(v) => blockExplorerUrlSet(v)}
							getIssue={(v) => {
								// console.log(v, validateHttpUrl(v));
								if (!validateHttpUrl(v)) {
									return i18n.urlMustStartWithHttpOrHttps;
								}
							}}
						/>
						<button
							className="round-solid-button p-1"
							onClick={() => {
								const valid = validateInputs([
									networkNameRef,
									rpcUrlRef,
									blockExplorerUrlRef,
								]);
								if (valid) {
									const newNetworks = {
										...networks,
										[rpcUrl]: networkName,
									};
									setState({ networks: newNetworks });
									setValue({ networks: newNetworks });
									close();
								}
							}}
						>
							Add
						</button>
					</div>
				)}
			</Modal>
			<Modal
				heading={i18n.accounts}
				visible={changingActiveAccount}
				onClose={() => changingActiveAccountSet(false)}
			>
				{accountList.map(({ address }, i) => {
					const active = i === activeAccountIndex;
					return (
						<div key={address} className="flex items-center">
							<ModalListItem
								radio
								active={active}
								className="flex-1"
								label={contacts[address] || `${i18n.account} ${i}`}
								sublabel={shortenAddress(address)}
								// rightJSX={
								// 	// not that useful a feature for the technical overhead it creates.
								// 	false && (
								// 		<div className="self-start border-2 border-skin-alt px-1 text-skin-muted rounded-full text-xs">
								// 			{i18n.new}
								// 		</div>
								// 	)
								// }
								onClick={() => {
									if (!active) {
										toastSuccess(i18n.accountChanged);
										const data = { activeAccountIndex: i };
										setState({ ...data, activeAccount: accountList[i] });
										setValue(data);
									}
									changingActiveAccountSet(false);
								}}
							/>
							{i + 1 === accountList.length && (
								<button
									className="xy w-8 h-8 mr-2 overflow-hidden rounded-full bg-skin-middleground brightness-button"
									onClick={() => {
										const data: Partial<State> = {
											accountList: [...accountList].slice(
												0,
												accountList.length - 1
											),
										};
										if (activeAccountIndex === data.accountList!.length - 1) {
											data.activeAccountIndex = 0;
										}
										setState(data);
										setValue(data);
									}}
								>
									<XIcon className="w-5 text-skin-secondary" />
								</button>
							)}
						</div>
					);
				})}
				<ModalListBottomButton
					label={i18n.deriveAddress}
					onClick={() => {
						const data = {
							accountList: [
								...accountList,
								wallet.deriveAddress({
									...secrets,
									index: accountList.length,
								}),
							],
						};
						setState(data);
						setValue(data);
					}}
				/>
			</Modal>
		</TabContainer>
	);
};

export default connect(Home);
