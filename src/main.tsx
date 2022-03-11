import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/App';
import './styles/reset.css';
import './styles/colors.css';
import './styles/classes.css';
import './styles/theme.ts';

ReactDOM.render(
	<React.StrictMode>
		<App />
	</React.StrictMode>,
	document.getElementById('root')
);
