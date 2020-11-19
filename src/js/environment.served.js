
export const environmentServed = {
	appKey: '865af1430a854af5b01733ff9b725a2b',
	channelName: 'BHere',
	flags: {
		selfService: true,
		guidedTourRequest: true,
		ar: true,
		menu: true,
		attendee: true,
		streamer: true,
		viewer: true,
	},
	logo: '/Modules/B-Here/Client/docs/img/logo.png',
	background: {
		image: '/Modules/B-Here/Client/docs/img/background.jpg',
		video: '/Modules/B-Here/Client/docs/img/background.mp4',
	},
	assets: '/Modules/B-Here/Client/docs/',
	worker: '/Modules/B-Here/Client/docs/js/workers/image.service.worker.js',
	githubDocs: 'https://raw.githubusercontent.com/diegoUE8/b-here-master/main/docs/',
	url: {
		index: '/',
		access: '/',
		editor: '/it/it/editor',
		bHere: '/it/it/b-here',
		selfServiceTour: '/it/it/self-service-tour',
		guidedTour: '/it/it/guided-tour',
	},
	template: {
		tryInAr: '/template/modules/b-here/try-in-ar.cshtml?viewId=$viewId',
		modal: {
			controlRequest: '/template/modules/b-here/control-request-modal.cshtml',
			tryInAr: '/template/modules/b-here/try-in-ar-modal.cshtml',
			view: {
				'panorama': '/template/modules/b-here/panorama-modal.cshtml',
				'panorama-grid': '/template/modules/b-here/panorama-grid-modal.cshtml',
				'room-3d': '/template/modules/b-here/room-3d-modal.cshtml',
				'model': '/template/modules/b-here/model-modal.cshtml',
			},
			viewItem: {
				'nav': '/template/modules/b-here/nav-modal.cshtml',
				'plane': '/template/modules/b-here/plane-modal.cshtml',
				'curved-plane': '/template/modules/b-here/curved-plane-modal.cshtml',
				'texture': '/template/modules/b-here/texture-modal.cshtml',
				'gltf': '/template/modules/b-here/gltf-modal.cshtml',
			},
			remove: '/template/modules/b-here/remove-modal.cshtml',
		}
	}
};
