import { validateXML } from 'xsd-schema-validator';

import { expect } from 'chai';

import {
  createModdle,
  readFile
} from '../../helper.js';

const fixture = 'test/fixtures/dmn15/decision-table.dmn';
const xsd = 'resources/dmn/xsd/DMN15.xsd';


describe('dmn-moddle - DMN 1.5 roundtrip', function() {

  this.timeout(30000);

  it('imports, writes and re-imports a typed DMN 1.5 decision table with DMNDI', async function() {
    const moddle = createModdle(undefined, { dmnVersion: '1.5' });

    expect(moddle.getPackage('dmn').uri).to.equal('https://www.omg.org/spec/DMN/20230324/MODEL/');
    expect(moddle.getPackage('dmndi').uri).to.equal('https://www.omg.org/spec/DMN/20230324/DMNDI/');

    const {
      rootElement: definitions,
      warnings
    } = await moddle.fromXML(readFile(fixture), 'dmn:Definitions');

    expect(warnings, JSON.stringify(warnings, null, 2)).to.be.empty;
    expect(definitions.$type).to.equal('dmn:Definitions');

    const decision = definitions.drgElement.find(element => element.id === 'Decision_Eligibility');

    expect(decision).to.exist;
    expect(decision.$type).to.equal('dmn:Decision');
    expect(decision.decisionLogic.$type).to.equal('dmn:DecisionTable');
    expect(definitions.dmnDI.$type).to.equal('dmndi:DMNDI');

    const { xml } = await moddle.toXML(definitions, { format: true });

    expect(xml).to.include('https://www.omg.org/spec/DMN/20230324/MODEL/');
    expect(xml).to.include('https://www.omg.org/spec/DMN/20230324/DMNDI/');
    expect(xml).to.include('DMNShape_Decision_Eligibility');
    expect(xml).to.include('DMNEdge_InformationRequirement_Age');

    await validateXML(xml, xsd);

    const {
      rootElement: reimported,
      warnings: reimportWarnings
    } = await moddle.fromXML(xml, 'dmn:Definitions');

    expect(reimportWarnings, JSON.stringify(reimportWarnings, null, 2)).to.be.empty;
    expect(reimported.$type).to.equal('dmn:Definitions');

    const reimportedDecision = reimported.drgElement.find(element => element.id === 'Decision_Eligibility');

    expect(reimportedDecision.decisionLogic.$type).to.equal('dmn:DecisionTable');
    expect(reimported.dmnDI.$type).to.equal('dmndi:DMNDI');
  });
});
