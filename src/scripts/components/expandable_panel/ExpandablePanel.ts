import * as styles from 'bundle-text:./ExpandablePanel.css';

const sheet = new CSSStyleSheet();
sheet.replaceSync(String(styles));

const MINIMIZED_CLASS = 'minimized';

export class ExpandablePanel extends HTMLElement {
  #legend: HTMLLegendElement;
  #fieldset: HTMLFieldSetElement;

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });

    shadow.adoptedStyleSheets = [sheet];

    this.shadowRoot!.innerHTML = `
      <fieldset>
        <legend></legend>
        <div>
            <slot></slot>
        </div>
      </fieldset>
      `;
    this.#legend = shadow.querySelector('legend');
    this.#fieldset = shadow.querySelector('fieldset');

    this.#legend.addEventListener('click', () => this.toggle());
  }

  static get observedAttributes() {
    return ['legend', 'minimized', 'noborder'];
  }

  connectedCallback() {
    this.syncAttributes();
  }

  attributeChangedCallback() {
    this.syncAttributes();
  }

  syncAttributes() {
    if (this.hasAttribute('legend')) {
      this.#legend.textContent = this.getAttribute('legend');
    } else {
      this.#fieldset.classList.remove(MINIMIZED_CLASS);
      this.#legend.textContent = '';
    }

    if (this.hasAttribute(MINIMIZED_CLASS)) {
      this.#fieldset.classList.add(MINIMIZED_CLASS);
    } else {
      this.#fieldset.classList.remove(MINIMIZED_CLASS);
    }

    if (this.hasAttribute('noborder')) {
      this.#fieldset.classList.add('noborder');
    } else {
      this.#fieldset.classList.remove('noborder');
    }
  }

  private notifyChange() {
    this.dispatchEvent(
      new CustomEvent('change', {
        detail: {
          isExpanded: this.#fieldset.classList.contains(MINIMIZED_CLASS),
        },
        bubbles: true,
      })
    );
  }

  private toggle(): void {
    this.#fieldset.classList.toggle(MINIMIZED_CLASS);
    this.notifyChange();
  }

  open(): void {
    this.#fieldset.classList.remove(MINIMIZED_CLASS);
    this.notifyChange();
  }

  close(): void {
    this.#fieldset.classList.add(MINIMIZED_CLASS);
    this.notifyChange();
  }
}

customElements.define('expandable-panel', ExpandablePanel);
