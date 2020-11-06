import { of } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { environment } from '../environment';
import HttpService from '../http/http.service';
import { mapView } from '../view/view';

export default class ViewService {

	static data$() {
		if (!this.data$_) {
			const dataUrl = environment.STATIC ? './api/data.json' : '/api/view';
			this.data$_ = HttpService.get$(dataUrl).pipe(
				map(data => {
					data.views = data.views.map(view => mapView(view));
					return data;
				}),
				shareReplay(1),
			);
		}
		return this.data$_;
	}

	static view$(viewId) {
		return this.data$().pipe(
			map(data => data.views.find(x => x.id === viewId))
		);
	}

	static viewLike$(view) {
		if (!view.liked) {
			view.liked = true;
			// this.view.likes++;
			if (environment.STATIC) {
				view.likes = view.likes || 0;
				view.likes++;
				return of(view);
			} else {
				return HttpService.get$(`/api/view/${view.id}/like`);
			}
		} else {
			return of(null);
		}
	}
}
