import { expect } from 'chai';

import {
  createModdle
} from '../helper.js';


describe('dmn-moddle - DMN version package isolation', function() {

  it('constructs the default 1.3 registry with biodi extensions', function() {
    const moddle = createModdle();

    expect(moddle.create('dmn:DecisionTable').$type).to.equal('dmn:DecisionTable');
    expect(moddle.getType('dmn:DecisionTable').$descriptor.allTypesByName['biodi:DecisionTable']).to.exist;
  });


  it('constructs 1.3 and 1.5 registries independently', function() {
    const dmn13 = createModdle();
    const dmn15 = createModdle(undefined, { dmnVersion: '1.5' });

    expect(dmn13.create('dmn:Decision').$type).to.equal('dmn:Decision');
    expect(dmn15.create('dmn:Decision').$type).to.equal('dmn:Decision');
    expect(dmn13.getPackage('dmn').uri).to.equal('https://www.omg.org/spec/DMN/20191111/MODEL/');
    expect(dmn15.getPackage('dmn').uri).to.equal('https://www.omg.org/spec/DMN/20230324/MODEL/');
  });

});
