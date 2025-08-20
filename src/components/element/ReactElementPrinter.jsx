import _ from "lodash";
import $ from "jquery";
import ReactDOM from "react-dom";
import { ReactElement } from "react";

/**
 * Imprime dynamiquement un composant React avec animation spinner.
 * Nécessite jQuery et Font Awesome.
 */
export default function printReactElement(element, options = { delay: 1000, text: "" }) {
  return new Promise((resolve) => {
    // Ajouter les règles CSS nécessaires
    const extraCss = $(`
      <style id="react_element_printer_css">
        @media print {
          body {
            visibility: hidden;
            margin: 0;
            padding: 0;
            opacity: 100%;
          }
          body > * {
            display: none;
          }
          #react_element_printer {
            display: block !important;
            visibility: visible;
          }
        }
        @page {
          size: 8.5in 11in;
          margin: 0.5in;
        }
        #react_element_printer_splash {
          display: flex;
          align-items: center;
          justify-content: center;
          position: fixed;
          left: 0;
          top: 0;
          z-index: 9999;
          width: 100%;
          height: 100%;
          background-color: rgba(255,255,255,0.7);
        }
        @media print {
          #react_element_printer_splash {
            display: none;
          }
        }
      </style>
    `);
    $("body").append(extraCss);

    // Ajouter l'élément de rendu
    $("body").append('<div id="react_element_printer"></div>');

    // Ajouter le splash spinner
    $("body").append(`
      <div id="react_element_printer_splash">
        <div style="font-size: 30pt;">
          <i class="fa fa-spinner fa-spin"></i> ${options.text || ""}
        </div>
      </div>
    `);

    // Rendu de l'élément dans le DOM temporaire
    ReactDOM.render(element, $("#react_element_printer").get(0), () => {
      _.delay(() => {
        window.print();

        // Nettoyage
        ReactDOM.unmountComponentAtNode($("#react_element_printer").get(0));
        $("#react_element_printer").remove();
        $("#react_element_printer_css").remove();
        $("#react_element_printer_splash").remove();

        resolve();
      }, options.delay);
    });
  });
}
