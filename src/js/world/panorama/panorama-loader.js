import { fromEvent } from 'rxjs';
import { filter, first, switchMap, takeWhile, tap } from 'rxjs/operators';
import { AssetType } from '../../asset/asset';
import { environment } from '../../environment';
import ImageService, { ImageServiceEvent } from '../../image/image.service';
import LoaderService from '../../loader/loader.service';
import StreamService from '../../stream/stream.service';
// import * as THREE from 'three';
import { RGBELoader } from '../loaders/RGBELoader';

export class PanoramaLoader {

	static get video() {
		return this.video_;
	}

	static set video(video) {
		if (this.video_) {
			this.video_.muted = true;
			this.video_.pause();
			if (this.video_.parentNode) {
				this.video_.parentNode.removeChild(this.video_);
			}
			this.video_ = null;
		}
		if (video) {
			const video = this.video_ = document.createElement('video');
			video.loop = true;
			video.playsInline = true;
			video.crossOrigin = 'anonymous';
			// document.querySelector('body').appendChild(video);
		}
	}

	static get muted() {
		return this.muted_;
	}

	static set muted(muted) {
		this.muted_ = muted;
		// console.log('PanoramaLoader.muted', muted, this.video);
		if (this.video) {
			this.video.muted = muted === true;
		}
	}

	static set cubeRenderTarget(cubeRenderTarget) {
		if (this.cubeRenderTarget_) {
			this.cubeRenderTarget_.texture.dispose();
			this.cubeRenderTarget_.dispose();
		}
		this.cubeRenderTarget_ = cubeRenderTarget;
	}

	static set texture(texture) {
		if (this.texture_) {
			this.texture_.dispose();
		}
		this.texture_ = texture;
	}

	static load(asset, renderer, callback) {
		this.video = null;
		if (!asset) {
			return;
		}
		if (asset.type.name === AssetType.PublisherStream.name) {
			return this.loadPublisherStreamBackground(renderer, callback);
		} else if (asset.file.indexOf('.mp4') !== -1 || asset.file.indexOf('.webm') !== -1) {
			return this.loadVideoBackground(environment.getPath(asset.folder), asset.file, renderer, callback);
		} else if (asset.file.indexOf('.m3u8') !== -1) {
			return this.loadHlslVideoBackground(asset.file, renderer, callback);
		} else if (asset.file.indexOf('.hdr') !== -1) {
			return this.loadRgbeBackground(environment.getPath(asset.folder), asset.file, renderer, callback);
		} else {
			return this.loadBackgroundImageService(environment.getPath(asset.folder), asset.file, renderer, callback);
		}
	}

	static loadBackground(folder, file, renderer, callback) {
		const progressRef = LoaderService.getRef();
		const loader = new THREE.TextureLoader();
		loader.setPath(folder).load(file, (texture) => {
			texture.minFilter = THREE.LinearFilter;
			texture.magFilter = THREE.LinearFilter;
			texture.mapping = THREE.UVMapping;
			texture.format = THREE.RGBFormat;
			texture.needsUpdate = true;
			if (typeof callback === 'function') {
				callback(texture);
			}
			LoaderService.setProgress(progressRef, 1);
		}, (request) => {
			LoaderService.setProgress(progressRef, request.loaded, request.total);
		});
		return loader;
	}

	static loadBackgroundImageService(folder, file, renderer, callback) {
		const progressRef = LoaderService.getRef();
		const image = new Image();
		ImageService.events$(folder + file).pipe(
			tap(event => {
				if (event.type === ImageServiceEvent.Progress) {
					LoaderService.setProgress(progressRef, event.data.loaded, event.data.total);
				}
			}),
			filter(event => event.type === ImageServiceEvent.Complete),
			switchMap(event => {
				const load = fromEvent(image, 'load');
				image.crossOrigin = 'anonymous';
				image.src = event.data;
				return load;
			}),
			takeWhile(event => event.type !== ImageServiceEvent.Complete, true),
		).subscribe(event => {
			const texture = new THREE.Texture(image);
			texture.minFilter = THREE.LinearFilter;
			texture.magFilter = THREE.LinearFilter;
			texture.mapping = THREE.UVMapping;
			texture.format = THREE.RGBFormat;
			texture.needsUpdate = true;
			if (typeof callback === 'function') {
				callback(texture);
				URL.revokeObjectURL(event.data);
			}
			LoaderService.setProgress(progressRef, 1);
		});
	}

