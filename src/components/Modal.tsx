import { useRef, ReactNode, useMemo, useEffect, useState, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { useKeyPress } from '../utils/hooks';

type Props = {
	visible?: boolean;
	invisible?: boolean;
	fullscreen?: boolean;
	fromRight?: boolean;
	fromLeft?: boolean;
	onClose?: () => void;
	onStartClose?: () => void;
	children: ReactNode;
	className?: string;
};

const Modal = ({
	visible,
	fullscreen,
	fromRight,
	fromLeft,
	onClose = () => {},
	onStartClose = () => {},
	children,
	className,
}: Props) => {
	const modalRef = useRef<HTMLDivElement | null>(null);
	const mouseDraggingModal = useRef(false);
	const [mounted, mountedSet] = useState(false);
	const [animationStage, animationStageSet] = useState(0);
	const modalParent: HTMLElement | null = useMemo(() => document.getElementById('modal'), []);

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
		} else if (mounted) {
			close();
		}
	}, [visible]);

	useKeyPress('Escape', () => {
		if (mounted) {
			const index = Array.prototype.indexOf.call(modalParent!.children, modalRef.current);
			if (modalParent!.children.length - 1 === index) {
				close();
			}
		}
	});

	useEffect(() => {
		document.body.style.overflow = 'hidden';
		return () => {
			if (!modalParent!.children.length) {
				document.body.style.overflow = 'visible';
			}
		};
	}, [modalParent!.children.length]);

	return mounted
		? ReactDOM.createPortal(
				<div
					ref={modalRef}
					className={`z-10 h-[30rem] fixed inset-0 bg-black overflow-scroll flex flex-col transition duration-500 ${
						animationStage === 1 ? 'backdrop-blur-sm bg-opacity-10 dark:bg-opacity-20' : 'bg-opacity-0'
					}`}
					onClick={() => {
						!mouseDraggingModal.current && close();
						mouseDraggingModal.current = false;
					}}
				>
					{fullscreen ? (
						<div
							onClick={(e) => e.stopPropagation()}
							className={`flex mt-auto justify-center transition duration-500 ${
								animationStage === 1 ? '' : 'translate-y-10 opacity-0'
							}`}
						>
							{children}
						</div>
					) : (
						<>
							<div className="flex-1 min-h-[5rem]" />
							<div
								className={`flex justify-center transition duration-500 ${
									animationStage === 1
										? ''
										: `${fromRight ? 'translate-x-10' : fromLeft ? '-translate-x-10' : 'translate-y-10'} opacity-0`
								}`}
							>
								<div
									className={`bg-skin-middleground overflow-hidden rounded shadow-md ${className}`}
									onClick={(e) => e.stopPropagation()}
									onMouseDown={() => (mouseDraggingModal.current = true)}
									onMouseUp={() => (mouseDraggingModal.current = false)}
								>
									{children}
								</div>
							</div>
							<div className="flex-1 min-h-[5rem]"></div>
						</>
					)}
				</div>,
				modalParent!
		  )
		: null;
};

export default Modal;
