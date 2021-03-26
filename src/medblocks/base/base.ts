import { LitElement, property } from "lit-element";
import { EventEmitter } from "../../internal/decorators";

export abstract class EhrElement extends LitElement {
    @property({ type: String }) path: string

    @property({ type: String, reflect: true }) label: string

    abstract data: any

    abstract handleDataChange(): void

    abstract input: EventEmitter<any>


}