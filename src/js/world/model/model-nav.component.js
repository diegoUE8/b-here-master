// import * as THREE from 'three';
import { environment } from '../../environment';
import StateService from '../../state/state.service';
import { RoleType } from '../../user/user';
import { Geometry } from '../geometry/geometry';
import Interactive from '../interactive/interactive';
import InteractiveMesh from '../interactive/interactive.mesh';
import WorldComponent from '../world.component';
import ModelEditableComponent from './model-editable.component';

export const NavModeType = {
	None: 'none',
	Move: 'move',
	Info: 'info',
	Point: 'point',
	Title: 'title',
};

export default class ModelNavComponent extends ModelEditableComponent {

	static getLoader() {
		return ModelNavComponent.loader || (ModelNavComponent.loader = new THREE.TextureLoader());
	}

	static getTexturePoint() {
		return ModelNavComponent.texturePoint || (ModelNavComponent.texturePoint = ModelNavComponent.getLoader().load(environment.getPath('textures/ui/nav-point.png')));
	}

	static getTexturePointImportant() {
		return ModelNavComponent.texturePointImportant || (ModelNavComponent.texturePointImportant = ModelNavComponent.getLoader().load(environment.getPath('textures/ui/nav-point-important.png')));
	}

	static getTextureMove() {
		return ModelNavComponent.textureMove || (ModelNavComponent.textureMove = ModelNavComponent.getLoader().load(environment.getPath('textures/ui/nav-more.png')));
	}

	static getTextureMoveImportant() {
		return ModelNavComponent.textureMoveImportant || (ModelNavComponent.textureMoveImportant = ModelNavComponent.getLoader().load(environment.getPath('textures/ui/nav-more-important.png')));
	}

	static getTextureInfo() {
		return ModelNavComponent.textureInfo || (ModelNavComponent.textureInfo = ModelNavComponent.getLoader().load(environment.getPath('textures/ui/nav-info.png')));
	}

	static getTextureInfoImportant() {
		return ModelNavComponent.textureInfoImportant || (ModelNavComponent.textureInfoImportant = ModelNavComponent.getLoader().load(environment.getPath('textures/ui/nav-info-important.png')));
	}

	static getTexture(mode, important) {
		let texture;
		switch (mode) {
			case NavModeType.Move:
				texture = important ? this.getTextureMoveImportant() : this.getTextureMove();
				break;
			case NavModeType.Info:
				texture = important ? this.getTextureInfoImportant() : this.getTextureInfo();
				break;
			case NavModeType.Point:
			case NavModeType.Title:
				texture = important ? this.getTexturePointImportant() : this.getTexturePoint();
				break;
			default:
				break;
		}
		texture.disposable = false;
		texture.encoding = THREE.sRGBEncoding;
		return texture;
	}

	static getTitleTexture(item, mode) {
		let texture;
		if (mode === NavModeType.Title) {
			const text = item.title;
			const canvas = document.createElement('canvas');
			// document.querySelector('body').appendChild(canvas);
			canvas.width = 512;
			canvas.height = 32;
			const ctx = canvas.getContext('2d');
			ctx.imageSmoothingEnabled = true;
			ctx.imageSmoothingQuality = 'high';
			ctx.font = `24px ${environment.fontFamily}`;
			const metrics = ctx.measureText(text);
			let w = metrics.width + 8;
			w = Math.pow(2, Math.ceil(Math.log(w) / Math.log(2)));
			const x = w / 2;
			const y = 16;
			canvas.width = w;
			ctx.font = `24px ${environment.fontFamily}`;
			ctx.textAlign = 'center';
			ctx.textBaseline = 'middle';
			ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
			ctx.lineWidth = 6;
			ctx.lineJoin = 'round'; // Experiment with 'bevel' & 'round' for the effect you want!
			ctx.miterLimit = 2;
			ctx.strokeText(text, x, y);
			ctx.fillStyle = 'white';
			ctx.fillText(text, x, y);
			texture = new THREE.CanvasTexture(canvas);
		}
		return texture;
	}

