import { customElement, html, property } from "lit-element";
import { event, EventEmitter } from "../../internal/decorators";
import { SlInput } from "../../shoelace";
import { EhrElement } from "../base/base";

@customElement('mb-date')
export default class MbDateTime extends EhrElement {
    @property({ type: String }) data: string

    @property({ type: String, reflect: true }) label: string = ''

    @property({ type: Boolean, reflect: true }) time: boolean = false

    @event('input') input: EventEmitter<any>

    handleInput(e: CustomEvent) {
        const inputElement = e.target as SlInput
        this.data = inputElement.value
        this.input.emit()
    }

    render() {
        return html`
        <sl-input type="${this.time ? 'datetime-local' : 'date'}" label=${this.label} @sl-input=${this.handleInput}
            value=${this.data || '' }>
        </sl-input>
        `
    }
}