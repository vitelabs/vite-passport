import A from '../components/A';
import { DuplicateIcon } from '@heroicons/react/outline';
import { useCallback, useState } from 'react';
import { connect } from '../utils/global-context';
import { State } from '../utils/types';
import PageContainer from '../components/PageContainer';
import Secrets from '../containers/Secrets';
import { wallet } from '@vite/vitejs';
import { useLocation } from 'react-router-dom';

type Props = State;

const Create = ({ i18n, copyWithToast }: Props) => {
	const [mnemonics, mnemonicsSet] = useState(wallet.createMnemonics());
	const createMnemonics = useCallback((twelveWords = false) => {
		mnemonicsSet(wallet.createMnemonics(twelveWords ? 128 : 256));
	}, []);
	const {
		state: { routeAfterUnlock },
	} = useLocation() as {
		state: { routeAfterUnlock?: string };
	};

	return (
		<PageContainer heading={i18n.createWallet}>
			<div className="w-full justify-between fx">
				<div className="w-6"></div>
				<div className="flex bg-skin-middleground shadow rounded overflow-hidden">
					<button
						className={`brightness-button px-2 py-0.5 text-sm ${
							mnemonics.length === 12
								? 'bg-skin-foreground'
								: 'bg-skin-middleground'
						}`}
						onClick={() => createMnemonics(true)}
					>
						{i18n._12Words}
					</button>
					<button
						className={`brightness-button px-2 py-0.5 text-sm ${
							mnemonics.length === 24
								? 'bg-skin-foreground'
								: 'bg-skin-middleground'
						}`}
						onClick={() => createMnemonics()}
					>
						{i18n._24Words}
					</button>
				</div>
				<button
					className="darker-brightness-button -m-1 p-1"
					onClick={() => copyWithToast(mnemonics)}
				>
					<DuplicateIcon className="w-6 text-skin-secondary" />
				</button>
			</div>
			<Secrets mnemonics={mnemonics} className="mt-2" />
			<p className="mt-1 text-skin-secondary text-center text-sm">
				Store these words somewhere safe
			</p>
			<div className="flex-1"></div>
			<A
				to="/create2"
				className="round-solid-button"
				state={{ mnemonics, routeAfterUnlock }}
			>
				{i18n.next}
			</A>
		</PageContainer>
	);
};

export default connect(Create);
