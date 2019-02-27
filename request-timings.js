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
import {PolymerElement} from '@polymer/polymer/polymer-element.js';
import {html} from '@polymer/polymer/lib/utils/html-tag.js';
import '@polymer/polymer/lib/elements/dom-if.js';
import '@polymer/paper-progress/paper-progress.js';
import '@polymer/iron-flex-layout/iron-flex-layout.js';
import '@advanced-rest-client/date-time/date-time.js';
/* eslint-disable max-len */
/**
 * An element to display request timings information as a timeline according to the HAR 1.2 spec.
 *
 * The `timings` property should contain timings object as defined in
 * [HAR 1.2 spec](https://dvcs.w3.org/hg/webperf/raw-file/tip/specs/HAR/Overview.html#sec-object-types-timings).
 *
 * The timings object is consisted of:
 * - **blocked** [number, optional] - Time spent in a queue waiting for a network connection. Use -1 if the timing does not apply to the current request.
 * - **dns** [number, optional] - DNS resolution time. The time required to resolve a host name. Use -1 if the timing does not apply to the current request.
 * - **connect** [number, optional] - Time required to create TCP connection. Use -1 if the timing does not apply to the current request.
 * - **send** [number] - Time required to send HTTP request to the server.
 * - **wait** [number] - Waiting for a response from the server.
 * - **receive** [number] - Time required to read entire response from the server (or cache).
 * - **ssl** [number, optional] - Time required for SSL/TLS negotiation. If this field is defined then the time is also included in the connect field (to ensure backward compatibility with HAR 1.1). Use -1 if the timing does not apply to the current request.
 *
 * Additionally the object can contain the `startTime` property that indicates
 * the request start time. If can be Date object, timestamp or formatted string
 * representing a date.
 *
 * The timeline for `connect`, `send`, `wait` and `receive` are always shown.
 * `blocked`, `dns` and `ssl` are visible only if values for it was set and value
 * was > 0.
 *
 * ### Example
 *
 * ```html
 * <request-timings timings="[[requestTimings]]"></request-timings>
 *```
 *
 * ### Styling
 * `<request-timings>` provides the following custom properties and mixins for styling:
 *
 * Custom property | Description | Default
 * ----------------|-------------|----------
 * `--request-timings` | Mixin applied to the element | `{}`
 * `--select-text` | Mixin applied to the text elements that should have text selection enabled (in some platforms text selection is disabled by default) | `{}`
 * `--form-label` | Mixin applied to labels elements | `{}`
 * `--request-timings-progress-height` | The height of the progress bar | `12px`
 * `--request-timings-progress-background` | Background color of the progress bar. | `#F5F5F5`
 * `--request-timings-progress-color` | Color of the progress bar. | `#4a4`
 * `--request-timings-label-width` | Width of the label | `160px`
 * `--request-timings-value-width` | Width of the value column | `120px`
 *
 * @customElement
 * @polymer
 * @demo demo/index.html
 * @memberof UiElements
 */
