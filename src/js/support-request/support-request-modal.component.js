import { Component, getContext } from 'rxcomp';
import ModalOutletComponent from '../modal/modal-outlet.component';
import ModalService from '../modal/modal.service';

export default class SupportRequestModalComponent extends Component {

	onInit() {
		super.onInit();
		const { parentInstance } = getContext(this);
		if (parentInstance instanceof ModalOutletComponent) {
			this.data = parentInstance.modal.data;
		}
	}

	onAccept(user) {
		ModalService.resolve();
	}

	onReject(user) {
		ModalService.reject();
	}

	onClose() {
		ModalService.reject();
	}
}

SupportRequestModalComponent.meta = {
	selector: '[support-request-modal]'
};
