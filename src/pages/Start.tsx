import ViteLogo from '../assets/ViteLogo';
import A from '../components/A';
import { connect } from '../utils/global-context';
import { State } from '../utils/types';

type Props = State;

const Start = ({ i18n }: Props) => {
	return (
		<div className="p-5 h-full flex flex-col">
			<div className="flex-1 xy flex-col">
				{/* <ViteLogo size={170} className="drop-shadow-lg text-[var(--bg-base-color)]" /> */}
				<p className="text-3xl drop-shadow-lg">Vite Passport</p>
			</div>
			<A to="/create" className="round-solid-button">
				{i18n.createANewWallet}
			</A>
			<A to="/import" className="round-outline-button mt-4">
				{i18n.importAnExistingWallet}
			</A>
		</div>
	);
};

export default connect(Start);
