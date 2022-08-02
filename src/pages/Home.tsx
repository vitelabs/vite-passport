import { useCallback, useMemo, useRef, useState } from 'react';
import {
	CreditCardIcon,
	DuplicateIcon,
	PencilIcon,
	// LockClosedIcon,
	// SortAscendingIcon,
} from '@heroicons/react/outline';
import { wallet } from '@vite/vitejs';
import Modal from '../components/Modal';
import ModalListItem from '../components/ModalListItem';
import TabContainer from '../components/TabContainer';
import TextInput, { TextInputRefObject } from '../containers/TextInput';
import { connect } from '../utils/global-context';
import { validateInputs } from '../utils/misc';
import { shortenAddress, validateHttpUrl, validateWsUrl } from '../utils/strings';
import { State } from '../utils/types';
import ModalListBottomButton from '../components/ModalListBottomButton';
import { setValue } from '../utils/storage';
import WalletContents from '../containers/WalletContents';
import { ExternalLinkIcon } from '@heroicons/react/solid';
import A from '../components/A';

// constant.Contracts.StakeForQuota_V1
// constant.Contracts.StakeForQuota

const Home = ({
	i18n,
	setState,
	secrets,
	activeAccountIndex,
	activeAccount,
	copyWithToast,
	networkList,
	activeNetworkIndex,
	accountList,
	contacts,
	toastSuccess,
	activeNetwork,
	triggerEvent,
}: State) => {
	// const quotaBeneficiaryRef = useRef<TextInputRefObject>();
	// const lockedAmountRef = useRef<TextInputRefObject>();
	const networkNameRef = useRef<TextInputRefObject>();
	const rpcUrlRef = useRef<TextInputRefObject>();
	const blockExplorerUrlRef = useRef<TextInputRefObject>();
	const [editingNetwork, editingNetworkSet] = useState(false);
	const [addingNetwork, addingNetworkSet] = useState(false);
	const [changingActiveAccount, changingActiveAccountSet] = useState(false);
	const [editingAccountName, editingAccountNameSet] = useState(false);
	const [accountName, accountNameSet] = useState(contacts[activeAccount.address]);
	const [networkName, networkNameSet] = useState('');
	const [rpcUrl, rpcUrlSet] = useState('');
	const [blockExplorerUrl, blockExplorerUrlSet] = useState('');
	// const [votingModalOpen, votingModalOpenSet] = useState(false);
	// const [quotaModalOpen, quotaModalOpenSet] = useState(false);
	// const [quotaBeneficiary, quotaBeneficiarySet] = useState('');
	// const [lockedAmount, lockedAmountSet] = useState('');

	const activeAddress = useMemo(() => {
		accountNameSet(contacts[activeAccount.address]);
		return activeAccount.address;
	}, [activeAccount, contacts]);

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
						{activeNetwork.name}
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
							<p className="text-skin-secondary">{shortenAddress(activeAddress)}</p>
							<DuplicateIcon className="ml-1 w-5 text-skin-secondary opacity-0 duration-200 group-hover:opacity-100" />
						</button>
						{activeNetwork.explorerUrl && (
							<A
								className="ml-0.5 darker-brightness-button"
								href={`${activeNetwork.explorerUrl}/address/${activeAddress}`}
							>
								<ExternalLinkIcon className="ml-1 w-5 text-skin-secondary opacity-0 duration-200 group-hover:opacity-100" />
							</A>
						)}
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
				{networkList.map((network, i) => {
					const active = i === activeNetworkIndex;
					return (
						<ModalListItem
							radio
							key={network.rpcUrl}
							active={active}
							label={network.name}
							sublabel={network.rpcUrl}
							onClick={() => {
								if (!active) {
									toastSuccess(i18n.networkChanged);
									setState({
										activeNetworkIndex: i,
										viteBalanceInfo: undefined,
										activeNetwork: networkList[i],
									});
									setValue({ activeNetworkIndex: i });
									triggerEvent({
										type: 'networkChange',
										payload: { activeNetwork: network.rpcUrl },
									});
								}
								editingNetworkSet(false);
							}}
							onClose={
								[
									'wss://node.vite.net/gvite/ws',
									'wss://buidl.vite.net/gvite/ws',
									'ws://localhost:23457',
								].includes(network.rpcUrl)
									? undefined
									: () => {
											const newNetworkList = [...networkList];
											newNetworkList.splice(i, 1);
											const data = {
												networkList: newNetworkList,
												activeNetworkIndex: i === networkList.length - 1 ? 0 : activeNetworkIndex,
											};
											setState(data);
											setValue(data);
									  }
							}
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
								if (!validateWsUrl(v) && !validateHttpUrl(v)) {
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
								const valid = validateInputs([networkNameRef, rpcUrlRef, blockExplorerUrlRef]);
								if (valid) {
									const newNetworkList = [
										...networkList,
										{
											name: networkName.trim(),
											rpcUrl: networkName.trim(),
											explorerUrl: blockExplorerUrl.trim() || undefined,
										},
									];
									const data = { networkList: newNetworkList };
									setState(data);
									setValue(data);
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
						<ModalListItem
							radio
							key={address}
							active={active}
							className="flex-1"
							label={contacts[address]}
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
									setState({
										...data,
										activeAccount: accountList[i],
										viteBalanceInfo: undefined,
										transactionHistory: undefined,
									});
									setValue(data);
									triggerEvent({
										type: 'accountChange',
										payload: { activeAddress: accountList[i].address },
									});
								}
								changingActiveAccountSet(false);
							}}
							onClose={
								i + 1 !== accountList.length || i === 0
									? undefined
									: () => {
											const data = {
												accountList: [...accountList].slice(0, accountList.length - 1),
												activeAccountIndex:
													activeAccountIndex === accountList.length - 1 ? 0 : activeAccountIndex,
											};
											setState({ ...data, activeAccount: accountList[data.activeAccountIndex] });
											setValue(data);
									  }
							}
						/>
					);
				})}
				<ModalListBottomButton
					label={i18n.deriveAddress}
					onClick={() => {
						const newAccount = wallet.deriveAddress({
							...secrets!,
							index: accountList.length,
						});
						const newAccountList = [...accountList, newAccount];
						const newContacts = {
							...contacts,
							[newAccount.address]: `Account ${accountList.length}`,
						};
						const data = {
							accountList: newAccountList,
							contacts: newContacts,
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
