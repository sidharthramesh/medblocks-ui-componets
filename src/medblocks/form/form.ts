import { customElement, html, internalProperty, LitElement, property, unsafeCSS } from 'lit-element';
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

  @internalProperty() pathElementMap: { [path: string]: HTMLElement }

  async getComposition(uid: string = this.uid) {
    const r = await this.axios.get(`/composition/${uid}`, { params: { format: 'FLAT' } })
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
    // Check only whichever has changed. This is also slow.
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
    const data = this.export()
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

  export(data: Data = this.data) {
    return toFlat(data)
  }

  get submitButton(): MbSubmit | null {
    return this.querySelector('mb-submit')
  }


  currentPathElementMap(el: HTMLElement): { [path: string]: HTMLElement } {

    // TODO: This is the slowest function. Find ways to speed it up.
    const selfElement = el.matches(this.selector) ? el as EhrElement : null
    const childElements = el.querySelectorAll(this.selector);
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
    if (selfElement) {
      map = {...map, [selfElement.path]: selfElement}
    }
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
    // TODO Only handle current data for the event target. Not all. This is slow.
    this.data = this.currentData();
    this.input.emit();
  }
  handleSlotChange() {
    this.data = this.currentData();
    this.input.emit();
  }

  async connectedCallback() {
    // Set pathElementMap first
    super.connectedCallback();
    this.pathElementMap = this.currentPathElementMap(this)
    const observer = new MutationObserver((mutationRecord) => {
      mutationRecord
        .map(record => [...record.addedNodes])
        .flat()
        .filter(node => node.nodeType === Node.ELEMENT_NODE)
        .map(node => this.currentPathElementMap(node as HTMLElement))
        .forEach(pathElement => {
          this.pathElementMap = { ...this.pathElementMap, ...pathElement }
        })

      const removedNodes = mutationRecord
        .map(record => [...record.removedNodes])
        .flat()

      console.log(removedNodes)

      removedNodes
        .filter(node => node.nodeType === Node.ELEMENT_NODE)
        .map(node => this.currentPathElementMap(node as HTMLElement))
        .forEach(pathElement => {
          const pathsToRemove = Object.keys(pathElement)
          let newPathElementMap = { ...this.pathElementMap }
          console.log(pathsToRemove)
          pathsToRemove.forEach(path => {
            delete newPathElementMap[path]
          })
          this.pathElementMap = newPathElementMap
        })
      // TODO Only handle newly added/deleted nodes. Slow currently. Attribute/data change is handled by handleInput.
      // Update the path element map based on mutations
      this.data = this.currentData();
      this.input.emit();
    });
    observer.observe(this, { childList: true, subtree: true });
  }

  firstUpdated() {
    this.load.emit({ composed: true })
  }
  render() {
    return html`<slot @slotchange=${this.handleSlotChange} @input=${this.handleInput} @mb-submit=${this.handleSubmit}></slot>
    `;
  }
}
