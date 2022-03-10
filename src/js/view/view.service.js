import { BehaviorSubject, combineLatest, of } from 'rxjs';
import { distinctUntilChanged, map, shareReplay, tap } from 'rxjs/operators';
import { AssetType } from '../asset/asset';
import { environment } from '../environment';
import HttpService from '../http/http.service';
import { LanguageService } from '../language/language.service';
import LocationService from '../location/location.service';
import { MeetingUrl } from '../meeting/meeting-url';
import StateService from '../state/state.service';
import { mapView, ViewItemType, ViewType } from '../view/view';

export const DEFAULT_WAITING_ROOM = {
	id: 'waiting-room',
	type: { id: 1, name: 'waiting-room' },
	name: 'Waiting Room',
	likes: 0,
	liked: false,
	asset: {
		type: { id: 1, name: 'image' },
		folder: '/textures/waiting-room/',
		file: 'waiting-room.jpg',
	},
	items: [],
	orientation: {
		latitude: 0,
		longitude: 0
	}
};
export default class ViewService {

	static views$_ = new BehaviorSubject([]);
	static set views(views) {
		this.views$_.next(views);
	}
	static get views() {
		return this.views$_.getValue();
	}

	static view$_ = new BehaviorSubject(null);
	static set view(view) {
		this.view$_.next(view);
	}
	static get view() {
		return this.view$_.getValue();
	}

	static get dataViews() {
		return this.data ? this.data.views : [];
	}

	static get validViews() {
		return this.data ? this.data.views.filter(x => x.type.name !== ViewType.WaitingRoom.name) : [];
	}

	static get pathViews() {
		const views = this.validViews;
		return views.filter(x => x.path);
		// const path = this.path;
		// return path ? this.validViews.filter(x => path.items.indexOf(x.id) === -1) : this.validViews;
	}

	static get validPathViews() {
		const views = this.editor ? this.data.views : this.validViews;
		return views.filter(x => x.path);
	}

	// action: { viewId:number, keepOrientation:boolean, useLastOrientation:boolean };
	static action$_ = new BehaviorSubject(null);
	static set action(action) {
		this.action$_.next(action);
	}
	static get action() {
		return this.action$_.getValue();
	}

	// static viewId$_ = new BehaviorSubject(null);
	static set viewId(viewId) {
		this.action$_.next({ viewId, keepOrientation: false, useLastOrientation: false });
	}
	static get viewId() {
		const action = this.action$_.getValue();
		return action ? action.viewId : null;
	}

	static getDataView(viewId) {
		const views = this.dataViews;
		return views.find(x => x.id === viewId);
	}

	static getValidPathId(viewId) {
		if (!viewId) {
			return null;
		}
		const views = this.validPathViews;
		if (views.find(x => x.id === viewId) == null) {
			return null;
		}
		return viewId;
	}

	static getFirstPathId() {
		const views = (this.editor && this.path.id === null) ? this.dataViews : this.pathViews;
		// console.log('ViewService.getFirstPathId', this.editor, this.path, views);
		return views.length ? views[0].id : null;
	}

	/*
	static view_ = null;
	static get view() {
		return this.view_;
	}
	static set view(view) {
		this.view_ = view;
	}
	*/

	static data$() {
		if (!this.data$_) {
			const dataUrl = (environment.flags.production ? '/api/view' : './api/data.json') + '?lang=' + LanguageService.selectedLanguage;
			this.data$_ = HttpService.get$(dataUrl).pipe(
				map(data => {
					data.views = data.views.map(view => mapView(view));
					this.data = data;
					const views = data.views;
					// const views = data.views.filter(x => x.type.name !== 'waiting-room');
					this.views = views;
					return data;
				}),
				// tap(data => console.log('ViewService.data$', data)),
				shareReplay(1),
			);
		}
		return this.data$_;
	}

