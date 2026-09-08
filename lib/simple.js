import {
  assign
} from 'min-dash';

import DmnModdle from './dmn-moddle.js';

import DcPackage from '../resources/dmn/json/dc.json' with { type: 'json' };
import DiPackage from '../resources/dmn/json/di.json' with { type: 'json' };
import Dmn13Package from '../resources/dmn/json/dmn13.json' with { type: 'json' };
import Dmn15Package from '../resources/dmn/json/dmn15.json' with { type: 'json' };
import DmnDi13Package from '../resources/dmn/json/dmndi13.json' with { type: 'json' };
import DmnDi15Package from '../resources/dmn/json/dmndi15.json' with { type: 'json' };
import BioDiPackage from '../resources/dmn/bpmn-io/biodi.json' with { type: 'json' };

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
