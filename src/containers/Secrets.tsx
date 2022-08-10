import { useState } from 'react';
import { DocumentDuplicateIcon } from '@heroicons/react/outline';
import { connect } from '../utils/global-context';
import { isDarkMode } from '../utils/misc';
import { State } from '../utils/types';

type Props = State & {
	mnemonics: string;
	passphrase?: string;
	className?: string;
};

const Secrets = ({ i18n, mnemonics, copyWithToast, className }: Props) => {
	const [visible, visibleSet] = useState(false);
	return (
		<div
			className={`relative overflow-hidden w-full bg-skin-middleground rounded shadow p-4 ${className}`}
		>
			<button className="fx group leading-3 mb-2" onClick={() => copyWithToast(mnemonics)}>
				<p className="text-skin-secondary">{i18n.mnemonicPhrase}</p>
				<DocumentDuplicateIcon className="ml-1 w-5 text-skin-secondary opacity-0 duration-200 group-hover:opacity-100" />
			</button>
			<div className="grid grid-flow-col grid-rows-[repeat(12,minmax(0,1fr))]">
				{mnemonics.split(' ').map((word, i) => (
					<p key={i} className="">
						<span className="text-skin-secondary">{i + 1}.</span> {word}
					</p>
				))}
			</div>
			{/* {passphrase && (
				<>
					<p className="mt-2 text-skin-secondary">{i18n.bip39Passphrase}</p>
					<p className="break-words">{passphrase}</p>
				</>
			)} */}
			{!visible && (
				<div
					// dark: variant doesn't work with bg-opacity
					// https://github.com/tailwindlabs/tailwindcss/issues/2966
					className={`absolute xy p-4 flex-col inset-0 ${
						/* isDarkMode() ? 'bg-black' : 'bg-white' */
						'bg-black'
					} bg-opacity-30 backdrop-blur`}
				>
					<div className="bg-skin-middleground rounded-sm">
						<div className="xy h-10 border-b-2 border-skin-divider">
							<p className="text-lg text-center leading-4">{i18n.secrets}</p>
						</div>
						<p className="m-3 drop-shadow">
							{
								i18n.youAreAboutToViewYourMnemonicPhraseAnyoneWhoSeesItCanStealYourWalletSoMakeSureNoOneElseIsLooking
							}
						</p>
						<button
							className="mt-3 h-10 w-full xy text-skin-lowlight border-t-2 border-skin-divider"
							onClick={() => visibleSet(true)}
						>
							{i18n.view}
						</button>
					</div>
				</div>
			)}
		</div>
	);
};

export default connect(Secrets);