class RequestTimings extends PolymerElement {
  static get template() {
    return html`<style>
    :host {
      display: block;
      --paper-progress-height: var(--request-timings-progress-height, 12px);
      --paper-progress-container-color: var(--request-timings-progress-background, #F5F5F5);
      --paper-progress-active-color: var(--request-timings-progress-background, #F5F5F5);
      --paper-progress-secondary-color: var(--request-timings-progress-color, #4a4);
      @apply --request-timings;
    }

    .row {
      @apply --layout-horizontal;
      @apply --layout-center;
    }

    .flex,
    paper-progress {
      @apply --layout-flex;
    }

    .label,
    .date-value {
      @apply --select-text;
      @apply --form-label;
    }

    .timing-label {
      width: var(--request-timings-label-width, 160px);
      @apply --form-label;
    }

    .timing-value {
      width: var(--request-timings-value-width, 120px);
      text-align: right;
      @apply --select-text;
    }

    .total {
      margin-top: 12px;
      padding-top: 12px;
      font-weight: 500;
      border-top: 2px var(--paper-grey-200, rgba(255, 0, 0, 0.74)) solid;
    }

    .row.is-total {
      @apply --layout-end-justified;
    }
    </style>
    <dom-if if="[[_hasStartTime]]">
      <template>
        <div class="row" data-type="start-time">
          <span class="label">Start date</span>:
          <date-time year="numeric" month="numeric" day="numeric" hour="numeric" minute="numeric" second="numeric" class="date-value" date="[[startTime]]"></date-time>
        </div>
      </template>
    </dom-if>
    <dom-if if="[[_hasBlockedTime]]">
      <template>
        <div class="row" data-type="block-time">
          <div class="timing-label label">
            Queueing:
          </div>
          <paper-progress aria-label="Queueing time" value="0" secondary-progress="[[blocked]]" max="[[fullTime]]" step="0.0001"></paper-progress>
          <span class="timing-value">[[roundBlocked]] ms</span>
        </div>
      </template>
    </dom-if>
    <dom-if if="[[_hasDnsTime]]">
      <template>
        <div class="row" data-type="dns-time">
          <div class="timing-label label">
            DNS Lookup:
          </div>
          <paper-progress aria-label="DNS lookup time" value="[[_blockedProgressValue]]" secondary-progress="[[_ttcProgressValue]]" max="[[fullTime]]" step="0.0001"></paper-progress>
          <span class="timing-value">[[roundDns]] ms</span>
        </div>
      </template>
    </dom-if>
    <dom-if if="[[_hasConnectTime]]">
      <template>
        <div class="row" data-type="ttc-time">
          <div class="timing-label label">
            Time to connect:
          </div>
          <paper-progress aria-label="Time to connect" value="[[_ttcProgressValue]]" secondary-progress="[[_sslProgressValue]]" max="[[fullTime]]" step="0.0001"></paper-progress>
          <span class="timing-value">[[roundConnect]] ms</span>
        </div>
      </template>
    </dom-if>
    <dom-if if="[[_hasSslTime]]">
      <template>
        <div class="row" data-type="ssl-time">
          <div class="timing-label label">
            SSL negotiation:
          </div>
          <paper-progress aria-label="SSL negotiation time" value="[[_sslProgressValue]]" secondary-progress="[[_sendProgressValue]]" max="[[fullTime]]" step="0.0001"></paper-progress>
          <span class="timing-value">[[roundSsl]] ms</span>
        </div>
      </template>
    </dom-if>
    <dom-if if="[[_hasSendTime]]">
      <template>
        <div class="row" data-type="send-time">
          <div class="timing-label label">
            Send time:
          </div>
          <paper-progress aria-label="Send time" value="[[_sendProgressValue]]" secondary-progress="[[_ttfbProgressValue]]" max="[[fullTime]]" step="0.0001"></paper-progress>
          <span class="timing-value">[[roundSend]] ms</span>
        </div>
      </template>
    </dom-if>
    <dom-if if="[[_hasWaitTime]]">
      <template>
        <div class="row" data-type="ttfb-time">
          <div class="timing-label label">
            Wait time (TTFB):
          </div>
          <paper-progress aria-label="Time to first byte" value="[[_ttfbProgressValue]]" secondary-progress="[[_receiveProgressValue]]" max="[[fullTime]]" step="0.0001"></paper-progress>
          <span class="timing-value">[[roundWait]] ms</span>
        </div>
      </template>
    </dom-if>
    <dom-if if="[[_hasReceiveTime]]">
      <template>
        <div class="row" data-type="receive-time">
          <div class="timing-label label">
            Content download:
          </div>
          <paper-progress aria-label="Receiving time" value="[[_receiveProgressValue]]" secondary-progress="[[_receive2ProgressValue]]" max="[[fullTime]]" step="0.0001"></paper-progress>
          <span class="timing-value">[[roundReceive]] ms</span>
        </div>
      </template>
    </dom-if>
    <div class="row is-total">
      <span class="timing-value total">[[roundFullTime]] ms</span>
    </div>`;
  }

  static get is() {
    return 'request-timings';
  }

