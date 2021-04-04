import { customElement, html, LitElement, property, unsafeCSS } from 'lit-element';
import { event, EventEmitter, watch } from '../../internal/decorators';
import { EhrElement } from '../base/base';
import styles from 'sass:./form.scss';


@customElement('mb-form')
export default class MedblockForm extends LitElement {
  static styles = unsafeCSS(styles)
  @property({ type: String }) selector: string = '[path]';

  @property({ type: Object }) data: { [path: string]: any };

  @event('input') input: EventEmitter<any>;

  @watch('data')
  testChanged(oldValue: any, newValue: any) {
    if (oldValue !== newValue) {
      Object.keys(this.pathElementMap).forEach(path => {
        let element = this.pathElementMap[path] as EhrElement;
        element.data = newValue[path];
      });
    }
  }

  serialize() {
    const data = this.data
    const newData: any = {}
    Object.keys(data).forEach(path => {
      if (typeof data[path] === 'object') {
        const obj = data[path]
        Object.keys(obj).forEach(frag => {
          newData[`${path}|${frag}`] = obj[frag]
        })
      }
    })
    return newData
  }

  get selectedNodes(): NodeListOf<HTMLElement> {
    return this.querySelectorAll(this.selector);
  }

  get pathElementMap(): { [path: string]: HTMLElement } {
    const childElements = this.selectedNodes;
    if (childElements.length === 0) {
      console.debug(`mb-template: No child elements found for selector "${this.selector}"`);
    }
    let map = {};
    childElements.forEach((el: any) => {
      const path = el.path;
      if (Object.keys(map).includes(path)) {
        console.debug(`${path} included twice. Only the last occurance will be considered.`);
      }
      map = { ...map, [el.path]: el };
    });
    return map;
  }

  currentData() {
    let newValue: { [path: string]: any } = {};
    Object.entries(this.pathElementMap).map(([path, node]) => {
      newValue[path] = (node as any).data;
    });
    return newValue;
  }

  handleInput(e: CustomEvent) {
    e.stopPropagation();
    this.data = this.currentData();
    this.input.emit();
  }
  handleSlotChange() {
    this.data = this.currentData();
    this.input.emit();
  }

  async connectedCallback() {
    super.connectedCallback();
    const observer = new MutationObserver(() => {
      this.data = this.currentData();
      this.input.emit();
    });
    observer.observe(this, { childList: true, subtree: true });
  }

  render() {
    return html`<slot @slotchange=${this.handleSlotChange} @input=${this.handleInput}></slot>`;
  }
}
