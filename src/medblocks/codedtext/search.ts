import { customElement, html, property, TemplateResult, unsafeCSS } from 'lit-element';
import { SlInput } from '../../shoelace';
import { until } from 'lit-html/directives/until.js';
import { classMap } from 'lit-html/directives/class-map';
import styles from 'sass:./search.scss';
import { ifDefined } from 'lit-html/directives/if-defined';
import { CodedTextElement } from './base';
import MbFilter from './filter';




@customElement('mb-search')
export default class MbSearch extends CodedTextElement {
  static styles = unsafeCSS(styles);

  @property({ type: String }) searchTerm: string;

  @property({ type: Array }) filters: MbFilter[];

  @property({ type: Array }) cancelledFilters: string[] = [];

  @property({type: Array}) mock: string [] = [];
  handleInput(e: CustomEvent) {
    const inputElement = e.target as SlInput;
    this.searchTerm = inputElement.value;
    this.renderRoot.querySelector('sl-dropdown')?.show();
    console.log("getting input")
  }

  async getResults() {
    await new Promise(r => setTimeout(r, 500));
    return this.mock.map(r=>html`
      <sl-menu-item value=${r} .label=${r} .terminology=${this.terminology}
        >${r}
      </sl-menu-item>
    `)
  }

  get loadingResults(): TemplateResult {
    const skeletons = 4;
    return html`${[...Array(skeletons)].map(
      () => html` <sl-menu-item disabled class="loading">
        <sl-skeleton effect="sheen"></sl-skeleton>
      </sl-menu-item>`
    )}`;
  }

  handleSelect(e: CustomEvent) {
    const menuItem = e.detail.item;
    this.data = {
      value: menuItem.label,
      code: menuItem.value,
      terminology: menuItem.terminology
    };
    this.input.emit();
  }

  connectedCallback(){
    super.connectedCallback()
    const observer = new MutationObserver(()=>{
      this.handleChildChange()
    })
    observer.observe(this, {childList: true, subtree: true, attributes: true})
  }
  
  handleChildChange(){
    this.filters = [...this.querySelectorAll('mb-filter') as NodeListOf<MbFilter>]
  }
  
  handleClear() {
    this.data = undefined;
    this.input.emit();
  }

  get hasValue() {
    return this?.data?.value && this?.data?.code ? true : false;
  }

  get display() {
    return this.hasValue ? this.data?.value : undefined;
  }

  get code() {
    return this.hasValue ? this.data?.code : undefined;
  }

  render() {
    return html`
      <sl-dropdown
        .focusKeys=${['Enter']}
        .typeToSelect=${false}
        @sl-after-hide=${() => {
          this.cancelledFilters = [];
        }}
      >
        <sl-input
          class=${classMap({ pointer: this.hasValue })}
          slot="trigger"
          .label=${this.label}
          @sl-input=${this.handleInput}
          value=${ifDefined(this.display ?? this.searchTerm ?? '')}
          ?readonly=${this.hasValue}
          ?clearable=${this.hasValue}
          @sl-clear=${this.handleClear}
          placeholder="Type to search"
        >
        </sl-input>
        ${this.hasValue
          ? null
          : html`
              <sl-menu style="min-width: 300px" @sl-select=${this.handleSelect}>
                ${until(this.getResults(), this.loadingResults)}
                ${this.filters?.length > 0
                  ? html`<div class="tags">
                      ${this.filters
                        .map(
                          f =>
                            html`<sl-tag
                              size="medium"
                              type=${f.disabled ? "info" : "primary"}
                              @click=${()=>{f.disabled = !f.disabled}}
                              pill
                              >${f.name}</sl-tag
                            >`
                        )}
                    </div>`
                  : null}
              </sl-menu>
            `}
      </sl-dropdown>
      <slot @slotchange=${this.handleChildChange}></slot>
    `;
  }
}
