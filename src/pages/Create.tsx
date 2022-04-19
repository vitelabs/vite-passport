import A from '../components/A';
import { DuplicateIcon } from '@heroicons/react/outline';
import { useEffect, useState } from 'react';
import { testWallet } from '../utils/constants';
import { connect } from '../utils/global-context';
import { State } from '../utils/types';
import { isDarkMode } from '../utils/misc';
import PageContainer from '../components/PageContainer';
// import { wallet } from '@vite/vitejs';
// console.log('wallet:', wallet);

type Props = State;

// eslint-disable-next-line
const Create = ({ i18n, copyWithToast }: Props) => {
	const [mnemonics, mnemonicsSet] = useState<string[]>([]);
	const [mnemonicsVisible, mnemonicsVisibleSet] = useState(false);
	useEffect(() => {
		// const thing = wallet.createWallet(256);
		// console.log('thing:', thing);
		mnemonicsSet(testWallet.mnemonics.split(' '));
	}, []);

	return (
		<PageContainer title="Create Wallet">
			<div className="w-full justify-between fx">
				<div className="w-6"></div>
				<div className="flex bg-skin-middleground shadow rounded overflow-hidden">
					<button
						className={`brightness-button px-2 py-0.5 text-sm ${
							mnemonics.length === 12 ? 'bg-skin-foreground' : 'bg-skin-middleground'
						}`}
						onClick={() => {
							mnemonicsSet(testWallet.mnemonics.split(' ').slice(0, 12));
						}}
					>
						12 words
					</button>
					<button
						className={`brightness-button px-2 py-0.5 text-sm ${
							mnemonics.length === 24 ? 'bg-skin-foreground' : 'bg-skin-middleground'
						}`}
						onClick={() => {
							mnemonicsSet(testWallet.mnemonics.split(' '));
						}}
					>
						24 words
					</button>
				</div>
				<button className="darker-brightness-button -m-1 p-1" onClick={() => copyWithToast(mnemonics.join(' '))}>
					<DuplicateIcon className="w-6 text-skin-secondary" />
				</button>
			</div>
			<div
				className={`mt-2 relative overflow-hidden grid grid-flow-col w-full grid-rows-[repeat(12,minmax(0,1fr))] bg-skin-middleground rounded shadow p-2`}
			>
				{mnemonics.map((word, i) => (
					<p key={i}>
						{i + 1}. {word}
					</p>
				))}
				{!mnemonicsVisible && (
					<div
						// dark: variant doesn't work with bg-opacity
						// https://github.com/tailwindlabs/tailwindcss/issues/2966
						className={`absolute xy p-4 flex-col inset-0 ${
							isDarkMode() ? 'bg-black' : 'bg-white'
						} bg-opacity-10 backdrop-blur`}
					>
						<p className="mx-3 drop-shadow">
							You are about to view your mnemonic phrase. Anyone who sees it can steal your wallet, so make sure no one
							else is looking.
						</p>
						<button className="mt-3 round-outline-button p-0 px-4 w-fit" onClick={() => mnemonicsVisibleSet(true)}>
							View
						</button>
					</div>
				)}
			</div>
			<p className="mt-1 text-skin-secondary text-center text-sm">Store these words somewhere safe</p>
			<div className="flex-1"></div>
			<A to="/create2" className="round-solid-button">
				{i18n.next}
			</A>
		</PageContainer>
	);
};

export default connect(Create);
