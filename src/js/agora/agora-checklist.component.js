import { Component } from 'rxcomp';
import { first, takeUntil } from 'rxjs/operators';
import { DevicePlatform, DeviceService } from '../device/device.service';
import { environment } from '../environment';
import LabelPipe from '../label/label.pipe';
import LocalStorageService from '../local-storage/local-storage.service';
import ModalService from '../modal/modal.service';
import StateService from '../state/state.service';
import { RoleType } from '../user/user';
import AgoraService from './agora.service';

const TIMEOUT = 100;
const SHOW_ERROR = false;

export default class AgoraChecklistComponent extends Component {

	onInit() {
		this.platform = DeviceService.platform;
		this.checklist = {};
		this.errors = {};
		this.state = {};
		this.busy = true;
		this.shouldCheckAudio = true;
		this.shouldCheckVideo = true;
		LocalStorageService.set('checklist', false);
		StateService.state$.pipe(
			first(),
		).subscribe(state => {
			// console.log('AgoraChecklistComponent', state);
			this.state = state;
			if (state.role === RoleType.Viewer) {
				this.shouldCheckAudio = false;
				this.shouldCheckVideo = false;
			}
			if (this.platform === DevicePlatform.VRHeadset) {
				this.shouldCheckAudio = true;
				this.shouldCheckVideo = false;
			}
			this.pushChanges();
			setTimeout(() => {
				this.checkBrowser();
			}, 1000);
		});
	}

	checkBrowser() {
		const browser = AgoraRTC.checkSystemRequirements();
		this.checklist.browser = browser;
		if (SHOW_ERROR) {
			this.checklist.browser = false;
			this.errors.browser = LabelPipe.transform('bhere_browser_error');
			this.checkHttps();
			this.checkAudio();
			this.checkVideo();
			this.checkRtc();
			this.checkRtm();
		} else if (browser) {
			setTimeout(() => {
				this.checkHttps();
			}, TIMEOUT);
		} else {
			this.errors.browser = LabelPipe.transform('bhere_browser_error');
			this.checkHttps(true);
			this.checkAudio(true);
			this.checkVideo(true);
			this.checkRtc(true);
			this.checkRtm(true);
		}
		this.pushChanges();
	}

	checkHttps(skip) {
		const https = window.location.protocol === 'https:';
		this.checklist.https = https;
		if (SHOW_ERROR) {
			this.checklist.https = false;
			this.errors.https = LabelPipe.transform('bhere_https_error');
		} else if (skip) {
			if (!https) {
				this.errors.https = LabelPipe.transform('bhere_https_error');
			}
		} else if (https) {
			setTimeout(() => {
				this.checkAudio();
			}, TIMEOUT);
			this.pushChanges();
		} else {
			this.errors.https = LabelPipe.transform('bhere_https_error');
			this.checkAudio(true);
			this.checkVideo(true);
			this.checkRtc(true);
			this.checkRtm(true);
			this.pushChanges();
		}
	}

	checkAudio(skip) {
		if (SHOW_ERROR) {
			this.checklist.audio = false;
			this.errors.audio = LabelPipe.transform('bhere_audio_error');
		} else if (skip) {
			this.checklist.audio = false;
		} else if (this.shouldCheckAudio) {
			AgoraService.getDevices().then((devices) => {
				// console.log('checkAudio', devices);
				const audioinput = devices.find(x => x.kind === 'audioinput' && x.deviceId);
				this.checklist.audio = audioinput != null;
				this.pushChanges();
				setTimeout(() => {
					this.checkVideo();
				}, TIMEOUT);
			}).catch((error) => {
				this.checklist.audio = false;
				this.errors.audio = LabelPipe.transform('bhere_audio_error', error);
				this.pushChanges();
				setTimeout(() => {
					this.checkVideo();
				}, TIMEOUT);
			});
		} else {
			this.checkVideo();
		}
	}

	checkVideo(skip) {
		if (SHOW_ERROR) {
			this.checklist.video = false;
			this.errors.video = LabelPipe.transform('bhere_video_error');
		} else if (skip) {
			this.checklist.video = false;
		} else if (this.shouldCheckVideo) {
			AgoraService.getDevices().then((devices) => {
				// console.log('checkVideo', devices);
				const videoinput = devices.find(x => x.kind === 'videoinput' && x.deviceId);
				this.checklist.video = videoinput != null;
				setTimeout(() => {
					this.checkRtc();
				}, TIMEOUT);
				this.pushChanges();
			}).catch((error) => {
				this.checklist.video = false;
				this.errors.video = LabelPipe.transform('bhere_video_error', error);
				setTimeout(() => {
					this.checkRtc();
				}, TIMEOUT);
				this.pushChanges();
			});
		} else {
			this.checkRtc();
		}
	}

	checkRtc(skip) {
		if (SHOW_ERROR) {
			this.checklist.rtc = false;
			this.errors.rtc = LabelPipe.transform('bhere_rtc_error');
		} else if (skip) {
			this.checklist.rtc = false;
		} else {
			AgoraService.checkRtcConnection().then(uid => {
				this.checklist.rtc = true;
				this.pushChanges();
				setTimeout(() => {
					this.checkRtm(false, uid);
				}, TIMEOUT);
			}).catch((error) => {
				this.checklist.rtc = false;
				this.errors.rtc = LabelPipe.transform('bhere_rtc_error', error);
				this.checkRtm(true);
				this.pushChanges();
			});
		}
	}

	checkRtm(skip, uid) {
		if (SHOW_ERROR) {
			this.checklist.rtm = false;
			this.errors.rtm = LabelPipe.transform('bhere_rtm_error');
		} else if (skip) {
			this.checklist.rtm = false;
			this.onComplete();
		} else {
			AgoraService.checkRtmConnection(uid).then(_ => {
				this.checklist.rtm = true;
			}).catch((error) => {
				this.checklist.rtm = false;
				this.errors.rtm = LabelPipe.transform('bhere_rtm_error', error);
			}).finally(() => {
				this.onComplete();
			});
		}
	}

	onComplete() {
		// console.log('AgoraChecklistComponent.onComplete');
		const success = Object.keys(this.checklist).reduce((p, c) => {
			return p && this.checklist[c];
		}, true);
		this.checklist.success = success;
		this.checklist.error = !success;
		this.busy = false;
		this.pushChanges();
		if (this.state.role === RoleType.SmartDevice) {
			this.onNext();
		}
	}

	onNext() {
		if (this.checklist.success) {
			LocalStorageService.set('checklist', true);
		}
		this.checked.next(this.checklist);
	}

	openHttps() {
		window.location.href = window.location.href.replace('http://', 'https://').replace(':5000', ':6443');
	}

	showFirewallConfiguration() {
		ModalService.open$({ src: environment.template.modal.configureFirewall }).pipe(
			takeUntil(this.unsubscribe$)
		).subscribe();
	}
}

AgoraChecklistComponent.meta = {
	selector: '[agora-checklist]',
	outputs: ['checked'],
};
