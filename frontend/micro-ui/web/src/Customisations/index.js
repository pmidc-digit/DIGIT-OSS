import { ptComponents } from "./pt";
import { tlComponents } from "./tl";
import { wsComponents } from "./ws";

var Digit = window.Digit || {};

const customisedComponent = {
  ...ptComponents,
  ...tlComponents,
  ...wsComponents,
};

export const initCustomisationComponents = () => {
  Object.entries(customisedComponent).forEach(([key, value]) => {
    Digit.ComponentRegistryService.setComponent(key, value);
  });
};
