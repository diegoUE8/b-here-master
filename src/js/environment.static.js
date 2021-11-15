
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
		editorAssetScreen: true,
		menu: true,
		menuEmbed: true,
		navmaps: true,
		chat: true,
		ar: true,
		like: true,
		hideNavInfo: true,
		attendee: true,
		streamer: true,
		viewer: true,
		smartDevice: true,
		maxQuality: false,
	},
	logo: '/b-here/img/logo.png',
	background: {
		// image: '/b-here/img/background.jpg',
		video: '/b-here/img/background.mp4',
	},
	colors: {
		menuBackground: '#000000',
		menuForeground: '#ffffff',
		menuOverBackground: '#464646',
		menuOverForeground: '#ffffff',
		menuBackBackground: '#464646',
		menuBackForeground: '#000000',
		menuBackOverBackground: '#464646',
		menuBackOverForeground: '#ffffff',
	},
	editor: {
		disabledViewTypes: ['waiting-room'],
		disabledViewItemTypes: ['texture'],
	},
	assets: '/b-here/',
	workers: {
		image: './js/workers/image.service.worker.js',
		prefetch: './js/workers/prefetch.service.worker.js',
	},
	textures: {
		envMap: 'textures/envMap/flower_road_1k.hdr',
		grid: 'textures/grid/grid.jpg',
	},
	githubDocs: 'https://raw.githubusercontent.com/diegoUE8/b-here-master/main/docs/',
	template: {
		tryInAr: '/try-in-ar.html?viewId=$viewId',
		modal: {
			configureFirewall: '/configure-firewall-modal.html',
			controlRequest: '/control-request-modal.html',
			tryInAr: '/try-in-ar-modal.html',
			view: {
				'panorama': '/panorama-modal.html',
				'panorama-grid': '/panorama-grid-modal.html',
				'room-3d': '/room-3d-modal.html',
				'model': '/model-modal.html',
				'media': '/media-modal.html',
			},
			viewItem: {
				'nav': '/nav-modal.html',
				'plane': '/plane-modal.html',
				'curved-plane': '/curved-plane-modal.html',
				'texture': '/texture-modal.html',
				'model': '/item-model-modal.html',
			},
			navmap: '/navmap-modal.html',
			navmapItem: '/navmap-item-modal.html',
			remove: '/remove-modal.html',
		}
	},
};
