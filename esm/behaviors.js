/*! (c) Andrea Giammarchi - ISC */

const CALLBACK = 'Callback';
export const CONNECTED_CALLBACK = 'connected' + CALLBACK;
export const DISCONNECTED_CALLBACK = 'disconnected' + CALLBACK;
export const ATTACHED_CALLBACK = 'attached' + CALLBACK;
export const DETACHED_CALLBACK = 'detached' + CALLBACK;
export const ATTRIBUTE_CHANGED_CALLBACK = 'attributeChanged' + CALLBACK;

const names = new Map;
const details = new WeakMap;

function* $(target, list) {
  const {behaviors, classList} = details.get(target);
  for (const name of (list || classList)) {
    if (names.has(name)) {
      for (const behavior of names.get(name)) {
        yield [behaviors, behavior];
      }
    }
  }
}

export const define = (name, behavior) => {
  if (!names.has(name))
    names.set(name, new Set);
  names.get(name).add(behavior);
};

export const behaviors = Class => class extends Class {
  static get observedAttributes() { return ['class']; }
  constructor() {
    details.set(super(), {
      behaviors: new Map,
      classList: []
    });
  }
  [CONNECTED_CALLBACK]() {
    notify(this, CONNECTED_CALLBACK, true);
  }
  [DISCONNECTED_CALLBACK]() {
    notify(this, DISCONNECTED_CALLBACK, false);
  }
  [ATTRIBUTE_CHANGED_CALLBACK]() {
    let connect = false;
    const target = this;
    const detail = details.get(target);
    const {classList} = detail;
    const old = new Set(classList);

    // update
    (detail.classList = [...target.classList]).forEach(old.delete, old);

    for (const [behaviors, behavior] of $(target)) {
      if (!behaviors.has(behavior)) {
        // attach
        connect = true;
        const info = {mo: null, live: false};
        behaviors.set(behavior, info);
        if (ATTACHED_CALLBACK in behavior)
          behavior[ATTACHED_CALLBACK](target);

        // attributes
        let {observedAttributes: attributeFilter} = behavior;
        if (attributeFilter || ATTRIBUTE_CHANGED_CALLBACK in behavior) {
          info.mo = new MutationObserver(attributes);
          info.mo.observe(target, {
            attributeOldValue: true,
            attributes: true,
            attributeFilter
          });
          const records = [];
          for (const attributeName of (
            attributeFilter ||
            [...target.attributes].map(({name}) => name))
          ) {
            if (target.hasAttribute(attributeName))
              records.push({target, attributeName, oldValue: null});
          }
          attributes(records, info.mo);
        }
      }
    }

    // connect
    if (connect && target.isConnected)
      notify(target, CONNECTED_CALLBACK, connect);

    // detach
    detach(target, old);
  }
};

const attributes = (records, mo) => {
  for (const {target, attributeName, oldValue} of records) {
    const {behaviors} = details.get(target);
    for (const [behavior, {mo: observer}] of behaviors.entries()) {
      if (observer === mo && ATTRIBUTE_CHANGED_CALLBACK in behavior) {
        behavior[ATTRIBUTE_CHANGED_CALLBACK](
          target,
          attributeName,
          oldValue,
          target.getAttribute(attributeName)
        );
      }
    }
  }
};

const detach = (target, detached) => {
  for (const [behaviors, behavior] of $(target, detached)) {
    if (behaviors.has(behavior)) {
      const {mo, live} = behaviors.get(behavior);
      if (mo)
        mo.disconnect();
      behaviors.delete(behavior);
      if (live && DISCONNECTED_CALLBACK in behavior)
        behavior[DISCONNECTED_CALLBACK](target);
      if (DETACHED_CALLBACK in behavior)
        behavior[DETACHED_CALLBACK](target);
    }
  }
};

const notify = (target, method, connect) => {
  for (const [behaviors, behavior] of $(target)) {
    if (method in behavior) {
      const info = behaviors.get(behavior);
      if (info.live !== connect) {
        info.live = connect;
        behavior[method](target);
      }
    }
  }
};
