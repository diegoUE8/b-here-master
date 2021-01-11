
export const environmentStatic = {
	appKey: '865af1430a854af5b01733ff9b725a2b',
	channelName: 'BHere',
	flags: {
		production: false,
		useProxy: false,
		useToken: false,
		selfService: true,
		guidedTourRequest: true,
		editor: true,
		ar: true,
		menu: true,
		attendee: true,
		streamer: true,
		viewer: true,
		maxQuality: false,
	},
	logo: null, //'/b-here/img/logo.png'
	background: {
		image: '/b-here/img/background.jpg',
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
	assets: './',
	worker: './js/workers/image.service.worker.js',
	githubDocs: 'https://raw.githubusercontent.com/diegoUE8/b-here-master/ws/docs/',
	language: '',
	market: '',
	url: {
		index: '/',
		access: '/',
		editor: '/editor',
		selfServiceTour: '/self-service-tour',
		guidedTour: '/guided-tour',
	},
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
	}
};
