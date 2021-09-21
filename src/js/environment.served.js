
export const environmentServed = {
	appKey: '865af1430a854af5b01733ff9b725a2b',
	channelName: 'BHere',
	flags: {
		production: true,
		useProxy: false,
		useToken: false,
		selfService: true,
		guidedTourRequest: true,
		editor: false,
		editorAssetScreen: false,
		menu: true,
		navmaps: false,
		chat: false,
		ar: true,
		like: true,
		hideNavInfo: true,
		attendee: true,
		streamer: true,
		viewer: true,
		smartDevice: true,
		maxQuality: false,
	},
	logo: null,
	background: {
		// image: '/Modules/B-Here/Client/docs/img/background.jpg',
		video: '/Modules/B-Here/Client/docs/img/background.mp4',
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
		disabledViewTypes: ['waiting-room', 'room-3d', 'media'],
		disabledViewItemTypes: ['texture'],
	},
	assets: '/Modules/B-Here/Client/docs/',
	workers: {
		image: '/Modules/B-Here/Client/docs/js/workers/image.service.worker.js',
		prefetch: '/Modules/B-Here/Client/docs/js/workers/prefetch.service.worker.js',
	},
	textures: {
		envMap: 'textures/envMap/flower_road_1k.hdr',
		grid: 'textures/grid/grid.jpg',
	},
	githubDocs: 'https://raw.githubusercontent.com/diegoUE8/b-here-master/main/docs/',
	template: {
		tryInAr: '/template/modules/b-here/try-in-ar.cshtml?viewId=$viewId',
		modal: {
			configureFirewall: '/template/modules/b-here/configure-firewall-modal.cshtml',
			controlRequest: '/template/modules/b-here/control-request-modal.cshtml',
			tryInAr: '/template/modules/b-here/try-in-ar-modal.cshtml',
			view: {
				'panorama': '/template/modules/b-here/panorama-modal.cshtml',
				'panorama-grid': '/template/modules/b-here/panorama-grid-modal.cshtml',
				'room-3d': '/template/modules/b-here/room-3d-modal.cshtml',
				'model': '/template/modules/b-here/model-modal.cshtml',
				'media': '/template/modules/b-here/media-modal.cshtml',
			},
			viewItem: {
				'nav': '/template/modules/b-here/nav-modal.cshtml',
				'plane': '/template/modules/b-here/plane-modal.cshtml',
				'curved-plane': '/template/modules/b-here/curved-plane-modal.cshtml',
				'texture': '/template/modules/b-here/texture-modal.cshtml',
				'model': '/template/modules/b-here/item-model-modal.cshtml',
			},
			navmap: '/template/modules/b-here/navmap-modal.cshtml',
			navmapItem: '/template/modules/b-here/navmap-item-modal.cshtml',
			remove: '/template/modules/b-here/remove-modal.cshtml',
		}
	},
};
