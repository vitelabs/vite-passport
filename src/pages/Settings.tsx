import TabContainer from '../components/TabContainer';
import { connect } from '../utils/global-context';
import { State } from '../utils/types';

type Props = State;

const Settings = ({}: Props) => {
	return (
		<TabContainer scrollable={false}>
			<div className="w-full top-0 bg-skin-middleground">
				<p className="text-xl flex-1 text-center p-2">Settings</p>
			</div>
			<div className="flex-1 overflow-scroll">
				<button className="fx w-full justify-between p-2 brightness-button">
					<p className="">Explorer</p>
					<p className="">ViteScan</p>
				</button>
				<button className="fx w-full justify-between p-2 brightness-button">
					<p className="">Currency Conversion</p>
					<p className="">USD</p>
				</button>
				<button className="fx w-full justify-between p-2 brightness-button">
					<p className="">Contacts</p>
				</button>
				<button className="fx w-full justify-between p-2 brightness-button">
					<p className="">Change Password</p>
				</button>
				<button className="fx w-full justify-between p-2 brightness-button">
					<p className="">Change BIP-39 Passphrase</p>
				</button>
				<button className="fx w-full justify-between p-2 brightness-button">
					<p className="">Reset Wallet</p>
				</button>
				<button className="fx w-full justify-between p-2 brightness-button">
					<p className="">Lock Wallet</p>
				</button>
			</div>
		</TabContainer>
	);
};

export default connect(Settings);
