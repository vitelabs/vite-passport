/* eslint-disable */

import { useMemo } from 'react';
import DeterministicIcon from '../components/DeterministicIcon';
import { connect } from '../utils/global-context';
import { formatPrice } from '../utils/misc';
import { addIndexToTokenSymbol, shortenTti, toBiggestUnit } from '../utils/strings';
import { State, TokenApiInfo } from '../utils/types';

type Props = State &
	TokenApiInfo & {
		onClick?: () => void;
	};

const TokenCard = ({
	prices,
	currencyConversion,
	viteBalanceInfo,
	onClick,
	symbol,
	name,
	tokenAddress: tti,
	tokenIndex,
	icon,
	decimal,
}: // gatewayInfo,
Props) => {
	const balanceInfoMap = useMemo(
		() => (viteBalanceInfo ? viteBalanceInfo?.balance?.balanceInfoMap || {} : undefined),
		[viteBalanceInfo]
	);
	const balance = balanceInfoMap?.[tti]?.balance || '0';
	const biggestUnit = !balanceInfoMap ? null : toBiggestUnit(balance, decimal);
	const Tag = useMemo(() => (onClick ? 'button' : 'div'), [onClick]);

	return (
		<Tag className="fx rounded-sm w-full px-4 py-3 shadow bg-skin-middleground" onClick={onClick}>
			{!icon ? (
				<DeterministicIcon tti={tti} className="h-10 w-10 rounded-full" />
			) : (
				<img
					src={icon}
					alt={addIndexToTokenSymbol(symbol, tokenIndex)}
					className="h-10 w-10 rounded-full bg-gradient-to-tr from-skin-eye-icon to-skin-bg-base"
				/>
			)}
			<div className="ml-4 flex-1 flex">
				<div className="flex flex-col flex-1 items-start">
					<p className="text-lg">{addIndexToTokenSymbol(symbol, tokenIndex)}</p>
					<p className="text-sm text-skin-tertiary font-medium">{shortenTti(tti)}</p>
				</div>
				<div className="flex flex-col items-end mr-1.5">
					<p className="text-lg">{biggestUnit === null ? '...' : biggestUnit}</p>
					{currencyConversion && (
						<p className="text-sm text-skin-secondary font-medium">
							{!prices || biggestUnit === null
								? '...'
								: `≈${formatPrice(
										biggestUnit!,
										prices?.[name.replace(/ /g, '').toLowerCase()]?.usd
								  )}`}
						</p>
					)}
				</div>
			</div>
		</Tag>
	);
};

export default connect(TokenCard);
