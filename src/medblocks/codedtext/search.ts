import {
  css,
  customElement,
  html,
  internalProperty,
  property,
  TemplateResult,
} from 'lit-element';
import SlInput from '@shoelace-style/shoelace/dist/components/input/input';
import '@shoelace-style/shoelace/dist/components/spinner/spinner';

import { until } from 'lit-html/directives/until.js';
import { classMap } from 'lit-html/directives/class-map';
import { ifDefined } from 'lit-html/directives/if-defined';
import { CodedTextElement } from './base';
import MbFilter from './filter';
import SlDropdown from '@shoelace-style/shoelace/dist/components/dropdown/dropdown';
import '@shoelace-style/shoelace/dist/components/dropdown/dropdown';
import '@shoelace-style/shoelace/dist/components/menu/menu';
import '@shoelace-style/shoelace/dist/components/icon/icon';
import { AxiosInstance } from 'axios';
import { watch } from '../../internal/decorators';

@customElement('mb-search')
export default class MbSearch extends CodedTextElement {
  static styles = css`
    :host,
    sl-dropdown {
      display: block;
    }

    sl-input.pointer::part(base) {
      cursor: default;
    }

    .tags {
      padding: var(--sl-spacing-xx-small) var(--sl-spacing-x-large);
    }

    .more {
      display: flex;
      justify-content: space-between;
      padding: var(--sl-spacing-xxx-small) var(--sl-spacing-small);
    }
    .tags sl-tag {
      padding: var(--sl-spacing-xx-small);
    }

    sl-tag::part(base) {
      cursor: pointer;
    }
  `;

  @property({ type: String }) searchTerm: string;

  @property({ type: Array }) filters: MbFilter[];

  @property({ type: Array }) cancelledFilters: string[] = [];

  @property({ type: Array }) mock: string[] = [];

  @property({ type: Object }) axios: AxiosInstance;

  @property({ type: Number }) debounceInterval = 250;

  @property({ type: Number }) hits = 10;

  @internalProperty() moreHits: number = 0;

  @internalProperty() debouncing: boolean = false;

  @internalProperty() debounceTimeout: number;

  get maxHits() {
    return this.hits + this.moreHits;
  }

  @watch('searchTerm')
  searchTermChange() {
    clearTimeout(this.debounceTimeout);
    this.debouncing = true;
    this.debounceTimeout = window.setTimeout(() => {
      this.debouncing = false;
    }, this.debounceInterval);
  }

  handleInput(e: CustomEvent) {
    const inputElement = e.target as SlInput;
    this.searchTerm = inputElement.value;
    const dropdown = this.renderRoot.querySelector('sl-dropdown') as SlDropdown;
    dropdown.show();
  }

  get contraints() {
    const filters = this.filters
      .filter(filter => !filter.disabled)
      .map(filter => filter.filter);
    if (filters?.length > 0) {
      return filters.join(' OR ');
    }
    return null;
  }

  get viewMore() {
    return html` <div class="more">
      <sl-button
        type="text"
        @click=${() => {
          this.moreHits += 10;
        }}
      >
        <sl-icon name="caret-down-fill" slot="prefix"></sl-icon>More</sl-button
      >
      ${this.maxHits > this.hits
        ? html`<sl-button
            type="text"
            @click=${() => {
              this.moreHits -= 10;
            }}
          >
            <sl-icon name="caret-up-fill" slot="prefix"></sl-icon
            >Less</sl-button
          >`
        : null}
    </div>`;
  }

  async getResults() {
    if (this.debouncing) {
      return this.loadingResults;
    }

    if (this.mock.length) {
      return this.mock.map(
        r => html`<sl-menu-item value=${r} .label=${r}>${r}</sl-menu-item>`
      );
    }

    if (!this.searchTerm) {
      return [];
    }
    try {
      const response = await this.axios.get(
        'http://localhost:9200/v1/snomed/search',
        {
          params: {
            s: this.searchTerm,
            maxHits: this.maxHits,
            constraint: this.contraints,
          },
        }
      );
      const results = response.data.map(
        (term: {
          id: number;
          conceptId: number;
          term: string;
          preferredTerm: string;
        }) =>
          html`
            <sl-menu-item
              value=${term.conceptId}
              .label=${term.preferredTerm}
              .terminology=${this.terminology}
            >
              ${term.preferredTerm === term.term
                ? html`<sl-icon slot="suffix" name="star"></sl-icon>`
                : null}
              ${term.term}
            </sl-menu-item>
          `
      );
      return this.maxHits === results.length
        ? [...results, this.viewMore]
        : results;
    } catch (e) {
      console.error(e);
      return html`
        <sl-menu-item disabled>
          <sl-icon name="exclamation-triangle" slot="prefix"></sl-icon>
          An unexpected error occured
        </sl-menu-item>
      `;
    }
  }

  get loadingResults(): TemplateResult {
    const skeletons = 5;
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
      terminology: menuItem.terminology,
      _type: () => 'codedtext',
    };
    this.input.emit();
  }

  connectedCallback() {
    super.connectedCallback();
    // Emit register event
    // Get axios instance from parent
    // If not, default or error
    const observer = new MutationObserver(() => {
      this.handleChildChange();
    });
    observer.observe(this, {
      childList: true,
      subtree: true,
      attributes: true,
    });
  }

  handleChildChange() {
    this.filters = [
      ...(this.querySelectorAll('mb-filter') as NodeListOf<MbFilter>),
    ];
  }

  handleClear() {
    this.data = undefined;
    this.moreHits = 0;
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
          ${this.hasValue
            ? null
            : html`<sl-icon
                library="medblocks"
                name="search"
                slot="prefix"
              ></sl-icon>`}
        </sl-input>
        ${this.hasValue || !this.searchTerm
          ? null
          : html`
              <sl-menu style="min-width: 300px" @sl-select=${this.handleSelect}>
                ${until(this.getResults())}
                ${this.filters?.length > 0
                  ? html`<div class="tags">
                      ${this.filters.map(
                        f =>
                          html`<sl-tag
                            ?clearable=${!f.disabled}
                            size="medium"
                            type=${f.disabled ? 'info' : 'primary'}
                            @click=${() => {
                              f.disabled = !f.disabled;
                            }}
                            >${f.label}</sl-tag
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
