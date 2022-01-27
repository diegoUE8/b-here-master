import { from, of, Subject } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';

export class ModalEvent {

	constructor(data) {
		this.data = data;
	}

}

export class ModalResolveEvent extends ModalEvent { }
export class ModalRejectEvent extends ModalEvent { }

export default class ModalService {

	static hasModal = false;

	static open$(modal) {
		return (
			modal.iframe ?
				of(/*html*/`<div class="iframe-modal" iframe-modal>
					<div class="modal__header">
					<button type="button" class="btn--close" (click)="onClose()">
						<svg width="24" height="24" viewBox="0 0 24 24"><use xlink:href="#close"></use></svg>
					</button>
				</div>
				<div class="modal__content">
					<iframe src="${modal.iframe}"></iframe>
				</div>
			</div>`) :
				this.getTemplate$(modal.src)
		).pipe(
			map(template => {
				return { node: this.getNode(template), data: modal.data, modal: modal };
			}),
			tap(node => {
				this.modal$.next(node);
				this.hasModal = true;
			}),
			switchMap(node => this.events$),
			tap(_ => this.hasModal = false)
		)
	}

	static load$(modal) {

	}

	static getTemplate$(url) {
		return from(fetch(url).then(response => {
			return response.text();
		}));
	}

	static getNode(template) {
		const div = document.createElement('div');
		div.innerHTML = template;
		const node = div.firstElementChild;
		return node;
	}

	static reject(data) {
		this.modal$.next(null);
		this.events$.next(new ModalRejectEvent(data));
	}

	static resolve(data) {
		this.modal$.next(null);
		this.events$.next(new ModalResolveEvent(data));
	}

}

ModalService.modal$ = new Subject();
ModalService.events$ = new Subject();
