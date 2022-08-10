import { useRef, useEffect, useState, HTMLProps } from 'react';
import QRCode from 'qrcode';

type Props = {
	className?: string;
	data: string;
};

const QR = ({ data, className }: Props) => {
	const [src, srcSet] = useState('');

	const mountedRef = useRef(true);
	useEffect(
		() => () => {
			mountedRef.current = false;
		},
		[]
	);

	useEffect(() => {
		QRCode.toString(data, { type: 'svg', margin: 0 }).then(
			(url: string) => {
				if (mountedRef.current) {
					srcSet(url);
				}
			},
			(e) => window.alert('QR error: ' + JSON.stringify(e))
		);
	}, [data]);

	return (
		<div className={`h-48 w-48 mx-auto ${className}`}>
			<div
				{...{
					dangerouslySetInnerHTML: { __html: src },
				}}
				className="bg-white p-1.5 dark:invert"
			/>
		</div>
	);
};

export default QR;
