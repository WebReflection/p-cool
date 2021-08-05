import {define as $define, HTML} from 'vanilla-elements';
import {define as _define, behaviors, ATTRIBUTE_CHANGED_CALLBACK} from './behaviors.js';

const classes = new Set;
for (const key in HTML) {
  const Class = HTML[key];
  const tag = Object.getOwnPropertySymbols(Class).filter(
    ({description}) => description === 'extends'
  );
  let name = 'p-cool';
  if (tag.length)
    name += '-' + Class[tag[0]].toLowerCase();
  if (!classes.has(name)) {
    classes.add(name);
    try {
      $define(name, behaviors(Class));
    }
    catch (o_O) {}
  }
}

export const define = (name, behavior, doc = document) => {
  _define(name, behavior);
  const selector = `p-cool.${name},[is^="p-cool"].${name}`;
  for (const target of doc.querySelectorAll(selector)) {
    if (ATTRIBUTE_CHANGED_CALLBACK in target)
      target[ATTRIBUTE_CHANGED_CALLBACK]();
  }
};
