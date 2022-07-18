/* eslint-disable */

import { useMemo } from 'react';

type Props = {
	tti: string;
	className?: string;
};

// There isn't much rhyme or reason to this. Just need an algorithm to deterministically derive a color from a tti (e.g. tti_5649544520544f4b454e6e40)
const DeterministicIcon = ({ tti, className }: Props) => {
	const derivedHex = useMemo(() => {
		const num = parseInt(tti.slice(5, 20), 16) * 7;
		const str = num.toString(16);
		return str.slice(str.length - 10);
	}, [tti]);

	return (
		<div
			className={`relative overflow-hidden aspect-square ${className}`}
			style={{
				backgroundColor: '#' + derivedHex.slice(0, 6),
			}}
		>
			<div
				className="rounded-full h-[70%] w-[70%] absolute bottom-0 left-0"
				style={{
					backgroundColor: '#' + derivedHex.slice(4, 10),
				}}
			/>
			<div
				className="rounded-full h-[70%] w-[70%] absolute top-0 right-0"
				style={{
					backgroundColor: '#' + derivedHex.slice(2, 8) + 'b0',
				}}
			/>
		</div>
	);
};

export default DeterministicIcon;