	static getNavMode(item, view) {
		let mode = NavModeType.None;
		if (item.viewId !== view.id) {
			mode = NavModeType.Move;
			if (this.isValidText(item.title)) {
				mode = NavModeType.Title;
			}
			if (this.isValidText(item.abstract) ||
				(item.asset && item.asset.id) ||
				(item.link && item.link.href)) {
				mode = NavModeType.Point;
			}
		} else if (this.isValidText(item.title) ||
			this.isValidText(item.abstract) ||
			(item.asset && item.asset.id) ||
			(item.link && item.link.href)) {
			mode = NavModeType.Info;
		}
		return mode;
	}

	static isValidText(text) {
		return text && text.length > 0;
	}

	hidden_ = false;
	get hidden() {
		return this.hidden_;
	}
	set hidden(hidden) {
		if (this.hidden_ !== hidden) {
			this.hidden_ = hidden;
			this.updateVisibility(!hidden);
		}
	}

	get isHidden() {
		return StateService.state.zoomedId != null || (environment.flags.hideNavInfo && !this.editor &&
			(!StateService.state.showNavInfo && !(this.host.renderer.xr.isPresenting || StateService.state.role === RoleType.SelfService || StateService.state.role === RoleType.Embed)) &&
			this.mode === NavModeType.Info);
	}

	updateVisibility(visible) {
		this.mesh.visible = visible;
		this.sphere.freezed = !visible;
		if (!visible) {
			this.item.showPanel = false;
		}
	}

	setVisible(visible) {
		if (this.mesh) {
			this.mesh.visible = visible && !this.hidden_;
		}
	}

	onInit() {
		super.onInit();
	}

	onChanges() {
		this.mode = ModelNavComponent.getNavMode(this.item, this.view);
		this.editing = this.item.selected;
		this.hidden = this.isHidden;
	}

	onCreate(mount, dismount) {
		// this.renderOrder = environment.renderOrder.nav;
		const mode = this.mode = ModelNavComponent.getNavMode(this.item, this.view);
		if (mode === NavModeType.None) {
			return;
		}
		const nav = new THREE.Group();
		const position = new THREE.Vector3().set(...this.item.position).normalize().multiplyScalar(ModelNavComponent.RADIUS);
		nav.position.set(position.x, position.y, position.z);

		this.onCreateSprites(nav);

		const geometry = Geometry.sphereGeometry;
		const sphere = this.sphere = new InteractiveMesh(geometry, new THREE.MeshBasicMaterial({
			depthTest: false,
			depthWrite: false,
			transparent: true,
			opacity: 0.0,
			color: 0x00ffff,
		}));
		sphere.name = `[nav] ${this.item.id}`;
		// sphere.lookAt(Host.origin); ??
		sphere.depthTest = false;
		// sphere.renderOrder = 0;
		nav.add(sphere);
		sphere.on('over', () => {
			// console.log('ModelNavComponent.over');
			/*
			if ((mode !== NavModeType.Move && mode !== NavModeType.Title) && !this.editing) {
				this.over.next(this);
			}
			*/
			this.over.next(this);
			const icon = this.icon;
			const from = { scale: icon.scale.x };
			gsap.to(from, {
				duration: 0.35,
				scale: 0.05,
				delay: 0,
				ease: Power2.easeOut,
				overwrite: true,
				onUpdate: () => {
					icon.scale.set(from.scale, from.scale, from.scale);
				},
				onComplete: () => {
					/*
					if (!this.editing) {
						this.over.next(this);
					}
					*/
				}
			});
		});
		sphere.on('out', () => {
			this.out.next(this);
			const icon = this.icon;
			const from = { scale: icon.scale.x };
			gsap.to(from, {
				duration: 0.35,
				scale: 0.03,
				delay: 0,
				ease: Power2.easeOut,
				overwrite: true,
				onUpdate: () => {
					icon.scale.set(from.scale, from.scale, from.scale);
				},
				onComplete: () => {
					/*
					this.out.next(this);
					*/
				}
			});
		});
		sphere.on('down', () => {
			this.down.next(this);
		});
		const from = { opacity: 0 };
		gsap.to(from, {
			duration: 0.7,
			opacity: 1,
			delay: 0.5 + 0.1 * this.item.index,
			ease: Power2.easeInOut,
			overwrite: true,
			onUpdate: () => {
				this.materials.forEach(material => {
					material.opacity = from.opacity;
					material.needsUpdate = true;
				});
			}
		});
		if (typeof mount === 'function') {
			mount(nav, this.item);
		}
	}

