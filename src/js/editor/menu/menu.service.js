import { BehaviorSubject } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import HttpService from '../../http/http.service';
import { ViewType } from '../../view/view';

let MENU_UID = 0;

export default class MenuService {

	static menu$_ = new BehaviorSubject([]);

	static menu$() {
		return this.getMenu$().pipe(
			switchMap(menu => {
				this.menu$_.next(menu);
				return this.menu$_;
			}),
		);
	}

	static getMenu$() {
		return HttpService.get$(`/api/menu`).pipe(
			map(data => {
				return data.menu;
			}),
		);
	}

	static updateMenu$(menu) {
		return HttpService.put$(`/api/menu`, menu);
	}

	static createMenuItem$(parentId = null) {
		const payload = {
			parentId: parentId,
			viewId: null,
			name: 'Folder ' + (++MENU_UID),
		}
		return HttpService.post$(`/api/menu`, payload);
	}

	static updateMenuItem$(item) {
		return HttpService.put$(`/api/menu/${item.id}`, item);
	}

	static deleteMenuItem$(item) {
		return HttpService.delete$(`/api/menu/${item.id}`);
	}

	static getModelMenu$(views, editor = false) {
		return this.menu$().pipe(
			map(menu => {
				if (menu && menu.length) {
					return this.mapMenuItems(menu);
				} else {
					const keys = {};
					views.forEach(item => {
						if (item.type.name !== ViewType.WaitingRoom.name && (!item.hidden || editor)) {
							let group = keys[item.type.name];
							if (!group) {
								group = keys[item.type.name] = [];
							}
							group.push(item);
						}
					});
					const menu = Object.keys(keys).map(typeName => {
						let name = 'Button';
						switch (typeName) {
							case ViewType.WaitingRoom.name:
								name = 'Waiting Room';
								break;
							case ViewType.Panorama.name:
								name = 'Experience';
								break;
							case ViewType.PanoramaGrid.name:
								name = 'Virtual Tour';
								break;
							case ViewType.Room3d.name:
								name = 'Stanze 3D';
								break;
							case ViewType.Model.name:
								name = 'Modelli 3D';
								break;
						}
						return { name, type: { name: 'menu-group' }, items: views.filter(x => x.type.name === typeName && (!x.hidden || editor)) };
					});
					return menu;
				}
			})
		);
	}

	static mapMenuItem(item, items) {
		if (item.viewId) {
			return { id: item.viewId, name: item.name, type: { name: 'panorama' } };
		} else {
			return { name: item.name, type: { name: 'menu-group' }, items: this.mapMenuItems(items, item.id) };
		}
	}

	static mapMenuItems(items, parentId = null) {
		return items.filter(item => (item.parentId || null) === parentId ).map(item => this.mapMenuItem(item, items))
	}

}
