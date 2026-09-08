import { expect } from 'chai';

import {
  createModdle
} from '../helper.js';


describe('dmn-moddle - DMN version selection', function() {

  it('keeps DMN 1.3 as the default', function() {
    const moddle = createModdle();

    expect(moddle.getPackage('dmn').uri).to.equal('https://www.omg.org/spec/DMN/20191111/MODEL/');
    expect(moddle.getPackage('dmndi').uri).to.equal('https://www.omg.org/spec/DMN/20191111/DMNDI/');
  });


  it('selects DMN 1.5 explicitly', function() {
    const moddle = createModdle(undefined, { dmnVersion: '1.5' });

    expect(moddle.getPackage('dmn').uri).to.equal('https://www.omg.org/spec/DMN/20230324/MODEL/');
    expect(moddle.getPackage('dmndi').uri).to.equal('https://www.omg.org/spec/DMN/20230324/DMNDI/');
  });


  it('rejects unsupported DMN versions', function() {
    expect(() => createModdle(undefined, { dmnVersion: '2.0' }))
      .to.throw('unsupported DMN version <2.0>');
  });

});
