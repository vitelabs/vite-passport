import { XIcon } from '@heroicons/react/outline';
import { useRef, ReactNode, useEffect, useState, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { useKeyPress } from '../utils/hooks';

type Props = {
	// TODO: editing - for removing items from lists
	visible?: boolean;
	invisible?: boolean;
	fullscreen?: boolean;
	fromRight?: boolean;
	fromLeft?: boolean;
	heading?: string;
	subheading?: string;
	headerComponent?: ReactNode;
	onClose?: () => void;
	onStartClose?: () => void;
	children: ReactNode | ((close: () => void) => ReactNode);
	className?: string;
};

const modalParent = document.getElementById('modal')!;

const Modal = ({
	visible,
	fullscreen,
	fromRight,
	fromLeft,
	heading,
	subheading,
	headerComponent,
	onClose = () => {},
	onStartClose = () => {},
	children,
	className,
}: Props) => {
	const modalRef = useRef<HTMLDivElement | null>(null);
	const mouseDraggingModal = useRef(false);
	const [mounted, mountedSet] = useState(false);
	const [animationStage, animationStageSet] = useState(0);

	const close = useCallback(() => {
		onStartClose();
		animationStageSet(2);
		setTimeout(() => {
			mountedSet(false);
			onClose();
		}, 500);
	}, [onStartClose, onClose]);

	useEffect(() => {
		if (visible && !mounted) {
			mountedSet(true);
			setTimeout(() => animationStageSet(1), 0);
		} else if (!visible && mounted) {
			close();
		}
	}, [visible, mounted, close]);

	useKeyPress('Escape', () => {
		if (mounted) {
			const index = Array.prototype.indexOf.call(
				modalParent!.children,
				modalRef.current
			);
			if (modalParent!.children.length - 1 === index) {
				close();
			}
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

	return !mounted
		? null
		: ReactDOM.createPortal(
				<div
					ref={modalRef}
					className={`z-10 h-full w-full fixed inset-0 bg-black overflow-scroll flex flex-col transition duration-500 ${
						animationStage === 1
							? 'backdrop-blur-sm bg-opacity-10 dark:bg-opacity-20'
							: 'bg-opacity-0'
					}`}
					onClick={() => {
						!mouseDraggingModal.current && close();
						mouseDraggingModal.current = false;
					}}
				>
					{fullscreen ? (
						<div
							onClick={(e) => e.stopPropagation()}
							className={`w-full h-full bg-skin-middleground transition duration-500 ${
								animationStage === 1 ? '' : 'translate-y-10 opacity-0'
							} ${className}`}
						>
							<div className="z-50 fx w-full px-1 shadow">
								<button className="brightness-button" onClick={close}>
									<XIcon className="w-8 text-skin-secondary" />
								</button>
								{heading && (
									<p className="text-xl flex-1 text-center p-2 mr-8">
										{heading}
									</p>
								)}
								{headerComponent}
							</div>
							{typeof children === 'function' ? children(close) : children}
						</div>
					) : (
						<>
							<div className="flex-1 min-h-[3rem]" />
							<div
								className={`flex justify-center transition duration-500 ${
									animationStage === 1
										? ''
										: `${
												fromRight
													? 'translate-x-10'
													: fromLeft
													? '-translate-x-10'
													: 'translate-y-10'
										  } opacity-0`
								}`}
							>
								<div
									className={`bg-skin-middleground w-full max-w-full mx-3 overflow-hidden rounded shadow-md ${className}`}
									onClick={(e) => e.stopPropagation()}
									onMouseDown={() => (mouseDraggingModal.current = true)}
									onMouseUp={() => (mouseDraggingModal.current = false)}
								>
									<div className="min-h-[2.5rem] xy fy border-b-2 border-skin-alt">
										<p className="text-xl text-center leading-4">{heading}</p>
										{subheading && (
											<p className="mt-1 text-center leading-3 text-xs text-skin-secondary">
												{subheading}
											</p>
										)}
									</div>
									{typeof children === 'function' ? children(close) : children}
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
