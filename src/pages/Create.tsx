import A from '../components/A';
import { DuplicateIcon, XIcon } from '@heroicons/react/outline';
import { useEffect, useState } from 'react';
import { testWallet } from '../utils/constants';
import { connect } from '../utils/global-context';
import { State } from '../utils/types';

type Props = State;

// eslint-disable-next-line
const Create = ({ i18n, copyWithToast }: Props) => {
	const [mnemonics, mnemonicsSet] = useState<string[]>([]);
	const [mnemonicsVisible, mnemonicsVisibleSet] = useState(false);
	useEffect(() => {
		mnemonicsSet(testWallet.mnemonics.split(' '));
	}, []);

	return (
		<div className="h-full flex flex-col">
			<div className="fx justify-between p-1">
				<A to="/" className="p-1">
					<XIcon className="w-7 text-skin-secondary" />
				</A>
				<p className="text-2xl font-medium">New Wallet</p>
				<div className="w-9" />
			</div>
			<div className="flex-1 p-5 pt-0 fy">
				<div className="w-full justify-between fx">
					<div className="w-8"></div>
					<div className="flex bg-skin-middleground shadow rounded overflow-hidden">
						<button
							className={`px-2 py-0.5 font-semibold text-sm ${mnemonics.length === 12 ? 'bg-skin-foreground' : ''}`}
							onClick={() => {
								mnemonicsSet(testWallet.mnemonics.split(' ').slice(0, 12));
							}}
						>
							12 words
						</button>
						<button
							className={`px-2 py-0.5 font-semibold text-sm ${mnemonics.length === 24 ? 'bg-skin-foreground' : ''}`}
							onClick={() => {
								mnemonicsSet(testWallet.mnemonics.split(' '));
							}}
						>
							24 words
						</button>
					</div>
					<button
						className="px-1"
						onClick={() => {
							console.log('mnemonics:', mnemonics);
							copyWithToast(mnemonics.join(' '));
						}}
					>
						<DuplicateIcon className="w-6 text-skin-secondary" />
					</button>
				</div>
				<div
					className={`mt-2 relative overflow-hidden grid grid-flow-col w-full grid-rows-[repeat(12,minmax(0,1fr))] bg-skin-middleground rounded shadow p-2`}
				>
					{mnemonics.map((word, i) => (
						<p className={`font-medium [${i === 0 ? 'order-last' : ''}]`}>
							{i + 1}. {word}
						</p>
					))}
					{!mnemonicsVisible && (
						<div className="absolute xy p-4 flex-col inset-0 bg-white bg-opacity-50 backdrop-blur">
							<p className="text-justify drop-shadow">
								You are about to view your mnemonic phrase. Anyone who sees it can steal your wallet, so make sure no
								one else is looking.
							</p>
							<button className="mt-3 round-outline-button p-0 px-4 w-fit" onClick={() => mnemonicsVisibleSet(true)}>
								View
							</button>
						</div>
					)}
				</div>
				<p className="mt-1 text-skin-secondary text-sm">Store these words somewhere safe</p>
				<div className="flex-1"></div>
				<A to="/create" className="round-solid-button">
					{i18n.next}
				</A>
			</div>
		</div>
	);
};

export default connect(Create);
