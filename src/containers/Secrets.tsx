import { DuplicateIcon } from '@heroicons/react/outline';
import { useState } from 'react';
import { connect } from '../utils/global-context';
import { isDarkMode } from '../utils/misc';
import { State } from '../utils/types';

type Props = State & {
	mnemonics: string;
	passphrase?: string;
	className?: string;
};

const Secrets = ({
	i18n,
	mnemonics,
	copyWithToast,
	passphrase,
	className,
}: Props) => {
	const [visible, visibleSet] = useState(false);
	return (
		<div
			className={`relative overflow-hidden w-full bg-skin-middleground rounded shadow p-2 ${className}`}
		>
			<p className="text-skin-secondary">{i18n.mnemonicPhrase}</p>
			<button
				className="darker-brightness-button -m-1 p-1"
				onClick={() => copyWithToast(mnemonics)}
			>
				<DuplicateIcon className="w-6 text-skin-secondary" />
			</button>
			<div className="grid grid-flow-col grid-rows-[repeat(12,minmax(0,1fr))]">
				{mnemonics.split(' ').map((word, i) => (
					<p key={i}>
						{i + 1}. {word}
					</p>
				))}
			</div>
			{passphrase && (
				<>
					<p className="mt-2 text-skin-secondary">{i18n.bip39Passphrase}</p>
					<p className="break-words">{passphrase}</p>
				</>
			)}
			{!visible && (
				<div
					// dark: variant doesn't work with bg-opacity
					// https://github.com/tailwindlabs/tailwindcss/issues/2966
					className={`absolute xy p-4 flex-col inset-0 ${
						isDarkMode() ? 'bg-black' : 'bg-white'
					} bg-opacity-10 backdrop-blur`}
				>
					<p className="mx-3 drop-shadow">
						You are about to view your mnemonic phrase. Anyone who sees it can
						steal your wallet, so make sure no one else is looking.
					</p>
					<button
						className="mt-3 round-outline-button p-0 px-4 w-fit"
						onClick={() => visibleSet(true)}
					>
						View
					</button>
				</div>
			)}
		</div>
	);
};

export default connect(Secrets);
