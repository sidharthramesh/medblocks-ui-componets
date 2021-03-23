import { customElement, html, LitElement, property, unsafeCSS } from 'lit-element';
import styles from 'sass:./search.scss';
import { SlInput } from '../../shoelace';
import { until } from 'lit-html/directives/until.js';

@customElement('mb-search')
export default class MbSearch extends LitElement {
  @property({ type: String }) label: string;

  @property({ type: String }) searchTerm: string;
  handleInput(e: CustomEvent) {
    const inputElement = e.target as SlInput;
    this.searchTerm = inputElement.value;
    this.renderRoot.querySelector('sl-dropdown')?.show();
  }
  static styles = unsafeCSS(styles);
  async getResults() {
    await new Promise(r => setTimeout(r, 500));
    return html`
      <!-- <sl-menu-item>
                  Hello there
                </sl-menu-item> -->
      <sl-skeleton effect="sheen" style="padding: 8px 14px 8px 20px"></sl-skeleton>
      <sl-skeleton effect="sheen" style="padding: 8px 10px 8px 20px"></sl-skeleton>
      <sl-skeleton effect="sheen" style="padding: 8px 15px 8px 20px"></sl-skeleton>
      <sl-skeleton effect="sheen" style="padding: 8px 18px 8px 20px"></sl-skeleton>
      <sl-skeleton effect="sheen" style="padding: 8px 20px 8px 20px"></sl-skeleton>
    `;
  }
  render() {
    return html`
      <sl-dropdown .focusKeys=${['Enter']} .typeToSelect=${false}>
        <sl-input slot="trigger" .label=${this.label} @sl-input=${this.handleInput}></sl-input>
        <sl-menu
          style="min-width: 400px; border: solid 1px var(--sl-panel-border-color); border-radius: var(--sl-border-radius-medium);"
        >
          ${until(
            this.getResults(),
            html`<sl-menu-item>
                <sl-skeleton effect="sheen"></sl-skeleton>
              </sl-menu-item>
              <sl-menu-item>
                <sl-skeleton effect="sheen"></sl-skeleton>
              </sl-menu-item>
              <sl-menu-item>
                <sl-skeleton effect="sheen"></sl-skeleton>
              </sl-menu-item>`
          )}
        </sl-menu>
      </sl-dropdown>
    `;
  }
}
