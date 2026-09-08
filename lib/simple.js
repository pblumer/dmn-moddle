import {
  assign
} from 'min-dash';

import DmnModdle from './dmn-moddle.js';

import DcPackage from '../resources/dmn/json/dc.json' with { type: 'json' };
import DiPackage from '../resources/dmn/json/di.json' with { type: 'json' };
import Dmn13Package from '../resources/dmn/json/dmn13.json' with { type: 'json' };
import DmnDi13Package from '../resources/dmn/json/dmndi13.json' with { type: 'json' };
import BioDiPackage from '../resources/dmn/bpmn-io/biodi.json' with { type: 'json' };

const DMN_15_MODEL_URI = 'https://www.omg.org/spec/DMN/20230324/MODEL/';
const DMN_15_DMNDI_URI = 'https://www.omg.org/spec/DMN/20230324/DMNDI/';

// DMN 1.5 keeps the Decision Table / DRG subset used by this first fork slice
// structurally compatible with DMN 1.3. Reuse the generated 1.3 type graph while
// switching the normative package URIs. The follow-up metamodel work replaces
// these aliases with descriptors generated from the official DMN 1.5 XMI.
const Dmn15Package = assign({}, Dmn13Package, {
  uri: DMN_15_MODEL_URI
});

const DmnDi15Package = assign({}, DmnDi13Package, {
  uri: DMN_15_DMNDI_URI
});

const versionPackages = {
  '1.3': {
    dmn: Dmn13Package,
    dmndi: DmnDi13Package
  },
  '1.5': {
    dmn: Dmn15Package,
    dmndi: DmnDi15Package
  }
};

export default function(additionalPackages, options) {
  const dmnVersion = options && options.dmnVersion || '1.3';
  const selectedPackages = versionPackages[dmnVersion];

  if (!selectedPackages) {
    throw new Error(`unsupported DMN version <${dmnVersion}>`);
  }

  // Package registration order is significant. biodi extends dmn:* types, so the
  // DMN and DMNDI packages must be registered before the biodi extension package.
  // Keep the same dependency order as upstream's original package map.
  var pks = assign({
    dc: DcPackage,
    di: DiPackage,
    dmn: selectedPackages.dmn,
    dmndi: selectedPackages.dmndi,
    biodi: BioDiPackage
  }, additionalPackages);

  return new DmnModdle(pks, options);
}