  static get properties() {
    return {
      /**
       * A timings object as described in HAR 1.2 spec.
       */
      timings: {
        type: Object,
        observer: '_update'
      },
      /**
       * Request stat time. It can be either Date object,
       * timestamp or a string representing the date.
       *
       * If the `timings` property contains the `startTime` property it
       * will be overwritten.
       */
      startTime: String,
      /**
       * Computed value. Calculated full time of the request and response
       */
      fullTime: {
        type: Number,
        readOnly: true
      },
      roundFullTime: {
        type: Number,
        computed: '_round(fullTime)'
      },
      // Computed value. Time required to establish the connection
      connect: {
        type: Number,
        readOnly: true
      },
      roundConnect: {
        type: Number,
        computed: '_round(connect)'
      },
      // Computed value. Time of receiving data from the remote machine.
      receive: {
        type: Number,
        readOnly: true
      },
      roundReceive: {
        type: Number,
        computed: '_round(receive)'
      },
      // Computed value. Time to send data to the remote machine.
      send: {
        type: Number,
        readOnly: true
      },
      roundSend: {
        type: Number,
        computed: '_round(send)'
      },
      // Computed value. Wait time for the first byte to arrive.
      wait: {
        type: Number,
        readOnly: true
      },
      roundWait: {
        type: Number,
        computed: '_round(wait)'
      },
      // Computed value. Time spent in a queue waiting for a network connection
      blocked: {
        type: Number,
        readOnly: true
      },
      roundBlocked: {
        type: Number,
        computed: '_round(blocked)'
      },
      // Computed value. DNS resolution time.
      dns: {
        type: Number,
        readOnly: true
      },
      roundDns: {
        type: Number,
        computed: '_round(dns)'
      },
      // Computed value. Time required for SSL/TLS negotiation.
      ssl: {
        type: Number,
        readOnly: true
      },
      roundSsl: {
        type: Number,
        computed: '_round(ssl)'
      },
      _hasStartTime: {
        type: Boolean,
        computed: '_hasValue(startTime)'
      },
      _hasBlockedTime: {
        type: Boolean,
        computed: '_hasValue(blocked)'
      },
      _hasDnsTime: {
        type: Boolean,
        computed: '_hasValue(dns)'
      },
      _hasConnectTime: {
        type: Boolean,
        computed: '_hasValue(connect)'
      },
      _hasSslTime: {
        type: Boolean,
        computed: '_hasValue(ssl)'
      },
      _hasSendTime: {
        type: Boolean,
        computed: '_hasValue(send)'
      },
      _hasWaitTime: {
        type: Boolean,
        computed: '_hasValue(wait)'
      },
      _hasReceiveTime: {
        type: Boolean,
        computed: '_hasValue(receive)'
      },
      _blockedProgressValue: {
        type: Number,
        computed: '_computeSum(blocked)'
      },
      _ttcProgressValue: {
        type: Number,
        computed: '_computeSum(blocked, dns)'
      },
      _sslProgressValue: {
        type: Number,
        computed: '_computeSum(_ttcProgressValue, connect)'
      },
      _sendProgressValue: {
        type: Number,
        computed: '_computeSum(_sslProgressValue, ssl)'
      },
      _ttfbProgressValue: {
        type: Number,
        computed: '_computeSum(_sendProgressValue, send)'
      },
      _receiveProgressValue: {
        type: Number,
        computed: '_computeSum(_ttfbProgressValue, wait)'
      },
      _receive2ProgressValue: {
        type: Number,
        computed: '_computeSum(_receiveProgressValue, receive)'
      }
    };
  }

  // Updates the view after `timings` change.
  _update() {
    const timings = this.timings || {};
    let fullTime = 0;
    let connect = Number(timings.connect);
    let receive = Number(timings.receive);
    let send = Number(timings.send);
    let wait = Number(timings.wait);
    let blocked = Number(timings.blocked);
    let dns = Number(timings.dns);
    let ssl = Number(timings.ssl);
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
    this._setFullTime(fullTime);
    this._setConnect(connect);
    this._setReceive(receive);
    this._setSend(send);
    this._setWait(wait);
    this._setDns(dns);
    this._setBlocked(blocked);
    this._setSsl(ssl);
    if (timings.startTime) {
      this.set('startTime', timings.startTime);
    } else {
      this.set('startTime', this.startTime || -1);
    }
  }
  /**
   * Round numeric value to presision defined in the `power` argument.
   *
   * @param {Number} value The value to round
   * @return {Number} Rounded value.
   */
  _round(value) {
    value = Number(value);
    if (value !== value) {
      return 'unknown';
    }
    let factor = Math.pow(10, 4);
    return Math.round(value * factor) / factor;
  }
  /**
   * Sums two HAR times.
   * If any argument is `undefined` or `-1` then `0` is assumed.
   * @param {Number} a Time #1
   * @param {Number} b Time #2
   * @return {Number} Sum of both
   */
  _computeSum(a, b) {
    if (a === undefined) {
      a = 0;
    } else {
      a = Number(a);
      if (a < 0) {
        a = 0;
      }
    }
    if (b === undefined) {
      b = 0;
    } else {
      b = Number(b);
      if (b < 0) {
        b = 0;
      }
    }
    return a + b;
  }

  _hasValue(num) {
    if (num === undefined) {
      return false;
    }
    if (typeof num === 'string') {
      return !!num;
    }
    return num > 0;
  }
}
window.customElements.define(RequestTimings.is, RequestTimings);
