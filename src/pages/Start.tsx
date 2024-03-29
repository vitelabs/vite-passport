import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import ViteLogo from '../assets/ViteLogo';
import A from '../components/A';
import { connect } from '../utils/global-context';
import { State } from '../utils/types';

const Start = ({ i18n }: State) => {
	const [searchParams] = useSearchParams();
	const routeAfterUnlock = useMemo(() => searchParams.get('routeAfterUnlock'), [searchParams]);

	return (
		<div className="p-4 pb-8 h-full flex flex-col">
			<div className="flex-1 xy flex-col">
				<ViteLogo size={150} className="text-skin-primary" />
			</div>
			<A
				to="/create"
				state={{ routeAfterUnlock }}
				className="h-10 w-full xy rounded-sm bg-skin-highlight text-white"
			>
				{i18n.createANewWallet}
			</A>
			<A
				to="/import"
				state={{ routeAfterUnlock }}
				className="h-10 w-full bg-white xy rounded-sm text-skin-lowlight mt-3"
			>
				{i18n.importAnExistingWallet}
			</A>
		</div>
	);
};

export default connect(Start);
