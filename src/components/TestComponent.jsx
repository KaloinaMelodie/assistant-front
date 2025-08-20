import React from "react";
import ReactDOM from "react-dom/client";
import ReactTestUtils from "react-dom/test-utils";

/**
 * Utilitaire de test pour composants React.
 * Fournit des méthodes pour simuler des événements et inspecter le DOM rendu.
 */
export default class TestComponent {
  constructor(elem) {
    this.div = document.createElement("div");
    document.body.appendChild(this.div); // nécessaire pour certains tests
    this.root = ReactDOM.createRoot(this.div);
    this.setElement(elem);
  }

  setElement(elem) {
    this.elem = elem;
    this.root.render(elem);
    this.comp = this.elem?.type ? this.elem : null;
  }

  getComponent() {
    return this.comp;
  }

  destroy() {
    this.root.unmount();
    this.div.remove();
  }

  findDOMNodesByText(pattern) {
    const matches = [];

    function findRecursively(node) {
      if (node.nodeType === 1) {
        for (const subnode of node.childNodes) {
          if (subnode.nodeType === 3 && subnode.nodeValue.match(pattern)) {
            matches.push(node);
          }
          findRecursively(subnode);
        }
      }
    }

    findRecursively(this.div);
    return matches;
  }

  findDOMNodeByText(pattern) {
    return this.findDOMNodesByText(pattern)[0];
  }

  findInput() {
    return this.div.querySelector("input");
  }

  findComponentById(id) {
    return ReactTestUtils.findAllInRenderedTree(this.comp, (c) => c.id === id)[0];
  }

  static click(comp) {
    ReactTestUtils.Simulate.click(comp);
  }

  static pressEnter(comp) {
    ReactTestUtils.Simulate.keyDown(comp, { key: "Enter", keyCode: 13, which: 13 });
  }

  static pressTab(comp) {
    ReactTestUtils.Simulate.keyDown(comp, { key: "Tab", keyCode: 9, which: 9 });
  }

  static changeValue(comp, value) {
    comp.value = value;
    ReactTestUtils.Simulate.change(comp);
  }
}
