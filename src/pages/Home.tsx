import { useMemo, useState } from 'react';
import {
	CreditCardIcon,
	DuplicateIcon,
	// PencilIcon,
	// LockClosedIcon,
	// SortAscendingIcon,
} from '@heroicons/react/outline';
import { wallet } from '@vite/vitejs';
import Modal from '../components/Modal';
import ModalListItem from '../components/ModalListItem';
import TabContainer from '../components/TabContainer';
import TextInput, { useTextInputRef } from '../containers/TextInput';
import { connect } from '../utils/global-context';
import { validateInputs } from '../utils/misc';
import { shortenAddress, validateHttpUrl, validateWsUrl } from '../utils/strings';
import { State } from '../utils/types';
import { setValue } from '../utils/storage';
import WalletContents from '../containers/WalletContents';
import { ExternalLinkIcon } from '@heroicons/react/solid';
import A from '../components/A';
import ViteLogo from '../assets/ViteLogo';

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
	// const quotaBeneficiaryRef = useTextInputRef();
	// const lockedAmountRef = useTextInputRef();
	const networkNameRef = useTextInputRef();
	const rpcUrlRef = useTextInputRef();
	const blockExplorerUrlRef = useTextInputRef();
	const [editingNetwork, editingNetworkSet] = useState(false);
	const [addingNetwork, addingNetworkSet] = useState(false);
	const [changingActiveAccount, changingActiveAccountSet] = useState(false);
	const [networkName, networkNameSet] = useState('');
	const [rpcUrl, rpcUrlSet] = useState('');
	const [blockExplorerUrl, blockExplorerUrlSet] = useState('');
	// const [votingModalOpen, votingModalOpenSet] = useState(false);
	// const [quotaModalOpen, quotaModalOpenSet] = useState(false);
	// const [quotaBeneficiary, quotaBeneficiarySet] = useState('');
	// const [lockedAmount, lockedAmountSet] = useState('');

	return (
		<TabContainer>
			<div className="bg-skin-middleground shadow-md z-10 p-4">
				<div className="fx absolute top-3">
					<div className="h-8 w-8 xy rounded-full text-white bg-gradient-to-br from-[#1944c5] to-[#60b2ed]">
						<ViteLogo noText size={16} />
					</div>
					<div className="flex flex-col items-start ml-2.5">
						<button
							className="mt-0.5 p-1 text-sm text-skin-secondary leading-3"
							onClick={() => editingNetworkSet(true)}
						>
							{activeNetwork.name}
						</button>
						<button
							className="p-1 fx"
							onClick={() => {
								//
							}}
						>
							<div
								className={`h-2 w-2 rounded-full ${
									!true ? 'bg-skin-connected-green' : 'bg-skin-eye-icon'
								}`}
							/>
							<p className="ml-1 text-xs text-skin-tertiary leading-3">
								{!true ? i18n.connected : i18n.disconnected}
							</p>
						</button>
					</div>
				</div>
				<button
					className="absolute p-1 -m-1 right-5"
					onClick={() => changingActiveAccountSet(true)}
				>
					<CreditCardIcon className="w-6 text-skin-unchecked-checkbox" />
				</button>
				<div className="fy xy mt-12">
					<p className="text-skin-secondary">{contacts[activeAccount.address]}</p>
					<div className="flex rounded-full bg-skin-base gap-2 py-2 px-4">
						<p className="text-sm">{shortenAddress(activeAccount.address)}</p>
						<button className="p-1 -m-1 xy" onClick={() => copyWithToast(activeAccount.address)}>
							<DuplicateIcon className="w-4 text-skin-back-arrow-icon" />
						</button>
						{activeNetwork.explorerUrl && (
							<A
								className="p-1 -m-1 xy"
								href={`${activeNetwork.explorerUrl}/address/${activeAccount.address}`}
							>
								<ExternalLinkIcon className="w-4 text-skin-back-arrow-icon" />
							</A>
						)}
					</div>
				</div>
			</div>
			<div className="flex-1 p-4 space-y-4 overflow-scroll">
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
			{editingNetwork && (
				<Modal
					onClose={() => editingNetworkSet(false)}
					heading={i18n.networks}
					buttonText={i18n.addNetwork}
					onButtonClick={() => {
						editingNetworkSet(false);
						addingNetworkSet(true);
					}}
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
				</Modal>
			)}
			{addingNetwork && (
				<Modal
					heading={i18n.addNetwork}
					onClose={() => {
						editingNetworkSet(true);
						networkNameSet('');
						rpcUrlSet('');
						blockExplorerUrlSet('');
					}}
					buttonText={i18n.add}
					onButtonClick={() => {
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
							addingNetworkSet(false);
						}
					}}
				>
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
					</div>
				</Modal>
			)}
			{changingActiveAccount && (
				<Modal
					plusIcon
					heading={i18n.accounts}
					onClose={() => changingActiveAccountSet(false)}
					buttonText={i18n.deriveAddress}
					onButtonClick={() => {
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
								// 		<div className="self-start border-2 border-skin-eye-icon px-1 text-skin-muted rounded-full text-xs">
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
				</Modal>
			)}
		</TabContainer>
	);
};

export default connect(Home);
