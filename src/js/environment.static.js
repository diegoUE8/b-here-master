
export const environmentStatic = {
	appKey: '8b0cae93d47a44e48e97e7fd0404be4e',
	channelName: 'BHere',
	flags: {
		production: false,
		useProxy: true,
		useToken: false,
		selfService: true,
		guidedTourRequest: true,
		editor: true,
		editorAssetScreen: true,
		menu: true,
		chat: true,
		ar: true,
		like: true,
		attendee: true,
		streamer: true,
		viewer: true,
		smartDevice: true,
		maxQuality: false,
	},
	logo: null, //'/b-here/img/logo.png'
	background: {
		// image: '/b-here/img/background.jpg',
		video: '/b-here/img/background.mp4',
	},
	colors: {
		menuBackground: '#000000',
		menuForeground: '#ffffff',
		menuOverBackground: '#0099ff',
		menuOverForeground: '#ffffff',
		menuBackBackground: '#0099ff',
		menuBackForeground: '#000000',
		menuBackOverBackground: '#0099ff',
		menuBackOverForeground: '#ffffff',
	},
	editor: {
		disabledViewTypes: ['waiting-room', 'room-3d'],
		disabledViewItemTypes: ['texture'],
	},
	assets: '/b-here/',
	worker: './js/workers/image.service.worker.js',
	githubDocs: 'https://raw.githubusercontent.com/diegoUE8/b-here-master/cr.bhere/docs/',
	template: {
		tryInAr: '/try-in-ar.html?viewId=$viewId',
		modal: {
			controlRequest: '/control-request-modal.html',
			tryInAr: '/try-in-ar-modal.html',
			view: {
				'panorama': '/panorama-modal.html',
				'panorama-grid': '/panorama-grid-modal.html',
				'room-3d': '/room-3d-modal.html',
				'model': '/model-modal.html',
			},
			viewItem: {
				'nav': '/nav-modal.html',
				'plane': '/plane-modal.html',
				'curved-plane': '/curved-plane-modal.html',
				'texture': '/texture-modal.html',
				'model': '/item-model-modal.html',
			},
			remove: '/remove-modal.html',
		}
	},
};
