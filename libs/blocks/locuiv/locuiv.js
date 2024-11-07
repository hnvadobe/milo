import { html, render } from '../../deps/htm-preact.js';

export default function init(el) {
  render(html`<p class="big">Hello World!</p>`, el);
}
