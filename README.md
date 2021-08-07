# Pretty Cool Elements

This module is a follow up of [this Medium post](https://webreflection.medium.com/about-web-components-cc3e8b4035b0), and it provides element mixins/behaviors, through class names, without names clashing.

```js
import {define} from 'p-cool';

define('some-behavior', {

  // to know when a behavior is attached or detached via class
  attachedCallback(element) {},
  detachedCallback(element) {}, // see ## About Callbacks

  // to observe connected/disconnected lifecycle
  connectedCallback(element) {},
  disconnectedCallback(element) {},

  // to observe specific attributes (omit to observe them all)
  observedAttributes: ['some-attribute'],

  // to know when observed attributes changed
  attributeChangedCallback(element, name, oldValue, newValue) {},
});
```

```html
<div is="p-cool-div" class="some-behavior" some-attribute="ok">
  Hello Behaviors 👋
</div>
```

## About Callbacks

<details>
  <summary><strong>attachedCallback</strong></summary>
  <div>

This callback is granted to be invoked only *once*, and *before* any other callback, whenever a mixin/behavior is attached through the element's class, somehow simulating what a `constructor` would do with Custom Elements.

This callback is ideal to add related event listeners, setup an element for the specific mixin/behavior, and so on.

Please note that if a mixin/behavior is detached, and then re-attached, this callback *will* be invoked again.

  </div>
</details>

<details>
  <summary><strong>attributeChangedCallback</strong></summary>
  <div>

If any `observedAttributes` is specified, or if there is an `attributeChangedCallback`, this is invoked every time observed attributes change.

Like it is for *Custom Elements*, this callback is invoked, after a mixin/behavior is attached, *before* `connectedCallback`, and *after* `attributeChangedCallback`.

This callback is also invoked during the element lifecycle, whenever observed attributes change, providing the `oldValue` and the `newValue`.

Both values are `null` if there was not attribute, or if the attribute got removed, replicating the native *Custom Element* behavior.

  </div>
</details>

<details>
  <summary><strong>connectedCallback</strong></summary>
  <div>

This callback is granted to be *after* an element gets a new mixin/behavior, and every single time the element gets moved or re-appended on the DOM, exactly like it is for native *Custom Elements*.

If there are observed attributes, this callback is invoked *after* `attributeChangedCallback`.

  </div>
</details>

<details>
  <summary><strong>disconnectedCallback</strong></summary>
  <div>

This callback is granted to be invoked when an element gets removed from the DOM, and it would never trigger if the `connectedCallback` didn't trigger already.

Both callbacks are the ideal place to attach, on *connected*, and remove, on *disconnected*, timers, animations, or idle related callbacks, as even when elements get trached, both callbacks are granted to be executed.

  </div>
</details>

<details>
  <summary><strong>detachedCallback</strong></summary>
  <div>

This callback is **not granted to be invoked** if an element get trashed, but it's granted to be invoked *after* `disconnectedCallback`, if a mixin/behavior is removed from an element.

Please note that this callback is *not* really useful for elements that might be, or may not be, trashed, because there is no way to use a *FinalizationRegistry* and pass along the `element`, but it's very hando for those elements that never leave the DOM, but might change, over time, their classes, hence their mixins/behaviors.

```js
import {define} from 'p-cool';

define('mixin', {
  attachedCallback(element) {
    console.log('mixin attached');
  },
  detachedCallback(element) {
    console.log('mixin detached');
  }
});

// example
document.body.innerHTML = `
  <div id="first" class="mixin">First</div>
  <div id="second" class="mixin">Second</div>
`;
// logs "mixin attached" twice

// will **not** "mixin detached"
first.remove();

// it **will** log "mixin detached"
second.classList.remove('mixin');
```

  </div>
</details>

## About Exports

This module offers the following exports:

  * `p-cool` with a `define(name, mixin)` export that *does not polyfill Safari*
  * `p-cool/min` with a minified `define(name, mixin)` export that *does polyfill Safari*
  * `p-cool/poly` with a minified `define(name, mixin)` export that also *does polyfill Safari*
  * `p-cool/behaviors` with the internally used `define` and `behaviors` exports, plus constants, useful to potentially create other libraries or utilities on top of the same logic

The `https://unpkg.com/p-cool` points at the minified `/poly` variant, useful to quickly test, or develop, with this module.