	onCreateSprites(mesh, opacity = 0) {
		this.onRemoveSprite(this.icon);
		this.onRemoveSprite(this.title);
		const mode = this.mode = ModelNavComponent.getNavMode(this.item, this.view);
		if (mode === NavModeType.None) {
			return;
		}
		const map = ModelNavComponent.getTexture(mode, this.item.important);
		const material = new THREE.SpriteMaterial({
			map: map,
			depthTest: false,
			depthWrite: false,
			transparent: true,
			sizeAttenuation: false,
			opacity: opacity,
			// color: 0xff0000,
		});
		const materials = [material];
		const icon = this.icon = new THREE.Sprite(material);
		icon.renderOrder = environment.renderOrder.nav;
		icon.scale.set(0.03, 0.03, 0.03);
		mesh.add(icon);
		let titleMaterial;
		const titleTexture = ModelNavComponent.getTitleTexture(this.item, mode);
		if (titleTexture) {
			titleMaterial = new THREE.SpriteMaterial({
				depthTest: false,
				depthWrite: false,
				transparent: true,
				map: titleTexture,
				sizeAttenuation: false,
				opacity: opacity,
				// color: 0xff0000,
			});
			// console.log(titleTexture);
			const image = titleTexture.image;
			const title = this.title = new THREE.Sprite(titleMaterial);
			title.scale.set(0.03 * image.width / image.height, 0.03, 0.03);
			title.position.set(0, -3.5, 0);
			mesh.add(title);
			materials.push(titleMaterial);
		}
		this.materials = materials;
	}

	onRemoveSprite(sprite) {
		if (sprite) {
			if (sprite.parent) {
				sprite.parent.remove(sprite);
			}
			if (sprite.material.map && sprite.material.map.disposable !== false) {
				sprite.material.map.dispose();
			}
			sprite.material.dispose();
		}
	}

	onDestroy() {
		Interactive.dispose(this.sphere);
		super.onDestroy();
	}

	shouldShowPanel() {
		return (!this.editing && this.mode !== NavModeType.Move && this.mode !== NavModeType.Title);
	}

	// called by UpdateViewItemComponent
	onUpdate(item, mesh) {
		this.item = item;
		this.onCreateSprites(this.mesh, 1);
		const position = new THREE.Vector3().set(...item.position).normalize().multiplyScalar(ModelNavComponent.RADIUS);
		mesh.position.set(position.x, position.y, position.z);
		// console.log('onUpdate', item, mesh.position);
		this.updateHelper();
		/*
		this.onCreate(
			(mesh, item) => this.onMount(mesh, item),
			(mesh, item) => this.onDismount(mesh, item)
		);
		*/
	}

	// called by WorldComponent
	onDragMove(position, normal, spherical) {
		// console.log('ModelNavComponent.onDragMove', position, normal, spherical);
		if (spherical) {
			position.normalize().multiplyScalar(ModelNavComponent.RADIUS);
			// normal = cameraGroup?
		}
		this.editing = true;
		this.item.showPanel = false;
		this.mesh.position.set(position.x, position.y, position.z);
		this.updateHelper();
	}

	// called by WorldComponent
	onDragEnd() {
		this.item.position = new THREE.Vector3().copy(this.mesh.position).normalize().toArray();
		this.editing = false;
	}
}

ModelNavComponent.RADIUS = 100;

ModelNavComponent.meta = {
	selector: '[model-nav]',
	hosts: { host: WorldComponent },
	outputs: ['over', 'out', 'down'],
	inputs: ['item', 'view', 'editor'],
};
