/**
@license
Copyright 2018 The Advanced REST client authors <arc@mulesoft.com>
Licensed under the Apache License, Version 2.0 (the "License"); you may not
use this file except in compliance with the License. You may obtain a copy of
the License at
http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
License for the specific language governing permissions and limitations under
the License.
*/
import {PolymerElement} from '../../@polymer/polymer/polymer-element.js';
import {html} from '../../@polymer/polymer/lib/utils/html-tag.js';
import '../../@polymer/polymer/lib/elements/dom-if.js';
import '../../@polymer/polymer/lib/elements/dom-repeat.js';
import '../../@polymer/iron-flex-layout/iron-flex-layout.js';
import './request-timings.js';
/* eslint-disable max-len */
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
 *
 * @customElement
 * @polymer
 * @demo demo/index.html
 * @memberof UiElements
 */
class RequestTimingsPanel extends PolymerElement {
  static get template() {
    return html`
    <style>
     :host {
      display: block;
      @apply --request-timings-panel;
    }

    .status-row,
    .timings-row {
      @apply --layout-horizontal;
      @apply --layout-center;
      min-height: 56px;
    }

    .status-row {
      @apply --layout-horizontal;
      @apply --layout-end-justified;
    }

    .sub-title {
      @apply --arc-font-subhead;
    }

    .status-label {
      width: 60px;
      font-size: var(--request-timings-panel-timing-total-size, 16px);
      font-weight: var(--request-timings-panel-timing-total-weigth, 400);
      @apply --arc-font-subhead;
    }

    .text {
      -webkit-user-select: text;
      cursor: text;
    }

    .redirect-value {
      margin-top: 12px;
      @apply --layout-flex;
    }
    </style>
    <template is="dom-if" if="[[hasRedirects]]">
      <section class="redirects">
        <h3 class="sub-title">Redirects</h3>
        <template is="dom-repeat" items="[[redirectTimings]]">
          <div class="timings-row">
            <div class="status-label text">
              #<span>{{_computeIndexName(index)}}</span>
            </div>
            <div class="redirect-value">
              <request-timings timings="[[item]]"></request-timings>
            </div>
          </div>
        </template>
        <h3 class="sub-title">Final request</h3>
        <div class="timings-row">
          <div class="redirect-value">
            <request-timings timings="[[timings]]"></request-timings>
          </div>
        </div>
        <div class="status-row">
          <div class="flex"></div>
          <span class="timing-value total text">[[requestTotalTime]] ms</span>
        </div>
      </section>
    </template>
    <template is="dom-if" if="[[!hasRedirects]]">
      <request-timings timings="[[timings]]"></request-timings>
    </template>
`;
  }

  static get properties() {
    return {
      // Computed value, if true it will display redirects details
      hasRedirects: {
        type: Boolean,
        value: false,
        readOnly: true,
        computed: '_computeHasRedirects(redirectTimings.*)'
      },
      /**
       * An array of HAR 1.2 timings object.
       * It should contain a timings objects for any redirect object during
       * the request.
       * List should be arelady ordered by the time of occurence.
       */
      redirectTimings: Array,
      // The request / response HAR timings.
      timings: Object,
      /**
       * Calculated total request time (final response + redirectTimings).
       */
      requestTotalTime: {
        type: Number,
        value: 0,
        computed: '_computeRequestTime(redirectTimings.*, timings.*)'
      }
    };
  }

  _computeHasRedirects(record) {
    return !!(record && record.base && record.base.length);
  }

  _computeRequestTime(redirectsRecord, timingsRecord) {
    const redirects = redirectsRecord.base;
    const timings = timingsRecord.base;
    let time = 0;
    if (redirects && redirects.length) {
      redirects.forEach((timing) => time += this._computeHarTime(timing));
    }
    let add = this._computeHarTime(timings);
    if (add) {
      time += add;
    }
    time = Math.round(time * 10000) / 10000;
    return time;
  }

  _computeIndexName(index) {
    return index + 1;
  }

  _computeHarTime(har) {
    let fullTime = 0;
    if (!har) {
      return fullTime;
    }
    let connect = Number(har.connect);
    let receive = Number(har.receive);
    let send = Number(har.send);
    let wait = Number(har.wait);
    let blocked = Number(har.blocked);
    let dns = Number(har.dns);
    let ssl = Number(har.ssl);
    if (connect !== connect || connect < 0) {
      connect = 0;
    }
    if (receive !== receive || receive < 0) {
      receive = 0;
    }
    if (send !== send || send < 0) {
      send = 0;
    }
    if (wait !== wait || wait < 0) {
      wait = 0;
    }
    if (dns !== dns || dns < 0) {
      dns = -1;
    }
    if (blocked !== blocked || blocked < 0) {
      blocked = -1;
    }
    if (ssl !== ssl || ssl < 0) {
      ssl = -1;
    }
    fullTime += connect + receive + send + wait;
    if (dns > 0) {
      fullTime += dns;
    }
    if (blocked > 0) {
      fullTime += blocked;
    }
    if (ssl > 0) {
      fullTime += ssl;
    }
    return fullTime;
  }
}
window.customElements.define('request-timings-panel', RequestTimingsPanel);
