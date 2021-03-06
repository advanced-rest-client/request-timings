/**
 * DO NOT EDIT
 *
 * This file was automatically generated by
 *   https://github.com/Polymer/tools/tree/master/packages/gen-typescript-declarations
 *
 * To modify these typings, edit the source file(s):
 *   request-timings-panel.js
 */


// tslint:disable:variable-name Describing an API that's defined elsewhere.
// tslint:disable:no-any describes the API as best we are able today

import {LitElement, html, css} from 'lit-element';

declare namespace UiElements {

  /**
   * The `request-timings-panel` element is a panel to display a set of timings
   * for the request / response. The use case is to display timings for the request
   * where redirects are possible and timings for the redirects are calculated.
   *
   * The timings accepted by this element is defined in the HAR 1.2 spec. See The
   * `request-timings` element docs for more info.
   *
   * Custom property | Description | Default
   * ----------------|-------------|----------
   * `--request-timings-panel` | Mixin applied to the element | `{}`
   * `--arc-font-subhead` | Mixin applied to the headers element. Similar to `--paper-font-subhead` mixin in Paper elements. | `{}`
   *
   * Use `request-timings` properties an mixins to style the charts.
   *
   * ## Changes in version 2
   * - `redirects` property rendamed to `redirectTimings`
   */
  class RequestTimingsPanel extends LitElement {

    /**
     * An array of HAR 1.2 timings object.
     * It should contain a timings objects for any redirect object during
     * the request.
     * List should be arelady ordered by the time of occurence.
     */
    redirectTimings: any[]|null|undefined;

    /**
     * The request / response HAR timings.
     */
    timings: object|null|undefined;

    /**
     * When set it renders mobile friendly view
     */
    narrow: boolean|null|undefined;
    constructor();
    render(): any;
    _computeRequestTime(redirects: any, timings: any): any;
    _computeHarTime(har: any): any;
  }
}

declare global {

  interface HTMLElementTagNameMap {
    "request-timings-panel": UiElements.RequestTimingsPanel;
  }
}