	static loadRgbeBackground(folder, file, renderer, callback) {
		const progressRef = LoaderService.getRef();
		const loader = new RGBELoader();
		loader.setDataType(THREE.UnsignedByteType).setPath(folder).load(file, (texture) => {
			if (typeof callback === 'function') {
				callback(texture, true);
			}
			LoaderService.setProgress(progressRef, 1);
		}, (request) => {
			LoaderService.setProgress(progressRef, request.loaded, request.total);
		});
		return loader;
	}

	static loadHlslVideoBackground(src, renderer, callback) {
		const progressRef = LoaderService.getRef();
		const video = document.createElement('video');
		const onPlaying = () => {
			video.oncanplay = null;
			const texture = new THREE.VideoTexture(video);
			texture.minFilter = THREE.LinearFilter;
			texture.magFilter = THREE.LinearFilter;
			texture.mapping = THREE.UVMapping;
			texture.format = THREE.RGBFormat;
			texture.needsUpdate = true;
			if (typeof callback === 'function') {
				callback(texture);
			}
			LoaderService.setProgress(progressRef, 1);
		};
		video.oncanplay = () => {
			// console.log('videoReady', videoReady);
			onPlaying();
		};
		if (Hls.isSupported()) {
			var hls = new Hls();
			hls.attachMedia(video);
			hls.on(Hls.Events.MEDIA_ATTACHED, () => {
				hls.loadSource(src);
				hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
					video.play();
				});
			});
		}
	}

	static loadVideoBackground(folder, file, renderer, callback) {
		const progressRef = LoaderService.getRef();
		this.video = true;
		const video = this.video;
		const onPlaying = () => {
			video.oncanplay = null;
			const texture = new THREE.VideoTexture(video);
			texture.minFilter = THREE.LinearFilter;
			texture.magFilter = THREE.LinearFilter;
			texture.mapping = THREE.UVMapping;
			texture.format = THREE.RGBFormat;
			texture.needsUpdate = true;
			if (typeof callback === 'function') {
				callback(texture);
			}
			// console.log('loadVideoBackground.loaded');
			LoaderService.setProgress(progressRef, 1);
		};
		video.oncanplay = () => {
			// console.log('PanoramaLoader.loadVideoBackground.oncanplay');
			onPlaying();
		};
		video.crossOrigin = 'anonymous';
		video.src = folder + file;
		video.load();
		video.play().then(() => {
			// console.log('PanoramaLoader.loadVideoBackground.play');
		}, error => {
			console.log('PanoramaLoader.loadVideoBackground.play.error', error);
		});
	}

	static loadPublisherStreamBackground(renderer, callback) {
		const onPublisherStreamId = (publisherStreamId) => {
			const video = document.querySelector(`#stream-${publisherStreamId} video`);
			if (!video) {
				return;
			}
			const onPlaying = () => {
				const texture = this.texture = new THREE.VideoTexture(video);
				texture.minFilter = THREE.LinearFilter;
				texture.magFilter = THREE.LinearFilter;
				texture.mapping = THREE.UVMapping;
				texture.format = THREE.RGBFormat;
				texture.needsUpdate = true;
				if (typeof callback === 'function') {
					callback(texture);
				}
			};
			video.crossOrigin = 'anonymous';
			if (video.readyState >= video.HAVE_FUTURE_DATA) {
				onPlaying();
			} else {
				video.oncanplay = () => {
					onPlaying();
				};
			}
		};
		StreamService.getPublisherStreamId$().pipe(
			first(),
		).subscribe(publisherStreamId => onPublisherStreamId(publisherStreamId));
	}
}
