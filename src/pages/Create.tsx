import { useCallback, useMemo, useState } from 'react';
import { connect } from '../utils/global-context';
import { State } from '../utils/types';
import PageContainer from '../components/PageContainer';
import Secrets from '../containers/Secrets';
import { wallet } from '@vite/vitejs';
import { useLocation, useNavigate } from 'react-router-dom';
import A from '../components/A';

const Create = ({ i18n }: State) => {
	const navigate = useNavigate();
	const [mnemonics, mnemonicsSet] = useState(wallet.createMnemonics());
	const createMnemonics = useCallback((twelveWords = false) => {
		mnemonicsSet(wallet.createMnemonics(twelveWords ? 128 : 256));
	}, []);
	const { state } = useLocation() as {
		state: { routeAfterUnlock?: string };
	};
	const mnemonicsLength = useMemo(() => mnemonics.split(' ').length, [mnemonics]);

	return (
		<PageContainer heading={i18n.createWallet}>
			<div className="w-full flex flex-col">
				<div className="self-start flex rounded-full border border-skin-divider">
					<button
						className={`text-sm px-3 py-1 rounded-full border ${
							mnemonicsLength === 12
								? 'text-skin-lowlight bg-skin-foreground border-skin-divider'
								: 'text-skin-secondary border-transparent'
						}`}
						onClick={() => createMnemonics(true)}
					>
						{i18n._12Words}
					</button>
					<button
						className={`text-sm px-3 py-1 rounded-full border ${
							mnemonicsLength === 24
								? 'text-skin-lowlight bg-skin-foreground border-skin-divider'
								: 'text-skin-secondary border-transparent'
						}`}
						onClick={() => createMnemonics()}
					>
						{i18n._24Words}
					</button>
				</div>
			</div>
			<Secrets mnemonics={mnemonics} className="mt-2 self-center" />
			<p className="mt-1 text-skin-tertiary text-sm">{i18n.storeTheseWordsSomewhereSafe}</p>
			<div className="flex-1"></div>
			<A
				to="/create2"
				className="h-10 w-full bg-skin-highlight xy rounded-sm"
				state={{ ...state, mnemonics }}
			>
				{i18n.next}
			</A>
		</PageContainer>
	);
};

export default connect(Create);
