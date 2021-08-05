# Pretty Cool Elements

This module is a follow up of [this Medium post](https://webreflection.medium.com/about-web-components-cc3e8b4035b0).

It provides element mixins/behaviors, through class names, and without names clashing.

```js
import {define} from 'p-cool';

define('some-behavior', {

  // to know when a behavior is attached or detached via class
  attachedCallback(element) {},
  detachedCallback(element) {}, // see notes

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
