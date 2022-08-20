// https://glennmccomb.com/articles/building-a-pure-css-animated-svg-spinner/

import '../styles/spinner.css';

type Props = { className?: string; size?: number };

const Spinner = ({ className, size = 36 }: Props) => {
	return (
		<svg
			className={`spinner-container ${className}`}
			width={size}
			height={size}
			viewBox="0 0 100 100"
			xmlns="http://www.w3.org/2000/svg"
		>
			<circle className="spinner-circle" cx="50" cy="50" r="45" />
		</svg>
	);
};

export default Spinner;
