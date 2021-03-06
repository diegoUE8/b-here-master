import ControlComponent from './control.component';

export default class ControlCheckboxComponent extends ControlComponent {

	onInit() {
		this.label = this.label || 'label';
	}

}

ControlCheckboxComponent.meta = {
	selector: '[control-checkbox]',
	inputs: ['control', 'label'],
	template: /* html */ `
		<div class="group--form--checkbox" [class]="{ required: control.validators.length }">
			<label>
				<input type="checkbox" class="control--checkbox" [formControl]="control" [value]="true" />
				<span [innerHTML]="label | html"></span>
			</label>
			<span class="required__badge" [innerHTML]="'required' | label"></span>
		</div>
		<errors-component [control]="control"></errors-component>
	`
};
