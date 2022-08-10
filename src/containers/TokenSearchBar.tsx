import { SearchIcon } from '@heroicons/react/solid';
import { useState } from 'react';
import { connect } from '../utils/global-context';
import { State } from '../utils/types';

type Props = State & {
	onUserInput: (str: string) => void;
};

const TokenSearchBar = ({ i18n, onUserInput }: Props) => {
	const [value, valueSet] = useState('');
	return (
		<div className="fx z-10 rounded-sm mx-4">
			<div className="absolute z-10 w-10 xy">
				<SearchIcon className="h-6 w-6 text-skin-eye-icon" />
			</div>
			<input
				placeholder={i18n.searchTokensBySymbolOrTti}
				value={value}
				className="h-10 pl-10 pr-2 w-full bg-skin-middleground"
				onChange={(e) => {
					valueSet(e.target.value);
					onUserInput(e.target.value);
					// if (availableTokens !== null) {
					// 	availableTokensSet(undefined);
					// }
					// if (!e.target.value) {
					// 	availableTokensSet([
					// 		...displayedTokens!,
					// 		...defaultTokenList.filter(({ tokenAddress }) => !checkedTokens[tokenAddress]),
					// 	]);
					// 	return;
					// }
					// searchTokenApiInfo(e.target.value, (list: TokenApiInfo[]) => {
					// 	// console.log('list:', list);
					// 	availableTokensSet(list);
					// });
				}}
			/>
		</div>
	);
};

export default connect(TokenSearchBar);
