const EMPTY = '';
const HEADING = 'Heading';
const TABLECELL = 'TableCell';
const TABLE_SECTION = 'TableSection';

const ELEMENT = 'Element';

const qualify = name => ('HTML' + (name in namespace ? namespace[name] : name) + ELEMENT);

const namespace = {
  A: 'Anchor',
  Caption: 'TableCaption',
  DL: 'DList',
  Dir: 'Directory',
  Img: 'Image',
  OL: 'OList',
  P: 'Paragraph',
  TR: 'TableRow',
  UL: 'UList',

  Article: EMPTY,
  Aside: EMPTY,
  Footer: EMPTY,
  Header: EMPTY,
  Main: EMPTY,
  Nav: EMPTY,
  [ELEMENT]: EMPTY,

  H1: HEADING,
  H2: HEADING,
  H3: HEADING,
  H4: HEADING,
  H5: HEADING,
  H6: HEADING,

  TD: TABLECELL,
  TH: TABLECELL,

  TBody: TABLE_SECTION,
  TFoot: TABLE_SECTION,
  THead: TABLE_SECTION,
};

/*! (c) Andrea Giammarchi - ISC */

const EXTENDS = Symbol('extends');

const {customElements} = self;
const {define: $define} = customElements;
const names$1 = new Map;

/**
* Define a custom elements in the registry.
* @param {string} name the custom element name
* @param {function} Class the custom element class definition
* @returns {function} the defined `Class` after definition
*/
const $$1 = (name, Class) => {
  const args = [name, Class];
  if (EXTENDS in Class)
    args.push({extends: Class[EXTENDS].toLowerCase()});
  $define.apply(customElements, args);
  names$1.set(Class, name);
  return Class;
};

/**
* Define a custom elements in the registry.
* @param {string} name the custom element name
* @param {function?} Class the custom element class definition. Optional when
*  used as decorator, instead of regular function.
* @returns {function} the defined `Class` after definition or a decorator
*/
const define$2 = (name, Class) => Class ?
  $$1(name, Class) :
  Class => $$1(name, Class);

/** @type {HTML} */
const HTML = new Proxy(new Map, {
  get(map, Tag) {
    if (!map.has(Tag)) {
      const Native = self[qualify(Tag)];
      map.set(Tag, Tag === ELEMENT ?
        class extends Native {} :
        class extends Native {
          static get [EXTENDS]() { return Tag; }
          constructor() {
            // @see https://github.com/whatwg/html/issues/5782
            if (!super().hasAttribute('is'))
              this.setAttribute('is', names$1.get(this.constructor));
          }
        }
      );
    }
    return map.get(Tag);
  }
});

/*! (c) Andrea Giammarchi - ISC */

const CALLBACK = 'Callback';
const CONNECTED_CALLBACK = 'connected' + CALLBACK;
const DISCONNECTED_CALLBACK = 'disconnected' + CALLBACK;
const ATTACHED_CALLBACK = 'attached' + CALLBACK;
const DETACHED_CALLBACK = 'detached' + CALLBACK;
const ATTRIBUTE_CHANGED_CALLBACK = 'attributeChanged' + CALLBACK;

const names = new Map;
const details = new WeakMap;

function* $(target, list) {
  const {behaviors, classList} = details.get(target);
  for (const name of (list || classList)) {
    if (names.has(name)) {
      for (const behavior of names.get(name))
        yield [behaviors, behavior];
    }
  }
}

const define$1 = (name, behavior) => {
  if (!names.has(name))
    names.set(name, new Set);
  names.get(name).add(behavior);
};

const behaviors = Class => class extends Class {
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

const classes = new Set;
for (const key of Object.getOwnPropertyNames(self)) {
  if (/^HTML(.*?)Element$/.test(key)) {
    const Class = HTML[RegExp.$1 || 'Element'];
    let name = 'p-cool';
    if (EXTENDS in Class)
      name += '-' + Class[EXTENDS].toLowerCase();
    if (!classes.has(name)) {
      classes.add(name);
      try { define$2(name, behaviors(Class)); }
      catch (o_O) {}
    }
  }
}

const define = (name, behavior, doc = document) => {
  define$1(name, behavior);
  const selector = `p-cool.${name},[is^="p-cool"].${name}`;
  for (const target of doc.querySelectorAll(selector)) {
    if (ATTRIBUTE_CHANGED_CALLBACK in target)
      target[ATTRIBUTE_CHANGED_CALLBACK]();
  }
};

export { define };