	static view$() {
		// const editor = this.editor;
		const meetingUrl = new MeetingUrl();
		// const pathId = meetingUrl.pathId;
		const viewId = this.getValidPathId(meetingUrl.viewId);
		const embedViewId = this.getValidPathId(meetingUrl.embedViewId);
		const initialViewId = embedViewId || viewId || this.getFirstPathId();
		// console.log('ViewService.view$', viewId, embedViewId, initialViewId);
		this.action$_.next({ viewId: initialViewId });
		return this.action$_.pipe(
			distinctUntilChanged((a, b) => a.viewId === b.viewId),
			map(action => {
				// const view = data.views.find(view => view.id === action.viewId);
				// console.log('ViewService.view$', 'path', path);
				// filter path
				let view = this.dataViews.find(view => view.id === action.viewId);
				/*
				if (path && !editor) {
					if (path.items.indexOf(view.id) === -1) {
						const newView = Object.assign({}, view);
						newView.items = view.items.filter(x => {
							if (x.type.name === ViewItemType.Nav.name) {
								return path.items.indexOf(x.viewId) === -1;
							} else {
								return true;
							}
						});
						view = mapView(newView);
					} else {
						view = null;
					}
				}
				console.log('ViewService.view$', view, path);
				*/
				if (view) {
					view.keepOrientation = action.keepOrientation || false;
					view.useLastOrientation = action.useLastOrientation || false;
				}
				// console.log('ViewService.view$', action.viewId, action.keepOrientation, action.useLastOrientation);
				return view || this.getWaitingRoom();
			}),
		);
	}

	static setDataAndPath(data, path) {
		this.data = data;
		data.views.forEach(view => {
			view.path = !path || path.items.indexOf(view.id) === -1;
			view.items.forEach(item => {
				let valid = true;
				if (path) {
					if (item.type.name === ViewItemType.Nav.name) {
						valid = path.items.indexOf(item.viewId) === -1;
					}
					item.path = valid;
				}
			});
		});
		this.views = data.views;
		this.path = path;
	}

	static hostedView$(data, path) {
		this.setDataAndPath(data, path);
		this.editor = false;
		const waitingRoom = this.getWaitingRoom();
		return combineLatest([this.view$(), this.hosted$()]).pipe(
			map(datas => {
				const view = datas[0];
				const hosted = datas[1];
				return hosted ? view : waitingRoom;
			}),
			distinctUntilChanged((a, b) => {
				return a.id === b.id;
			}),
			tap(view => {
				this.view = view;
				if (view.id !== waitingRoom.id) {
					LocationService.set('viewId', view.id);
					const prefetchAssets = ViewService.getPrefetchAssets(view);
					view.prefetchAssets = prefetchAssets;
				}
			}),
		);
	}

	static editorView$(data, path) {
		this.setDataAndPath(data, path);
		this.editor = true;
		const waitingRoom = this.getWaitingRoom();
		return this.view$().pipe(
			map(view => {
				// console.log('ViewService.editorView$.view', view.updateIndices);
				this.view = view;
				if (view.id !== waitingRoom.id) {
					LocationService.set('viewId', view.id);
				}
				if (path && path.id !== null) {
					LocationService.set('pathId', path.id);
				} else {
					LocationService.delete('pathId');
				}
				return view;
			}),
		);
	}

	static hosted$() {
		return StateService.state$.pipe(
			map(state => state.hosted),
			distinctUntilChanged(),
		);
	}

	static viewById$(viewId) {
		return this.data$().pipe(
			map(data => this.views.find(x => x.id === viewId))
		);
	}

	static viewLike$(view) {
		if (!view.liked) {
			view.liked = true;
			if (environment.flags.production) {
				return HttpService.get$(`/api/view/${view.id}/like`);
			} else {
				view.likes = view.likes || 0;
				view.likes++;
				return of(view);
			}
		} else {
			return of(null);
		}
	}

	static setViewLike$(message) {
		return this.viewById$(message.viewId).pipe(
			tap(view => {
				if (view) {
					view.likes = message.likes;
				}
			})
		);
	}

	static getWaitingRoom() {
		return this.dataViews.find(x => x.type.name === ViewType.WaitingRoom.name) || DEFAULT_WAITING_ROOM;
	}

	static getPrefetchAssets(view) {
		const views = this.views;
		const assets = view.items
			// filter nav items
			.filter(x => x.type.name === ViewItemType.Nav.name && x.viewId != null)
			// map to view
			.map(x => views.find(v => v.id === x.viewId))
			// filter view with image
			.filter(v => v && v.asset && v.asset.type.name === AssetType.Image.name)
			// map to asset
			.map(v => environment.getPath(v.asset.folder + v.asset.file));
		// console.log('ViewService.getPrefetchAssets', assets);
		return assets;
	}

	static addView(view) {
		const data = this.data;
		const views = data.views.slice();
		views.push(view);
		data.views = views;
		this.views = views;
		this.viewId = view.id;
	}

	static deleteView(view) {
		const data = this.data;
		const views = data.views.slice();
		const index = views.reduce((p, c, i) => {
			return c.id === view.id ? i : p;
		}, -1);
		if (index > 0) {
			views.splice(index, 1);
			data.paths = views;
		}
		ViewService.viewId = this.dataViews[0].id;
		// this.pushChanges();
	}

}
