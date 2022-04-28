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
// import React from 'react';
// import ReactDOM from 'react-dom';

// const root = document.createElement('div');
// root.id = 'crx-root';
// document.body.append(root);
// console.log('test');
// ReactDOM.render(
// 	<React.StrictMode>
// 		<h1>test</h1>
// 	</React.StrictMode>,
// 	root
// );
