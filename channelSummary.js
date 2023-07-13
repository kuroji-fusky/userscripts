/**
 * @name KuroChannelSummarizer
 * @description This script injects an additional button from a channel page
 *
 * @version 1.0.0
 * @author Kuroji Fusky
 * @license MIT
 */
(function () {
  /**
   * @param {keyof HTMLElementTagNameMap} tag
   */
  const createElement = (tag) => document.createElement(tag);

  /**
   * @param {keyof HTMLElementTagNameMap | string} tag
   * @param {{ styles: { [rule: string]: Partial<CSSStyleDeclaration }; text: string; id: string }} options
   * @returns {HTMLElement}
   */
  function $e(tag, options) {
    if (!options) {
      return createElement(tag);
    }

    const { styles, text, name: _id } = options;

    const el = Object.assign(createElement(tag), {
      textContent: text,
    });

    if (_id) el.setAttribute("id", _id.toLocaleLowerCase().replace(/\s/g, "-"));

    if (typeof styles !== "undefined") {
      for (const [property, value] of Object.entries(styles)) {
        el.style[property] = value;
      }
    }

    return el;
  }

  // ytInitialData stuff

  // Render the UI
  // const __app_name = "kuro-channel-window",
  //   __app_container = $e(__app_name, {
  //     styles: {
  //       position: "relative",
  //       fontFamily: `"Roboto","Arial",sans-serif`,
  //       height: "400px",
  //     },
  //   });

  // class KuroSummerizer extends HTMLElement {
  //   constructor() {
  //     super();
  //     const __styles = $e("style", {
  //       text: `
  //       :root{
  //         --active: red;
  //       }
  //       .summary kuro-wikitext-wrapper,
  //       .wikitext kuro-summary-wrapper {
  //         pointer-events: none;
  //       }
  //       .summary kuro-wikitext-wrapper {
  //         transform: translate3d(calc(100% + var(--container-padding)),0,0);
  //       }
  //       .wikitext kuro-summary-wrapper {
  //         transform: translate3d(calc(-100% + var(--container-padding)),0,0);
  //       }
  //       `,
  //     });

  //     // Dropdown toggle
  //     let isMenuToggle = true;

  //     const __buttonToggle = $e("button", {
  //       text: "Hide",
  //       styles: {
  //         width: "fit-content",
  //       },
  //     });

  //     // Main container
  //     const __main = $e("div", {
  //       styles: {
  //         backgroundColor: "royalblue",
  //         position: "absolute",
  //         top: "20px",
  //         borderRadius: "0.33rem",
  //         overflow: "hidden",
  //         left: 0,
  //         width: "300px",
  //         height: "400px",
  //       },
  //     });

  //     __buttonToggle.addEventListener("click", () => {
  //       isMenuToggle = !isMenuToggle;

  //       if (!isMenuToggle) {
  //         __main.style.display = "none";
  //         __buttonToggle.textContent = "Show";
  //       } else {
  //         __main.style.display = "block";
  //         __buttonToggle.textContent = "Hide";
  //       }
  //     });

  //     // Tabs
  //     const __tab_container = $e("kuro-tab-row", {
  //       styles: {
  //         display: "grid",
  //         gridAutoFlow: "column",
  //       },
  //     });
  //     /**
  //      * @param {string} name
  //      */
  //     function __tab_button(name) {
  //       const e = $e("kuro-tab-button", {
  //         text: name,
  //         styles: {
  //           borderRadius: 0,
  //           border: "none",
  //           backgroundColor: "var(--tab-button-state)",
  //           padding: "0.5rem 0",
  //           textAlign: "center",
  //           cursor: "pointer",
  //         },
  //       });

  //       e.setAttribute("role", "button");
  //       e.setAttribute("tabindex", "-1");

  //       return e;
  //     }

  //     const wrapperClasses = {
  //       display: "block",
  //       width: "100%",
  //       transition: "150ms ease-in-out",
  //       position: "absolute",
  //       top: "0",
  //     };

  //     const summaryButton = __tab_button("Summary"),
  //       summaryWrapper = $e("kuro-summary-wrapper", {
  //         text: "BALLS",
  //         styles: wrapperClasses,
  //       }),
  //       wikiTextButton = __tab_button("Wikitext"),
  //       wikitextWrapper = $e("kuro-wikitext-wrapper", {
  //         text: "TANG INA",
  //         styles: wrapperClasses,
  //       });

  //     __tab_container.prepend(summaryButton, wikiTextButton);

  //     const __wrapper = $e("div", {
  //       styles: {
  //         padding: "var(--container-padding)",
  //         position: "relative",
  //         backgroundColor: "royalblue",
  //         borderRadius: "0.33rem",
  //         overflow: "hidden",
  //       },
  //     });

  //     __wrapper.prepend(summaryWrapper, wikitextWrapper);

  //     __main.append(__styles, __tab_container, __wrapper);

  //     function initialTabLoad() {
  //       __main.classList.add("summary");
  //       __main.classList.remove("wikitext");
  //     }

  //     initialTabLoad();

  //     summaryButton.addEventListener("click", initialTabLoad);

  //     wikiTextButton.addEventListener("click", function () {
  //       __main.classList.remove("summary");
  //       __main.classList.add("wikitext");
  //     });

  //     // App mount
  //     this.attachShadow({ mode: "closed" }).prepend(__buttonToggle, __main);
  //   }
  // }

  // window.customElements.define(__app_name, KuroSummerizer);
  // document.body.prepend(__app_container);
})();
