type Props = {
	onClick: () => void;
	label: string;
	className?: string;
	disabled?: boolean;
	theme: 'white' | 'highlight' | 'foreground';
};

const Button = ({ onClick, label, disabled, theme = 'highlight', className }: Props) => {
	return (
		<button
			disabled={disabled}
			className={`h-10 w-full xy rounded-sm ${
				disabled
					? 'bg-skin-foreground text-skin-eye-icon'
					: {
							white: 'bg-white text-skin-lowlight',
							highlight: 'bg-skin-highlight text-white',
							foreground: 'bg-skin-foreground text-skin-lowlight',
					  }[theme]
			} ${className}`}
			onClick={onClick}
		>
			{label}
		</button>
	);
};

export default Button;
