import { customElement, html, LitElement, property, TemplateResult, unsafeCSS } from 'lit-element';
import { SlInput } from '../../shoelace';
import { until } from 'lit-html/directives/until.js';
import { classMap } from 'lit-html/directives/class-map';
import styles from 'sass:./search.scss';
import { event, EventEmitter, watch } from '../../internal/decorators';
import { ifDefined } from 'lit-html/directives/if-defined';

interface CodedText {
  code: string;
  display: string;
  terminology: string;
}

@customElement('mb-search')
export default class MbSearch extends LitElement {
  static styles = unsafeCSS(styles);

  @property({ type: Object }) data: CodedText | undefined;

  @property({ type: String }) label: string;

  @property({ type: String }) searchTerm: string;

  @property({ type: String }) path: string;

  @property({ type: Array }) filters: { name: string; filter: string }[];

  @property({ type: Array }) cancelledFilters: string[] = [];

  @event('input') input: EventEmitter<CodedText>;

  @watch('data')
  handleDataChange() {
    this.input.emit();
  }

  handleInput(e: CustomEvent) {
    const inputElement = e.target as SlInput;
    this.searchTerm = inputElement.value;
    this.renderRoot.querySelector('sl-dropdown')?.show();
  }

  async getResults() {
    await new Promise(r => setTimeout(r, 500));
    return html`
      <sl-menu-item value="option1" .label=${'Option 1'} .terminology=${'SNOMED-CT'}
        >Cataract posterior subcapsular
      </sl-menu-item>
    `;
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
      display: menuItem.label,
      code: menuItem.value,
      terminology: menuItem.terminology
    };
    this.input.emit();
  }

  handleClear() {
    this.data = undefined;
    this.input.emit();
  }

  get hasValue() {
    return this?.data?.display && this?.data?.code ? true : false;
  }

  get display() {
    return this.hasValue ? this.data?.display : undefined;
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
          value=${ifDefined(this.display || this.searchTerm)}
          ?readonly=${this.hasValue}
          ?clearable=${this.hasValue}
          @sl-clear=${this.handleClear}
          placeholder="Type to search"
        >
        </sl-input>
        ${this.hasValue
          ? null
          : html`
              <sl-menu style="min-width: 400px" @sl-select=${this.handleSelect}>
                ${until(this.getResults(), this.loadingResults)}
                ${this.filters?.length > 0
                  ? html`<div class="tags">
                      ${this.filters
                        .filter(f => !this.cancelledFilters.includes(f.filter))
                        .map(
                          f =>
                            html`<sl-tag
                              size="small"
                              @sl-clear=${() => (this.cancelledFilters = [...this.cancelledFilters, f.filter])}
                              clearable
                              pill
                              >${f.name}</sl-tag
                            >`
                        )}
                    </div>`
                  : null}
              </sl-menu>
            `}
      </sl-dropdown>
    `;
  }
}
