import { Component, getContext } from 'rxcomp';
import { FormControl, FormGroup, RequiredValidator } from 'rxcomp-form';
import { first } from 'rxjs/operators';
// import * as THREE from 'three';
import ModalOutletComponent from '../../modal/modal-outlet.component';
import ModalService from '../../modal/modal.service';
import { ViewItemType } from '../../view/view';
import { Host } from '../../world/host/host';
import ModelNavComponent from '../../world/model/model-nav.component';
import EditorService from '../editor.service';

export default class NavModalComponent extends Component {

	get data() {
		let data = null;
		const { parentInstance } = getContext(this);
		if (parentInstance instanceof ModalOutletComponent) {
			data = parentInstance.modal.data;
		}
		return data;
	}

	get view() {
		let view = null;
		const data = this.data;
		if (data) {
			view = data.view;
		}
		return view;
	}

	get position() {
		let position = null;
		const data = this.data;
		if (data) {
			position = data.hit.position;
		}
		return position;
	}

	get object() {
		const object = new THREE.Object3D();
		const data = this.data;
		if (data) {
			const position = data.hit.position.clone();
			const normal = data.hit.normal.clone();
			const spherical = data.hit.spherical;
			if (spherical) {
				position.normalize().multiplyScalar(ModelNavComponent.RADIUS);
				object.position.copy(position);
				object.lookAt(Host.origin);
			} else {
				object.lookAt(normal);
				object.position.set(position.x, position.y, position.z);
				object.position.add(normal.multiplyScalar(0.01));
			}
		}
		return object;
	}

	onInit() {
		const object = this.object;
		this.error = null;
		const form = this.form = new FormGroup({
			type: ViewItemType.Nav,
			title: null,
			abstract: null,
			viewId: new FormControl(null, RequiredValidator()),
			keepOrientation: false,
			important: false,
			transparent: false,
			//
			position: new FormControl(object.position.toArray(), RequiredValidator()),
			rotation: new FormControl(object.rotation.toArray(), RequiredValidator()), // [0, -Math.PI / 2, 0],
			scale: new FormControl([20, 5, 1], RequiredValidator()),
			//
			asset: null,
			link: new FormGroup({
				title: new FormControl(null),
				href: new FormControl(null),
				target: '_blank',
			}),
			// upload: new FormControl(null, RequiredValidator()),
			// items: new FormArray([null, null, null], RequiredValidator()),
		});
		this.controls = form.controls;
		/*
		this.controls.viewId.options = [{
			name: 'Name',
			id: 2,
		}];
		*/
		form.changes$.subscribe((changes) => {
			// console.log('NavModalComponent.form.changes$', changes, form.valid, form);
			this.pushChanges();
		});
		EditorService.viewIdOptions$().pipe(
			first(),
		).subscribe(options => {
			this.controls.viewId.options = options;
			this.pushChanges();
		});
	}

	onSubmit() {
		if (this.form.valid) {
			this.form.submitted = true;
			const item = Object.assign({}, this.form.value);
			item.viewId = parseInt(item.viewId);
			if (item.link && (!item.link.title || !item.link.href)) {
				item.link = null;
			}
			// console.log('NavModalComponent.onSubmit', this.view, item);
			EditorService.inferItemCreate$(this.view, item).pipe(
				first(),
			).subscribe(response => {
				// console.log('NavModalComponent.onSubmit.success', response);
				ModalService.resolve(response);
			}, error => {
				console.log('NavModalComponent.onSubmit.error', error);
				this.error = error;
				this.form.submitted = false;
				// this.form.reset();
			});
		} else {
			this.form.touched = true;
		}
	}

	onClose() {
		ModalService.reject();
	}
}

NavModalComponent.meta = {
	selector: '[nav-modal]'
};
