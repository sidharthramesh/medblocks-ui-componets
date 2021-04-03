import { LitElement, property } from "lit-element";
import { EventEmitter, watch } from "../../internal/decorators";

export abstract class EhrElement extends LitElement {
    @property({ type: String }) path: string

    @property({ type: String, reflect: true }) label: string

    abstract data: any

    abstract input: EventEmitter<any>

    @watch('data')
    handleDataChange() {
        this.input.emit()
    }
}