import { html, render } from 'https://unpkg.com/lit-html?module';
const template = html` <h1 class="subtitle">Inside custom element</h1> `;

render(template, document.getElementById('app'));
