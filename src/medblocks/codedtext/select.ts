import { customElement, property } from "lit-element";
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

    @property({ type: Array }) options: { code: string, label: string }[] = []

    getLabel(code: string) {
        return this.options.filter(option => option.code === code)[0].label
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
    render() {
        return html`
            <sl-select clearable placeholder=${this.placeholder ?? 'Please select' } label=${ifDefined(this.label)}
                @sl-change=${this.handleInput} @sl-clear=${() => { this.data = undefined; this.input.emit() }}>
                ${this.options.map(option => html`<sl-menu-item value=${option.code} .label=${option.label}>${option.label}
                </sl-menu-item>`)}
            </sl-select>
            <slot @slotchange=${()=> console.log("Slot changed", this.querySelectorAll('mb-option'))}></slot>
        `
    }
}