import A from '../components/A';
import { DuplicateIcon } from '@heroicons/react/outline';
import { useCallback, useEffect, useState } from 'react';
import { testWallet } from '../utils/constants';
import { connect } from '../utils/global-context';
import { State } from '../utils/types';
import PageContainer from '../components/PageContainer';
import Secrets from '../containers/Secrets';
import { wallet } from '@vite/vitejs';

type Props = State;

const Create = ({ i18n, copyWithToast }: Props) => {
	const [mnemonics, mnemonicsSet] = useState('');
	const createMnemonics = useCallback((twelveWords = false) => {
		mnemonicsSet(wallet.createMnemonics(twelveWords ? 128 : 256));
	}, []);
	useEffect(() => {
		createMnemonics();
	}, []);

	return (
		<PageContainer heading="Create Wallet">
			<div className="w-full justify-between fx">
				<div className="w-6"></div>
				<div className="flex bg-skin-middleground shadow rounded overflow-hidden">
					<button
						className={`brightness-button px-2 py-0.5 text-sm ${
							mnemonics.length === 12 ? 'bg-skin-foreground' : 'bg-skin-middleground'
						}`}
						onClick={() => createMnemonics(true)}
					>
						12 words
					</button>
					<button
						className={`brightness-button px-2 py-0.5 text-sm ${
							mnemonics.length === 24 ? 'bg-skin-foreground' : 'bg-skin-middleground'
						}`}
						onClick={() => createMnemonics()}
					>
						24 words
					</button>
				</div>
				<button className="darker-brightness-button -m-1 p-1" onClick={() => copyWithToast(mnemonics)}>
					<DuplicateIcon className="w-6 text-skin-secondary" />
				</button>
			</div>
			<Secrets mnemonics={mnemonics} className="mt-2" />
			<p className="mt-1 text-skin-secondary text-center text-sm">Store these words somewhere safe</p>
			<div className="flex-1"></div>
			<A to="/create2" className="round-solid-button" state={{ mnemonics }}>
				{i18n.next}
			</A>
		</PageContainer>
	);
};

export default connect(Create);
