import { useRef, ReactNode, useMemo, useEffect, useState, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { useKeyPress } from '../utils/hooks';

export type ModalRefObject = {
	close: () => void;
};

type Props = {
	padless?: boolean;
	onClose: () => void;
	children: ReactNode;
	className?: string;
	_ref?: Function | React.MutableRefObject<ModalRefObject | undefined>;
};

const Modal = ({ padless, _ref, onClose = () => {}, children, className }: Props) => {
	const mouseDraggingModal = useRef(false);
	const [animationStage, animationStageSet] = useState(0);
	const [index, indexSet] = useState<number>();
	const modalParent: HTMLElement | null = useMemo(() => document.getElementById('modal'), []);

	useEffect(() => {
		// setTimeout is for modals that mount exactly when another unmounts.
		// The setTimeout waits until after rendering before counting DOM nodes.
		setTimeout(() => indexSet(modalParent?.children.length), 0);

		animationStageSet(1);
	}, []);

	const close = useCallback(() => {
		animationStageSet(2);
		setTimeout(() => onClose(), 500);
	}, [onClose]);

	useEffect(() => {
		if (_ref) {
			const refObject = {
				close,
			};
			if (typeof _ref === 'function') {
				_ref(refObject);
			} else {
				_ref.current = refObject;
			}
		}
	}, [close]);

	useKeyPress('Escape', () => {
		if (modalParent?.children.length === index) {
			close();
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
					className={`z-10 h-[30rem] fixed inset-0 bg-black overflow-scroll flex flex-col transition duration-500 ${
						animationStage === 1 ? 'backdrop-blur-sm bg-opacity-10 dark:bg-opacity-20' : 'bg-opacity-0'
					}`}
					onClick={() => {
						!mouseDraggingModal.current && close();
						mouseDraggingModal.current = false;
					}}
				>
					{padless ? (
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
									animationStage === 1 ? '' : 'translate-y-10 opacity-0'
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
				modalParent
		  )
		: null;
};

export default Modal;
