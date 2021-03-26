import { property } from "lit-element";
import { event, EventEmitter } from "../../internal/decorators";
import { EhrElement } from "../base/base";

interface CodedText {
    code: string;
    display: string;
    terminology: string;
}

export abstract class CodedTextElement extends EhrElement {
    @property({ type: Object }) data: CodedText | undefined
    @property({ type: String }) terminology: string = 'local'
    @event('input') input: EventEmitter<CodedText>;
}