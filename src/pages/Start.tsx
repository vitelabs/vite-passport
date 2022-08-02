// import ViteLogo from '../assets/ViteLogo';
import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import A from '../components/A';
import { connect } from '../utils/global-context';
import { State } from '../utils/types';
// import { accountBlock } from '@vite/vitejs'
// console.log('accountBlock:', accountBlock)

const Start = ({ i18n }: State) => {
	const [searchParams] = useSearchParams();
	const routeAfterUnlock = useMemo(() => searchParams.get('routeAfterUnlock'), [searchParams]);

	return (
		<div className="p-4 h-full flex flex-col">
			<div className="flex-1 xy flex-col">
				{/* <ViteLogo size={170} className="drop-shadow-lg text-[var(--bg-base-color)]" /> */}
				<p className="text-3xl drop-shadow-lg font-black text-skin-muted">Vite Passport</p>
			</div>
			<A to={'/create'} state={{ routeAfterUnlock }} className="round-solid-button">
				{i18n.createANewWallet}
			</A>
			<A to={'/import'} state={{ routeAfterUnlock }} className="round-outline-button mt-3">
				{i18n.importAnExistingWallet}
			</A>
		</div>
	);
};

export default connect(Start);
