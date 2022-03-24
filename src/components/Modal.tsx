import { useRef, ReactNode, useMemo, useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { useKeyPress } from '../utils/hooks';

type Props = {
	onClose: () => void;
	children: ReactNode;
	className?: string;
};

const Modal = ({ onClose = () => {}, children, className }: Props) => {
	const mouseDraggingModal = useRef(false);
	const [index, indexSet] = useState<number>();
	const modalParent: HTMLElement | null = useMemo(() => document.getElementById('modal'), []);

	useEffect(() => {
		// setTimeout is for modals that mount exactly when another unmounts.
		// The setTimeout waits until after rendering before counting DOM nodes.
		setTimeout(() => indexSet(modalParent?.children.length), 0);
	}, []);

	useKeyPress('Escape', () => {
		if (modalParent?.children.length === index) {
			onClose();
		}
	});

	useEffect(() => {
		document.body.style.overflow = 'hidden';
		return () => {
			if (!modalParent?.children.length) {
				document.body.style.overflow = 'visible';
			}
		};
	}, [modalParent?.children.length]);

	return modalParent
		? ReactDOM.createPortal(
				<div
					className="z-10 h-[30rem] fixed inset-0 bg-black bg-opacity-10 overflow-scroll flex flex-col"
					onClick={() => {
						!mouseDraggingModal.current && onClose();
						mouseDraggingModal.current = false;
					}}
				>
					<div className="flex-1 min-h-[5rem]" />
					<div className="px-4 flex justify-center">
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
				</div>,
				modalParent
		  )
		: null;
};

export default Modal;
