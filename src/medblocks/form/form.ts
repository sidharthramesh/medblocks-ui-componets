import { customElement, html, LitElement, property, unsafeCSS } from 'lit-element';
import { event, EventEmitter, watch } from '../../internal/decorators';
import { EhrElement } from '../base/base';
import styles from 'sass:./form.scss';
import MbContext from '../context/context';
import { Ctx, Data, defaultContextData, fromFlat, toFlat } from './utils';
import { AxiosInstance } from 'axios';
import { MbSubmit } from '../../shoelace';



@customElement('mb-form')
export default class MedblockForm extends LitElement {
  static styles = unsafeCSS(styles)
  @property({ type: String }) selector: string = '[path]';

  @property({ type: Object }) data: Data;

  @property({ type: Object }) ctx: Ctx

  @property({ type: Boolean, reflect: true }) overwritectx: boolean = false

  @event('input') input: EventEmitter<any>;

  @event('load') load: EventEmitter<any>;

  @property({ type: Object }) axios: AxiosInstance

  @property({ type: String, reflect: true }) uid: string

  @property({ type: String, reflect: true }) template: string

  @property({ type: String, reflect: true }) ehr: string

  async getComposition() {
    const r = await this.axios.get(`/composition/${this.uid}`, { params: { format: 'FLAT' } })
    const composition = r?.data?.composition
    const data = fromFlat(composition)
    return data

  }

  async postComposition(flat: Data) {
    const r = await this.axios.post(`/composition`, flat, { params: { format: 'FLAT', templateId: this.template, ehrId: this.ehr } })
    return r?.data?.compositionUid
  }

  async putComposition(flat: Data) {
    const r = await this.axios.put(`/composition/${this.uid}`, flat, { params: { format: 'FLAT', templateId: this.template } })
    return r?.data?.compositionUid
  }

  @watch('data')
  handleDataChange(oldValue: any, newValue: any) {
    if (oldValue !== newValue) {
      Object.keys(this.pathElementMap).forEach(path => {
        let element = this.pathElementMap[path] as EhrElement;
        element.data = newValue[path];
      });
    }
  }

  @event('submit') submit: EventEmitter<any>
  async handleSubmit() {
    this.insertContext()
    await 0
    const data = toFlat(this.data)
    this.submit.emit({ detail: data, cancelable: true })
  }

  insertContext() {
    Object.values(this.pathElementMap)
      .filter((element: MbContext) => !!element.autocontext)
      .forEach((element: MbContext) => {
        const path = element.path
        const contextData = this.overwritectx ? defaultContextData(path, this.ctx) : element.data ?? defaultContextData(path, this.ctx)
        element.data = contextData
      })
  }

  get submitButton(): MbSubmit | null {
    return this.querySelector('mb-submit')
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

  firstUpdated() {
    this.load.emit({ composed: true })
  }
  render() {
    return html`<slot @slotchange=${this.handleSlotChange} @input=${this.handleInput} @mb-submit=${this.handleSubmit}></slot>`;
  }
}
