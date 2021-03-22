import { customElement, html, LitElement } from 'lit-element';

@customElement('mb-search')
export default class MbSearch extends LitElement {
  render() {
    return html`
      <sl-dropdown .focusKeys=${['Enter']} .typeToSelect=${() => {}}>
        <sl-input slot="trigger"></sl-input>
        <sl-menu .typeToSelect=${() => {}}>
          <sl-menu-item>Dropdown Item 1</sl-menu-item>
          <sl-menu-item>Dropdown Item 2</sl-menu-item>
          <sl-menu-item>Dropdown Item 3</sl-menu-item>
          <sl-menu-item checked>Checked</sl-menu-item>
          <sl-menu-item disabled>Disabled</sl-menu-item>
          <sl-menu-divider></sl-menu-divider>
          <sl-menu-item>
            Prefix
            <sl-icon slot="prefix" name="gift"></sl-icon>
          </sl-menu-item>
          <sl-menu-item>
            Suffix Icon
            <sl-icon slot="suffix" name="heart"></sl-icon>
          </sl-menu-item>
        </sl-menu>
      </sl-dropdown>
    `;
  }
}
