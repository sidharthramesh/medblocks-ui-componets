import { customElement, internalProperty, property } from "lit-element";
import { html } from "lit-html";
import { ifDefined } from "lit-html/directives/if-defined";
import { watch } from "../../internal/decorators";
import { CodedTextElement } from "./base";
import { MbOption, SlSelect } from "../../shoelace"
@customElement('mb-select')
export default class MbSelect extends CodedTextElement {

    @watch('data')
    handleDataChange() {

    }

    @property({ type: String }) terminology: string

    @property({ type: String, reflect: true }) placeholder: string

    @internalProperty() options: MbOption[] = []

    getLabel(code: string) {
        return this.options.filter(option => option.value === code)[0].innerHTML
    }

    get optionElements(): NodeListOf<MbOption> {
        return this.querySelectorAll('mb-option')
    }

    handleInput(e: CustomEvent) {
        const select = e.target as SlSelect
        if (select.value && typeof select.value === 'string') {
            console.log(e)
            this.data = { code: select.value, display: this.getLabel(select.value), terminology: this.terminology }
            this.input.emit()
        }
    }
    connectedCallback() {
        super.connectedCallback()
        const observer = new MutationObserver(() => {
            this.handleChildChange()
        });
        observer.observe(this, { childList: true, subtree: true });
    }

    handleChildChange() {
        this.options = [...this.querySelectorAll('mb-option') as NodeListOf<MbOption>]
    }

    render() {
        return html`
            <sl-select clearable placeholder=${this.placeholder ?? 'Please select' } label=${ifDefined(this.label)}
                @sl-change=${this.handleInput} @sl-clear=${() => { this.data = undefined; this.input.emit() }}>
                ${this.options.map(option => html`<sl-menu-item value=${option.value}>${option.innerHTML}
                </sl-menu-item>`)}
            </sl-select>
            <slot @slotchange=${this.handleChildChange}></slot>
        `
    }
}