const electron = require('electron');
const url = require('url');
const path = require('path');

const { app, BrowserWindow, Menu, ipcMain } = electron;

let mainWindow;
let addWindow;

// Listen for app to be ready
app.on('ready', () => {
	// create new window
	mainWindow = new BrowserWindow({
		webPreferences: {
			nodeIntegration: true,
			contextIsolation: false,
		},
	});

	mainWindow.loadURL(
		url.format({
			pathname: path.join(__dirname, 'html/mainWindow.html'),
			protocol: 'file',
			slashes: true,
		})
	);
	// Quit app when closed
	mainWindow.on('closed', () => {
		app.quit();
	});

	// Build menu from template
	const mainMenu = Menu.buildFromTemplate(menuTemplate);
	// Insert menu
	Menu.setApplicationMenu(mainMenu);
});

// Handle create add window
function createAddWindow() {
	// create new window
	addWindow = new BrowserWindow({
		width: 300,
		height: 200,
		title: 'Add item',
		webPreferences: {
			nodeIntegration: true,
			contextIsolation: false,
		},
	});

	addWindow.loadURL(
		url.format({
			pathname: path.join(__dirname, 'html/addWindow.html'),
			protocol: 'file',
			slashes: true,
		})
	);
	// Garbage collection
	addWindow.on('closed', () => {
		addWindow = null;
	});
}

// Catch ipc item:add
ipcMain.on('item:add', (e, item) => {
	console.log(item);
	mainWindow.webContents.send('item:add', item);
	addWindow.close();
});

const menuTemplate = [
	{
		label: 'File',
		submenu: [
			{
				label: 'Add Item',
				accelerator: process.platform == 'darwin' ? 'Command+N' : 'Ctrl+N',
				click() {
					createAddWindow();
				},
			},
			{
				label: 'Clear Items',
				accelerator: process.platform == 'darwin' ? 'Command+W' : 'Ctrl+W',
				click() {
					mainWindow.webContents.send('item:clear');
				},
			},
			{
				label: 'Quit',
				accelerator: process.platform == 'darwin' ? 'Command+Q' : 'Ctrl+Q',
				click() {
					app.quit();
				},
			},
		],
	},
];

// Add dev tools if not in prod
if (process.env.NODE_ENV !== 'production') {
	menuTemplate.push({
		label: 'Dev tools',
		submenu: [
			{
				label: 'Toggle Dev tools',
				accelerator: process.platform == 'darwin' ? 'Command+I' : 'Ctrl+I',
				click(item, focusedWindow) {
					focusedWindow.toggleDevTools();
				},
			},
			{
				role: 'reload',
			},
		],
	});
}
