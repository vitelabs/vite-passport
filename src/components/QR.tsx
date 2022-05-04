import { useRef, useEffect, useState, HTMLProps } from 'react';
import QRCode from 'qrcode';

const QR = ({
	data,
	...rest
}: HTMLProps<HTMLDivElement> & {
	data: string;
}) => {
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
		<div {...rest}>
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
