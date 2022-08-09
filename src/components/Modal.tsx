import { XIcon } from '@heroicons/react/outline';
import { ArrowNarrowLeftIcon, PlusIcon } from '@heroicons/react/solid';
import { ReactNode, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { useKeyPress } from '../utils/hooks';

type Props = {
	fullscreen?: boolean;
	heading?: string;
	subheading?: string;
	headerComponent?: ReactNode;
	onClose?: () => void;
	children: ReactNode;
	className?: string;
	buttonText?: string;
	plusIcon?: boolean;
	onButtonClick?: () => void;
};

const modalParent = document.getElementById('modal')!;

const Modal = ({
	fullscreen,
	heading,
	subheading,
	headerComponent,
	onClose = () => {},
	children,
	className,
	plusIcon,
	buttonText,
	onButtonClick,
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
			className="z-10 h-full w-full fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm overflow-scroll flex flex-col"
			onClick={() => {
				!mouseDraggingModal.current && onClose();
				mouseDraggingModal.current = false;
			}}
		>
			{fullscreen ? (
				<div onClick={(e) => e.stopPropagation()} className="w-full h-full bg-skin-base">
					<div className="xy h-12">
						<button className="absolute left-3 w-8 xy" onClick={onClose}>
							<ArrowNarrowLeftIcon className="w-5 text-skin-back-arrow-icon" />
						</button>
						{heading && <p className="text-lg">{heading}</p>}
						{headerComponent}
					</div>
					<div className={className}>{children}</div>
				</div>
			) : (
				<>
					<div className="flex-1 min-h-[3rem]" />
					<div className="flex justify-center">
						<div
							className={`bg-skin-middleground w-full max-w-full mx-3 overflow-hidden rounded-sm shadow-md ${className}`}
							onClick={(e) => e.stopPropagation()}
							onMouseDown={() => (mouseDraggingModal.current = true)}
							onMouseUp={() => (mouseDraggingModal.current = false)}
						>
							<div className="xy h-12 border-b-2 border-skin-divider">
								<p className="text-lg text-center leading-4">{heading}</p>
								{subheading && (
									<p className="mt-1 text-center leading-3 text-xs text-skin-secondary">
										{subheading}
									</p>
								)}
							</div>
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
				</>
			)}
		</div>,
		modalParent!
	);
};

export default Modal;
