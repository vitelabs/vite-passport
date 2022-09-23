import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Button from '../components/Button';
import ModalListItem from '../components/ModalListItem';
import { connect } from '../utils/global-context';
import { setValue } from '../utils/storage';
import { shortenAddress } from '../utils/strings';
import { State } from '../utils/types';

const Connect = ({
	i18n,
	contacts,
	derivedAddresses,
	activeAccountIndex,
	triggerInjectedScriptEvent,
	connectedDomains,
}: State) => {
	const [lastActiveAccountIndex, lastActiveAccountIndexSet] = useState(activeAccountIndex);
	const [searchParams] = useSearchParams();
	const hostname = useMemo(() => searchParams.get('hostname'), [searchParams]);
	if (!hostname) {
		throw new Error('hostname not provided in search params');
	}
	if (!derivedAddresses) {
		// This should never happen. If the wallet does not exist and a dapp tries to connect to VP,
		// the user should be prompted with `/` route
		throw new Error('derivedAddresses does not exist');
	}

	return (
		<div className="h-full flex flex-col">
			<div className="fy p-4 bg-skin-middleground">
				<p className="text-lg text-center">{i18n.vitePassportIsLinking}</p>
				<div className="mt-2 px-4 py-3 bg-skin-base rounded-full">
					<p className="leading-3 text-lg break-words">{hostname}</p>
				</div>
			</div>
			<div className="flex-1 overflow-scroll">
				{derivedAddresses.map((address, i) => {
					const active = i === lastActiveAccountIndex;
					return (
						<ModalListItem
							radio
							base
							key={address}
							active={active}
							className="flex-1"
							label={contacts[address]}
							sublabel={shortenAddress(address)}
							onClick={() => lastActiveAccountIndexSet(i)}
						/>
					);
				})}
			</div>
			<div className="fx p-4 gap-4">
				<Button theme="foreground" label={i18n.cancel} onClick={() => window.close()} />
				<Button
					theme="highlight"
					label={i18n.confirm}
					onClick={async () => {
						const activeAddress = derivedAddresses[lastActiveAccountIndex];
						triggerInjectedScriptEvent({ type: 'connectWallet', payload: { domain: hostname } });
						triggerInjectedScriptEvent({
							type: 'accountChange',
							payload: { activeAddress },
						});
						if (!connectedDomains[activeAddress]) {
							connectedDomains[activeAddress] = {};
						}
						if (!connectedDomains[activeAddress][hostname]) {
							connectedDomains[activeAddress][hostname] = {};
						}
						await setValue({ connectedDomains, activeAccountIndex: lastActiveAccountIndex });
						window.close();
					}}
				/>
			</div>
		</div>
	);
};

export default connect(Connect);
