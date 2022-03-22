import { CheckCircleIcon } from '@heroicons/react/solid';
import { useEffect, useMemo, useState } from 'react';
import ReactDOM from 'react-dom';
import { connect } from '../utils/global-context';
import { State, ToastTypes } from '../utils/types';

type Props = State;

const colors = {
	success: '#85C787',
	warning: '#FEB74D',
	error: '#FE8863',
	info: '#62ABEC',
};
const secondaryColors = {
	success: '#E7F4E6',
	warning: '#FFF2DB',
	error: '#FFE6E2',
	info: '#DFEEFB',
};

let mountTimer: NodeJS.Timeout;
let unmountTimer: NodeJS.Timeout;
let closeTimer: NodeJS.Timeout;
let enterDate = 0;
let exiting = false;
let showTimeStart = 0;
const minShowTime = 2000;
const toastParent = document.getElementById('toast');

const Toast = ({ setState, toast }: Props) => {
	const [animationStage, animationStageSet] = useState(0);
	const colorKey = toast?.[1] || 'success';
	// toast = 'test';

	useEffect(() => {
		clearTimeout(closeTimer);
		clearTimeout(mountTimer);
		clearTimeout(unmountTimer);
		if (toast) {
			showTimeStart = Date.now();
			exiting = false;
			setTimeout(() => animationStageSet(1), 0);
			mountTimer = setTimeout(() => animationStageSet(2), minShowTime);
			unmountTimer = setTimeout(() => {
				animationStageSet(0);
				closeTimer = setTimeout(() => setState({ toast: undefined }), 300);
			}, minShowTime + 300); // +300 cuz duration-300
		}
	}, [setState, toast]);
	return !toast
		? null
		: ReactDOM.createPortal(
				<div className="fixed z-50 top-0 w-full pointer-events-none xy p-3">
					{toast && (
						<div
							onMouseEnter={() => {
								if (exiting) return; // If ur mouse leaves the toast going down, the exit animation can make ur cursor enter again, cancelling the dismount - hence this check.
								clearTimeout(closeTimer);
								clearTimeout(mountTimer);
								clearTimeout(unmountTimer);
								enterDate = Date.now();
							}}
							onMouseLeave={() => {
								closeTimer = setTimeout(() => {
									exiting = true;
									animationStageSet(2);
									closeTimer = setTimeout(() => {
										setState({ toast: undefined });
										animationStageSet(0);
									}, 300);
								}, Math.max(0, minShowTime - (Date.now() - enterDate)));
							}}
							className={`shadow-md w-full fx pointer-events-auto backdrop-blur bg-skin-foreground dark:bg-skin-base relative pl-2 pr-3 py-2 rounded overflow-hidden transition-all duration-300 ${
								animationStage === 0
									? 'scale-90 -translate-y-2 opacity-0'
									: animationStage === 1
									? 'scale-1 translate-y-0 opacity-1'
									: 'translate-y-4 opacity-0'
							}`}
						>
							<div className="absolute inset-0" style={{ background: secondaryColors[colorKey] + '11' }} />
							<div className="absolute top-0 left-0 h-full w-1" style={{ background: colors[colorKey] }} />
							<CheckCircleIcon className="w-[1.5rem] min-w-[1.5rem]" style={{ fill: colors[colorKey] }} />
							<p className="mx-1 z-10">{toast[0]}</p>
						</div>
					)}
				</div>,
				toastParent!
		  );
};

export default connect(Toast);
