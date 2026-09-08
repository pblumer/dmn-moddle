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


  it('exposes DMN 1.5 boxed expression types', function() {
    const moddle = createModdle(undefined, { dmnVersion: '1.5' });

    [
      'Conditional',
      'For',
      'Quantified',
      'Filter'
    ].forEach(typeName => {
      const element = moddle.create(`dmn:${ typeName }`);

      expect(element.$type).to.equal(`dmn:${ typeName }`);
      expect(element.$instanceOf('dmn:Expression')).to.be.true;
    });
  });


  it('models DMN 1.5 iterator helper types according to the XSD', function() {
    const moddle = createModdle(undefined, { dmnVersion: '1.5' });

    const typedChildExpression = moddle.create('dmn:TypedChildExpression');
    const iterator = moddle.create('dmn:Iterator');
    const iteratorVariable = moddle.getPropertyDescriptor(iterator, 'iteratorVariable');

    expect(typedChildExpression.$instanceOf('dmn:ChildExpression')).to.be.true;
    expect(iteratorVariable).to.exist;
    expect(iteratorVariable.type).to.equal('String');
    expect(iteratorVariable.isAttr).to.be.true;
  });


  it('does not expose DMN 1.5 boxed expression types in the 1.3 default', function() {
    const moddle = createModdle();

    expect(() => moddle.create('dmn:Conditional')).to.throw;
  });


  it('rejects unsupported DMN versions', function() {
    expect(() => createModdle(undefined, { dmnVersion: '2.0' }))
      .to.throw('unsupported DMN version <2.0>');
  });

});
