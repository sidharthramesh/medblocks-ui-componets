import { LitElement, property } from 'lit-element';
import { EventEmitter, watch } from '../../internal/decorators';

export default abstract class EhrElement extends LitElement {
  @property({ type: String, reflect: true }) path: string;

  @property({ type: String, reflect: true }) label: string;

  abstract data: any;

  abstract input: EventEmitter<any>;

  checkValidation(): boolean {
    return true;
  }

  @watch('data')
  handleDataChange() {
    this.input.emit();
  }
}
