import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const HistoryListener = () => {
	const location = useLocation();

	useEffect(() => {
		// location.pathname
		// console.log('location.pathname:', location.pathname);
		// location.state
		// console.log('location.state:', location.state);
		// console.table(location);
	}, [location]);

	return null;
};

export default HistoryListener;
