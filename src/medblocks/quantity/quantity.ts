import { customElement, html, property, unsafeCSS } from "lit-element";
import { event, EventEmitter } from "../../internal/decorators";
import { EhrElement } from "../base/base";
import styles from 'sass:./quantity.scss';
import MbUnit from "./unit";
import { SlInput, SlSelect } from '../../shoelace'
import { ifDefined } from 'lit-html/directives/if-defined'

interface Quantity { magnitude?: number, unit?: string }

@customElement('mb-quantity')
export default class MbQuantity extends EhrElement {
    static styles = unsafeCSS(styles)

    @property({ type: Object }) data: Quantity | undefined
    @property({ type: String, reflect: true }) default: string

    @property({ type: Array }) units: MbUnit[] = []
    @event('input') input: EventEmitter<Quantity>

    handleChildChange() {
        this.units = [...this.querySelectorAll('mb-unit') as NodeListOf<MbUnit>]
    }

    connectedCallback() {
        super.connectedCallback()
        const observer = new MutationObserver(() => {
            this.handleChildChange()
        })
        observer.observe(this, { attributes: true, childList: true })
        if (this.default) {
            this.data = { ...this.data, unit: this.default }
            this.input.emit()
        }
    }

    handleInput(e: CustomEvent) {
        const input = e.target as SlInput
        this.data = { ...this.data, magnitude: parseFloat(input.value) }
    }

    handleSelect(e: CustomEvent) {
        const select = e.target as SlSelect
        this.data = { ...this.data, unit: select.value as string }
    }
    @property({ type: String }) label: string
    render() {
        return html`
        <div class="base">
            <sl-input label=${ifDefined(this.label)} type="number" @sl-input=${this.handleInput}></sl-input>
            <sl-select placeholder="Select units" .value=${this.data?.unit ?? '' } @sl-change=${this.handleSelect}>
                ${this.units.map(unit => html`<sl-menu-item value=${unit.unit}>${unit.label}</sl-menu-item>`)}
            </sl-select>
            <slot style="display: none" @slotchange=${this.handleChildChange}></slot>
        </div>
        `
    }
}