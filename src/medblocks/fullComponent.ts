import { css, customElement, html, LitElement, property, svg } from "lit-element";

@customElement('main-element')
export default class Component extends LitElement {
    static styles = css`
    
    `
    createRenderRoot() {
        return this
    }

    @property({ type: Object })
    composition: any = {}

    @property({ type: Array })
    points: { x: number, y: number }[] = []

    handleImageClick(e: any) {
        const imagebox = e.target.getBoundingClientRect()
        const x = e.clientX - imagebox.left
        const y = e.clientY - imagebox.top
        this.points = [...this.points, { x, y }]
    }
    render() {

        return html`
            <div class="section">
                <div class="container">
                    <h1 class="title">Botulin Injection site</h1>
                    <div class="columns">
                        <div class="column is-one-fifth">
                            ${svg`<svg width="250" height="250" xmlns="http://www.w3.org/2000/svg">
                                <image @click=${this.handleImageClick} href="https://thispersondoesnotexist.com/image" height="250"
                                    width="250">
                                </image>
                                ${this.points.map((point, i) => svg`
                                <text x=${point.x + 3} y=${point.y} - 10
                                    style="font-size: large; cursor: default; font-weight: bold;" fill="black">${i + 1}</text>
                                <circle cx=${point.x} cy=${point.y} r="5" fill="white"></circle>
                                <circle cx=${point.x} cy=${point.y} r="2" fill="black"></circle>
                                `)}
                            </svg>`}
                        </div>
                        <div class="column">
                            <mb-form @input=${(e: any)=> this.composition = e.target.data} .data=${this.composition}>
                                <mb-context path=boutolin_medication/context/setting></mb-context>
                                <mb-context path=boutolin_medication/context/start_time> </mb-context> <mb-context
                                    path=boutolin_medication/contexts/setting> </mb-context> <mb-context
                                    path=boutolin_medication/category> </mb-context> <mb-context path=boutolin_medication/language>
                                    </mb-context> <mb-context path=boutolin_medication/territory> </mb-context> <mb-context
                                    path=boutolin_medication/composer> </mb-context> <div class="grid">
                                    <!-- <p class="label">Site</p> -->
                                    <p class="label">Vol(mL)</p>
                                    <p class="label">Units</p>
                        </div>
                        ${this.points.map((_, i) => html`
                        <div class="grid field">
                            <div class="is-hidden">

                                <mb-input path=${`boutolin_medication/medication_order/order:${i}/anatomical_location/body_site_name`} label="Body site name"></mb-input>
                                <mb-input path=${`boutolin_medication/medication_order/order:${i}/medication_item`}
                                label="Medication item" data="Botulin"></mb-input>
                                <mb-input path=${`boutolin_medication/medication_order/order:${i}/route:0`}
                                    data="Subcutaneous"></mb-input>
                
                        </div>
                        <mb-input path="boutolin_medication/medication_order/order:${i}/overall_directions_description" label="Overall directions description"></mb-input>
                        <mb-input path="boutolin_medication/medication_order/order:0/route:0" label="Route"></mb-input>
                        <mb-input path="boutolin_medication/medication_order/order:0/route:0" label="Route"></mb-input>
                            <mb-input path=${`boutolin_medication/medication_order/order:${i}/specific_directions_description:0`}>
                            
                                </mb-input>
                                
                                <mb-input
                                    path=${`boutolin_medication/medication_order/order:${i}/specific_directions_description:1`}>
                                    </mb-input> </div> `)} 
                                    <mb-context path=boutolin_medication/medication_order/narrative></mb-context>
                                    <mb-context path=boutolin_medication/medication_order/language></mb-context>
                                    <mb-context path=boutolin_medication/medication_order/encoding></mb-context>
                                    <mb-context path=boutolin_medication/medication_order/subject></mb-context>
                                </mb-form> </div> </div> </div> <hr>
                        </div>
                        <pre>${JSON.stringify(this.composition, null, 2)}</pre>`
    }
}