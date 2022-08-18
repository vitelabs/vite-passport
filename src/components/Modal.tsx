import { ArrowNarrowLeftIcon, PlusIcon } from '@heroicons/react/solid';
import { ReactNode, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { useKeyPress } from '../utils/hooks';

type Props = {
	fullscreen?: boolean;
	bottom?: boolean;
	noHeader?: boolean;
	heading?: string;
	subheading?: string;
	onClose: () => void;
	children: ReactNode;
	className?: string;
	buttonText?: string;
	plusIcon?: boolean;
	noBackArrow?: boolean;
	onButtonClick?: () => void;
};

const modalParent = document.getElementById('modal')!;

const Modal = ({
	fullscreen,
	noHeader,
	heading,
	subheading,
	onClose,
	children,
	className,
	plusIcon,
	buttonText,
	onButtonClick,
	bottom,
	noBackArrow,
}: Props) => {
	const modalRef = useRef<HTMLDivElement | null>(null);
	const mouseDraggingModal = useRef(false);

	useKeyPress('Escape', () => {
		const index = Array.prototype.indexOf.call(modalParent!.children, modalRef.current);
		if (modalParent!.children.length - 1 === index) {
			onClose();
		}
	});

	useEffect(() => {
		document.body.style.overflow = 'hidden';
		return () => {
			if (!modalParent.children.length) {
				document.body.style.overflow = 'visible';
			}
		};
	}, []);

	return ReactDOM.createPortal(
		<div
			ref={modalRef}
			className="z-10 h-full w-full fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm overflow-scroll"
			onClick={() => {
				!mouseDraggingModal.current && onClose();
				mouseDraggingModal.current = false;
			}}
		>
			{fullscreen ? (
				<div
					onClick={(e) => e.stopPropagation()}
					className="flex flex-col w-full h-full bg-skin-base"
				>
					<div className="xy flex-col h-12">
						{!noBackArrow && (
							<button className="absolute left-3 w-8 h-8 xy" onClick={onClose}>
								<ArrowNarrowLeftIcon className="w-5 text-skin-back-arrow-icon" />
							</button>
						)}
						{heading && <p className="text-lg">{heading}</p>}
						{subheading && (
							<p className="mt-1 text-center leading-3 text-xs text-skin-secondary">{subheading}</p>
						)}
					</div>
					<div className={`flex-1 ${className}`}>{children}</div>
				</div>
			) : bottom ? (
				<div onClick={(e) => e.stopPropagation()} className="h-full flex flex-col">
					<div className="flex-1" onClick={onClose} />
					<div className={`bg-skin-middleground ${className}`}>{children}</div>
				</div>
			) : (
				<div className="min-h-full flex flex-col">
					<div className="flex-1 min-h-[3rem]" />
					<div className="flex justify-center">
						<div
							className={`bg-skin-middleground w-full max-w-full mx-8 rounded-sm shadow-md ${className}`}
							onClick={(e) => e.stopPropagation()}
							onMouseDown={() => (mouseDraggingModal.current = true)}
							onMouseUp={() => (mouseDraggingModal.current = false)}
						>
							{!noHeader && (
								<div className="xy h-12 border-b-2 border-skin-divider">
									<p className="text-lg text-center leading-4">{heading}</p>
									{subheading && (
										<p className="mt-1 text-center leading-3 text-xs text-skin-secondary">
											{subheading}
										</p>
									)}
								</div>
							)}
							{children}
							{buttonText && (
								<button
									className={`h-12 px-2 w-full text-skin-lowlight border-t-2 border-skin-divider ${
										plusIcon ? 'fx' : 'xy'
									}`}
									onClick={onButtonClick}
								>
									{plusIcon && <PlusIcon className="w-6 ml-1 mr-2" />}
									{buttonText}
								</button>
							)}
						</div>
					</div>
					<div className="flex-1 min-h-[2rem]"></div>
				</div>
			)}
		</div>,
		modalParent!
	);
};

export default Modal;
